'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Bell, Check, Settings, Mail, MessageSquare, DollarSign, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { NotificationDeliveryStatus } from '@/components/notifications/NotificationDeliveryStatus';
import { NotificationTester } from '@/components/notifications/NotificationTester';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  metadata: any;
  action_url?: string;
  action_label?: string;
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showTester, setShowTester] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState<string>('');
  const { toast } = useToast();
  const { preferences, updatePreferences, isLoading: preferencesLoading } = useNotificationPreferences();

  useEffect(() => {
    fetchNotifications();
    setupRealtimeSubscription();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

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
          setNotifications(prev => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );

      toast({
        title: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      case 'chat':
        return <MessageSquare className="h-4 w-4" />;
      case 'general':
        return <Check className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (isLoading || preferencesLoading) {
    return <LoadingSpinner size="lg" text="Loading notifications..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-muted-foreground">{unreadCount} unread notifications</p>
          )}
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" onClick={markAllAsRead}>
              Mark All Read
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setShowTester(!showTester)}
          >
            <TestTube className="h-4 w-4 mr-2" />
            Test
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Test Panel */}
      {showTester && <NotificationTester />}

      {/* Settings Panel */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Choose how you want to receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Delivery Methods */}
            <div>
              <h4 className="font-medium mb-4">Delivery Methods</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email">Email notifications</Label>
                  <Switch
                    id="email"
                    checked={preferences.email_notifications}
                    onCheckedChange={(checked) => 
                      updatePreferences({ email_notifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push">Push notifications</Label>
                  <Switch
                    id="push"
                    checked={preferences.push_notifications}
                    onCheckedChange={(checked) => 
                      updatePreferences({ push_notifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms">SMS notifications</Label>
                  <Switch
                    id="sms"
                    checked={preferences.sms_notifications}
                    onCheckedChange={(checked) => 
                      updatePreferences({ sms_notifications: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="dnd">Do not disturb</Label>
                  <Switch
                    id="dnd"
                    checked={preferences.do_not_disturb}
                    onCheckedChange={(checked) => 
                      updatePreferences({ do_not_disturb: checked })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Quiet Hours */}
            <div>
              <h4 className="font-medium mb-4">Quiet Hours</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quiet-start">Start time</Label>
                  <Input
                    id="quiet-start"
                    type="time"
                    value={preferences.quiet_hours_start || '22:00'}
                    onChange={(e) => 
                      updatePreferences({ quiet_hours_start: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="quiet-end">End time</Label>
                  <Input
                    id="quiet-end"
                    type="time"
                    value={preferences.quiet_hours_end || '07:00'}
                    onChange={(e) => 
                      updatePreferences({ quiet_hours_end: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Notification Types */}
            <div>
              <h4 className="font-medium mb-4">Notification Types</h4>
              <div className="space-y-4">
                {Object.entries(preferences.notification_types).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <Label htmlFor={key}>
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Label>
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => 
                        updatePreferences({
                          notification_types: {
                            ...preferences.notification_types,
                            [key]: checked
                          }
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delivery Status for selected notification */}
      {selectedNotificationId && (
        <NotificationDeliveryStatus notificationId={selectedNotificationId} />
      )}

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <Bell className="mx-auto h-12 w-12 mb-4" />
                <p>No notifications yet. We'll notify you about important updates!</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`${!notification.is_read ? 'border-blue-200 bg-blue-50/50' : ''}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-medium">{notification.title}</h4>
                        {notification.message && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.is_read && (
                          <Badge variant="secondary">New</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedNotificationId(
                            selectedNotificationId === notification.id ? '' : notification.id
                          )}
                        >
                          Status
                        </Button>
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {notification.action_url && notification.action_label && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => window.location.href = notification.action_url!}
                      >
                        {notification.action_label}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
