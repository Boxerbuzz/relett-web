
// Legacy trading service - maintained for backward compatibility
// New implementations should use the services in /lib/services/

import { LegacyTradingService } from './services/LegacyTradingService';

// Re-export types and service for backward compatibility
export type { TradeRequest, TradeResult } from './services/LegacyTradingService';
export { LegacyTradingService as TradingService };

// Create default instance for immediate use
export const tradingService = new LegacyTradingService();
