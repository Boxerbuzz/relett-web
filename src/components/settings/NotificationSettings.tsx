import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";
import { Input } from "../ui/input";

export function NotificationSettings() {
  const [loading, setLoading] = useState(false);
  const {
    preferences,
    updatePreferences,
    isLoading: preferencesLoading,
  } = useNotificationPreferences();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Manage how you receive notifications and updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Delivery Methods */}
        <div>
          <h4 className="font-medium mb-4">Delivery Methods</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="email" className="text-sm">
                Email notifications
              </Label>
              <Switch
                id="email"
                checked={preferences.email_notifications}
                onCheckedChange={(checked) =>
                  updatePreferences({ email_notifications: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="push" className="text-sm">
                Push notifications
              </Label>
              <Switch
                id="push"
                checked={preferences.push_notifications}
                onCheckedChange={(checked) =>
                  updatePreferences({ push_notifications: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms" className="text-sm">
                SMS notifications
              </Label>
              <Switch
                id="sms"
                checked={preferences.sms_notifications}
                onCheckedChange={(checked) =>
                  updatePreferences({ sms_notifications: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dnd" className="text-sm">
                Do not disturb
              </Label>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quiet-start" className="text-sm">
                Start time
              </Label>
              <Input
                id="quiet-start"
                type="time"
                value={preferences.quiet_hours_start || "22:00"}
                onChange={(e) =>
                  updatePreferences({ quiet_hours_start: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="quiet-end" className="text-sm">
                End time
              </Label>
              <Input
                id="quiet-end"
                type="time"
                value={preferences.quiet_hours_end || "07:00"}
                onChange={(e) =>
                  updatePreferences({ quiet_hours_end: e.target.value })
                }
                className="mt-1"
              />
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div>
          <h4 className="font-medium mb-4">Notification Types</h4>
          <div className="space-y-4">
            {Object.entries(preferences?.notification_types).map(
              ([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={key} className="text-sm">
                    {key
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Label>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) =>
                      updatePreferences({
                        notification_types: {
                          ...preferences.notification_types,
                          [key]: checked,
                        },
                      })
                    }
                  />
                </div>
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
