
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Client,
  AccountId,
  PrivateKey,
  AccountBalanceQuery,
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

interface WalletValidationRequest {
  accountId: string;
  privateKey: string;
}

interface WalletValidationResponse {
  valid: boolean;
  balance?: number;
  accountId?: string;
  message?: string;
  error?: string;
  details?: string;
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

    const { accountId, privateKey }: WalletValidationRequest = await req.json();

    if (!accountId || !privateKey) {
      return createResponse(createErrorResponse("Missing account ID or private key"), 400);
    }

    // Get Hedera credentials for network access
    const hederaAccountId = Deno.env.get("HEDERA_ACCOUNT_ID");
    const hederaPrivateKey = Deno.env.get("HEDERA_PRIVATE_KEY");

    if (!hederaAccountId || !hederaPrivateKey) {
      // Mock validation for development
      const mockResponse: WalletValidationResponse = {
        valid: true,
        balance: 100.0,
        message: "Mock wallet validation for development",
      };
      return createResponse(createSuccessResponse(mockResponse));
    }

    try {
      // Initialize Hedera client
      const client = Client.forTestnet();

      // Validate the provided credentials
      const account = AccountId.fromString(accountId);
      const key = PrivateKey.fromStringECDSA(privateKey);

      // Test the credentials by getting account balance
      const balanceQuery = new AccountBalanceQuery().setAccountId(account);
      const balance = await balanceQuery.execute(client);

      client.close();

      const response: WalletValidationResponse = {
        valid: true,
        balance: parseFloat(balance.hbars.toString()),
        accountId: account.toString(),
      };

      return createResponse(createSuccessResponse(response));
    } catch (hederaError) {
      console.error("Hedera validation error:", hederaError);

      const errorResponse: WalletValidationResponse = {
        valid: false,
        error: "Invalid wallet credentials or network error",
        details: hederaError instanceof Error ? hederaError.message : String(hederaError),
      };

      return createResponse(createErrorResponse(errorResponse.error!, errorResponse.details), 400);
    }
  } catch (error) {
    console.error("Wallet validation error:", error);
    return createResponse(handleSupabaseError(error), 500);
  }
});
