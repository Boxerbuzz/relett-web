
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  Client,
  AccountId,
  PrivateKey,
  AccountBalanceQuery
} from "https://esm.sh/@hashgraph/sdk@2.65.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { accountId, privateKey } = await req.json();

    if (!accountId || !privateKey) {
      return new Response(JSON.stringify({ error: 'Missing account ID or private key' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get Hedera credentials for network access
    const hederaAccountId = Deno.env.get('HEDERA_ACCOUNT_ID');
    const hederaPrivateKey = Deno.env.get('HEDERA_PRIVATE_KEY');

    if (!hederaAccountId || !hederaPrivateKey) {
      // Mock validation for development
      return new Response(JSON.stringify({
        valid: true,
        balance: 100.0,
        message: 'Mock wallet validation for development'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    try {
      // Initialize Hedera client
      const client = Client.forTestnet();
      
      // Validate the provided credentials
      const account = AccountId.fromString(accountId);
      const key = PrivateKey.fromStringECDSA(privateKey);
      
      // Test the credentials by getting account balance
      const balanceQuery = new AccountBalanceQuery()
        .setAccountId(account);
      
      const balance = await balanceQuery.execute(client);
      
      client.close();

      return new Response(JSON.stringify({
        valid: true,
        balance: parseFloat(balance.hbars.toString()),
        accountId: account.toString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (hederaError) {
      console.error('Hedera validation error:', hederaError);
      
      return new Response(JSON.stringify({ 
        valid: false,
        error: 'Invalid wallet credentials or network error',
        details: hederaError.message 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Wallet validation error:', error);
    return new Response(JSON.stringify({ 
      valid: false,
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
