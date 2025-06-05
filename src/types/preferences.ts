
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
