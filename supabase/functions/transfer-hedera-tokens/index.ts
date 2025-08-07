import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.6";
import {
  Client,
  AccountId,
  PrivateKey,
  TokenId,
  TransferTransaction,
  Hbar,
} from "https://esm.sh/@hashgraph/sdk@2.65.1";
import { systemLogger } from "../shared/system-logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(authHeader.replace("Bearer ", ""));

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const {
      tokenId,
      fromAccountId,
      toAccountId,
      amount,
      fromPrivateKey,
      tokenizedPropertyId,
      pricePerToken,
      paymentReference,
      userId,
    } = await req.json();

    if (
      !tokenId ||
      !fromAccountId ||
      !toAccountId ||
      !amount ||
      !fromPrivateKey
    ) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get Hedera credentials
    const hederaAccountId = Deno.env.get("HEDERA_ACCOUNT_ID");
    const hederaPrivateKey = Deno.env.get("HEDERA_PRIVATE_KEY");

    if (!hederaAccountId || !hederaPrivateKey) {
      systemLogger(
        "[TRANSFER-HEDERA-TOKENS]",
        "Hedera credentials not configured"
      );
      return new Response(
        JSON.stringify({ error: "Hedera token service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Initialize Hedera client
    const client = Client.forTestnet();
    const fromKey = PrivateKey.fromStringECDSA(fromPrivateKey);
    const fromAccount = AccountId.fromString(fromAccountId);
    const toAccount = AccountId.fromString(toAccountId);
    const token = TokenId.fromString(tokenId);

    systemLogger("[TRANSFER-HEDERA-TOKENS]", {
      tokenId,
      fromAccountId,
      toAccountId,
      amount,
    });

    try {
      // Create transfer transaction
      const transferTx = new TransferTransaction()
        .addTokenTransfer(token, fromAccount, -amount * 100) // Convert to smallest unit
        .addTokenTransfer(token, toAccount, amount * 100)
        .setMaxTransactionFee(new Hbar(10))
        .freezeWith(client);

      // Sign with sender's private key
      const transferSign = await transferTx.sign(fromKey);
      const transferSubmit = await transferSign.execute(client);
      const transferReceipt = await transferSubmit.getReceipt(client);

      systemLogger(
        "[TRANSFER-HEDERA-TOKENS]",
        `Token transfer successful: ${transferSubmit.transactionId.toString()}`
      );

      // Record transaction in database
      const { error: insertError } = await supabaseClient
        .from("token_transactions")
        .insert({
          tokenized_property_id: tokenizedPropertyId,
          from_holder: fromAccountId,
          to_holder: toAccountId,
          token_amount: amount.toString(),
          price_per_token: pricePerToken || 0,
          total_value: amount * (pricePerToken || 0),
          transaction_type: "transfer",
          hedera_transaction_id: transferSubmit.transactionId.toString(),
          status: "confirmed",
          metadata: {
            payment_reference: paymentReference,
            purchase_type: "token_purchase",
          }
        });

      if (insertError) {
        systemLogger("[TRANSFER-HEDERA-TOKENS]", insertError);
      }

      // Create or update token holdings for buyer
      if (userId) {
        const { error: holdingError } = await supabaseClient
          .from("token_holdings")
          .upsert({
            tokenized_property_id: tokenizedPropertyId,
            holder_id: userId,
            tokens_owned: amount.toString(),
            purchase_price_per_token: pricePerToken || 0,
            total_investment: amount * (pricePerToken || 0),
            acquisition_date: new Date().toISOString(),
          }, {
            onConflict: "holder_id,tokenized_property_id",
            ignoreDuplicates: false,
          });

        if (holdingError) {
          systemLogger("[TRANSFER-HEDERA-TOKENS]", `Token holdings update failed: ${holdingError.message}`);
        }

        // Initialize investment tracking
        await supabaseClient.rpc("create_investment_tracking", {
          p_user_id: userId,
          p_tokenized_property_id: tokenizedPropertyId,
          p_tokens_owned: amount,
          p_investment_amount: amount * (pricePerToken || 0),
          p_purchase_price_per_token: pricePerToken || 0,
        });
      }

      client.close();

      return new Response(
        JSON.stringify({
          success: true,
          transaction_id: transferSubmit.transactionId.toString(),
          message: "Token transfer successful",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (hederaError) {
      systemLogger("[TRANSFER-HEDERA-TOKENS]", hederaError);
      client.close();

      const message = (hederaError as Error).message || "Unknown error";

      return new Response(
        JSON.stringify({
          error: "Failed to transfer tokens",
          details: message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    systemLogger("[TRANSFER-HEDERA-TOKENS]", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
