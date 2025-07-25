
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PreferencesUpdate {
  email_notifications?: boolean;
  push_notifications?: boolean;
  sms_notifications?: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  do_not_disturb?: boolean;
}

interface NotificationTypesUpdate {
  [key: string]: boolean;
}

interface PortfolioTargetsUpdate {
  [allocationType: string]: {
    [category: string]: {
      target: number;
      threshold: number;
    };
  };
}

export function useDefaultsManager() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateUserDefaults = async (
    userId: string,
    updates: {
      preferences?: PreferencesUpdate;
      notification_types?: NotificationTypesUpdate;
      portfolio_targets?: PortfolioTargetsUpdate;
    }
  ) => {
    setIsUpdating(true);
    try {
      const { data, error } = await supabase.functions.invoke('update-user-defaults', {
        body: {
          user_id: userId,
          ...updates
        }
      });

      if (error) throw error;

      toast({
        title: 'Settings Updated',
        description: 'Your preferences have been saved successfully.',
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error updating user defaults:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update your preferences. Please try again.',
        variant: 'destructive'
      });
      return { success: false, error };
    } finally {
      setIsUpdating(false);
    }
  };

  const trackInteraction = async (
    propertyId: string,
    userId: string,
    interactionType: 'view' | 'like' | 'favorite' | 'share' | 'inquiry' | 'contact',
    metadata?: Record<string, any>
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('track-interaction', {
        body: {
          property_id: propertyId,
          user_id: userId,
          interaction_type: interactionType,
          metadata: {
            ...metadata,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent,
            referrer: document.referrer
          }
        }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error tracking interaction:', error);
      return { success: false, error };
    }
  };

  const createInvestmentTracking = async (
    userId: string,
    tokenizedPropertyId: string,
    tokensOwned: number,
    investmentAmount: number,
    purchasePricePerToken: number
  ) => {
    try {
      const { data, error } = await supabase.rpc('create_investment_tracking', {
        p_user_id: userId,
        p_tokenized_property_id: tokenizedPropertyId,
        p_tokens_owned: tokensOwned,
        p_investment_amount: investmentAmount,
        p_purchase_price_per_token: purchasePricePerToken
      });

      if (error) throw error;

      toast({
        title: 'Investment Tracked',
        description: 'Your investment has been recorded successfully.',
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error creating investment tracking:', error);
      toast({
        title: 'Tracking Failed',
        description: 'Failed to record your investment. Please contact support.',
        variant: 'destructive'
      });
      return { success: false, error };
    }
  };

  const updatePropertyAnalytics = async () => {
    try {
      const { data, error } = await supabase.rpc('update_property_analytics');
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating property analytics:', error);
      return { success: false, error };
    }
  };

  return {
    updateUserDefaults,
    trackInteraction,
    createInvestmentTracking,
    updatePropertyAnalytics,
    isUpdating
  };
}
