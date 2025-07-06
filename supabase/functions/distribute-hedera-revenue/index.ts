
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Client,
  AccountId,
  PrivateKey
} from "https://esm.sh/@hashgraph/sdk@2.65.1";
import { 
  createTypedSupabaseClient,
  createSuccessResponse, 
  createErrorResponse,
  createResponse,
  createCorsResponse,
  verifyUser 
} from '../shared/supabase-client.ts';

interface RevenueDistributionRequest {
  tokenizedPropertyId: string;
  totalRevenue: number;
  distributionType: string;
  sourceDescription: string;
}

interface RevenueDistributionResponse {
  success: boolean;
  distribution_id: string;
  total_holders: number;
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const userResult = await verifyUser(authHeader);
    
    if (!userResult.success) {
      return createResponse(userResult, 401);
    }

    const {
      tokenizedPropertyId,
      totalRevenue,
      _distributionType,
      _sourceDescription
    }: RevenueDistributionRequest = await req.json();

    if (!tokenizedPropertyId || !totalRevenue) {
      return createResponse(createErrorResponse('Missing required fields'), 400);
    }

    const supabase = createTypedSupabaseClient();

    // Get tokenized property details
    const { data: property, error: propertyError } = await supabase
      .from('tokenized_properties')
      .select('*')
      .eq('id', tokenizedPropertyId)
      .single();

    if (propertyError || !property) {
      return createResponse(createErrorResponse('Tokenized property not found'), 404);
    }

    // Calculate revenue per token
    const totalSupply = parseFloat(property.total_supply);
    const revenuePerToken = totalRevenue / totalSupply;

    // For development without Hedera credentials
    const hederaAccountId = Deno.env.get('HEDERA_ACCOUNT_ID');
    const hederaPrivateKey = Deno.env.get('HEDERA_PRIVATE_KEY');

    if (!hederaAccountId || !hederaPrivateKey) {
      console.error('Hedera credentials not configured');
      return createResponse(createErrorResponse('Hedera revenue distribution service not configured'), 500);
    }

    // Initialize Hedera client
    const client = Client.forTestnet();
    const operatorId = AccountId.fromString(hederaAccountId);
    const operatorKey = PrivateKey.fromStringECDSA(hederaPrivateKey);
    client.setOperator(operatorId, operatorKey);

    try {
      // Get all token holders
      const { data: holders, error: holdersError } = await supabase
        .from('token_holdings')
        .select('*')
        .eq('tokenized_property_id', tokenizedPropertyId);

      if (holdersError) {
        throw holdersError;
      }

      // Create revenue distribution record
      const { data: distribution, error: distributionError } = await supabase
        .from('revenue_distributions')
        .insert({
          tokenized_property_id: tokenizedPropertyId,
          total_revenue: totalRevenue,
          revenue_per_token: revenuePerToken,
          distribution_date: new Date().toISOString(),
          distribution_type: 'rental_income',
          source_description: 'Property rental revenue'
        })
        .select()
        .single();

      if (distributionError) {
        throw distributionError;
      }

      // Create dividend payment records for each holder
      const dividendPayments = holders?.map(holder => {
        const tokensOwned = parseFloat(holder.tokens_owned);
        const dividendAmount = tokensOwned * revenuePerToken;
        const taxWithholding = dividendAmount * 0.1; // 10% tax withholding
        const netAmount = dividendAmount - taxWithholding;

        return {
          revenue_distribution_id: distribution.id,
          token_holding_id: holder.id,
          recipient_id: holder.holder_id,
          amount: dividendAmount,
          net_amount: netAmount,
          tax_withholding: taxWithholding,
          currency: 'USD',
          payment_method: 'hedera_transfer',
          status: 'pending'
        };
      }) || [];

      if (dividendPayments.length > 0) {
        const { error: paymentsError } = await supabase
          .from('dividend_payments')
          .insert(dividendPayments);

        if (paymentsError) {
          console.error('Error creating dividend payments:',paymentsError);
        }
      }

      client.close();

      const response: RevenueDistributionResponse = {
        success: true,
        distribution_id: distribution.id,
        total_holders: holders?.length || 0,
        message: 'Revenue distribution initiated successfully'
      };

      return createResponse(createSuccessResponse(response));

    } catch (hederaError) {
      console.error('Hedera distribution error:', hederaError);
      client.close();
      
      const errorMessage = hederaError instanceof Error ? hederaError.message : String(hederaError);
      return createResponse(createErrorResponse('Failed to distribute revenue', errorMessage), 500);
    }

  } catch (error) {
    console.error('Revenue distribution error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(createErrorResponse('Internal server error', errorMessage), 500);
  }
});
