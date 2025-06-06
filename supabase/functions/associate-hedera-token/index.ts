
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  Client,
  AccountId,
  PrivateKey,
  TokenId,
  TokenAssociateTransaction,
  Hbar
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

    const { tokenId, investorAccountId, investorPrivateKey } = await req.json();

    if (!tokenId || !investorAccountId || !investorPrivateKey) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get Hedera credentials
    const hederaAccountId = Deno.env.get('HEDERA_ACCOUNT_ID');
    const hederaPrivateKey = Deno.env.get('HEDERA_PRIVATE_KEY');

    if (!hederaAccountId || !hederaPrivateKey) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Mock token association for development',
        transaction_id: `mock_assoc_${Date.now()}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
      const { error: insertError } = await supabaseClient
        .from('token_associations')
        .insert({
          user_id: user.id,
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

      return new Response(JSON.stringify({
        success: true,
        transaction_id: associateSubmit.transactionId.toString(),
        message: 'Token association successful'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (hederaError) {
      console.error('Hedera association error:', hederaError);
      client.close();
      
      return new Response(JSON.stringify({ 
        error: 'Failed to associate token',
        details: hederaError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Token association error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
