
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  Client,
  AccountId,
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

    const { accountId } = await req.json();

    if (!accountId) {
      return new Response(JSON.stringify({ error: 'Missing account ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get Hedera credentials
    const hederaAccountId = Deno.env.get('HEDERA_ACCOUNT_ID');
    const hederaPrivateKey = Deno.env.get('HEDERA_PRIVATE_KEY');

    if (!hederaAccountId || !hederaPrivateKey) {
      // Mock balance for development
      return new Response(JSON.stringify({
        balance: 100.0,
        tokens: [],
        message: 'Mock balance check for development'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
      const tokenBalances: Array<{ tokenId: string; balance: string }> = [];
      if (balance.tokens) {
        Object.entries(balance.tokens).forEach(([tokenId, amount]) => {
          tokenBalances.push({
            tokenId: tokenId.toString(),
            balance: amount.toString(),
          });
        });
      }
      
      client.close();

      return new Response(JSON.stringify({
        balance: parseFloat(balance.hbars.toString()),
        tokens: tokenBalances,
        accountId: account.toString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (hederaError) {
      console.error('Hedera balance query error:', hederaError);
      
      return new Response(JSON.stringify({ 
        error: 'Failed to get account balance',
        details: hederaError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Balance query error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
