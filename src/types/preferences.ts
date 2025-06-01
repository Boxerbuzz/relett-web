
export type Channel = "sms" | "email" | "push" | "in_app" | string;

export interface NotificationTypeDetails {
  enabled: boolean;
  priority_threshold: "low" | "medium" | "high";
  channels: Channel[];
}

export interface NotificationChannel {
  sms: boolean;
  email: boolean;
  push: boolean;
  in_app: boolean;
}

export interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_types: {
    property_updates: boolean;
    payment_notifications: boolean;
    dividend_alerts: boolean;
    verification_updates: boolean;
    market_insights: boolean;
    investment_opportunities: boolean;
    tokenization_updates: boolean;
    auction_notifications: boolean;
    system_announcements: boolean;
  };
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  do_not_disturb: boolean;
}

export interface FinancialReport {
  id: string;
  user_id: string;
  report_type: string;
  period_start: string;
  period_end: string;
  data: any;
  generated_at: string;
  status: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface InvestmentTracking {
  id: string;
  user_id: string;
  tokenized_property_id: string;
  investment_amount: number;
  tokens_owned: number;
  current_value: number;
  roi_percentage: number;
  last_dividend_amount: number;
  last_dividend_date?: string;
  total_dividends_received: number;
  created_at: string;
  updated_at: string;
  tokenized_property?: {
    token_name: string;
    token_symbol: string;
    property_id: string;
  };
}
