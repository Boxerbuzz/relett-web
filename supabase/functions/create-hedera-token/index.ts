
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Client,
  AccountId,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
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

interface TokenCreationRequest {
  tokenizedPropertyId: string;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  memo?: string;
}

interface TokenCreationResponse {
  success: boolean;
  token_id: string;
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

    const { tokenizedPropertyId, tokenName, tokenSymbol, totalSupply, memo }: TokenCreationRequest = await req.json();

    if (!tokenizedPropertyId || !tokenName || !tokenSymbol || !totalSupply) {
      return createResponse(createErrorResponse('Missing required fields'), 400);
    }

    // Get Hedera credentials
    const hederaAccountId = Deno.env.get('HEDERA_ACCOUNT_ID');
    const hederaPrivateKey = Deno.env.get('HEDERA_PRIVATE_KEY');

    if (!hederaAccountId || !hederaPrivateKey) {
      console.error('Hedera credentials not configured');
      return createResponse(createErrorResponse('Hedera token service not configured'), 500);
    }

    // Initialize Hedera client
    const operatorId = AccountId.fromString(hederaAccountId);
    const operatorKey = PrivateKey.fromStringECDSA(hederaPrivateKey);
    const client = Client.forTestnet();
    client.setOperator(operatorId, operatorKey);

    console.log('Creating Hedera token:', { tokenName, tokenSymbol, totalSupply });

    try {
      // Create the token
      const tokenCreateTx = new TokenCreateTransaction()
        .setTokenName(tokenName)
        .setTokenSymbol(tokenSymbol)
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(2)
        .setInitialSupply(totalSupply * 100) // Convert to smallest unit
        .setTreasuryAccountId(operatorId)
        .setAdminKey(operatorKey)
        .setSupplyKey(operatorKey)
        .setFreezeKey(operatorKey)
        .setWipeKey(operatorKey)
        .setMaxTransactionFee(new Hbar(30))
        .freezeWith(client);

      if (memo) {
        tokenCreateTx.setTokenMemo(memo);
      }

      // Sign and execute
      const tokenCreateSign = await tokenCreateTx.sign(operatorKey);
      const tokenCreateSubmit = await tokenCreateSign.execute(client);
      const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);
      
      const tokenId = tokenCreateReceipt.tokenId;
      if (!tokenId) {
        throw new Error('Token creation failed - no token ID returned');
      }

      console.log('Token created successfully:', tokenId.toString());

      // Update database with real token information
      const supabase = createTypedSupabaseClient();
      const { error: updateError } = await supabase
        .from('tokenized_properties')
        .update({
          hedera_token_id: tokenId.toString(),
          status: 'minted',
          metadata: {
            hedera_transaction_id: tokenCreateSubmit.transactionId.toString(),
            created_at: new Date().toISOString(),
            treasury_account: operatorId.toString()
          }
        })
        .eq('id', tokenizedPropertyId);

      if (updateError) {
        console.error('Database update error:', updateError);
        return createResponse(createErrorResponse('Token created but database update failed'), 500);
      }

      // Close client
      client.close();

      const response: TokenCreationResponse = {
        success: true,
        token_id: tokenId.toString(),
        transaction_id: tokenCreateSubmit.transactionId.toString(),
        message: 'Hedera token created successfully'
      };

      return createResponse(createSuccessResponse(response));

    } catch (hederaError) {
      console.error('Hedera token creation error:', hederaError);
      client.close();
      
      const errorMessage = hederaError instanceof Error ? hederaError.message : String(hederaError);
      return createResponse(createErrorResponse('Failed to create Hedera token', errorMessage), 500);
    }

  } catch (error) {
    console.error('Token creation error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(createErrorResponse('Internal server error', errorMessage), 500);
  }
});
