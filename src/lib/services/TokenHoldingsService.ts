
import { supabase } from '@/integrations/supabase/client';

export class TokenHoldingsService {
  async updateHoldings(
    userId: string,
    tokenizedPropertyId: string,
    tokenAmount: number,
    pricePerToken: number,
    tradeType: 'buy' | 'sell'
  ): Promise<void> {
    const { data: currentHolding, error: fetchError } = await supabase
      .from('token_holdings')
      .select('*')
      .eq('holder_id', userId)
      .eq('tokenized_property_id', tokenizedPropertyId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (currentHolding) {
      await this.updateExistingHolding(currentHolding, tokenAmount, pricePerToken, tradeType);
    } else if (tradeType === 'buy') {
      await this.createNewHolding(userId, tokenizedPropertyId, tokenAmount, pricePerToken);
    }
  }

  private async updateExistingHolding(
    currentHolding: any,
    tokenAmount: number,
    pricePerToken: number,
    tradeType: 'buy' | 'sell'
  ): Promise<void> {
    const newTokenAmount = parseInt(currentHolding.tokens_owned) + (tradeType === 'buy' ? tokenAmount : -tokenAmount);
    const newTotalInvestment = tradeType === 'buy' 
      ? currentHolding.total_investment + (tokenAmount * pricePerToken)
      : currentHolding.total_investment;

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
  }

  private async createNewHolding(
    userId: string,
    tokenizedPropertyId: string,
    tokenAmount: number,
    pricePerToken: number
  ): Promise<void> {
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
