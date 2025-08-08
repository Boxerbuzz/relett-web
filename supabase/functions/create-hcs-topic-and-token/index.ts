import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicId,
  Hbar,
  Status,
  FileCreateTransaction,
} from "https://esm.sh/@hashgraph/sdk@2.65.1";
import { createTypedSupabaseClient } from "../shared/supabase-client.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TokenCreationRequest {
  tokenizedPropertyId: string;
}

// Initialize Supabase client
const supabase = createTypedSupabaseClient();

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting Hedera token creation with HCS audit trail...");

    // Get request data
    const { tokenizedPropertyId }: TokenCreationRequest = await req.json();

    if (!tokenizedPropertyId) {
      throw new Error("Missing tokenizedPropertyId in request");
    }

    console.log(
      `Processing token creation for property: ${tokenizedPropertyId}`
    );

    // Keep existing status to avoid retriggering the approval hook

    // Get tokenized property details with property info
    const { data: tokenData, error: fetchError } = await supabase
      .from("tokenized_properties")
      .select(
        `
            *,
        property:properties!tokenized_properties_property_id_fkey (
          title,
          location
        ),
        land_titles (
          title_number
        )
      `
      )
      .eq("id", tokenizedPropertyId)
      .single();

    if (fetchError || !tokenData) {
      throw new Error(`Failed to fetch token data: ${fetchError?.message}`);
    }

    console.log(
      `Token data retrieved: ${tokenData.token_name} (${tokenData.token_symbol})`
    );

    // Get Hedera credentials
    const hederaAccountId = Deno.env.get("HEDERA_ACCOUNT_ID");
    const hederaPrivateKey = Deno.env.get("HEDERA_PRIVATE_KEY");

    if (!hederaAccountId || !hederaPrivateKey) {
      throw new Error("Missing Hedera credentials in environment");
    }

    // Initialize Hedera client
    const client = Client.forTestnet();
    const operatorAccountId = AccountId.fromString(hederaAccountId);
    const operatorPrivateKey = PrivateKey.fromStringECDSA(hederaPrivateKey);

    client.setOperator(operatorAccountId, operatorPrivateKey);

    console.log("Ensuring single HCS topic per property (reuse if exists)...");

    // Try to find existing topic for this property
    let topicId: string | null = null;
    let hcsTopicRowId: string | null = null;

    const { data: existingTopic } = await supabase
      .from("hcs_topics")
      .select("id, topic_id")
      .eq("property_id", tokenData.property_id)
      .maybeSingle();

    if (existingTopic?.topic_id) {
      topicId = existingTopic.topic_id as string;
      hcsTopicRowId = existingTopic.id as string;
      console.log(`Reusing HCS topic ${topicId} for property ${tokenData.property_id}`);
    } else {
      console.log("Creating HCS topic for property audit trail...");
      const topicMemo = `Property audit trail for ${tokenData.property?.title || 'Unknown'}`;
      const topicCreateTx = new TopicCreateTransaction()
        .setTopicMemo(topicMemo)
        .setMaxTransactionFee(new Hbar(5))
        .freezeWith(client);

      const topicCreateTxSigned = await topicCreateTx.sign(operatorPrivateKey);
      const topicCreateSubmit = await topicCreateTxSigned.execute(client);
      const topicCreateReceipt = await topicCreateSubmit.getReceipt(client);

      if (topicCreateReceipt.status !== Status.Success) {
        throw new Error(`Topic creation failed with status: ${topicCreateReceipt.status}`);
      }

      topicId = topicCreateReceipt.topicId!.toString();
      console.log(`HCS topic created: ${topicId}`);

      // Store HCS topic in database and link to property and tokenized property
      const { data: hcsTopicRow, error: hcsErr } = await supabase
        .from("hcs_topics")
        .insert({
          topic_id: topicId,
          topic_memo: topicMemo,
          property_id: tokenData.property_id,
          tokenized_property_id: tokenizedPropertyId,
        })
        .select("id")
        .single();

      if (hcsErr) console.warn("Failed to persist HCS topic:", hcsErr);
      hcsTopicRowId = hcsTopicRow?.id || null;
    }

    // Ensure linkage to tokenized property (idempotent)
    await supabase
      .from("hcs_topics")
      .update({ tokenized_property_id: tokenizedPropertyId })
      .eq("topic_id", topicId!);

    console.log(`Using HCS topic: ${topicId}`);

    console.log("Creating token on Hedera network...");

    // Get property blockchain hash from the property
    const { data: propertyData } = await supabase
      .from("properties")
      .select("blockchain_hash, title, location")
      .eq("id", tokenData.property_id || "")
      .single();

    // Create comprehensive token metadata
    const tokenMetadata = {
      propertyBlockchainHash: propertyData?.blockchain_hash || null,
      propertyTitle: propertyData?.title || tokenData.property?.title,
      propertyLocation: propertyData?.location || tokenData.property?.location,
      landTitleNumber: tokenData.land_titles?.title_number,
      tokenizationDate: new Date().toISOString(),
      legalStructure: tokenData.legal_structure,
      totalSupply: tokenData.total_supply,
      tokenPrice: tokenData.token_price,
      version: "1.0",
    };

    const metadataBytes = new TextEncoder().encode(
      JSON.stringify(tokenMetadata)
    );

    // Step 1: Upload metadata to File Service
    const fileCreateTx = new FileCreateTransaction()
      .setKeys([operatorPrivateKey.publicKey]) // Required so only you can update/delete the file
      .setContents(metadataBytes)
      .setMaxTransactionFee(new Hbar(2));

    const fileCreateSubmit = await fileCreateTx.execute(client);
    const fileReceipt = await fileCreateSubmit.getReceipt(client);
    const fileId = fileReceipt.fileId;

    // Create the token with all required keys and proper supply
    const tokenCreateTx = new TokenCreateTransaction()
      .setTokenName(tokenData.token_name)
      .setTokenSymbol(tokenData.token_symbol)
      .setTokenType(TokenType.FungibleCommon)
      .setSupplyType(TokenSupplyType.Finite)
      .setInitialSupply(0) // Start with 0, mint later
      .setMaxSupply(Number(tokenData.total_supply)) // Ensure proper number conversion
      .setDecimals(8)
      .setTreasuryAccountId(operatorAccountId)
      .setSupplyKey(operatorPrivateKey)
      .setAdminKey(operatorPrivateKey)
      .setWipeKey(operatorPrivateKey) // Required for compliance
      .setFreezeKey(operatorPrivateKey) // Required for compliance
      .setMetadataKey(operatorPrivateKey) // Required for compliance
      .setPauseKey(operatorPrivateKey) // Required for compliance
      .setTokenMemo(
        `Property Token Audit Trail: ${
          tokenData.property?.title || "Unknown"
        } - ${tokenData.token_symbol}`
      )
      .setFreezeDefault(false)
      .setMaxTransactionFee(new Hbar(20))
      .freezeWith(client);

    // Sign and execute the transaction
    const tokenCreateTxSigned = await tokenCreateTx.sign(operatorPrivateKey);
    const tokenCreateSubmit = await tokenCreateTxSigned.execute(client);
    const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);

    if (tokenCreateReceipt.status !== Status.Success) {
      throw new Error(
        `Token creation failed with status: ${tokenCreateReceipt.status}`
      );
    }

    const tokenId = tokenCreateReceipt.tokenId?.toString();
    const transactionId = tokenCreateSubmit.transactionId.toString();

    if (!tokenId) {
      throw new Error("Token ID not returned from Hedera");
    }

    console.log(`Token created successfully: ${tokenId}`);

    // Skipping minting: tokens will be minted after the presale window closes.
    // This aligns with the agreed flow to accept fiat commitments first.


    // Record tokenization event on HCS
    const auditEvent = {
      eventType: "PROPERTY_TOKENIZATION",
      eventData: {
        propertyId: tokenData.property_id,
        tokenId: tokenId,
        totalSupply: parseInt(tokenData.total_supply),
        tokenPrice: parseFloat(Number(tokenData.token_price).toFixed(2)),
        legalStructure: tokenData.legal_structure,
        action: "TOKEN_CREATED",
        timestamp: new Date().toISOString(),
        version: "1.0",
        fileId: fileId?.toString(),
      },
      metadata: {
        source: "hedera-consensus-service",
        network: "testnet",
        propertyTitle: tokenData.property?.title,
        location: tokenData.property?.location,
        titleNumber: tokenData.land_titles?.title_number,
        fileId: fileId?.toString(),
      },
    };

    console.log("Recording tokenization event on HCS...");

    const messageSubmitTx = new TopicMessageSubmitTransaction()
      .setTopicId(TopicId.fromString(topicId))
      .setMessage(JSON.stringify(auditEvent))
      .setMaxTransactionFee(new Hbar(2))
      .freezeWith(client);

    const messageSubmitTxSigned = await messageSubmitTx.sign(
      operatorPrivateKey
    );
    const messageSubmitSubmit = await messageSubmitTxSigned.execute(client);
    const messageSubmitReceipt = await messageSubmitSubmit.getReceipt(client);

    if (messageSubmitReceipt.status !== Status.Success) {
      console.warn(
        `HCS message submission failed with status: ${messageSubmitReceipt.status}`
      );
    } else {
      console.log("Tokenization event recorded on HCS successfully");

      // Store audit event in database
      const { data: hcsTopicData } = await supabase
        .from("hcs_topics")
        .select("id")
        .eq("topic_id", topicId)
        .single();

      if (hcsTopicData) {
        await supabase.from("audit_events").insert({
          hcs_topic_id: hcsTopicData.id,
          event_type: "PROPERTY_TOKENIZATION",
          event_data: auditEvent.eventData,
          consensus_timestamp:
            messageSubmitReceipt.topicRunningHash?.toString(),
          sequence_number: messageSubmitReceipt.topicSequenceNumber?.toNumber(),
          transaction_id: messageSubmitSubmit.transactionId.toString(),
        });
      }
    }

    // Mark property as tokenized (without minting)
    await supabase
      .from("properties")
      .update({
        is_tokenized: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", tokenData.property_id || "");

    const { error: updateError } = await supabase
      .from("tokenized_properties")
      .update({
        hedera_token_id: tokenId,
        hedera_transaction_id: transactionId,
        token_id: tokenId, // Populate the token_id field
        token_contract_address: `0x${tokenId
          .split(".")
          .slice(1)
          .join("")
          .padStart(40, "0")}`, // Generate EVM address format
        updated_at: new Date().toISOString(),
        metadata: {
          ...tokenMetadata,
          fileId: fileId?.toString(),
        },
      })
      .eq("id", tokenizedPropertyId);

    if (updateError) {
      console.error("Database update failed:", updateError);
      throw new Error(`Failed to update database: ${updateError.message}`);
    }

    // Create hedera_tokens record with comprehensive metadata
    await supabase.from("hedera_tokens").insert({
      tokenized_property_id: tokenizedPropertyId,
      hedera_token_id: tokenId,
      token_name: tokenData.token_name,
      token_symbol: tokenData.token_symbol,
      total_supply: Number(tokenData.total_supply), // Ensure proper number conversion
      treasury_account_id: hederaAccountId,
      metadata: {
        propertyBlockchainHash: propertyData?.blockchain_hash,
        tokenMetadata: tokenMetadata,
        createdAt: new Date().toISOString(),
        transactionId: transactionId,
        topicId: topicId,
        fileId: fileId?.toString(),
      },
    });

    console.log("Token creation and HCS audit trail completed successfully");

    // PHASE 2: Auto-create investment group for the tokenized property
    console.log("Creating investment group for token sales window...");
    try {
      const createGroupResponse = await supabase.functions.invoke(
        "create-investment-group",
        {
          body: {
            tokenizedPropertyId: tokenizedPropertyId,
            salesWindowDays: 30, // Default 30-day sales window
          },
        }
      );

      if (createGroupResponse.error) {
        console.warn(
          "Failed to auto-create investment group:",
          createGroupResponse.error
        );
      } else {
        console.log(
          "Investment group created successfully:",
          createGroupResponse.data
        );
      }
    } catch (groupError) {
      console.warn("Failed to auto-create investment group:", groupError);
      // Don't fail the entire token creation for this
    }

    // Close Hedera client
    client.close();

    return new Response(
      JSON.stringify({
        success: true,
        tokenId,
        transactionId,
        topicId,
        message:
          "Token created successfully on Hedera network with HCS audit trail",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Token creation failed:", error);

    // Update status to failed if we have the property ID
    try {
      const body = await req.clone().json();
      const { tokenizedPropertyId } = body;

      if (tokenizedPropertyId) {
        await supabase
          .from("tokenized_properties")
          .update({
            status: "creation_failed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", tokenizedPropertyId);
      }
    } catch (updateError) {
      console.error("Failed to update status to creation_failed:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
        message: "Failed to create token on Hedera network",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
