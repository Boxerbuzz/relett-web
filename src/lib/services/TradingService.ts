
import { supabase } from '@/integrations/supabase/client';
import { TradeValidationService, TradeRequest, TradeValidation } from './TradeValidationService';
import { HederaTradeService } from './HederaTradeService';
import { TokenHoldingsService } from './TokenHoldingsService';
import { TransactionRecordingService } from './TransactionRecordingService';

export interface TradeResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  details?: string;
}

export class TradingService {
  private validationService = new TradeValidationService();
  private hederaService = new HederaTradeService();
  private holdingsService = new TokenHoldingsService();
  private transactionService = new TransactionRecordingService();

  async validateTrade(request: TradeRequest): Promise<TradeValidation> {
    return this.validationService.validateTrade(request);
  }

  async executeTrade(request: TradeRequest): Promise<TradeResult> {
    try {
      console.log('Executing trade:', request);

      // Validate trade first
      const validation = await this.validationService.validateTrade(request);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Get required data
      const [userWallet, tokenizedProperty] = await Promise.all([
        this.getUserWallet(request.userId),
        this.getTokenizedProperty(request.tokenizedPropertyId)
      ]);

      // Execute the trade based on type
      const tradeResult = request.tradeType === 'buy' 
        ? await this.hederaService.executeBuyTrade(request, userWallet, tokenizedProperty)
        : await this.hederaService.executeSellTrade(request, userWallet, tokenizedProperty);

      if (!tradeResult.success) {
        await this.transactionService.recordTransaction(request, undefined, 'failed');
        return {
          success: false,
          error: tradeResult.error
        };
      }

      // Update holdings and record transaction
      await Promise.all([
        this.holdingsService.updateHoldings(
          request.userId,
          request.tokenizedPropertyId,
          request.tokenAmount,
          request.pricePerToken,
          request.tradeType
        ),
        this.transactionService.recordTransaction(request, tradeResult.transactionId, 'confirmed')
      ]);

      return {
        success: true,
        transactionId: tradeResult.transactionId
      };
    } catch (error) {
      console.error('Trade execution error:', error);
      await this.transactionService.recordTransaction(request, undefined, 'failed');
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown trading error',
        details: error instanceof Error ? error.stack : undefined
      };
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

  private async getUserWallet(userId: string) {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .eq('wallet_type', 'hedera')
      .eq('is_primary', true)
      .single();

    if (error) throw error;
    return data;
  }

  private async getTokenizedProperty(tokenizedPropertyId: string) {
    const { data, error } = await supabase
      .from('tokenized_properties')
      .select('*')
      .eq('id', tokenizedPropertyId)
      .single();

    if (error) throw error;
    return data;
  }
}
