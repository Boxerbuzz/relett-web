import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Client,
  AccountId,
  PrivateKey,
  TokenAssociateTransaction,
  TokenTransferTransaction,
  TokenId,
  Hbar,
} from "https://esm.sh/@hashgraph/sdk@2.65.1";
import { 
  createTypedSupabaseClient,
  handleSupabaseError, 
  createSuccessResponse, 
  createErrorResponse,
  createResponse,
  createCorsResponse,
  verifyUser 
} from '../shared/supabase-client.ts';

interface TokenTransferRequest {
  tokenId: string;
  toAccountId: string;
  amount: number;
  type: 'investment' | 'purchase';
  paymentId?: string;
  investorId?: string;
  tokenizedPropertyId?: string;
}

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

    const { 
      tokenId, 
      toAccountId, 
      amount, 
      type, 
      paymentId,
      investorId,
      tokenizedPropertyId 
    }: TokenTransferRequest = await req.json();

    if (!tokenId || !toAccountId || !amount) {
      return createResponse(createErrorResponse("Missing required parameters"), 400);
    }

    // Get Hedera credentials from secure environment
    const hederaAccountId = Deno.env.get("HEDERA_ACCOUNT_ID");
    const hederaPrivateKey = Deno.env.get("HEDERA_PRIVATE_KEY");

    if (!hederaAccountId || !hederaPrivateKey) {
      console.error('Hedera credentials not configured');
      return createResponse(createErrorResponse('Hedera service not configured'), 500);
    }

    const supabase = createTypedSupabaseClient();

    try {
      // Initialize Hedera client
      const client = Client.forTestnet();
      client.setOperator(
        AccountId.fromString(hederaAccountId),
        PrivateKey.fromStringECDSA(hederaPrivateKey)
      );

      const treasuryAccount = AccountId.fromString(hederaAccountId);
      const treasuryKey = PrivateKey.fromStringECDSA(hederaPrivateKey);
      const recipientAccount = AccountId.fromString(toAccountId);
      const token = TokenId.fromString(tokenId);

      // Step 1: Associate token with recipient account if needed
      console.log(`Associating token ${tokenId} with account ${toAccountId}`);
      
      // Note: In production, you'd want to check if association already exists
      // For now, we'll attempt association and handle potential errors
      try {
        const associateTransaction = new TokenAssociateTransaction()
          .setAccountId(recipientAccount)
          .setTokenIds([token])
          .freezeWith(client);

        // This would require the recipient's private key
        // In a real implementation, this would be done by the recipient
        console.log("Token association may be required - this should be handled by the recipient");
      } catch (associateError) {
        console.log("Association may already exist or needs to be done by recipient");
      }

      // Step 2: Transfer tokens from treasury to recipient
      console.log(`Transferring ${amount} tokens from treasury to ${toAccountId}`);
      
      const transferTransaction = new TokenTransferTransaction()
        .addTokenTransfer(token, treasuryAccount, -amount)
        .addTokenTransfer(token, recipientAccount, amount)
        .freezeWith(client);

      const signedTransaction = await transferTransaction.sign(treasuryKey);
      const transactionResponse = await signedTransaction.execute(client);
      const receipt = await transactionResponse.getReceipt(client);
      
      if (receipt.status.toString() !== 'SUCCESS') {
        throw new Error(`Transaction failed with status: ${receipt.status.toString()}`);
      }

      // Step 3: Record the transaction in database
      if (paymentId) {
        await supabase
          .from('payments')
          .update({
            metadata: {
              hedera_transaction_id: transactionResponse.transactionId.toString(),
              hedera_consensus_timestamp: receipt.consensusTimestamp?.toString(),
              transfer_completed: true
            }
          })
          .eq('id', paymentId);
      }

      // Step 4: Record token transaction
      if (investorId && tokenizedPropertyId) {
        await supabase
          .from('token_transactions')
          .insert({
            tokenized_property_id: tokenizedPropertyId,
            to_holder: investorId,
            token_amount: amount.toString(),
            transaction_type: 'transfer',
            status: 'confirmed',
            hedera_transaction_id: transactionResponse.transactionId.toString(),
            metadata: {
              transfer_type: type,
              recipient_account: toAccountId,
              consensus_timestamp: receipt.consensusTimestamp?.toString()
            }
          });
      }

      client.close();

      return createResponse(createSuccessResponse({
        transactionId: transactionResponse.transactionId.toString(),
        consensusTimestamp: receipt.consensusTimestamp?.toString(),
        amount,
        tokenId,
        recipientAccount: toAccountId
      }));

    } catch (hederaError) {
      console.error("Hedera transaction failed:", hederaError);
      
      // Update payment status if applicable
      if (paymentId) {
        const supabase = createTypedSupabaseClient();
        await supabase
          .from('payments')
          .update({
            status: 'failed',
            metadata: {
              error: hederaError instanceof Error ? hederaError.message : String(hederaError)
            }
          })
          .eq('id', paymentId);
      }

      return createResponse(createErrorResponse(
        "Token transfer failed",
        hederaError instanceof Error ? hederaError.message : String(hederaError)
      ), 500);
    }
  } catch (error) {
    console.error("Token transfer error:", error);
    return createResponse(handleSupabaseError(error), 500);
  }
});