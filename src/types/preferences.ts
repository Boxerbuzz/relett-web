
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
  } | null;
}

export interface DocumentVerificationRequest {
  id: string;
  document_id: string;
  requested_by: string;
  assigned_verifier?: string;
  priority: string;
  status: string;
  verification_checklist: any;
  notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  property_documents: {
    id: string;
    document_name: string;
    document_type: string;
    file_url: string;
    properties?: {
      id: string;
      title: string;
      user_profiles?: {
        first_name: string;
        last_name: string;
      };
    };
  };
}

export interface TokenizedProperty {
  id: string;
  token_name: string;
  token_symbol: string;
  total_supply: string;
  total_value_usd: number;
  token_holdings?: Array<{
    id: string;
    holder_id: string;
    tokens_owned: string;
    user_profiles?: {
      first_name: string;
      last_name: string;
    };
  }>;
}
