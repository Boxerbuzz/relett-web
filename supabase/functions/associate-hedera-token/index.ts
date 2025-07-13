
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
  // Private key removed for security - will be retrieved from Supabase Vault
}

interface HederaCredentials {
  accountId: string;
  privateKey: string;
}

/**
 * Retrieve user's Hedera private key from Supabase Vault
 */
async function getUserHederaCredentials(supabaseClient: any, userId: string): Promise<HederaCredentials | null> {
  try {
    const { data, error } = await supabaseClient
      .from('user_hedera_accounts')
      .select('hedera_account_id, private_key_vault_id')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      console.log(`No active Hedera account found for user: ${userId}`);
      return null;
    }

    // Retrieve private key from Supabase Vault
    const { data: vaultData, error: vaultError } = await supabaseClient
      .rpc('vault_get', { secret_id: data.private_key_vault_id });

    if (vaultError || !vaultData) {
      console.error(`Failed to retrieve private key from vault: ${vaultError?.message}`);
      return null;
    }

    return {
      accountId: data.hedera_account_id,
      privateKey: vaultData
    };
  } catch (error) {
    console.error(`Error retrieving Hedera credentials: ${error.message}`);
    return null;
  }
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

  let client: Client | null = null;

  try {
    const authHeader = req.headers.get('Authorization')!;
    const userResult = await verifyUser(authHeader);
    
    if (!userResult.success) {
      return createResponse(userResult, 401);
    }

    const { tokenId, investorAccountId }: TokenAssociationRequest = await req.json();

    if (!tokenId || !investorAccountId) {
      return createResponse(createErrorResponse('Missing required fields'), 400);
    }

    // Get user's Hedera credentials from Vault
    const supabase = createTypedSupabaseClient();
    const hederaCredentials = await getUserHederaCredentials(supabase, userResult.data.id);
    if (!hederaCredentials) {
      return createResponse(createErrorResponse('User Hedera account not found or not properly configured'), 400);
    }

    // Verify that the investorAccountId matches the user's Hedera account
    if (hederaCredentials.accountId !== investorAccountId) {
      return createResponse(createErrorResponse('Token association can only be done for your linked Hedera account'), 403);
    }

    // Get Hedera credentials
    const hederaAccountId = Deno.env.get('HEDERA_ACCOUNT_ID');
    const hederaPrivateKey = Deno.env.get('HEDERA_PRIVATE_KEY');

    if (!hederaAccountId || !hederaPrivateKey) {
      console.error('Hedera credentials not configured');
      return createResponse(createErrorResponse('Hedera token association service not configured'), 500);
    }

    // Initialize Hedera client
    client = Client.forTestnet();
    const investorKey = PrivateKey.fromStringECDSA(hederaCredentials.privateKey);
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
      const _associateReceipt = await associateSubmit.getReceipt(client);

      console.log('Token association successful:', associateSubmit.transactionId.toString());

      // Store association record
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

      const response: TokenAssociationResponse = {
        success: true,
        transaction_id: associateSubmit.transactionId.toString(),
        message: 'Token association successful'
      };

      return createResponse(createSuccessResponse(response));

    } catch (hederaError) {
      console.error('Hedera association error:', hederaError);
      
      const errorMessage = hederaError instanceof Error ? hederaError.message : String(hederaError);
      return createResponse(createErrorResponse('Failed to associate token', errorMessage), 500);
    }

  } catch (error) {
    console.error('Token association error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(createErrorResponse('Internal server error', errorMessage), 500);
  } finally {
    // Ensure Hedera client is always closed
    if (client) {
      try {
        client.close();
      } catch (closeError) {
        console.error('Error closing Hedera client:', closeError);
      }
    }
  }
});
