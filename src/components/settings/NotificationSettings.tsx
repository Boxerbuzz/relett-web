
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_types: {
    property_updates: boolean;
    investment_opportunities: boolean;
    dividend_alerts: boolean;
    verification_updates: boolean;
    system_announcements: boolean;
  };
}

export function NotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    notification_types: {
      property_updates: true,
      investment_opportunities: true,
      dividend_alerts: true,
      verification_updates: true,
      system_announcements: true,
    }
  });

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPreferences({
          email_notifications: data.email_notifications,
          push_notifications: data.push_notifications,
          sms_notifications: data.sms_notifications,
          notification_types: data.notification_types
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...preferences
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Notification preferences updated successfully'
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update notification preferences',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Manage how you receive notifications and updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium">Delivery Methods</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="email">Email Notifications</Label>
              <Switch
                id="email"
                checked={preferences.email_notifications}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, email_notifications: checked})
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push">Push Notifications</Label>
              <Switch
                id="push"
                checked={preferences.push_notifications}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, push_notifications: checked})
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms">SMS Notifications</Label>
              <Switch
                id="sms"
                checked={preferences.sms_notifications}
                onCheckedChange={(checked) => 
                  setPreferences({...preferences, sms_notifications: checked})
                }
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Notification Types</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="property">Property Updates</Label>
              <Switch
                id="property"
                checked={preferences.notification_types.property_updates}
                onCheckedChange={(checked) => 
                  setPreferences({
                    ...preferences, 
                    notification_types: {
                      ...preferences.notification_types,
                      property_updates: checked
                    }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="investment">Investment Opportunities</Label>
              <Switch
                id="investment"
                checked={preferences.notification_types.investment_opportunities}
                onCheckedChange={(checked) => 
                  setPreferences({
                    ...preferences, 
                    notification_types: {
                      ...preferences.notification_types,
                      investment_opportunities: checked
                    }
                  })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dividends">Dividend Alerts</Label>
              <Switch
                id="dividends"
                checked={preferences.notification_types.dividend_alerts}
                onCheckedChange={(checked) => 
                  setPreferences({
                    ...preferences, 
                    notification_types: {
                      ...preferences.notification_types,
                      dividend_alerts: checked
                    }
                  })
                }
              />
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Preferences'}
        </Button>
      </CardContent>
    </Card>
  );
}
