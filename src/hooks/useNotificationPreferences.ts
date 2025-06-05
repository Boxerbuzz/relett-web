
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { NotificationPreferences } from '@/types/preferences';

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    notification_types: {
      // Property related
      property_updates: true,
      property_verification: true,
      property_viewing: true,
      property_inspection: true,
      
      // Financial
      payment_notifications: true,
      dividend_alerts: true,
      transaction_alerts: true,
      
      // Investment
      investment_opportunities: true,
      tokenization_updates: true,
      auction_notifications: true,
      
      // Rental & Booking
      rental_requests: true,
      rental_approvals: true,
      reservation_updates: true,
      
      // Communication
      chat_messages: true,
      inquiry_responses: true,
      
      // System
      verification_updates: true,
      system_announcements: true,
      market_insights: false,
      
      // Purchase related
      purchase_confirmations: true,
      purchase_updates: true,
      delivery_notifications: false,
    },
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00',
    do_not_disturb: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPreferences({
          email_notifications: data.email_notifications,
          push_notifications: data.push_notifications,
          sms_notifications: data.sms_notifications,
          notification_types: typeof data.notification_types === 'object' && data.notification_types !== null 
            ? { ...preferences.notification_types, ...data.notification_types }
            : preferences.notification_types,
          quiet_hours_start: data.quiet_hours_start || '22:00',
          quiet_hours_end: data.quiet_hours_end || '07:00',
          do_not_disturb: data.do_not_disturb,
        });
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to load notification preferences.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const updatedPreferences = { ...preferences, ...newPreferences };

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...updatedPreferences
        });

      if (error) throw error;

      setPreferences(updatedPreferences);
      toast({
        title: 'Preferences updated',
        description: 'Your notification preferences have been saved.',
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast({
        title: 'Error updating preferences',
        description: 'Failed to save your notification preferences.',
        variant: 'destructive'
      });
    }
  };

  return {
    preferences,
    updatePreferences,
    isLoading,
    refetch: fetchPreferences
  };
}
