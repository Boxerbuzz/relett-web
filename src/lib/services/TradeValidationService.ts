
import { supabase } from '@/integrations/supabase/client';

export interface TradeRequest {
  tokenizedPropertyId: string;
  tokenAmount: number;
  pricePerToken: number;
  tradeType: 'buy' | 'sell';
  userId: string;
  orderType: 'market' | 'limit';
}

export interface TradeValidation {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export class TradeValidationService {
  async validateTrade(request: TradeRequest): Promise<TradeValidation> {
    try {
      // Check if user has wallet
      const walletValidation = await this.validateWallet(request.userId);
      if (!walletValidation.isValid) {
        return walletValidation;
      }

      // Check tokenized property
      const propertyValidation = await this.validateProperty(request.tokenizedPropertyId);
      if (!propertyValidation.isValid) {
        return propertyValidation;
      }

      // Validate trade amounts and holdings
      const amountValidation = await this.validateTradeAmounts(request);
      if (!amountValidation.isValid) {
        return amountValidation;
      }

      return { isValid: true };
    } catch (error) {
      console.error('Trade validation error:', error);
      return {
        isValid: false,
        error: 'Validation failed. Please try again.'
      };
    }
  }

  private async validateWallet(userId: string): Promise<TradeValidation> {
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .eq('wallet_type', 'hedera')
      .eq('is_primary', true)
      .maybeSingle();

    if (error) throw error;

    if (!wallet) {
      return {
        isValid: false,
        error: 'No Hedera wallet connected. Please connect your wallet first.'
      };
    }

    return { isValid: true };
  }

  private async validateProperty(tokenizedPropertyId: string): Promise<TradeValidation> {
    const { data: property, error } = await supabase
      .from('tokenized_properties')
      .select('*')
      .eq('id', tokenizedPropertyId)
      .single();

    if (error || !property) {
      return {
        isValid: false,
        error: 'Property not found or not available for trading.'
      };
    }

    if (property.status !== 'active') {
      return {
        isValid: false,
        error: 'Property is not currently available for trading.'
      };
    }

    return { isValid: true };
  }

  private async validateTradeAmounts(request: TradeRequest): Promise<TradeValidation> {
    // For sell orders, check user has enough tokens
    if (request.tradeType === 'sell') {
      const { data: holdings, error } = await supabase
        .from('token_holdings')
        .select('tokens_owned')
        .eq('holder_id', request.userId)
        .eq('tokenized_property_id', request.tokenizedPropertyId)
        .maybeSingle();

      if (error) throw error;

      const currentHoldings = holdings ? parseInt(holdings.tokens_owned) : 0;
      if (currentHoldings < request.tokenAmount) {
        return {
          isValid: false,
          error: `Insufficient tokens. You own ${currentHoldings} tokens but trying to sell ${request.tokenAmount}.`
        };
      }
    }

    // For buy orders, check minimum investment
    if (request.tradeType === 'buy') {
      const { data: property, error } = await supabase
        .from('tokenized_properties')
        .select('minimum_investment')
        .eq('id', request.tokenizedPropertyId)
        .single();

      if (error) throw error;

      const totalCost = request.tokenAmount * request.pricePerToken;
      if (totalCost < property.minimum_investment) {
        return {
          isValid: false,
          error: `Trade amount ${totalCost} is below minimum investment of ${property.minimum_investment}.`
        };
      }
    }

    return { isValid: true };
  }
}
