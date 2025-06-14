
import { supabase } from '@/integrations/supabase/client';

// Re-export the new refactored services for backward compatibility
export { TradingService } from './services/TradingService';
export type { TradeRequest as NewTradeRequest, TradeValidation } from './services/TradeValidationService';
export type { TradeResult as NewTradeResult } from './services/TradingService';

// Re-export legacy types with different names to avoid conflicts
export type { TradeRequest as LegacyTradeRequest, TradeResult as LegacyTradeResult } from './services/LegacyTradingService';
export { LegacyTradingService } from './services/LegacyTradingService';

// Default export is the new TradingService
export { TradingService as default } from './services/TradingService';
