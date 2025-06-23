
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Client,
  AccountId,
  PrivateKey,
  TokenId,
  TokenAssociateTransaction,
  Hbar
} from "https://esm.sh/@hashgraph/sdk@2.65.1";
import { 
  createTypedSupabaseClient,
  createSuccessResponse, 
  createErrorResponse,
  createResponse,
  createCorsResponse,
  verifyUser 
} from '../shared/supabase-client.ts';

interface TokenAssociationRequest {
  tokenId: string;
  investorAccountId: string;
  investorPrivateKey: string;
}

interface TokenAssociationResponse {
  success: boolean;
  transaction_id: string;
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const userResult = await verifyUser(authHeader);
    
    if (!userResult.success) {
      return createResponse(userResult, 401);
    }

    const { tokenId, investorAccountId, investorPrivateKey }: TokenAssociationRequest = await req.json();

    if (!tokenId || !investorAccountId || !investorPrivateKey) {
      return createResponse(createErrorResponse('Missing required fields'), 400);
    }

    // Get Hedera credentials
    const hederaAccountId = Deno.env.get('HEDERA_ACCOUNT_ID');
    const hederaPrivateKey = Deno.env.get('HEDERA_PRIVATE_KEY');

    if (!hederaAccountId || !hederaPrivateKey) {
      const mockResponse: TokenAssociationResponse = {
        success: true,
        message: 'Mock token association for development',
        transaction_id: `mock_assoc_${Date.now()}`
      };
      return createResponse(createSuccessResponse(mockResponse));
    }

    // Initialize Hedera client
    const client = Client.forTestnet();
    const investorKey = PrivateKey.fromStringECDSA(investorPrivateKey);
    const investorAccount = AccountId.fromString(investorAccountId);
    const token = TokenId.fromString(tokenId);

    console.log('Associating token with investor account:', { tokenId, investorAccountId });

    try {
      // Create token association transaction
      const associateTx = new TokenAssociateTransaction()
        .setAccountId(investorAccount)
        .setTokenIds([token])
        .setMaxTransactionFee(new Hbar(5))
        .freezeWith(client);

      // Sign with investor's private key
      const associateSign = await associateTx.sign(investorKey);
      const associateSubmit = await associateSign.execute(client);
      const associateReceipt = await associateSubmit.getReceipt(client);

      console.log('Token association successful:', associateSubmit.transactionId.toString());

      // Store association record
      const supabase = createTypedSupabaseClient();
      const { error: insertError } = await supabase
        .from('token_associations')
        .insert({
          user_id: userResult.data.id,
          token_id: tokenId,
          hedera_account_id: investorAccountId,
          transaction_id: associateSubmit.transactionId.toString(),
          status: 'associated',
          associated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Database insert error:', insertError);
      }

      client.close();

      const response: TokenAssociationResponse = {
        success: true,
        transaction_id: associateSubmit.transactionId.toString(),
        message: 'Token association successful'
      };

      return createResponse(createSuccessResponse(response));

    } catch (hederaError) {
      console.error('Hedera association error:', hederaError);
      client.close();
      
      const errorMessage = hederaError instanceof Error ? hederaError.message : String(hederaError);
      return createResponse(createErrorResponse('Failed to associate token', errorMessage), 500);
    }

  } catch (error) {
    console.error('Token association error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(createErrorResponse('Internal server error', errorMessage), 500);
  }
});
