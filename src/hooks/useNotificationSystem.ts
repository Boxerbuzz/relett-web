import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

interface NotificationPreferences {
  trading: boolean;
  governance: boolean;
  portfolio: boolean;
  security: boolean;
  marketing: boolean;
}

interface PushNotification {
  id: string;
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  timestamp: number;
}

export function useNotificationSystem() {
  const { user } = useAuth();
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    trading: true,
    governance: true,
    portfolio: true,
    security: true,
    marketing: false
  });

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        toast({
          title: "Notifications enabled",
          description: "You'll receive important updates about your investments."
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const showNotification = useCallback(async (notification: Omit<PushNotification, 'id' | 'timestamp'>) => {
    if (permission !== 'granted') return;

    const notificationData: PushNotification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    };

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(notification.title, {
          body: notification.body,
          icon: notification.icon || '/favicon.ico',
          badge: notification.badge || '/favicon.ico',
          data: notificationData.data,
          tag: notificationData.id,
          requireInteraction: true,
        });
      } else {
        new Notification(notification.title, {
          body: notification.body,
          icon: notification.icon || '/favicon.ico',
          data: notificationData.data
        });
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }, [permission]);

  const updatePreferences = useCallback(async (newPreferences: Partial<NotificationPreferences>) => {
    const updated = { ...preferences, ...newPreferences };
    setPreferences(updated);

    if (user) {
      try {
        // Store preferences in localStorage since users table doesn't have this field
        localStorage.setItem(`notification_preferences_${user.id}`, JSON.stringify(updated));
      } catch (error) {
        console.error('Error updating notification preferences:', error);
      }
    }
  }, [preferences, user]);

  // Set up real-time notification listeners
  useEffect(() => {
    if (!user || permission !== 'granted') return;

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const notification = payload.new;
          
          // Check preferences before showing
          const shouldShow = 
            (notification.type === 'trading' && preferences.trading) ||
            (notification.type === 'governance' && preferences.governance) ||
            (notification.type === 'portfolio' && preferences.portfolio) ||
            (notification.type === 'security' && preferences.security) ||
            (notification.type === 'marketing' && preferences.marketing);

          if (shouldShow) {
            showNotification({
              title: notification.title,
              body: notification.message,
              data: {
                type: notification.type,
                action_url: notification.action_url,
                metadata: notification.metadata
              }
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, permission, preferences, showNotification]);

  return {
    isSupported,
    permission,
    preferences,
    requestPermission,
    showNotification,
    updatePreferences
  };
}