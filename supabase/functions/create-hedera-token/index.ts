import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';
import {
  Client,
  PrivateKey,
  AccountId,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,
  Status
} from '@hashgraph/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenCreationRequest {
  tokenizedPropertyId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting Hedera token creation process...');

    // Get request data
    const { tokenizedPropertyId }: TokenCreationRequest = await req.json();

    if (!tokenizedPropertyId) {
      throw new Error('Missing tokenizedPropertyId in request');
    }

    console.log(`Processing token creation for property: ${tokenizedPropertyId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Update status to "creating"
    await supabase
      .from('tokenized_properties')
      .update({ status: 'creating' })
      .eq('id', tokenizedPropertyId);

    // Get tokenized property details
    const { data: tokenData, error: fetchError } = await supabase
      .from('tokenized_properties')
      .select('*')
      .eq('id', tokenizedPropertyId)
      .single();

    if (fetchError || !tokenData) {
      throw new Error(`Failed to fetch token data: ${fetchError?.message}`);
    }

    console.log(`Token data retrieved: ${tokenData.token_name} (${tokenData.token_symbol})`);

    // Get Hedera credentials
    const hederaAccountId = Deno.env.get('HEDERA_ACCOUNT_ID');
    const hederaPrivateKey = Deno.env.get('HEDERA_PRIVATE_KEY');

    if (!hederaAccountId || !hederaPrivateKey) {
      throw new Error('Missing Hedera credentials in environment');
    }

    // Initialize Hedera client
    const client = Client.forTestnet();
    const operatorAccountId = AccountId.fromString(hederaAccountId);
    const operatorPrivateKey = PrivateKey.fromString(hederaPrivateKey);
    
    client.setOperator(operatorAccountId, operatorPrivateKey);

    console.log('Creating token on Hedera network...');

    // Create the token
    const tokenCreateTx = new TokenCreateTransaction()
      .setTokenName(tokenData.token_name)
      .setTokenSymbol(tokenData.token_symbol)
      .setTokenType(TokenType.FungibleCommon)
      .setSupplyType(TokenSupplyType.Finite)
      .setInitialSupply(0) // Start with 0, mint later
      .setMaxSupply(parseInt(tokenData.total_supply))
      .setDecimals(8)
      .setTreasuryAccountId(operatorAccountId)
      .setSupplyKey(operatorPrivateKey)
      .setAdminKey(operatorPrivateKey)
      .setFreezeDefault(false)
      .setMaxTransactionFee(new Hbar(20))
      .freezeWith(client);

    // Sign and execute the transaction
    const tokenCreateTxSigned = await tokenCreateTx.sign(operatorPrivateKey);
    const tokenCreateSubmit = await tokenCreateTxSigned.execute(client);
    const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);

    if (tokenCreateReceipt.status !== Status.Success) {
      throw new Error(`Token creation failed with status: ${tokenCreateReceipt.status}`);
    }

    const tokenId = tokenCreateReceipt.tokenId?.toString();
    const transactionId = tokenCreateSubmit.transactionId.toString();

    if (!tokenId) {
      throw new Error('Token ID not returned from Hedera');
    }

    console.log(`Token created successfully: ${tokenId}`);

    // Update database with Hedera token info
    const { error: updateError } = await supabase
      .from('tokenized_properties')
      .update({
        status: 'minted',
        hedera_token_id: tokenId,
        hedera_transaction_id: transactionId,
        updated_at: new Date().toISOString()
      })
      .eq('id', tokenizedPropertyId);

    if (updateError) {
      console.error('Database update failed:', updateError);
      throw new Error(`Failed to update database: ${updateError.message}`);
    }

    // Create hedera_tokens record
    await supabase
      .from('hedera_tokens')
      .insert({
        tokenized_property_id: tokenizedPropertyId,
        hedera_token_id: tokenId,
        token_name: tokenData.token_name,
        token_symbol: tokenData.token_symbol,
        total_supply: parseInt(tokenData.total_supply),
        treasury_account_id: hederaAccountId
      });

    console.log('Token creation completed successfully');

    // Close Hedera client
    client.close();

    return new Response(
      JSON.stringify({
        success: true,
        tokenId,
        transactionId,
        message: 'Token created successfully on Hedera network'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Token creation failed:', error);

    // Update status to failed if we have the property ID
    try {
      const body = await req.clone().json();
      const { tokenizedPropertyId } = body;
      
      if (tokenizedPropertyId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        await supabase
          .from('tokenized_properties')
          .update({ 
            status: 'creation_failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', tokenizedPropertyId);
      }
    } catch (updateError) {
      console.error('Failed to update status to creation_failed:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to create token on Hedera network'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});