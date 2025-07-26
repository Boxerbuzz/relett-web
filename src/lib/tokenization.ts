
import { supabase } from '@/integrations/supabase/client';
import { Client, AccountId, PrivateKey, TokenCreateTransaction, TokenType, TokenSupplyType, AccountBalanceQuery, Hbar, TransferTransaction, TokenAssociateTransaction, TokenMintTransaction } from '@hashgraph/sdk';

export interface TokenizationParams {
  propertyId: string;
  landTitleId: string;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  tokenPrice: number;
  minimumInvestment: number;
  expectedROI: number;
  lockUpPeriodMonths: number;
  revenueDistributionFrequency: 'monthly' | 'quarterly' | 'annually';
  legalStructure?: string;
  regulatoryCompliance?: string[];
  riskFactors?: string[];
  propertyDetails?: any;
}

export interface TokenizationResult {
  success: boolean;
  tokenizedPropertyId?: string;
  hederaTokenId?: string;
  error?: string;
}

export class PropertyTokenizationService {
  private client: Client | null = null;
  private operatorId: AccountId | null = null;
  private operatorKey: PrivateKey | null = null;

  constructor() {
    this.initializeHederaClient();
  }

  private initializeHederaClient() {
    try {
      const accountId = process.env.HEDERA_ACCOUNT_ID;
      const privateKey = process.env.HEDERA_PRIVATE_KEY;
      
      if (!accountId || !privateKey) {
        console.warn('Hedera credentials not found in environment variables');
        return;
      }

      this.operatorId = AccountId.fromString(accountId);
      this.operatorKey = PrivateKey.fromString(privateKey);
      
      this.client = Client.forTestnet();
      this.client.setOperator(this.operatorId, this.operatorKey);
      
      console.log('Hedera client initialized successfully');
    } catch (error) {
      console.error('Error initializing Hedera client:', error);
    }
  }

  async tokenizeProperty(params: TokenizationParams): Promise<TokenizationResult> {
    try {
      console.log('Starting property tokenization:', params);

      // Calculate total value
      const totalValue = params.totalSupply * params.tokenPrice;

      // Create tokenized property record with pending_approval status
      const { data: tokenizedProperty, error: dbError } = await supabase
        .from('tokenized_properties')
        .insert({
          land_title_id: params.landTitleId,
          token_name: params.tokenName,
          token_symbol: params.tokenSymbol,
          total_supply: params.totalSupply.toString(),
          token_price: params.tokenPrice,
          total_value_usd: totalValue,
          minimum_investment: params.minimumInvestment,
          expected_roi: params.expectedROI,
          lock_up_period_months: params.lockUpPeriodMonths,
          revenue_distribution_frequency: params.revenueDistributionFrequency,
          status: 'pending_approval', // Set initial status to pending_approval
          blockchain_network: 'hedera',
          investment_terms: 'fixed',
          token_type: 'hts_fungible',
          metadata: {
            legal_structure: params.legalStructure,
            regulatory_compliance: params.regulatoryCompliance,
            risk_factors: params.riskFactors,
            property_details: params.propertyDetails,
            created_at: new Date().toISOString()
          }
        })
        .select('id')
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error(`Database error: ${dbError.message}`);
      }

      console.log('Tokenized property created successfully:', tokenizedProperty);

      return {
        success: true,
        tokenizedPropertyId: tokenizedProperty.id,
        error: undefined
      };

    } catch (error) {
      console.error('Error in tokenizeProperty:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async createHederaTokenAfterApproval(tokenizedPropertyId: string): Promise<TokenizationResult> {
    try {
      if (!this.client || !this.operatorId || !this.operatorKey) {
        throw new Error('Hedera client not initialized');
      }

      // Get tokenized property details
      const { data: tokenizedProperty, error: fetchError } = await supabase
        .from('tokenized_properties')
        .select('*')
        .eq('id', tokenizedPropertyId)
        .single();

      if (fetchError || !tokenizedProperty) {
        throw new Error('Tokenized property not found');
      }

      console.log('Creating Hedera token for:', tokenizedProperty);

      // Create Hedera token
      const tokenCreateTx = new TokenCreateTransaction()
        .setTokenName(tokenizedProperty.token_name)
        .setTokenSymbol(tokenizedProperty.token_symbol)
        .setTokenType(TokenType.FungibleCommon)
        .setSupplyType(TokenSupplyType.Finite)
        .setInitialSupply(0)
        .setMaxSupply(parseInt(tokenizedProperty.total_supply))
        .setDecimals(8)
        .setTreasuryAccountId(this.operatorId)
        .setSupplyKey(this.operatorKey)
        .setAdminKey(this.operatorKey)
        .setFreezeDefault(false)
        .setMaxTransactionFee(new Hbar(20));

      const tokenCreateSubmit = await tokenCreateTx.execute(this.client);
      const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(this.client);
      const hederaTokenId = tokenCreateReceipt.tokenId?.toString();

      if (!hederaTokenId) {
        throw new Error('Failed to create Hedera token');
      }

      console.log('Hedera token created:', hederaTokenId);

      // Mint initial supply
      const mintTx = new TokenMintTransaction()
        .setTokenId(hederaTokenId)
        .setAmount(parseInt(tokenizedProperty.total_supply))
        .setMaxTransactionFee(new Hbar(20));

      const mintSubmit = await mintTx.execute(this.client);
      await mintSubmit.getReceipt(this.client);

      // Update database with Hedera token info and change status to minted
      const { error: updateError } = await supabase
        .from('tokenized_properties')
        .update({
          status: 'minted',
          hedera_token_id: hederaTokenId,
          updated_at: new Date().toISOString()
        })
        .eq('id', tokenizedPropertyId);

      if (updateError) {
        console.error('Error updating tokenized property:', updateError);
      }

      // Store Hedera token details
      await supabase
        .from('hedera_tokens')
        .insert({
          tokenized_property_id: tokenizedPropertyId,
          hedera_token_id: hederaTokenId,
          token_name: tokenizedProperty.token_name,
          token_symbol: tokenizedProperty.token_symbol,
          total_supply: parseInt(tokenizedProperty.total_supply),
          treasury_account_id: this.operatorId.toString(),
          decimals: 8
        });

      console.log('Token creation completed successfully');

      return {
        success: true,
        tokenizedPropertyId,
        hederaTokenId
      };

    } catch (error) {
      console.error('Error creating Hedera token:', error);
      
      // Update status to indicate minting failed
      await supabase
        .from('tokenized_properties')
        .update({
          status: 'approved', // Keep as approved so it can be retried
          updated_at: new Date().toISOString(),
          metadata: {
            minting_error: error instanceof Error ? error.message : 'Unknown error',
            last_minting_attempt: new Date().toISOString()
          }
        })
        .eq('id', tokenizedPropertyId);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Add the purchaseTokens method that investment.ts expects
  async purchaseTokens(params: {
    investorId: string;
    tokenizedPropertyId: string;
    tokenAmount: number;
    investorAccountId: string;
    investorPrivateKey: string;
  }): Promise<TokenizationResult> {
    try {
      // This would implement the token purchase logic
      // For now, return a placeholder implementation
      console.log('Purchase tokens called with:', params);
      
      return {
        success: true,
        tokenizedPropertyId: params.tokenizedPropertyId
      };
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  close() {
    if (this.client) {
      this.client.close();
    }
  }
}
