
// Updated trading service - now uses the new TradingService
// This file provides backward compatibility for existing imports

import { TradingService } from './services/TradingService';
import { TradeRequest, TradeValidation } from './services/TradeValidationService';

// Re-export types and service for backward compatibility
export type { TradeRequest, TradeValidation };
export type TradeResult = { success: boolean; transactionId?: string; error?: string };
export { TradingService };

// Create default instance for immediate use
export const tradingService = new TradingService();
