
import { supabase } from '@/integrations/supabase/client';
import { TradeRequest } from './TradeValidationService';

export interface HederaTradeResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export class HederaTradeService {
  async executeBuyTrade(
    request: TradeRequest,
    userWallet: any,
    tokenizedProperty: any
  ): Promise<HederaTradeResult> {
    try {
      // Check token association
      await this.ensureTokenAssociation(tokenizedProperty.hedera_token_id, userWallet);

      // Execute token transfer
      const transferResult = await this.transferTokens({
        tokenId: tokenizedProperty.hedera_token_id,
        fromAccountId: 'treasury_account',
        toAccountId: userWallet.address,
        amount: request.tokenAmount,
        fromPrivateKey: 'treasury_private_key',
        tokenizedPropertyId: request.tokenizedPropertyId,
        pricePerToken: request.pricePerToken
      });

      return {
        success: true,
        transactionId: transferResult.transaction_id
      };
    } catch (error) {
      return {
        success: false,
        error: `Buy order failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  async executeSellTrade(
    request: TradeRequest,
    userWallet: any,
    tokenizedProperty: any
  ): Promise<HederaTradeResult> {
    try {
      // Execute token transfer from user to treasury
      const transferResult = await this.transferTokens({
        tokenId: tokenizedProperty.hedera_token_id,
        fromAccountId: userWallet.address,
        toAccountId: 'treasury_account',
        amount: request.tokenAmount,
        fromPrivateKey: userWallet.encrypted_private_key,
        tokenizedPropertyId: request.tokenizedPropertyId,
        pricePerToken: request.pricePerToken
      });

      return {
        success: true,
        transactionId: transferResult.transaction_id
      };
    } catch (error) {
      return {
        success: false,
        error: `Sell order failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private async ensureTokenAssociation(tokenId: string, userWallet: any): Promise<void> {
    // Check if token is associated
    const { data: associationData, error: associationError } = await supabase.functions.invoke('check-token-association', {
      body: {
        tokenId,
        accountId: userWallet.address
      }
    });

    if (associationError) throw associationError;

    // Associate token if not already associated
    if (!associationData.isAssociated) {
      const { error: assocError } = await supabase.functions.invoke('associate-hedera-token', {
        body: {
          tokenId,
          investorAccountId: userWallet.address,
          investorPrivateKey: userWallet.encrypted_private_key
        }
      });

      if (assocError) throw assocError;
    }
  }

  private async transferTokens(params: {
    tokenId: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    fromPrivateKey: string;
    tokenizedPropertyId: string;
    pricePerToken: number;
  }): Promise<{ transaction_id: string }> {
    const { data, error } = await supabase.functions.invoke('transfer-hedera-tokens', {
      body: params
    });

    if (error) throw error;
    return data;
  }
}
