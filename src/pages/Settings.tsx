import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BellIcon,
  ShieldCheckIcon,
  GearIcon,
  CreditCardIcon,
  GlobeIcon,
} from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useNotificationPreferences } from "@/hooks/useNotificationPreferences";

const Settings = () => {
  const {
    preferences,
    updatePreferences,
    isLoading: preferencesLoading,
  } = useNotificationPreferences();

  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Account Settings & Preferences
        </h1>
        <p className="text-gray-600">
          Manage your account preferences, and security settings
        </p>
      </div>

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="security" className="flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <BellIcon className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <GearIcon className="h-4 w-4" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCardIcon className="h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-6 w-full max-w-full">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and authentication methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </div>

              <Button>Update Password</Button>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Login Alerts</Label>
                    <p className="text-sm text-gray-500">
                      Get notified when someone logs into your account
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
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
              {preferences.do_not_disturb && (
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
                          updatePreferences({
                            quiet_hours_start: e.target.value,
                          })
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
              )}

              {/* Notification Types */}
              <div>
                <h4 className="font-medium mb-4">Notification Types</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(preferences.notification_types).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
                      >
                        <Label htmlFor={key} className="text-sm font-medium">
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
        </TabsContent>

        <TabsContent
          value="preferences"
          className="space-y-6 w-full max-w-full"
        >
          <Card>
            <CardHeader>
              <CardTitle>App Preferences</CardTitle>
              <CardDescription>
                Customize your app experience and interface
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Dark Mode</Label>
                    <p className="text-sm text-gray-500">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Language</Label>
                    <p className="text-sm text-gray-500">
                      Choose your preferred language
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <GlobeIcon size={16} className="mr-2" />
                    English
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Currency</Label>
                    <p className="text-sm text-gray-500">
                      Display prices in your preferred currency
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    USD
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6 w-full max-w-full">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>
                Manage your payment methods and billing details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Payment Methods</h3>
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-5 bg-blue-600 rounded"></div>
                      <div>
                        <p className="font-medium">**** **** **** 4242</p>
                        <p className="text-sm text-gray-500">Expires 12/24</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
                <Button variant="outline">
                  <CreditCardIcon size={16} className="mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
