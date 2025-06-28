'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, Smartphone, MessageSquare, AlertTriangle, Calendar, CreditCard, Home, Moon, Clock } from 'lucide-react';

interface NotificationSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface NotificationTypeSettings {
  enabled: boolean;
  channels: string[];
  priority: string;
}

export function NotificationSettingsDialog({ open, onOpenChange }: NotificationSettingsDialogProps) {
  const [settings, setSettings] = useState({
    // Notification Channels
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
    
    // Notification Types with Priority Levels
    rentalNotifications: {
      enabled: true,
      channels: ['push', 'in_app'],
      priority: 'medium'
    } as NotificationTypeSettings,
    generalNotifications: {
      enabled: true,
      channels: ['push', 'in_app'],
      priority: 'low'
    } as NotificationTypeSettings,
    paymentNotifications: {
      enabled: true,
      channels: ['push', 'in_app', 'email'],
      priority: 'high'
    } as NotificationTypeSettings,
    inspectionNotifications: {
      enabled: true,
      channels: ['push', 'in_app'],
      priority: 'medium'
    } as NotificationTypeSettings,
    reservationNotifications: {
      enabled: true,
      channels: ['push', 'in_app'],
      priority: 'medium'
    } as NotificationTypeSettings,
    propertyNotifications: {
      enabled: true,
      channels: ['push', 'in_app'],
      priority: 'medium'
    } as NotificationTypeSettings,
    verificationNotifications: {
      enabled: true,
      channels: ['push', 'in_app', 'email'],
      priority: 'high'
    } as NotificationTypeSettings,
    tokenizationNotifications: {
      enabled: true,
      channels: ['push', 'in_app'],
      priority: 'medium'
    } as NotificationTypeSettings,
    
    // Digest Settings
    digestEnabled: false,
    digestFrequency: 'weekly',
    digestTypes: [] as string[],
    
    // Do Not Disturb
    doNotDisturb: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00',
    
    // Global Settings
    notificationsEnabled: true
  });

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateNotificationType = (type: string, field: string, value: any) => {
    setSettings(prev => {
      const currentSettings = prev[type as keyof typeof prev] as NotificationTypeSettings;
      return {
        ...prev,
        [type]: {
          ...currentSettings,
          [field]: value
        }
      };
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const notificationTypes = [
    {
      key: 'rentalNotifications',
      title: 'Rental Notifications',
      description: 'Rental requests, approvals, and updates',
      icon: Home,
      settings: settings.rentalNotifications
    },
    {
      key: 'paymentNotifications',
      title: 'Payment Notifications',
      description: 'Payment confirmations, failures, and reminders',
      icon: CreditCard,
      settings: settings.paymentNotifications
    },
    {
      key: 'inspectionNotifications',
      title: 'Inspection Notifications',
      description: 'Inspection scheduling and results',
      icon: Calendar,
      settings: settings.inspectionNotifications
    },
    {
      key: 'reservationNotifications',
      title: 'Reservation Notifications',
      description: 'Booking confirmations and updates',
      icon: Calendar,
      settings: settings.reservationNotifications
    },
    {
      key: 'verificationNotifications',
      title: 'Verification Notifications',
      description: 'Property verification status updates',
      icon: AlertTriangle,
      settings: settings.verificationNotifications
    },
    {
      key: 'tokenizationNotifications',
      title: 'Tokenization Notifications',
      description: 'Token creation and trading updates',
      icon: Bell,
      settings: settings.tokenizationNotifications
    },
    {
      key: 'propertyNotifications',
      title: 'Property Updates',
      description: 'Property value changes and market updates',
      icon: Home,
      settings: settings.propertyNotifications
    },
    {
      key: 'generalNotifications',
      title: 'General Notifications',
      description: 'Platform updates and announcements',
      icon: Bell,
      settings: settings.generalNotifications
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell size={20} />
            Notification Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="channels" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="types">Types</TabsTrigger>
            <TabsTrigger value="digest">Digest</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="space-y-6">
            {/* Global Toggle */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Bell size={18} />
                  Global Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable All Notifications</Label>
                    <p className="text-sm text-gray-600">Master switch for all notifications</p>
                  </div>
                  <Switch
                    checked={settings.notificationsEnabled}
                    onCheckedChange={(checked) => updateSetting('notificationsEnabled', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notification Channels */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notification Channels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell size={18} />
                    <div>
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-gray-600">Receive notifications on your device</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                    disabled={!settings.notificationsEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail size={18} />
                    <div>
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => updateSetting('emailNotifications', checked)}
                    disabled={!settings.notificationsEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Smartphone size={18} />
                    <div>
                      <Label>SMS Notifications</Label>
                      <p className="text-sm text-gray-600">Receive text messages for urgent updates</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => updateSetting('smsNotifications', checked)}
                    disabled={!settings.notificationsEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare size={18} />
                    <div>
                      <Label>In-App Notifications</Label>
                      <p className="text-sm text-gray-600">Show notifications within the app</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings.inAppNotifications}
                    onCheckedChange={(checked) => updateSetting('inAppNotifications', checked)}
                    disabled={!settings.notificationsEnabled}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="types" className="space-y-4">
            {notificationTypes.map((type) => (
              <Card key={type.key}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <type.icon size={20} className="text-gray-600" />
                      <div>
                        <div className="flex items-center gap-2">
                          <Label className="text-base">{type.title}</Label>
                          <Badge className={getPriorityColor(type.settings.priority)} variant="outline">
                            {type.settings.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={type.settings.enabled}
                      onCheckedChange={(checked) => updateNotificationType(type.key, 'enabled', checked)}
                      disabled={!settings.notificationsEnabled}
                    />
                  </div>

                  {type.settings.enabled && (
                    <div className="ml-8 space-y-3">
                      <div>
                        <Label className="text-sm">Priority Level</Label>
                        <Select 
                          value={type.settings.priority} 
                          onValueChange={(value) => updateNotificationType(type.key, 'priority', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm">Delivery Channels</Label>
                        <div className="flex gap-2 mt-1">
                          {['push', 'email', 'sms', 'in_app'].map((channel) => (
                            <Badge
                              key={channel}
                              variant={type.settings.channels.includes(channel) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => {
                                const newChannels = type.settings.channels.includes(channel)
                                  ? type.settings.channels.filter((c: string) => c !== channel)
                                  : [...type.settings.channels, channel];
                                updateNotificationType(type.key, 'channels', newChannels);
                              }}
                            >
                              {channel.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="digest" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notification Digest</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable Digest</Label>
                    <p className="text-sm text-gray-600">Receive bundled notifications instead of individual ones</p>
                  </div>
                  <Switch
                    checked={settings.digestEnabled}
                    onCheckedChange={(checked) => updateSetting('digestEnabled', checked)}
                  />
                </div>

                {settings.digestEnabled && (
                  <div className="space-y-4">
                    <div>
                      <Label>Digest Frequency</Label>
                      <Select value={settings.digestFrequency} onValueChange={(value) => updateSetting('digestFrequency', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Include in Digest</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {notificationTypes.map((type) => (
                          <div key={type.key} className="flex items-center space-x-2">
                            <input
                              title={type.title}
                              type="checkbox"
                              id={`digest-${type.key}`}
                              checked={settings.digestTypes.includes(type.key)}
                              onChange={(e) => {
                                const newTypes = e.target.checked
                                  ? [...settings.digestTypes, type.key]
                                  : settings.digestTypes.filter((t: string) => t !== type.key);
                                updateSetting('digestTypes', newTypes);
                              }}
                            />
                            <Label htmlFor={`digest-${type.key}`} className="text-sm">{type.title}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Moon size={18} />
                  Do Not Disturb
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Enable Do Not Disturb</Label>
                    <p className="text-sm text-gray-600">Pause notifications during specified hours</p>
                  </div>
                  <Switch
                    checked={settings.doNotDisturb}
                    onCheckedChange={(checked) => updateSetting('doNotDisturb', checked)}
                  />
                </div>

                {settings.doNotDisturb && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Quiet Hours Start</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={16} />
                        <Select value={settings.quietHoursStart} onValueChange={(value) => updateSetting('quietHoursStart', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                {`${i.toString().padStart(2, '0')}:00`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Quiet Hours End</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock size={16} />
                        <Select value={settings.quietHoursEnd} onValueChange={(value) => updateSetting('quietHoursEnd', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 24 }, (_, i) => (
                              <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                                {`${i.toString().padStart(2, '0')}:00`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button className="flex-1">
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
