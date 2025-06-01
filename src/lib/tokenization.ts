
import { HederaClient, hederaUtils } from './hedera';
import { supabase } from '@/integrations/supabase/client';

interface TokenizationParams {
  landTitleId: string;
  propertyId?: string;
  tokenName: string;
  totalValue: number;
  totalSupply: number;
  minimumInvestment: number;
  expectedROI: number;
  lockUpPeriodMonths: number;
  revenueDistributionFrequency: string;
  investmentTerms: 'fixed' | 'variable' | 'hybrid';
}

interface TokenCreationResult {
  tokenizedPropertyId: string;
  hederaTokenId: string;
  transactionId: string;
  tokenSymbol: string;
  success: boolean;
  error?: string;
}

export class PropertyTokenizationService {
  private hederaClient: HederaClient;

  constructor() {
    this.hederaClient = new HederaClient();
  }

  async tokenizeProperty(params: TokenizationParams): Promise<TokenCreationResult> {
    try {
      // Step 1: Generate unique token symbol
      const tokenSymbol = hederaUtils.generateTokenSymbol(params.tokenName, params.landTitleId);
      
      // Step 2: Calculate token price
      const tokenPrice = params.totalValue / params.totalSupply;

      // Step 3: Create token on Hedera
      const tokenResult = await this.hederaClient.createPropertyToken({
        name: params.tokenName,
        symbol: tokenSymbol,
        totalSupply: params.totalSupply,
        decimals: 8, // Standard for fractional ownership
        memo: `Property tokenization for land title: ${params.landTitleId}`
      });

      if (!tokenResult.tokenId) {
        throw new Error('Failed to create token on Hedera');
      }

      // Step 4: Store tokenization record in database
      const { data: tokenizedProperty, error: dbError } = await supabase
        .from('tokenized_properties')
        .insert({
          land_title_id: params.landTitleId,
          property_id: params.propertyId,
          token_symbol: tokenSymbol,
          token_name: params.tokenName,
          token_type: 'hts_fungible',
          total_supply: params.totalSupply.toString(),
          total_value_usd: params.totalValue,
          minimum_investment: params.minimumInvestment,
          token_price: tokenPrice,
          status: 'minted',
          blockchain_network: 'hedera',
          hedera_token_id: tokenResult.tokenId,
          investment_terms: params.investmentTerms,
          expected_roi: params.expectedROI,
          revenue_distribution_frequency: params.revenueDistributionFrequency,
          lock_up_period_months: params.lockUpPeriodMonths,
          metadata: {
            creation_transaction: tokenResult.transactionId,
            decimals: 8,
            created_at: new Date().toISOString()
          },
          legal_structure: {
            ownership_type: 'fractional',
            jurisdiction: 'Nigeria',
            compliance_status: 'pending'
          }
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Failed to store tokenization record: ${dbError.message}`);
      }

      return {
        tokenizedPropertyId: tokenizedProperty.id,
        hederaTokenId: tokenResult.tokenId,
        transactionId: tokenResult.transactionId,
        tokenSymbol,
        success: true
      };

    } catch (error) {
      console.error('Tokenization failed:', error);
      return {
        tokenizedPropertyId: '',
        hederaTokenId: '',
        transactionId: '',
        tokenSymbol: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async purchaseTokens(params: {
    tokenizedPropertyId: string;
    investorId: string;
    tokenAmount: number;
    investorAccountId: string;
    investorPrivateKey: string;
  }) {
    try {
      // Step 1: Get tokenized property details
      const { data: property, error: propertyError } = await supabase
        .from('tokenized_properties')
        .select('*')
        .eq('id', params.tokenizedPropertyId)
        .single();

      if (propertyError || !property) {
        throw new Error('Tokenized property not found');
      }

      // Step 2: Associate investor account with token (if not already done)
      await this.hederaClient.associateToken(
        params.investorAccountId,
        property.hedera_token_id,
        params.investorPrivateKey
      );

      // Step 3: Transfer tokens from treasury to investor
      const transferResult = await this.hederaClient.transferTokens({
        tokenId: property.hedera_token_id,
        fromAccountId: process.env.HEDERA_ACCOUNT_ID!,
        toAccountId: params.investorAccountId,
        amount: params.tokenAmount,
        fromPrivateKey: process.env.HEDERA_PRIVATE_KEY!
      });

      // Step 4: Record the token holding
      const totalInvestment = params.tokenAmount * property.token_price;
      
      const { data: holding, error: holdingError } = await supabase
        .from('token_holdings')
        .insert({
          tokenized_property_id: params.tokenizedPropertyId,
          holder_id: params.investorId,
          tokens_owned: params.tokenAmount.toString(),
          purchase_price_per_token: property.token_price,
          total_investment: totalInvestment,
          acquisition_date: new Date().toISOString()
        })
        .select()
        .single();

      if (holdingError) {
        throw new Error(`Failed to record token holding: ${holdingError.message}`);
      }

      // Step 5: Record the transaction
      await supabase
        .from('token_transactions')
        .insert({
          tokenized_property_id: params.tokenizedPropertyId,
          to_holder: params.investorId,
          token_amount: params.tokenAmount.toString(),
          price_per_token: property.token_price,
          total_value: totalInvestment,
          transaction_type: 'transfer',
          hedera_transaction_id: transferResult.transactionId,
          status: 'confirmed',
          metadata: {
            transfer_type: 'purchase',
            investor_account: params.investorAccountId
          }
        });

      return {
        success: true,
        holdingId: holding.id,
        transactionId: transferResult.transactionId,
        totalInvestment
      };

    } catch (error) {
      console.error('Token purchase failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async distributeRevenue(params: {
    tokenizedPropertyId: string;
    totalRevenue: number;
    distributionType: string;
    sourceDescription: string;
  }) {
    try {
      // Step 1: Get all token holders
      const { data: holdings, error: holdingsError } = await supabase
        .from('token_holdings')
        .select('*')
        .eq('tokenized_property_id', params.tokenizedPropertyId);

      if (holdingsError || !holdings || holdings.length === 0) {
        throw new Error('No token holders found');
      }

      // Step 2: Get tokenized property details
      const { data: property, error: propertyError } = await supabase
        .from('tokenized_properties')
        .select('*')
        .eq('id', params.tokenizedPropertyId)
        .single();

      if (propertyError || !property) {
        throw new Error('Tokenized property not found');
      }

      // Step 3: Calculate revenue per token
      const totalSupply = parseInt(property.total_supply);
      const revenuePerToken = params.totalRevenue / totalSupply;

      // Step 4: Distribute revenue to each holder (this would typically involve actual payments)
      const distributions = holdings.map(holding => ({
        holderId: holding.holder_id,
        tokensOwned: parseInt(holding.tokens_owned),
        revenueShare: parseInt(holding.tokens_owned) * revenuePerToken
      }));

      // Step 5: Record the distribution
      const { data: distribution, error: distributionError } = await supabase
        .from('revenue_distributions')
        .insert({
          tokenized_property_id: params.tokenizedPropertyId,
          distribution_date: new Date().toISOString(),
          total_revenue: params.totalRevenue,
          revenue_per_token: revenuePerToken,
          distribution_type: params.distributionType,
          source_description: params.sourceDescription,
          metadata: {
            distributions,
            total_holders: holdings.length
          }
        })
        .select()
        .single();

      if (distributionError) {
        throw new Error(`Failed to record revenue distribution: ${distributionError.message}`);
      }

      return {
        success: true,
        distributionId: distribution.id,
        revenuePerToken,
        totalHolders: holdings.length,
        distributions
      };

    } catch (error) {
      console.error('Revenue distribution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async getTokenizedPropertyInfo(tokenizedPropertyId: string) {
    try {
      const { data: property, error } = await supabase
        .from('tokenized_properties')
        .select(`
          *,
          land_title:land_titles(*),
          token_holdings(*),
          revenue_distributions(*),
          token_transactions(*)
        `)
        .eq('id', tokenizedPropertyId)
        .single();

      if (error) {
        throw new Error(`Failed to get property info: ${error.message}`);
      }

      // Get Hedera token info
      let hederaInfo = null;
      if (property.hedera_token_id) {
        try {
          hederaInfo = await this.hederaClient.getTokenInfo(property.hedera_token_id);
        } catch (hederaError) {
          console.warn('Failed to get Hedera token info:', hederaError);
        }
      }

      return {
        success: true,
        property: {
          ...property,
          hedera_info: hederaInfo
        }
      };

    } catch (error) {
      console.error('Failed to get tokenized property info:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  close() {
    this.hederaClient.close();
  }
}

// Export utility functions
export { hederaUtils };
