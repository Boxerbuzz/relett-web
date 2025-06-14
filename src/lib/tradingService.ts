
import { supabase } from '@/integrations/supabase/client';

export interface TradeRequest {
  tokenizedPropertyId: string;
  tokenAmount: number;
  pricePerToken: number;
  tradeType: 'buy' | 'sell';
  userId: string;
  orderType: 'market' | 'limit';
}

export interface TradeResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  details?: string;
}

export interface TradeValidation {
  isValid: boolean;
  error?: string;
  warnings?: string[];
}

export class TradingService {
  async validateTrade(request: TradeRequest): Promise<TradeValidation> {
    try {
      // Check if user has wallet
      const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', request.userId)
        .eq('wallet_type', 'hedera')
        .eq('is_primary', true)
        .maybeSingle();

      if (walletError) throw walletError;

      if (!wallet) {
        return {
          isValid: false,
          error: 'No Hedera wallet connected. Please connect your wallet first.'
        };
      }

      // Check tokenized property exists and is active
      const { data: property, error: propertyError } = await supabase
        .from('tokenized_properties')
        .select('*')
        .eq('id', request.tokenizedPropertyId)
        .single();

      if (propertyError || !property) {
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

      // For sell orders, check user has enough tokens
      if (request.tradeType === 'sell') {
        const { data: holdings, error: holdingsError } = await supabase
          .from('token_holdings')
          .select('tokens_owned')
          .eq('holder_id', request.userId)
          .eq('tokenized_property_id', request.tokenizedPropertyId)
          .maybeSingle();

        if (holdingsError) throw holdingsError;

        const currentHoldings = holdings ? parseInt(holdings.tokens_owned) : 0;
        if (currentHoldings < request.tokenAmount) {
          return {
            isValid: false,
            error: `Insufficient tokens. You own ${currentHoldings} tokens but trying to sell ${request.tokenAmount}.`
          };
        }
      }

      // Check minimum investment requirements for buy orders
      if (request.tradeType === 'buy') {
        const totalCost = request.tokenAmount * request.pricePerToken;
        if (totalCost < property.minimum_investment) {
          return {
            isValid: false,
            error: `Trade amount ${totalCost} is below minimum investment of ${property.minimum_investment}.`
          };
        }
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

  async executeTrade(request: TradeRequest): Promise<TradeResult> {
    try {
      console.log('Executing trade:', request);

      // Validate trade first
      const validation = await this.validateTrade(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Get user's wallet
      const { data: userWallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', request.userId)
        .eq('wallet_type', 'hedera')
        .eq('is_primary', true)
        .single();

      if (walletError) throw walletError;

      // Get tokenized property details
      const { data: tokenizedProperty, error: propertyError } = await supabase
        .from('tokenized_properties')
        .select('*')
        .eq('id', request.tokenizedPropertyId)
        .single();

      if (propertyError) throw propertyError;

      // Execute the trade based on type
      if (request.tradeType === 'buy') {
        return await this.executeBuyOrder(request, userWallet, tokenizedProperty);
      } else {
        return await this.executeSellOrder(request, userWallet, tokenizedProperty);
      }
    } catch (error) {
      console.error('Trade execution error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown trading error',
        details: error instanceof Error ? error.stack : undefined
      };
    }
  }

  private async executeBuyOrder(
    request: TradeRequest, 
    userWallet: any, 
    tokenizedProperty: any
  ): Promise<TradeResult> {
    try {
      // First, check if token association is needed
      const { data: associationData, error: associationError } = await supabase.functions.invoke('check-token-association', {
        body: {
          tokenId: tokenizedProperty.hedera_token_id,
          accountId: userWallet.address
        }
      });

      if (associationError) throw associationError;

      // Associate token if not already associated
      if (!associationData.isAssociated) {
        const { data: assocResult, error: assocError } = await supabase.functions.invoke('associate-hedera-token', {
          body: {
            tokenId: tokenizedProperty.hedera_token_id,
            investorAccountId: userWallet.address,
            investorPrivateKey: userWallet.encrypted_private_key
          }
        });

        if (assocError) throw assocError;
      }

      // Execute token transfer
      const { data: transferData, error: transferError } = await supabase.functions.invoke('transfer-hedera-tokens', {
        body: {
          tokenId: tokenizedProperty.hedera_token_id,
          fromAccountId: 'treasury_account', // Treasury account
          toAccountId: userWallet.address,
          amount: request.tokenAmount,
          fromPrivateKey: 'treasury_private_key', // Treasury private key
          tokenizedPropertyId: request.tokenizedPropertyId,
          pricePerToken: request.pricePerToken
        }
      });

      if (transferError) throw transferError;

      // Update token holdings
      await this.updateTokenHoldings(
        request.userId,
        request.tokenizedPropertyId,
        request.tokenAmount,
        request.pricePerToken,
        'buy'
      );

      // Record trade transaction
      await this.recordTradeTransaction(request, transferData.transaction_id, 'confirmed');

      return {
        success: true,
        transactionId: transferData.transaction_id
      };
    } catch (error) {
      await this.recordTradeTransaction(request, undefined, 'failed');
      throw new Error(`Buy order failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executeSellOrder(
    request: TradeRequest, 
    userWallet: any, 
    tokenizedProperty: any
  ): Promise<TradeResult> {
    try {
      // Execute token transfer from user to treasury
      const { data: transferData, error: transferError } = await supabase.functions.invoke('transfer-hedera-tokens', {
        body: {
          tokenId: tokenizedProperty.hedera_token_id,
          fromAccountId: userWallet.address,
          toAccountId: 'treasury_account', // Treasury/marketplace account
          amount: request.tokenAmount,
          fromPrivateKey: userWallet.encrypted_private_key,
          tokenizedPropertyId: request.tokenizedPropertyId,
          pricePerToken: request.pricePerToken
        }
      });

      if (transferError) throw transferError;

      // Update token holdings
      await this.updateTokenHoldings(
        request.userId,
        request.tokenizedPropertyId,
        -request.tokenAmount, // Negative for sell
        request.pricePerToken,
        'sell'
      );

      // Record trade transaction
      await this.recordTradeTransaction(request, transferData.transaction_id, 'confirmed');

      return {
        success: true,
        transactionId: transferData.transaction_id
      };
    } catch (error) {
      await this.recordTradeTransaction(request, undefined, 'failed');
      throw new Error(`Sell order failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async updateTokenHoldings(
    userId: string,
    tokenizedPropertyId: string,
    tokenAmount: number,
    pricePerToken: number,
    tradeType: 'buy' | 'sell'
  ) {
    const { data: currentHolding, error: fetchError } = await supabase
      .from('token_holdings')
      .select('*')
      .eq('holder_id', userId)
      .eq('tokenized_property_id', tokenizedPropertyId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (currentHolding) {
      const newTokenAmount = parseInt(currentHolding.tokens_owned) + tokenAmount;
      const newTotalInvestment = tradeType === 'buy' 
        ? currentHolding.total_investment + (tokenAmount * pricePerToken)
        : currentHolding.total_investment;

      if (newTokenAmount <= 0) {
        await supabase
          .from('token_holdings')
          .delete()
          .eq('id', currentHolding.id);
      } else {
        await supabase
          .from('token_holdings')
          .update({
            tokens_owned: newTokenAmount.toString(),
            total_investment: newTotalInvestment,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentHolding.id);
      }
    } else if (tradeType === 'buy') {
      await supabase
        .from('token_holdings')
        .insert({
          holder_id: userId,
          tokenized_property_id: tokenizedPropertyId,
          tokens_owned: tokenAmount.toString(),
          purchase_price_per_token: pricePerToken,
          total_investment: tokenAmount * pricePerToken,
          acquisition_date: new Date().toISOString()
        });
    }
  }

  private async recordTradeTransaction(
    request: TradeRequest,
    transactionId?: string,
    status: 'pending' | 'confirmed' | 'failed' = 'confirmed'
  ) {
    try {
      // Map trade request to token_transactions table structure
      const transactionType = request.tradeType === 'buy' ? 'transfer' : 'transfer';
      const fromHolder = request.tradeType === 'buy' ? null : request.userId;
      const toHolder = request.tradeType === 'buy' ? request.userId : null;

      await supabase
        .from('token_transactions')
        .insert({
          tokenized_property_id: request.tokenizedPropertyId,
          transaction_type: transactionType,
          from_holder: fromHolder,
          to_holder: toHolder,
          token_amount: request.tokenAmount.toString(),
          price_per_token: request.pricePerToken,
          total_value: request.tokenAmount * request.pricePerToken,
          status,
          hedera_transaction_id: transactionId,
          metadata: {
            order_type: request.orderType,
            trade_type: request.tradeType
          }
        });
    } catch (error) {
      console.error('Error recording transaction:', error);
    }
  }

  async getMarketPrice(tokenizedPropertyId: string): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('tokenized_properties')
        .select('token_price')
        .eq('id', tokenizedPropertyId)
        .single();

      if (error) throw error;
      return data.token_price;
    } catch (error) {
      console.error('Error fetching market price:', error);
      return 0;
    }
  }

  async getTradeHistory(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('token_transactions')
        .select(`
          *,
          tokenized_properties!inner(token_name, token_symbol)
        `)
        .or(`from_holder.eq.${userId},to_holder.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching trade history:', error);
      return [];
    }
  }
}
