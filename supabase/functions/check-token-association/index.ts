
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  Client,
  AccountId,
  TokenId,
  AccountInfoQuery
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

    const { tokenId, accountId } = await req.json();

    if (!tokenId || !accountId) {
      return new Response(JSON.stringify({ error: 'Missing token ID or account ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get Hedera credentials
    const hederaAccountId = Deno.env.get('HEDERA_ACCOUNT_ID');
    const hederaPrivateKey = Deno.env.get('HEDERA_PRIVATE_KEY');

    if (!hederaAccountId || !hederaPrivateKey) {
      // Mock association check for development
      return new Response(JSON.stringify({
        isAssociated: true,
        message: 'Mock token association check for development'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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

      return new Response(JSON.stringify({
        isAssociated,
        accountId: account.toString(),
        tokenId: token.toString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (hederaError) {
      console.error('Hedera association check error:', hederaError);
      
      return new Response(JSON.stringify({ 
        isAssociated: false,
        error: 'Failed to check token association',
        details: hederaError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Token association check error:', error);
    return new Response(JSON.stringify({ 
      isAssociated: false,
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
