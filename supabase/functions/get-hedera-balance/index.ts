
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Client,
  AccountId,
  AccountBalanceQuery
} from "https://esm.sh/@hashgraph/sdk@2.65.1";
import { 
  createSuccessResponse, 
  createErrorResponse,
  createResponse,
  createCorsResponse,
  verifyUser 
} from '../shared/supabase-client.ts';

interface BalanceRequest {
  accountId: string;
}

interface TokenBalance {
  tokenId: string;
  balance: string;
}

interface BalanceResponse {
  balance: number;
  tokens: TokenBalance[];
  accountId: string;
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

    const { accountId }: BalanceRequest = await req.json();

    if (!accountId) {
      return createResponse(createErrorResponse('Missing account ID'), 400);
    }

    // Get Hedera credentials
    const hederaAccountId = Deno.env.get('HEDERA_ACCOUNT_ID');
    const hederaPrivateKey = Deno.env.get('HEDERA_PRIVATE_KEY');

    if (!hederaAccountId || !hederaPrivateKey) {
      // Mock balance for development
      const mockResponse: BalanceResponse = {
        balance: 100.0,
        tokens: [],
        accountId,
        message: 'Mock balance check for development'
      };
      return createResponse(createSuccessResponse(mockResponse));
    }

    try {
      // Initialize Hedera client
      const client = Client.forTestnet();
      
      const account = AccountId.fromString(accountId);
      
      // Get account balance
      const balance = await new AccountBalanceQuery()
        .setAccountId(account)
        .execute(client);
      
      // Convert token balances to array
      const tokenBalances: TokenBalance[] = [];
      if (balance.tokens) {
        Object.entries(balance.tokens).forEach(([tokenId, amount]) => {
          tokenBalances.push({
            tokenId: tokenId.toString(),
            balance: amount.toString(),
          });
        });
      }
      
      client.close();

      const response: BalanceResponse = {
        balance: parseFloat(balance.hbars.toString()),
        tokens: tokenBalances,
        accountId: account.toString()
      };

      return createResponse(createSuccessResponse(response));

    } catch (hederaError) {
      console.error('Hedera balance query error:', hederaError);
      
      const errorMessage = hederaError instanceof Error ? hederaError.message : String(hederaError);
      return createResponse(createErrorResponse('Failed to get account balance', errorMessage), 500);
    }

  } catch (error) {
    console.error('Balance query error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(createErrorResponse('Internal server error', errorMessage), 500);
  }
});
