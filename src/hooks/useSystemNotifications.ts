
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export interface SystemNotification {
  id: string;
  created_by: string;
  title: string;
  message: string;
  notification_type: 'info' | 'warning' | 'error' | 'success';
  severity: 'low' | 'medium' | 'high' | 'critical';
  target_audience: 'all' | 'verified' | 'admin' | 'custom';
  target_users: string[] | null;
  action_required: boolean;
  action_url: string | null;
  action_label: string | null;
  is_dismissible: boolean;
  auto_dismiss_after: number | null;
  display_from: string;
  display_until: string | null;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

export function useSystemNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissedNotifications, setDismissedNotifications] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      fetchSystemNotifications();
      subscribeToNotifications();
    }
  }, [user]);

  const fetchSystemNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('system_notifications')
        .select('*')
        .eq('is_active', true)
        .or('display_until.is.null,display_until.gt.' + new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filter notifications based on target audience and properly type them
      const filteredNotifications = (data || []).filter(notification => {
        if (notification.target_audience === 'all') return true;
        if (notification.target_audience === 'custom' && notification.target_users) {
          return notification.target_users.includes(user?.id || '');
        }
        // Add more audience filtering logic here based on user roles
        return true;
      }).map(notification => ({
        ...notification,
        notification_type: notification.notification_type as 'info' | 'warning' | 'error' | 'success',
        severity: notification.severity as 'low' | 'medium' | 'high' | 'critical',
        target_audience: notification.target_audience as 'all' | 'verified' | 'admin' | 'custom',
      }));

      setNotifications(filteredNotifications);
    } catch (err) {
      console.error('Error fetching system notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel('system-notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'system_notifications' 
        }, 
        (payload) => {
          const newNotification = payload.new as any;
          if (newNotification.is_active) {
            const typedNotification: SystemNotification = {
              ...newNotification,
              notification_type: newNotification.notification_type as 'info' | 'warning' | 'error' | 'success',
              severity: newNotification.severity as 'low' | 'medium' | 'high' | 'critical',
              target_audience: newNotification.target_audience as 'all' | 'verified' | 'admin' | 'custom',
            };
            
            setNotifications(prev => [typedNotification, ...prev]);
            
            // Show toast for high/critical notifications
            if (typedNotification.severity === 'high' || typedNotification.severity === 'critical') {
              toast({
                title: typedNotification.title,
                description: typedNotification.message,
                variant: typedNotification.notification_type === 'error' ? 'destructive' : 'default',
              });
            }
          }
        })
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'system_notifications' 
        }, 
        (payload) => {
          const updatedNotification = payload.new as any;
          const typedNotification: SystemNotification = {
            ...updatedNotification,
            notification_type: updatedNotification.notification_type as 'info' | 'warning' | 'error' | 'success',
            severity: updatedNotification.severity as 'low' | 'medium' | 'high' | 'critical',
            target_audience: updatedNotification.target_audience as 'all' | 'verified' | 'admin' | 'custom',
          };
          
          setNotifications(prev => 
            prev.map(n => n.id === typedNotification.id ? typedNotification : n)
          );
        })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const dismissNotification = (notificationId: string) => {
    setDismissedNotifications(prev => [...prev, notificationId]);
  };

  const getVisibleNotifications = () => {
    return notifications.filter(notification => 
      !dismissedNotifications.includes(notification.id) &&
      new Date(notification.display_from) <= new Date() &&
      (!notification.display_until || new Date(notification.display_until) > new Date())
    );
  };

  return {
    notifications: getVisibleNotifications(),
    loading,
    dismissNotification,
    refetch: fetchSystemNotifications,
  };
}
