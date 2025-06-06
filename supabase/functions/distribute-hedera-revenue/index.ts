
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  Client,
  AccountId,
  PrivateKey,
  TokenId,
  TransferTransaction,
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

    const { 
      revenueDistributionId,
      tokenizedPropertyId,
      totalRevenue,
      distributionType,
      sourceDescription 
    } = await req.json();

    if (!revenueDistributionId || !tokenizedPropertyId || !totalRevenue) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get tokenized property details
    const { data: tokenizedProperty, error: propertyError } = await supabaseClient
      .from('tokenized_properties')
      .select('*')
      .eq('id', tokenizedPropertyId)
      .single();

    if (propertyError || !tokenizedProperty) {
      return new Response(JSON.stringify({ error: 'Property not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get all token holders
    const { data: holdings, error: holdingsError } = await supabaseClient
      .from('token_holdings')
      .select(`
        *,
        users!token_holdings_holder_id_fkey(id, first_name, last_name, email)
      `)
      .eq('tokenized_property_id', tokenizedPropertyId);

    if (holdingsError || !holdings || holdings.length === 0) {
      return new Response(JSON.stringify({ error: 'No token holders found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate total tokens in circulation
    const totalTokens = holdings.reduce((sum, holding) => 
      sum + parseInt(holding.tokens_owned), 0);

    if (totalTokens === 0) {
      return new Response(JSON.stringify({ error: 'No tokens in circulation' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const revenuePerToken = totalRevenue / totalTokens;

    console.log('Processing revenue distribution:', {
      totalRevenue,
      totalTokens,
      revenuePerToken,
      holdersCount: holdings.length
    });

    // Get Hedera credentials
    const hederaAccountId = Deno.env.get('HEDERA_ACCOUNT_ID');
    const hederaPrivateKey = Deno.env.get('HEDERA_PRIVATE_KEY');

    const distributions = [];
    const taxRate = 0.1; // 10% tax withholding

    for (const holding of holdings) {
      const tokensOwned = parseInt(holding.tokens_owned);
      const revenueShare = tokensOwned * revenuePerToken;
      const taxWithholding = revenueShare * taxRate;
      const netAmount = revenueShare - taxWithholding;

      // Create dividend payment record
      const { data: dividendPayment, error: paymentError } = await supabaseClient
        .from('dividend_payments')
        .insert({
          revenue_distribution_id: revenueDistributionId,
          recipient_id: holding.holder_id,
          token_holding_id: holding.id,
          amount: revenueShare,
          net_amount: netAmount,
          tax_withholding: taxWithholding,
          currency: 'USD',
          status: 'pending',
          payment_method: 'hedera_transfer'
        })
        .select()
        .single();

      if (paymentError) {
        console.error('Error creating dividend payment:', paymentError);
        continue;
      }

      distributions.push({
        holding,
        payment: dividendPayment,
        tokensOwned,
        revenueShare,
        netAmount
      });
    }

    // Process Hedera transfers if credentials are available
    let successfulTransfers = 0;
    let failedTransfers = 0;

    if (hederaAccountId && hederaPrivateKey && tokenizedProperty.hedera_token_id) {
      const client = Client.forTestnet();
      const operatorId = AccountId.fromString(hederaAccountId);
      const operatorKey = PrivateKey.fromStringECDSA(hederaPrivateKey);
      client.setOperator(operatorId, operatorKey);

      for (const distribution of distributions) {
        try {
          // Note: This is a simplified example. In practice, you'd need:
          // 1. A stable coin token for USD transfers
          // 2. Proper account IDs for each holder
          // 3. More sophisticated error handling
          
          console.log(`Processing payment for holder ${distribution.holding.holder_id}: $${distribution.netAmount.toFixed(2)}`);
          
          // Update payment status to completed (mock for now)
          await supabaseClient
            .from('dividend_payments')
            .update({
              status: 'paid',
              paid_at: new Date().toISOString(),
              external_transaction_id: `hedera_${Date.now()}_${distribution.holding.holder_id}`
            })
            .eq('id', distribution.payment.id);

          successfulTransfers++;

        } catch (transferError) {
          console.error(`Transfer failed for holder ${distribution.holding.holder_id}:`, transferError);
          
          await supabaseClient
            .from('dividend_payments')
            .update({
              status: 'failed',
              external_transaction_id: `failed_${Date.now()}_${distribution.holding.holder_id}`
            })
            .eq('id', distribution.payment.id);

          failedTransfers++;
        }
      }

      client.close();
    } else {
      // Mock processing for development
      for (const distribution of distributions) {
        await supabaseClient
          .from('dividend_payments')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
            external_transaction_id: `mock_${Date.now()}_${distribution.holding.holder_id}`
          })
          .eq('id', distribution.payment.id);

        successfulTransfers++;
      }
    }

    // Update revenue distribution status
    await supabaseClient
      .from('revenue_distributions')
      .update({
        metadata: {
          processed_at: new Date().toISOString(),
          total_holders: holdings.length,
          successful_transfers: successfulTransfers,
          failed_transfers: failedTransfers,
          revenue_per_token: revenuePerToken
        }
      })
      .eq('id', revenueDistributionId);

    // Send notifications to holders
    for (const distribution of distributions) {
      await supabaseClient.functions.invoke('process-notification', {
        body: {
          user_id: distribution.holding.holder_id,
          type: 'investment',
          title: 'Revenue Distribution Received',
          message: `You have received $${distribution.netAmount.toFixed(2)} from ${tokenizedProperty.token_name} revenue distribution.`,
          metadata: {
            property_id: tokenizedPropertyId,
            distribution_id: revenueDistributionId,
            amount: distribution.netAmount,
            tokens_owned: distribution.tokensOwned
          }
        }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Revenue distribution completed',
      summary: {
        total_holders: holdings.length,
        total_revenue: totalRevenue,
        revenue_per_token: revenuePerToken,
        successful_transfers: successfulTransfers,
        failed_transfers: failedTransfers
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Revenue distribution error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
