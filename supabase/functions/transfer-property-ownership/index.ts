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

interface OwnershipTransferRequest {
  propertyId: string;
  newOwnerId: string;
  previousOwnerId: string;
  transferReason: string;
  transferType: 'sale' | 'inheritance' | 'gift' | 'court_order' | 'other';
  salePrice?: number;
  currency?: string;
  legalDocuments?: {
    documentType: string;
    documentHash: string;
    documentName: string;
  }[];
  previousBlockchainHash?: string;
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

    const transferData: OwnershipTransferRequest = await req.json();

    systemLogger("[TRANSFER-PROPERTY-OWNERSHIP]", { transferData });

    // Get Hedera credentials
    const hederaAccountId = Deno.env.get("HEDERA_ACCOUNT_ID");
    const hederaPrivateKey = Deno.env.get("HEDERA_PRIVATE_KEY");

    if (!hederaAccountId || !hederaPrivateKey) {
      systemLogger(
        "[TRANSFER-PROPERTY-OWNERSHIP]",
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
      // Get current property data from database
      const supabase = createTypedSupabaseClient();
      
      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .select(`
          *,
          property_documents(id, document_type, document_name, document_hash)
        `)
        .eq("id", transferData.propertyId)
        .single();

      if (propertyError || !property) {
        throw new Error("Property not found");
      }

      // Create ownership transfer document on Hedera File Service
      const transferDocument = JSON.stringify({
        // Transfer Identity
        transferId: crypto.randomUUID(),
        propertyId: transferData.propertyId,
        
        // Ownership Change
        previousOwnerId: transferData.previousOwnerId,
        newOwnerId: transferData.newOwnerId,
        transferTimestamp: new Date().toISOString(),
        
        // Transfer Details
        transferType: transferData.transferType,
        transferReason: transferData.transferReason,
        salePrice: transferData.salePrice,
        currency: transferData.currency,
        
        // Legal Documentation
        legalDocuments: transferData.legalDocuments || [],
        
        // Blockchain History
        previousBlockchainHash: transferData.previousBlockchainHash || property.blockchain_hash,
        linkedToOriginalRegistration: property.blockchain_hash,
        
        // Current Property Snapshot
        propertySnapshot: {
          title: property.title,
          type: property.type,
          location: property.location,
          price: property.price,
          specification: property.specification,
          features: property.features,
          amenities: property.amenities,
          documentHashes: property.property_documents?.map((doc: any) => ({
            documentId: doc.id,
            documentType: doc.document_type,
            documentName: doc.document_name,
            hash: doc.document_hash
          })) || [],
        },
        
        // Transfer Metadata
        recordedBy: operatorId.toString(),
        verifiedBy: userResult.user?.id,
        version: "1.0",
        schemaType: "ownership-transfer"
      });

      // Create file transaction for ownership transfer
      const fileCreateTx = new FileCreateTransaction()
        .setKeys([operatorKey])
        .setContents(transferDocument)
        .setMaxTransactionFee(new Hbar(2))
        .freezeWith(client);

      const fileCreateSign = await fileCreateTx.sign(operatorKey);
      const fileCreateSubmit = await fileCreateSign.execute(client);
      const fileCreateReceipt = await fileCreateSubmit.getReceipt(client);

      const fileId = fileCreateReceipt.fileId;
      if (!fileId) {
        throw new Error("Ownership transfer file creation failed");
      }

      systemLogger(
        "[TRANSFER-PROPERTY-OWNERSHIP]",
        `Ownership transfer recorded on Hedera: ${fileId.toString()}`
      );

      // Get file info for verification
      const fileInfo = await new FileInfoQuery()
        .setFileId(fileId)
        .execute(client);

      // Update property ownership in database
      const { error: updateError } = await supabase
        .from("properties")
        .update({
          user_id: transferData.newOwnerId,
          blockchain_transaction_id: fileCreateSubmit.transactionId.toString(),
          blockchain_hash: fileId.toString(),
          ownership_transfer_history: property.ownership_transfer_history 
            ? [...(property.ownership_transfer_history as any[]), {
                previousOwner: transferData.previousOwnerId,
                newOwner: transferData.newOwnerId,
                transferDate: new Date().toISOString(),
                transferType: transferData.transferType,
                blockchainHash: fileId.toString(),
                transactionId: fileCreateSubmit.transactionId.toString()
              }]
            : [{
                previousOwner: transferData.previousOwnerId,
                newOwner: transferData.newOwnerId,
                transferDate: new Date().toISOString(),
                transferType: transferData.transferType,
                blockchainHash: fileId.toString(),
                transactionId: fileCreateSubmit.transactionId.toString()
              }],
          updated_at: new Date().toISOString(),
        })
        .eq("id", transferData.propertyId);

      if (updateError) {
        systemLogger(
          "[TRANSFER-PROPERTY-OWNERSHIP]",
          `Error updating property ownership: ${updateError}`
        );
        client.close();
        return createResponse(
          createErrorResponse("Failed to update property ownership"),
          500
        );
      }

      client.close();

      systemLogger(
        "[TRANSFER-PROPERTY-OWNERSHIP]",
        `Property ${transferData.propertyId} ownership transferred on blockchain with transaction ${fileCreateSubmit.transactionId.toString()}`
      );

      const response = {
        success: true,
        transactionId: fileCreateSubmit.transactionId.toString(),
        fileId: fileId.toString(),
        status: "SUCCESS",
        network: "hedera-testnet",
        fileSize: fileInfo.size.toString(),
        message: "Property ownership transfer recorded on Hedera blockchain successfully",
        previousBlockchainHash: transferData.previousBlockchainHash || property.blockchain_hash,
        newBlockchainHash: fileId.toString()
      };

      return createResponse(createSuccessResponse(response));
    } catch (hederaError) {
      systemLogger(
        "[TRANSFER-PROPERTY-OWNERSHIP]",
        `Hedera ownership transfer error: ${hederaError}`
      );
      client.close();

      const errorMessage =
        hederaError instanceof Error
          ? hederaError.message
          : String(hederaError);
      return createResponse(
        createErrorResponse(
          "Hedera ownership transfer failed",
          errorMessage
        ),
        500
      );
    }
  } catch (error) {
    systemLogger("[TRANSFER-PROPERTY-OWNERSHIP]", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(
      createErrorResponse("Ownership transfer failed", errorMessage),
      500
    );
  }
});