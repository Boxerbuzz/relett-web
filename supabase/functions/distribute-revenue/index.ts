
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  createTypedSupabaseClient,
  createSuccessResponse, 
  createErrorResponse,
  createResponse,
  createCorsResponse 
} from '../shared/supabase-client.ts';

interface RevenueDistributionRequest {
  tokenized_property_id: string;
  total_revenue: number;
  distribution_type: string;
  source_description: string;
}

interface RevenueDistributionResponse {
  success: boolean;
  distribution: Record<string, unknown>;
  payments_processed: number;
  total_distributed: number;
  revenue_per_token: number;
  message: string;
}

interface TokenizedProperty {
  id: string;
  total_supply: string;
  token_name: string;
}

interface TokenHolder {
  id: string;
  holder_id: string;
  tokens_owned: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  try {
    const supabase = createTypedSupabaseClient();

    const {
      tokenized_property_id,
      total_revenue,
      distribution_type,
      source_description
    }: RevenueDistributionRequest = await req.json();

    // Validate required fields
    if (!tokenized_property_id || !total_revenue || !distribution_type || !source_description) {
      return createResponse(createErrorResponse('Missing required fields for revenue distribution'), 400);
    }

    // Get tokenized property details
    const { data: tokenizedProperty, error: propertyError } = await supabase
      .from('tokenized_properties')
      .select('*')
      .eq('id', tokenized_property_id)
      .single();

    if (propertyError || !tokenizedProperty) {
      return createResponse(createErrorResponse('Tokenized property not found'), 404);
    }

    const property = tokenizedProperty as TokenizedProperty;

    // Calculate revenue per token
    const totalSupply = parseFloat(property.total_supply);
    const revenuePerToken = total_revenue / totalSupply;

    // Create revenue distribution record
    const { data: distribution, error: distributionError } = await supabase
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
      .single();

    if (distributionError) throw distributionError;

    // Get all token holders
    const { data: tokenHolders, error: holdersError } = await supabase
      .from('token_holdings')
      .select('*')
      .eq('tokenized_property_id', tokenized_property_id)
      .gt('tokens_owned', '0');

    if (holdersError) throw holdersError;

    if (!tokenHolders || tokenHolders.length === 0) {
      return createResponse(createErrorResponse('No token holders found'), 404);
    }

    // Create dividend payment records for each holder
    const dividendPayments = [];
    
    for (const holder of tokenHolders as TokenHolder[]) {
      const tokensOwned = parseFloat(holder.tokens_owned);
      const dividendAmount = tokensOwned * revenuePerToken;
      const taxWithholding = dividendAmount * 0.1; // 10% tax withholding
      const netAmount = dividendAmount - taxWithholding;

      const { data: payment, error: paymentError } = await supabase
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
        .single();

      if (paymentError) {
        console.error('Error creating dividend payment:', paymentError);
        continue;
      }

      dividendPayments.push(payment);

      // Update user's account balance
      await supabase
        .from('accounts')
        .update({
          amount: supabase.raw('amount + ?', [netAmount])
        })
        .eq('user_id', holder.holder_id)
        .eq('type', 'wallet');

      // Update investment tracking
      await supabase
        .from('investment_tracking')
        .update({
          total_dividends_received: supabase.raw('total_dividends_received + ?', [netAmount]),
          last_dividend_amount: netAmount,
          last_dividend_date: new Date().toISOString()
        })
        .eq('user_id', holder.holder_id)
        .eq('tokenized_property_id', tokenized_property_id);

      // Send notification to token holder
      await supabase.functions.invoke('process-notification', {
        body: {
          user_id: holder.holder_id,
          type: 'investment',
          title: 'Dividend Payment Received',
          message: `You've received a dividend payment of $${netAmount.toFixed(2)} from ${property.token_name}.`,
          metadata: {
            amount: netAmount,
            gross_amount: dividendAmount,
            tax_withholding: taxWithholding,
            tokens_owned: tokensOwned,
            property_name: property.token_name
          },
          action_url: `/tokens/${tokenized_property_id}`,
          action_label: 'View Investment'
        }
      });
    }

    // Mark dividend payments as paid
    await supabase
      .from('dividend_payments')
      .update({
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('revenue_distribution_id', distribution.id);

    const response: RevenueDistributionResponse = {
      success: true,
      distribution,
      payments_processed: dividendPayments.length,
      total_distributed: total_revenue,
      revenue_per_token: revenuePerToken,
      message: 'Revenue distribution completed successfully'
    };

    return createResponse(createSuccessResponse(response));

  } catch (error) {
    console.error('Revenue distribution error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(createErrorResponse('Revenue distribution failed', errorMessage), 400);
  }
});
