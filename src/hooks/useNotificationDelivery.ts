
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface NotificationDeliveryStatus {
  id: string;
  channel: 'email' | 'sms' | 'push';
  status: 'pending' | 'delivered' | 'failed';
  delivered_at?: string | null;
  error_message?: string | null;
  notification_id: string;
  external_id?: string | null;
  created_at: string;
  updated_at: string;
}

export function useNotificationDelivery() {
  const [deliveryStatuses, setDeliveryStatuses] = useState<NotificationDeliveryStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendNotification = async (
    userId: string,
    type: 'reservation' | 'rental' | 'inspection' | 'payment' | 'general' | 'investment' | 'chat',
    title: string,
    message: string,
    metadata?: any,
    actionUrl?: string,
    actionLabel?: string
  ) => {
    try {
      setIsLoading(true);

      // Create notification in database
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type,
          title,
          message,
          metadata: metadata || {},
          action_url: actionUrl,
          action_label: actionLabel,
        })
        .select()
        .single();

      if (error) throw error;

      // Trigger the process-notification edge function
      const { data, error: processError } = await supabase.functions.invoke('process-notification', {
        body: { notification_id: notification.id }
      });

      if (processError) {
        console.error('Error processing notification:', processError);
        toast({
          title: 'Notification error',
          description: 'Failed to process notification delivery',
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Notification sent',
          description: 'Notification has been processed for delivery',
        });
      }

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Failed to send notification',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getDeliveryStatus = async (notificationId: string) => {
    try {
      const { data, error } = await supabase
        .from('notification_deliveries')
        .select('*')
        .eq('notification_id', notificationId);

      if (error) throw error;
      
      // Type the data properly to match our interface
      const typedData = data?.map(delivery => ({
        id: delivery.id,
        channel: delivery.channel as 'email' | 'sms' | 'push',
        status: delivery.status as 'pending' | 'delivered' | 'failed',
        delivered_at: delivery.delivered_at,
        error_message: delivery.error_message,
        notification_id: delivery.notification_id,
        external_id: delivery.external_id,
        created_at: delivery.created_at,
        updated_at: delivery.updated_at,
      })) || [];
      
      setDeliveryStatuses(typedData);
      return typedData;
    } catch (error) {
      console.error('Error fetching delivery status:', error);
      return [];
    }
  };

  const retryFailedDelivery = async (deliveryId: string) => {
    try {
      const { error } = await supabase
        .from('notification_deliveries')
        .update({ status: 'pending' })
        .eq('id', deliveryId);

      if (error) throw error;

      toast({
        title: 'Retry initiated',
        description: 'Delivery retry has been queued',
      });
    } catch (error) {
      console.error('Error retrying delivery:', error);
      toast({
        title: 'Retry failed',
        description: 'Could not retry notification delivery',
        variant: 'destructive'
      });
    }
  };

  return {
    sendNotification,
    getDeliveryStatus,
    retryFailedDelivery,
    deliveryStatuses,
    isLoading
  };
}
