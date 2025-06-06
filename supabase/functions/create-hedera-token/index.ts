
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  Client,
  AccountId,
  PrivateKey,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
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

    const { tokenizedPropertyId, tokenName, tokenSymbol, totalSupply, memo } = await req.json();

    if (!tokenizedPropertyId || !tokenName || !tokenSymbol || !totalSupply) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get Hedera credentials
    const hederaAccountId = Deno.env.get('HEDERA_ACCOUNT_ID');
    const hederaPrivateKey = Deno.env.get('HEDERA_PRIVATE_KEY');

    if (!hederaAccountId || !hederaPrivateKey) {
      console.log('Hedera credentials not found, using mock token creation');
      
      // Mock token creation for development
      const mockTokenId = `0.0.${Math.floor(Math.random() * 1000000)}`;
      
      const { error: updateError } = await supabaseClient
        .from('tokenized_properties')
        .update({
          hedera_token_id: mockTokenId,
          status: 'minted'
        })
        .eq('id', tokenizedPropertyId);

      if (updateError) {
        console.error('Database update error:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update token' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        success: true,
        token_id: mockTokenId,
        transaction_id: `mock_tx_${Date.now()}`,
        message: 'Mock token created for development'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
      const { error: updateError } = await supabaseClient
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
        return new Response(JSON.stringify({ error: 'Token created but database update failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Close client
      client.close();

      return new Response(JSON.stringify({
        success: true,
        token_id: tokenId.toString(),
        transaction_id: tokenCreateSubmit.transactionId.toString(),
        message: 'Hedera token created successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (hederaError) {
      console.error('Hedera token creation error:', hederaError);
      client.close();
      
      return new Response(JSON.stringify({ 
        error: 'Failed to create Hedera token',
        details: hederaError.message 
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Token creation error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
