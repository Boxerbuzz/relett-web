
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  Client,
  AccountId,
  PrivateKey,
  TokenId,
  TransferTransaction,
  Hbar
} from "https://esm.sh/@hashgraph/sdk@2.65.1";
import { systemLogger } from "../shared/system-logger.ts";

interface TransferRequest {
  tokenId: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  tokenizedPropertyId: string;
  pricePerToken?: number;
}

interface HederaCredentials {
  accountId: string;
  privateKey: string;
}

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute per IP

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      systemLogger('[GET-HEDERA-CREDENTIALS]', `No active Hedera account found for user: ${userId}`);
      return null;
    }

    // Retrieve private key from Supabase Vault
    const { data: vaultData, error: vaultError } = await supabaseClient
      .rpc('vault_get', { secret_id: data.private_key_vault_id });

    if (vaultError || !vaultData) {
      systemLogger('[GET-HEDERA-CREDENTIALS]', `Failed to retrieve private key from vault: ${vaultError?.message}`);
      return null;
    }

    return {
      accountId: data.hedera_account_id,
      privateKey: vaultData
    };
  } catch (error) {
    systemLogger('[GET-HEDERA-CREDENTIALS]', `Error retrieving Hedera credentials: ${error.message}`);
    return null;
  }
}

/**
 * Check IP-based rate limiting
 */
function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitStore.get(clientIP);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  userLimit.count++;
  return true;
}

/**
 * Validate transfer request input
 */
function validateTransferRequest(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.tokenId || typeof data.tokenId !== 'string') {
    errors.push('tokenId is required and must be a string');
  }

  if (!data.fromAccountId || typeof data.fromAccountId !== 'string') {
    errors.push('fromAccountId is required and must be a string');
  }

  if (!data.toAccountId || typeof data.toAccountId !== 'string') {
    errors.push('toAccountId is required and must be a string');
  }

  if (!data.amount || typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push('amount is required and must be a positive number');
  }

  if (!data.tokenizedPropertyId || typeof data.tokenizedPropertyId !== 'string') {
    errors.push('tokenizedPropertyId is required and must be a string');
  }

  if (data.pricePerToken !== undefined && (typeof data.pricePerToken !== 'number' || data.pricePerToken < 0)) {
    errors.push('pricePerToken must be a non-negative number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Get client IP for rate limiting
  const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

  // Check rate limiting
  if (!checkRateLimit(clientIP)) {
    return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
      status: 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let client: Client | null = null;

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization header required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const requestData = await req.json();
    const validation = validateTransferRequest(requestData);

    if (!validation.isValid) {
      return new Response(JSON.stringify({ 
        error: 'Invalid request data', 
        details: validation.errors 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { 
      tokenId, 
      fromAccountId, 
      toAccountId, 
      amount, 
      tokenizedPropertyId,
      pricePerToken 
    }: TransferRequest = requestData;

    // Get user's Hedera credentials from Vault
    const hederaCredentials = await getUserHederaCredentials(supabaseClient, user.id);
    if (!hederaCredentials) {
      return new Response(JSON.stringify({ 
        error: 'User Hedera account not found or not properly configured' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify that the fromAccountId matches the user's Hedera account
    if (hederaCredentials.accountId !== fromAccountId) {
      return new Response(JSON.stringify({ 
        error: 'Transfer can only be initiated from your linked Hedera account' 
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Hedera client
    client = Client.forTestnet();
    const fromKey = PrivateKey.fromStringECDSA(hederaCredentials.privateKey);
    const fromAccount = AccountId.fromString(fromAccountId);
    const toAccount = AccountId.fromString(toAccountId);
    const token = TokenId.fromString(tokenId);

    systemLogger('[TRANSFER-HEDERA-TOKENS]', { tokenId, fromAccountId, toAccountId, amount });

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

      systemLogger('[TRANSFER-HEDERA-TOKENS]', `Token transfer successful: ${transferSubmit.transactionId.toString()}`);

      // Record transaction in database
      const { error: insertError } = await supabaseClient
        .from('token_transactions')
        .insert({
          tokenized_property_id: tokenizedPropertyId,
          from_holder: fromAccountId,
          to_holder: toAccountId,
          token_amount: amount.toString(),
          price_per_token: pricePerToken || 0,
          total_value: (amount * (pricePerToken || 0)),
          transaction_type: 'transfer',
          hedera_transaction_id: transferSubmit.transactionId.toString(),
          status: 'confirmed'
        });

      if (insertError) {
        systemLogger('[TRANSFER-HEDERA-TOKENS]', insertError);
      }

      // Update token holdings
      await supabaseClient.rpc('process_token_transfer', {
        p_tokenized_property_id: tokenizedPropertyId,
        p_from_holder: fromAccountId,
        p_to_holder: toAccountId,
        p_token_amount: amount,
        p_price_per_token: pricePerToken || 0
      });

      return new Response(JSON.stringify({
        success: true,
        transaction_id: transferSubmit.transactionId.toString(),
        message: 'Token transfer successful'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (hederaError) {
      systemLogger('[TRANSFER-HEDERA-TOKENS]', hederaError);
      
      return new Response(JSON.stringify({ 
        error: 'Failed to transfer tokens',
        details: hederaError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    systemLogger('[TRANSFER-HEDERA-TOKENS]', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } finally {
    // Ensure Hedera client is always closed
    if (client) {
      try {
        client.close();
      } catch (closeError) {
        systemLogger('[TRANSFER-HEDERA-TOKENS]', `Error closing Hedera client: ${closeError.message}`);
      }
    }
  }
});
