
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { queryKeys, cacheConfig } from '@/lib/queryClient';
import type { NotificationPreferences } from '@/types/preferences';

export function useNotificationPreferences() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const getDefaultPreferences = (): NotificationPreferences => {
    return {
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
    };
  };

  const {
    data: preferences,
    isLoading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: queryKeys.notifications.preferences(user?.id || ''),
    queryFn: async (): Promise<NotificationPreferences> => {
      if (!user?.id) {
        return getDefaultPreferences();
      }

      console.log('Fetching notification preferences for:', user.email);

      try {
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          const defaultPrefs = getDefaultPreferences();
          return {
            email_notifications: data.email_notifications,
            push_notifications: data.push_notifications,
            sms_notifications: data.sms_notifications,
            notification_types: typeof data.notification_types === 'object' && data.notification_types !== null 
              ? { ...defaultPrefs.notification_types, ...data.notification_types }
              : defaultPrefs.notification_types,
            quiet_hours_start: data.quiet_hours_start || '22:00',
            quiet_hours_end: data.quiet_hours_end || '07:00',
            do_not_disturb: data.do_not_disturb,
          };
        }

        return getDefaultPreferences();
      } catch (err) {
        console.error('Error fetching notification preferences:', err);
        throw err;
      }
    },
    enabled: !!user?.id,
    ...cacheConfig.standard, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (newPreferences: Partial<NotificationPreferences>) => {
      if (!user?.id) throw new Error('No user ID');

      const updatedPreferences = { ...preferences, ...newPreferences };

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...updatedPreferences
        });

      if (error) throw error;
      return updatedPreferences;
    },
    onSuccess: (updatedPreferences) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        queryKeys.notifications.preferences(user?.id || ''),
        updatedPreferences
      );
      
      toast({
        title: 'Preferences updated',
        description: 'Your notification preferences have been saved.',
      });
    },
    onError: (error) => {
      console.error('Error updating notification preferences:', error);
      toast({
        title: 'Error updating preferences',
        description: 'Failed to save your notification preferences.',
        variant: 'destructive'
      });
    }
  });

  const updatePreferences = (newPreferences: Partial<NotificationPreferences>) => {
    updatePreferencesMutation.mutate(newPreferences);
  };

  return {
    preferences: preferences || getDefaultPreferences(),
    updatePreferences,
    isLoading,
    refetch
  };
}
