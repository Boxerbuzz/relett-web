
import { supabase } from '@/integrations/supabase/client';
import { TradeRequest } from './TradeValidationService';

export class TransactionRecordingService {
  async recordTransaction(
    request: TradeRequest,
    transactionId?: string,
    status: 'pending' | 'confirmed' | 'failed' = 'confirmed'
  ): Promise<void> {
    try {
      const transactionType = 'transfer';
      const fromHolder = request.tradeType === 'buy' ? null : request.userId;
      const toHolder = request.tradeType === 'buy' ? request.userId : null;

      await supabase
        .from('token_transactions')
        .insert({
          tokenized_property_id: request.tokenizedPropertyId,
          transaction_type: transactionType,
          from_holder: fromHolder,
          to_holder: toHolder || "",
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
}
