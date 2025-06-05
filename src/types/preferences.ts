
export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_types: {
    // Property related
    property_updates: boolean;
    property_verification: boolean;
    property_viewing: boolean;
    property_inspection: boolean;
    
    // Financial
    payment_notifications: boolean;
    dividend_alerts: boolean;
    transaction_alerts: boolean;
    
    // Investment
    investment_opportunities: boolean;
    tokenization_updates: boolean;
    auction_notifications: boolean;
    
    // Rental & Booking
    rental_requests: boolean;
    rental_approvals: boolean;
    reservation_updates: boolean;
    
    // Communication
    chat_messages: boolean;
    inquiry_responses: boolean;
    
    // System
    verification_updates: boolean;
    system_announcements: boolean;
    market_insights: boolean;
    
    // Purchase related
    purchase_confirmations: boolean;
    purchase_updates: boolean;
    delivery_notifications: boolean;
  };
  quiet_hours_start: string;
  quiet_hours_end: string;
  do_not_disturb: boolean;
}

// Add missing interfaces that were referenced in other files
export interface InvestmentTracking {
  id: string;
  user_id: string;
  tokenized_property_id: string;
  investment_amount: number;
  current_value: number;
  tokens_owned: number;
  roi_percentage: number;
  last_dividend_amount: number;
  last_dividend_date: string | null;
  total_dividends_received: number;
  created_at: string;
  updated_at: string;
  tokenized_property?: TokenizedProperty | null;
}

export interface TokenizedProperty {
  id: string;
  token_name: string;
  token_symbol: string;
  total_supply: string;
  total_value_usd: number;
  token_holdings?: TokenHolding[];
}

export interface TokenHolding {
  id: string;
  tokenized_property_id: string;
  holder_id: string;
  tokens_owned: string;
  purchase_price_per_token: number;
  total_investment: number;
  acquisition_date: string;
  created_at: string;
  updated_at: string;
}

export interface FinancialReport {
  id: string;
  user_id: string;
  report_type: string;
  period_start: string;
  period_end: string;
  data: any;
  status: string;
  generated_at: string;
  created_at: string;
  updated_at: string;
  metadata?: any;
}
