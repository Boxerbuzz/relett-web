import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import {
  Client,
  TransferTransaction,
  AccountId,
  PrivateKey,
  TokenId,
  Hbar
} from "https://esm.sh/@hashgraph/sdk@2.65.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TokenTradeRequest {
  sellerId: string;
  buyerId: string;
  tokenizedPropertyId: string;
  tokenAmount: number;
  pricePerToken: number;
  totalPrice: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sellerId, buyerId, tokenizedPropertyId, tokenAmount, pricePerToken, totalPrice }: TokenTradeRequest = await req.json();

    if (!sellerId || !buyerId || !tokenizedPropertyId || !tokenAmount || !pricePerToken) {
      throw new Error('All trade parameters are required');
    }

    console.log(`Processing token trade: ${tokenAmount} tokens from ${sellerId} to ${buyerId}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify seller has enough tokens
    const { data: sellerHolding, error: sellerError } = await supabase
      .from('token_holdings')
      .select('*')
      .eq('holder_id', sellerId)
      .eq('tokenized_property_id', tokenizedPropertyId)
      .single();

    if (sellerError || !sellerHolding) {
      throw new Error('Seller does not have holdings for this property');
    }

    if (sellerHolding.tokens_owned < tokenAmount) {
      throw new Error('Seller does not have enough tokens');
    }

    // Get tokenized property details for Hedera token transfer
    const { data: tokenizedProperty, error: tokenError } = await supabase
      .from('tokenized_properties')
      .select('*')
      .eq('id', tokenizedPropertyId)
      .single();

    if (tokenError || !tokenizedProperty) {
      throw new Error('Tokenized property not found');
    }

    // Get seller and buyer wallet information
    const { data: sellerWallet, error: sellerWalletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', sellerId)
      .eq('is_primary', true)
      .single();

    const { data: buyerWallet, error: buyerWalletError } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', buyerId)
      .eq('is_primary', true)
      .single();

    if (sellerWalletError || !sellerWallet || buyerWalletError || !buyerWallet) {
      throw new Error('Seller or buyer wallet not found');
    }

    // Initialize Hedera client for token transfer
    const hederaAccountId = Deno.env.get('HEDERA_ACCOUNT_ID')!;
    const hederaPrivateKey = Deno.env.get('HEDERA_PRIVATE_KEY')!;
    
    if (!hederaAccountId || !hederaPrivateKey) {
      throw new Error('Hedera credentials not configured');
    }

    const client = Client.forTestnet();
    client.setOperator(AccountId.fromString(hederaAccountId), PrivateKey.fromString(hederaPrivateKey));

    // Execute Hedera token transfer
    console.log(`Executing Hedera token transfer: ${tokenAmount} tokens from ${sellerWallet.address} to ${buyerWallet.address}`);
    
    const tokenTransferTx = new TransferTransaction()
      .addTokenTransfer(
        TokenId.fromString(tokenizedProperty.hedera_token_id),
        AccountId.fromString(sellerWallet.address),
        -tokenAmount
      )
      .addTokenTransfer(
        TokenId.fromString(tokenizedProperty.hedera_token_id),
        AccountId.fromString(buyerWallet.address),
        tokenAmount
      )
      .setMaxTransactionFee(new Hbar(2));

    // Sign with seller's private key (in real implementation, this would be done securely)
    const transferSubmit = await tokenTransferTx.execute(client);
    const transferReceipt = await transferSubmit.getReceipt(client);
    const transferTransactionId = transferSubmit.transactionId.toString();
    
    console.log(`Hedera token transfer completed with Transaction ID: ${transferTransactionId}`);
    
    // Close Hedera client
    client.close();

    // Update token holdings in database
    await supabase.rpc('update_token_holdings_after_sale', {
      p_seller_id: sellerId,
      p_buyer_id: buyerId,
      p_tokenized_property_id: tokenizedPropertyId,
      p_token_amount: tokenAmount,
      p_total_price: totalPrice
    });

    // Record the trade transaction
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        from_user_id: sellerId,
        to_user_id: buyerId,
        tokenized_property_id: tokenizedPropertyId,
        token_amount: tokenAmount,
        price_per_token: pricePerToken,
        total_amount: totalPrice,
        transaction_type: 'token_trade',
        status: 'completed',
        blockchain_hash: transferTransactionId,
        metadata: {
          tradeTimestamp: new Date().toISOString(),
          tradeType: 'fractional_ownership'
        }
      });

    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
    }

    // Record trade event on HCS
    const tradeEvent = {
      eventType: 'TOKEN_TRADE',
      sellerId,
      buyerId,
      tokenizedPropertyId,
      tokenAmount,
      pricePerToken,
      totalPrice,
      timestamp: new Date().toISOString(),
      data: {
        action: 'fractional_ownership_transfer',
        sellerNewBalance: sellerHolding.tokens_owned - tokenAmount,
        details: {
          tokenAmount,
          pricePerToken,
          totalPrice
        }
      }
    };

    // Submit to HCS via record-hcs-event function
    const hcsResponse = await fetch('https://wossuijahchhtjzphsgh.supabase.co/functions/v1/record-hcs-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
      },
      body: JSON.stringify({
        eventType: 'TOKEN_TRADE',
        tokenizedPropertyId,
        eventData: tradeEvent,
        userId: sellerId
      })
    });

    if (!hcsResponse.ok) {
      console.warn('Failed to record trade on HCS:', await hcsResponse.text());
    }

    console.log(`Successfully completed token trade`);

    return new Response(
      JSON.stringify({
        success: true,
        tradeId: transferTransactionId,
        sellerId,
        buyerId,
        tokenAmount,
        totalPrice,
        hederaTransactionId: transferTransactionId,
        message: 'Token trade completed successfully on Hedera network'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Token trade failed:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});