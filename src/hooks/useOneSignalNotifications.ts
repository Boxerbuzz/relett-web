
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface NotificationConfig {
  title: string;
  message: string;
  url?: string;
  data?: Record<string, any>;
}

export function useOneSignalNotifications() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const initializeOneSignal = async () => {
      try {
        // Check if OneSignal is already loaded
        if (typeof window !== 'undefined' && window.OneSignal) {
          await window.OneSignal.init({
            appId: 'YOUR_ONESIGNAL_APP_ID', // This should be set from environment
            safari_web_id: 'web.onesignal.auto.xxxx-xxxx-xxxx-xxxx',
            notifyButton: {
              enable: true,
            },
            allowLocalhostAsSecureOrigin: true,
          });

          // Get player ID
          const id = await window.OneSignal.getExternalUserId();
          setPlayerId(id);
          setIsInitialized(true);

          // Set up notification handlers
          window.OneSignal.on('notificationDisplay', (event) => {
            console.log('OneSignal notification displayed:', event);
          });

          window.OneSignal.on('notificationClick', (event) => {
            console.log('OneSignal notification clicked:', event);
            if (event.notification.launchURL) {
              window.open(event.notification.launchURL, '_blank');
            }
          });

        } else {
          console.warn('OneSignal SDK not loaded');
        }
      } catch (error) {
        console.error('OneSignal initialization error:', error);
        toast({
          title: 'Notification Setup Failed',
          description: 'Unable to initialize push notifications',
          variant: 'destructive'
        });
      }
    };

    initializeOneSignal();
  }, [toast]);

  const subscribeUser = async (userId: string) => {
    try {
      if (!isInitialized || !window.OneSignal) {
        throw new Error('OneSignal not initialized');
      }

      await window.OneSignal.setExternalUserId(userId);
      const newPlayerId = await window.OneSignal.getExternalUserId();
      setPlayerId(newPlayerId);

      toast({
        title: 'Notifications Enabled',
        description: 'You will now receive push notifications for important updates',
      });

      return newPlayerId;
    } catch (error) {
      console.error('OneSignal subscription error:', error);
      toast({
        title: 'Subscription Failed',
        description: 'Unable to enable push notifications',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const sendNotification = async (config: NotificationConfig, targetUserIds?: string[]) => {
    try {
      if (!isInitialized) {
        throw new Error('OneSignal not initialized');
      }

      // This would typically be done from your backend
      // For now, we'll just log the notification
      console.log('Sending notification:', config, 'to users:', targetUserIds);

      toast({
        title: 'Notification Sent',
        description: `Notification "${config.title}" has been sent`,
      });

    } catch (error) {
      console.error('Send notification error:', error);
      toast({
        title: 'Notification Failed',
        description: 'Unable to send notification',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const unsubscribeUser = async () => {
    try {
      if (!isInitialized || !window.OneSignal) {
        throw new Error('OneSignal not initialized');
      }

      await window.OneSignal.removeExternalUserId();
      setPlayerId(null);

      toast({
        title: 'Notifications Disabled',
        description: 'You will no longer receive push notifications',
      });

    } catch (error) {
      console.error('OneSignal unsubscription error:', error);
      throw error;
    }
  };

  return {
    isInitialized,
    playerId,
    subscribeUser,
    sendNotification,
    unsubscribeUser
  };
}
