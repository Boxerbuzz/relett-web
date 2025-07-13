import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  Client,
  AccountId,
  PrivateKey,
  FileCreateTransaction,
  FileInfoQuery,
  Hbar,
} from "https://esm.sh/@hashgraph/sdk@2.65.1";
import {
  createTypedSupabaseClient,
  createSuccessResponse,
  createErrorResponse,
  createResponse,
  createCorsResponse,
  verifyUser,
} from "../shared/supabase-client.ts";
import { systemLogger } from "../shared/system-logger.ts";

interface PropertyRegistrationRequest {
  propertyId: string;
  landTitleId: string;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  totalValue: number;
  minimumInvestment: number;
  expectedROI: number;
  lockupPeriod: number;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createCorsResponse();
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const userResult = await verifyUser(authHeader);

    if (!userResult.success) {
      return createResponse(userResult, 401);
    }

    const propertyData: PropertyRegistrationRequest = await req.json();

    systemLogger("[REGISTER-PROPERTY-BLOCKCHAIN]", { propertyData });

    // Get Hedera credentials
    const hederaAccountId = Deno.env.get("HEDERA_ACCOUNT_ID");
    const hederaPrivateKey = Deno.env.get("HEDERA_PRIVATE_KEY");

    if (!hederaAccountId || !hederaPrivateKey) {
      systemLogger(
        "[REGISTER-PROPERTY-BLOCKCHAIN]",
        "Hedera credentials not configured"
      );
      return createResponse(
        createErrorResponse("Blockchain service not configured"),
        500
      );
    }

    // Initialize Hedera client
    const client = Client.forTestnet();
    const operatorId = AccountId.fromString(hederaAccountId);
    const operatorKey = PrivateKey.fromStringECDSA(hederaPrivateKey);
    client.setOperator(operatorId, operatorKey);

    try {
      // Create property document on Hedera File Service
      const propertyDocument = JSON.stringify({
        propertyId: propertyData.propertyId,
        landTitleId: propertyData.landTitleId,
        tokenName: propertyData.tokenName,
        tokenSymbol: propertyData.tokenSymbol,
        totalSupply: propertyData.totalSupply,
        totalValue: propertyData.totalValue,
        minimumInvestment: propertyData.minimumInvestment,
        expectedROI: propertyData.expectedROI,
        lockupPeriod: propertyData.lockupPeriod,
        registrationTimestamp: new Date().toISOString(),
        registeredBy: operatorId.toString(),
      });

      // Create file transaction
      const fileCreateTx = new FileCreateTransaction()
        .setKeys([operatorKey])
        .setContents(propertyDocument)
        .setMaxTransactionFee(new Hbar(2))
        .freezeWith(client);

      const fileCreateSign = await fileCreateTx.sign(operatorKey);
      const fileCreateSubmit = await fileCreateSign.execute(client);
      const fileCreateReceipt = await fileCreateSubmit.getReceipt(client);

      const fileId = fileCreateReceipt.fileId;
      if (!fileId) {
        throw new Error("File creation failed - no file ID returned");
      }

      systemLogger(
        "[REGISTER-PROPERTY-BLOCKCHAIN]",
        `Property document created on Hedera: ${fileId.toString()}`
      );

      // Get file info for verification
      const fileInfo = await new FileInfoQuery()
        .setFileId(fileId)
        .execute(client);

      // Store blockchain registration record in database
      const supabase = createTypedSupabaseClient();

      const { error: dbError } = await supabase
        .from("properties")
        .update({
          blockchain_transaction_id: fileCreateSubmit.transactionId.toString(),
          blockchain_hash: fileId.toString(),
          is_blockchain_registered: true,
          blockchain_network: "hedera-testnet",
          updated_at: new Date().toISOString(),
        })
        .eq("id", propertyData.propertyId);

      if (dbError) {
        systemLogger(
          "[REGISTER-PROPERTY-BLOCKCHAIN]",
          `Error updating property blockchain status: ${dbError}`
        );
        client.close();
        return createResponse(
          createErrorResponse("Failed to update property status"),
          500
        );
      }

      client.close();

      systemLogger(
        "[REGISTER-PROPERTY-BLOCKCHAIN]",
        `Property ${
          propertyData.propertyId
        } registered on blockchain with transaction ${fileCreateSubmit.transactionId.toString()}`
      );

      const response = {
        success: true,
        transactionId: fileCreateSubmit.transactionId.toString(),
        fileId: fileId.toString(),
        status: "SUCCESS",
        network: "hedera-testnet",
        fileSize: fileInfo.size.toString(),
        message: "Property registered on Hedera blockchain successfully",
      };

      return createResponse(createSuccessResponse(response));
    } catch (hederaError) {
      systemLogger(
        "[REGISTER-PROPERTY-BLOCKCHAIN]",
        `Hedera blockchain registration error: ${hederaError}`
      );
      client.close();

      const errorMessage =
        hederaError instanceof Error
          ? hederaError.message
          : String(hederaError);
      return createResponse(
        createErrorResponse(
          "Hedera blockchain registration failed",
          errorMessage
        ),
        500
      );
    }
  } catch (error) {
    systemLogger("[REGISTER-PROPERTY-BLOCKCHAIN]", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(
      createErrorResponse("Blockchain registration failed", errorMessage),
      500
    );
  }
});
