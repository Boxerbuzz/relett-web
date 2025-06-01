
import { supabase } from '@/integrations/supabase/client';
import { HederaClient } from './hedera';
import { PropertyTokenizationService } from './tokenization';

export interface InvestmentOpportunity {
  id: string;
  propertyId: string;
  tokenizedPropertyId: string;
  title: string;
  description: string;
  location: string;
  totalValue: number;
  tokenPrice: number;
  totalTokens: number;
  availableTokens: number;
  minimumInvestment: number;
  expectedROI: number;
  riskLevel: 'low' | 'medium' | 'high';
  investmentTerm: string;
  propertyType: string;
  images: string[];
  documents: any[];
  status: 'active' | 'funding' | 'funded' | 'closed';
  fundingDeadline: string;
  targetFunding: number;
  currentFunding: number;
  investorCount: number;
}

export interface InvestmentPortfolio {
  totalInvestment: number;
  totalValue: number;
  totalROI: number;
  properties: PropertyInvestment[];
  recentTransactions: InvestmentTransaction[];
  upcomingPayments: RevenuePayment[];
}

export interface PropertyInvestment {
  id: string;
  propertyTitle: string;
  tokensOwned: number;
  initialInvestment: number;
  currentValue: number;
  roi: number;
  lastDividend: number;
  nextPaymentDate: string;
  ownershipPercentage: number;
}

export interface InvestmentTransaction {
  id: string;
  type: 'purchase' | 'sale' | 'dividend' | 'fee';
  propertyTitle: string;
  amount: number;
  tokens?: number;
  date: string;
  status: 'pending' | 'completed' | 'failed';
  transactionHash?: string;
}

export interface RevenuePayment {
  id: string;
  propertyTitle: string;
  amount: number;
  paymentDate: string;
  type: 'rental' | 'sale' | 'appreciation';
  status: 'pending' | 'paid';
}

export class InvestmentService {
  private hederaClient: HederaClient;
  private tokenizationService: PropertyTokenizationService;

  constructor() {
    this.hederaClient = new HederaClient();
    this.tokenizationService = new PropertyTokenizationService();
  }

  async getInvestmentOpportunities(filters?: {
    location?: string;
    priceRange?: [number, number];
    riskLevel?: string;
    propertyType?: string;
    minimumROI?: number;
  }): Promise<InvestmentOpportunity[]> {
    try {
      let query = supabase
        .from('tokenized_properties')
        .select(`
          *,
          property:properties(*),
          land_title:land_titles(*)
        `)
        .eq('status', 'minted');

      // Apply filters
      if (filters?.priceRange) {
        query = query
          .gte('total_value_usd', filters.priceRange[0])
          .lte('total_value_usd', filters.priceRange[1]);
      }

      if (filters?.minimumROI) {
        query = query.gte('expected_roi', filters.minimumROI);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data?.map(this.mapToInvestmentOpportunity) || [];
    } catch (error) {
      console.error('Error fetching investment opportunities:', error);
      throw error;
    }
  }

  async getInvestorPortfolio(investorId: string): Promise<InvestmentPortfolio> {
    try {
      // Get token holdings
      const { data: holdings, error: holdingsError } = await supabase
        .from('token_holdings')
        .select(`
          *,
          tokenized_property:tokenized_properties(
            *,
            property:properties(*),
            land_title:land_titles(*)
          )
        `)
        .eq('holder_id', investorId);

      if (holdingsError) throw holdingsError;

      // Get recent transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from('token_transactions')
        .select(`
          *,
          tokenized_property:tokenized_properties(token_name)
        `)
        .or(`from_holder.eq.${investorId},to_holder.eq.${investorId}`)
        .order('created_at', { ascending: false })
        .limit(10);

      if (transactionsError) throw transactionsError;

      // Calculate portfolio metrics
      const totalInvestment = holdings?.reduce((sum, holding) => 
        sum + holding.total_investment, 0) || 0;

      const totalValue = holdings?.reduce((sum, holding) => {
        const currentPrice = holding.tokenized_property.token_price;
        return sum + (parseInt(holding.tokens_owned) * currentPrice);
      }, 0) || 0;

      const totalROI = totalInvestment > 0 ? ((totalValue - totalInvestment) / totalInvestment) * 100 : 0;

      return {
        totalInvestment,
        totalValue,
        totalROI,
        properties: holdings?.map(this.mapToPropertyInvestment) || [],
        recentTransactions: transactions?.map(this.mapToInvestmentTransaction) || [],
        upcomingPayments: [] // This would come from revenue distributions
      };
    } catch (error) {
      console.error('Error fetching investor portfolio:', error);
      throw error;
    }
  }

  async purchaseTokens(params: {
    investorId: string;
    tokenizedPropertyId: string;
    tokenAmount: number;
    investorAccountId: string;
    investorPrivateKey: string;
  }) {
    try {
      return await this.tokenizationService.purchaseTokens(params);
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      throw error;
    }
  }

  async sellTokens(params: {
    sellerId: string;
    tokenizedPropertyId: string;
    tokenAmount: number;
    pricePerToken: number;
    sellerAccountId: string;
    sellerPrivateKey: string;
    buyerAccountId: string;
  }) {
    try {
      // Transfer tokens on Hedera
      const { data: property } = await supabase
        .from('tokenized_properties')
        .select('hedera_token_id')
        .eq('id', params.tokenizedPropertyId)
        .single();

      if (!property?.hedera_token_id) {
        throw new Error('Property token not found');
      }

      const transferResult = await this.hederaClient.transferTokens({
        tokenId: property.hedera_token_id,
        fromAccountId: params.sellerAccountId,
        toAccountId: params.buyerAccountId,
        amount: params.tokenAmount,
        fromPrivateKey: params.sellerPrivateKey
      });

      // Record the transaction
      const totalValue = params.tokenAmount * params.pricePerToken;
      
      const { data: transaction, error } = await supabase
        .from('token_transactions')
        .insert({
          tokenized_property_id: params.tokenizedPropertyId,
          from_holder: params.sellerId,
          to_holder: 'buyer_id', // This would come from the buyer
          token_amount: params.tokenAmount.toString(),
          price_per_token: params.pricePerToken,
          total_value: totalValue,
          transaction_type: 'transfer',
          hedera_transaction_id: transferResult.transactionId,
          status: 'confirmed'
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        transactionId: transferResult.transactionId,
        databaseTransactionId: transaction.id
      };
    } catch (error) {
      console.error('Error selling tokens:', error);
      throw error;
    }
  }

  private mapToInvestmentOpportunity = (data: any): InvestmentOpportunity => ({
    id: data.id,
    propertyId: data.property_id,
    tokenizedPropertyId: data.id,
    title: data.token_name,
    description: data.property?.description || '',
    location: data.land_title?.location_address || '',
    totalValue: data.total_value_usd,
    tokenPrice: data.token_price,
    totalTokens: parseInt(data.total_supply),
    availableTokens: parseInt(data.total_supply), // This would be calculated from holdings
    minimumInvestment: data.minimum_investment,
    expectedROI: data.expected_roi,
    riskLevel: 'medium', // This would be calculated based on property type/location
    investmentTerm: `${data.lock_up_period_months} months`,
    propertyType: data.property?.type || 'commercial',
    images: data.property?.images || [],
    documents: [],
    status: data.status === 'minted' ? 'active' : 'funding',
    fundingDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    targetFunding: data.total_value_usd,
    currentFunding: 0, // This would be calculated
    investorCount: 0 // This would be calculated from holdings
  });

  private mapToPropertyInvestment = (holding: any): PropertyInvestment => ({
    id: holding.id,
    propertyTitle: holding.tokenized_property.token_name,
    tokensOwned: parseInt(holding.tokens_owned),
    initialInvestment: holding.total_investment,
    currentValue: parseInt(holding.tokens_owned) * holding.tokenized_property.token_price,
    roi: ((parseInt(holding.tokens_owned) * holding.tokenized_property.token_price - holding.total_investment) / holding.total_investment) * 100,
    lastDividend: 0, // From revenue distributions
    nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    ownershipPercentage: (parseInt(holding.tokens_owned) / parseInt(holding.tokenized_property.total_supply)) * 100
  });

  private mapToInvestmentTransaction = (transaction: any): InvestmentTransaction => ({
    id: transaction.id,
    type: transaction.transaction_type === 'transfer' ? 'purchase' : 'purchase',
    propertyTitle: transaction.tokenized_property?.token_name || 'Unknown Property',
    amount: transaction.total_value,
    tokens: parseInt(transaction.token_amount),
    date: transaction.created_at,
    status: transaction.status === 'confirmed' ? 'completed' : 'pending',
    transactionHash: transaction.hedera_transaction_id
  });

  close() {
    this.hederaClient.close();
    this.tokenizationService.close();
  }
}
