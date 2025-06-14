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

// Re-export the new refactored services for backward compatibility
export { TradingService } from './services/TradingService';
export type { TradeRequest, TradeValidation } from './services/TradeValidationService';
export type { TradeResult } from './services/TradingService';

// Keep the old exports working
export { TradingService as TradingServiceLegacy } from './services/TradingService';
