
import { supabase } from '@/integrations/supabase/client';

export interface TradeRequest {
  tokenizedPropertyId: string;
  tokenAmount: number;
  pricePerToken: number;
  tradeType: 'buy' | 'sell';
  userId: string;
}

export interface TradeResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export class TradingService {
  async executeTrade(request: TradeRequest): Promise<TradeResult> {
    try {
      console.log('Executing trade:', request);

      // Get user's wallet information
      const { data: userWallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', request.userId)
        .eq('wallet_type', 'hedera')
        .eq('is_primary', true)
        .maybeSingle();

      if (walletError) throw walletError;

      if (!userWallet) {
        throw new Error('No Hedera wallet found. Please set up your wallet first.');
      }

      // Get tokenized property details
      const { data: tokenizedProperty, error: propertyError } = await supabase
        .from('tokenized_properties')
        .select('*')
        .eq('id', request.tokenizedPropertyId)
        .single();

      if (propertyError) throw propertyError;

      if (request.tradeType === 'buy') {
        return await this.executeBuyOrder(request, userWallet, tokenizedProperty);
      } else {
        return await this.executeSellOrder(request, userWallet, tokenizedProperty);
      }
    } catch (error) {
      console.error('Trade execution error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown trading error'
      };
    }
  }

  private async executeBuyOrder(
    request: TradeRequest, 
    userWallet: any, 
    tokenizedProperty: any
  ): Promise<TradeResult> {
    try {
      // For buy orders, transfer tokens from treasury to user
      const { data, error } = await supabase.functions.invoke('transfer-hedera-tokens', {
        body: {
          tokenId: tokenizedProperty.hedera_token_id,
          fromAccountId: 'treasury_account', // This would be the property's treasury
          toAccountId: userWallet.address,
          amount: request.tokenAmount,
          fromPrivateKey: 'treasury_private_key', // This would be securely stored
          tokenizedPropertyId: request.tokenizedPropertyId,
          pricePerToken: request.pricePerToken
        }
      });

      if (error) throw error;

      // Update token holdings in database
      await this.updateTokenHoldings(
        request.userId,
        request.tokenizedPropertyId,
        request.tokenAmount,
        request.pricePerToken,
        'buy'
      );

      return {
        success: true,
        transactionId: data.transaction_id
      };
    } catch (error) {
      throw new Error(`Buy order failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async executeSellOrder(
    request: TradeRequest, 
    userWallet: any, 
    tokenizedProperty: any
  ): Promise<TradeResult> {
    try {
      // Check if user has enough tokens
      const { data: holdings, error: holdingsError } = await supabase
        .from('token_holdings')
        .select('tokens_owned')
        .eq('holder_id', request.userId)
        .eq('tokenized_property_id', request.tokenizedPropertyId)
        .single();

      if (holdingsError) throw holdingsError;

      if (!holdings || parseInt(holdings.tokens_owned) < request.tokenAmount) {
        throw new Error('Insufficient token balance for sell order');
      }

      // For sell orders, transfer tokens from user to treasury (or marketplace)
      const { data, error } = await supabase.functions.invoke('transfer-hedera-tokens', {
        body: {
          tokenId: tokenizedProperty.hedera_token_id,
          fromAccountId: userWallet.address,
          toAccountId: 'treasury_account', // This would be the marketplace/treasury
          amount: request.tokenAmount,
          fromPrivateKey: userWallet.encrypted_private_key,
          tokenizedPropertyId: request.tokenizedPropertyId,
          pricePerToken: request.pricePerToken
        }
      });

      if (error) throw error;

      // Update token holdings in database
      await this.updateTokenHoldings(
        request.userId,
        request.tokenizedPropertyId,
        -request.tokenAmount, // Negative for sell
        request.pricePerToken,
        'sell'
      );

      return {
        success: true,
        transactionId: data.transaction_id
      };
    } catch (error) {
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
      // Update existing holding
      const newTokenAmount = parseInt(currentHolding.tokens_owned) + tokenAmount;
      const newTotalInvestment = tradeType === 'buy' 
        ? currentHolding.total_investment + (tokenAmount * pricePerToken)
        : currentHolding.total_investment; // Don't change investment on sell

      if (newTokenAmount <= 0) {
        // Remove holding if no tokens left
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
      // Create new holding for buy orders
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

  async getMarketPrice(tokenizedPropertyId: string): Promise<number> {
    try {
      // Get the current token price from the tokenized property
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
}
