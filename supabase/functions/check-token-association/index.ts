
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Client,
  AccountId,
  TokenId,
  AccountInfoQuery
} from "https://esm.sh/@hashgraph/sdk@2.65.1";
import { 
  createSuccessResponse, 
  createErrorResponse,
  createResponse,
  createCorsResponse,
  verifyUser 
} from '../shared/supabase-client.ts';

interface TokenAssociationRequest {
  tokenId: string;
  accountId: string;
}

interface TokenAssociationResponse {
  isAssociated: boolean;
  accountId: string;
  tokenId: string;
  message?: string;
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

    const { tokenId, accountId }: TokenAssociationRequest = await req.json();

    if (!tokenId || !accountId) {
      return createResponse(createErrorResponse('Missing token ID or account ID'), 400);
    }

    // Get Hedera credentials
    const hederaAccountId = Deno.env.get('HEDERA_ACCOUNT_ID');
    const hederaPrivateKey = Deno.env.get('HEDERA_PRIVATE_KEY');

    if (!hederaAccountId || !hederaPrivateKey) {
      // Mock association check for development
      const mockResponse: TokenAssociationResponse = {
        isAssociated: true,
        accountId,
        tokenId,
        message: 'Mock token association check for development'
      };
      return createResponse(createSuccessResponse(mockResponse));
    }

    try {
      // Initialize Hedera client
      const client = Client.forTestnet();
      
      const account = AccountId.fromString(accountId);
      const token = TokenId.fromString(tokenId);
      
      // Get account info to check token associations
      const accountInfo = await new AccountInfoQuery()
        .setAccountId(account)
        .execute(client);
      
      // Check if token is already associated
      const isAssociated = accountInfo.tokenRelationships.has(token);
      
      client.close();

      const response: TokenAssociationResponse = {
        isAssociated,
        accountId: account.toString(),
        tokenId: token.toString()
      };

      return createResponse(createSuccessResponse(response));

    } catch (hederaError) {
      console.error('Hedera association check error:', hederaError);
      
      const errorMessage = hederaError instanceof Error ? hederaError.message : String(hederaError);
      return createResponse(createErrorResponse('Failed to check token association', errorMessage), 500);
    }

  } catch (error) {
    console.error('Token association check error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(createErrorResponse('Internal server error', errorMessage), 500);
  }
});
