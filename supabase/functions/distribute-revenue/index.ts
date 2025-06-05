
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const {
      tokenized_property_id,
      total_revenue,
      distribution_type,
      source_description
    } = await req.json()

    // Validate required fields
    if (!tokenized_property_id || !total_revenue || !distribution_type || !source_description) {
      throw new Error('Missing required fields for revenue distribution')
    }

    // Get tokenized property details
    const { data: tokenizedProperty, error: propertyError } = await supabaseClient
      .from('tokenized_properties')
      .select('*')
      .eq('id', tokenized_property_id)
      .single()

    if (propertyError || !tokenizedProperty) {
      throw new Error('Tokenized property not found')
    }

    // Calculate revenue per token
    const totalSupply = parseFloat(tokenizedProperty.total_supply)
    const revenuePerToken = total_revenue / totalSupply

    // Create revenue distribution record
    const { data: distribution, error: distributionError } = await supabaseClient
      .from('revenue_distributions')
      .insert({
        tokenized_property_id,
        distribution_date: new Date().toISOString(),
        total_revenue,
        revenue_per_token: revenuePerToken,
        distribution_type,
        source_description,
        metadata: {
          total_supply: totalSupply,
          calculation_date: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (distributionError) throw distributionError

    // Get all token holders
    const { data: tokenHolders, error: holdersError } = await supabaseClient
      .from('token_holdings')
      .select('*')
      .eq('tokenized_property_id', tokenized_property_id)
      .gt('tokens_owned', '0')

    if (holdersError) throw holdersError

    if (!tokenHolders || tokenHolders.length === 0) {
      throw new Error('No token holders found')
    }

    // Create dividend payment records for each holder
    const dividendPayments = []
    
    for (const holder of tokenHolders) {
      const tokensOwned = parseFloat(holder.tokens_owned)
      const dividendAmount = tokensOwned * revenuePerToken
      const taxWithholding = dividendAmount * 0.1 // 10% tax withholding
      const netAmount = dividendAmount - taxWithholding

      const { data: payment, error: paymentError } = await supabaseClient
        .from('dividend_payments')
        .insert({
          revenue_distribution_id: distribution.id,
          token_holding_id: holder.id,
          recipient_id: holder.holder_id,
          amount: dividendAmount,
          tax_withholding: taxWithholding,
          net_amount: netAmount,
          currency: 'USD',
          status: 'pending',
          payment_method: 'bank_transfer'
        })
        .select()
        .single()

      if (paymentError) {
        console.error('Error creating dividend payment:', paymentError)
        continue
      }

      dividendPayments.push(payment)

      // Update user's account balance
      await supabaseClient
        .from('accounts')
        .update({
          amount: supabaseClient.raw('amount + ?', [netAmount])
        })
        .eq('user_id', holder.holder_id)
        .eq('type', 'wallet')

      // Update investment tracking
      await supabaseClient
        .from('investment_tracking')
        .update({
          total_dividends_received: supabaseClient.raw('total_dividends_received + ?', [netAmount]),
          last_dividend_amount: netAmount,
          last_dividend_date: new Date().toISOString()
        })
        .eq('user_id', holder.holder_id)
        .eq('tokenized_property_id', tokenized_property_id)

      // Send notification to token holder
      await supabaseClient.functions.invoke('process-notification', {
        body: {
          user_id: holder.holder_id,
          type: 'investment',
          title: 'Dividend Payment Received',
          message: `You've received a dividend payment of $${netAmount.toFixed(2)} from ${tokenizedProperty.token_name}.`,
          metadata: {
            amount: netAmount,
            gross_amount: dividendAmount,
            tax_withholding: taxWithholding,
            tokens_owned: tokensOwned,
            property_name: tokenizedProperty.token_name
          },
          action_url: `/tokens/${tokenized_property_id}`,
          action_label: 'View Investment'
        }
      })
    }

    // Mark dividend payments as paid
    await supabaseClient
      .from('dividend_payments')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('revenue_distribution_id', distribution.id)

    return new Response(
      JSON.stringify({
        success: true,
        distribution,
        payments_processed: dividendPayments.length,
        total_distributed: total_revenue,
        revenue_per_token: revenuePerToken,
        message: 'Revenue distribution completed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Revenue distribution error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
