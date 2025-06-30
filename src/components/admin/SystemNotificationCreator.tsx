
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SpeakerphoneIcon } from '@phosphor-icons/react';

export function SystemNotificationCreator() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    notification_type: 'info' as 'info' | 'warning' | 'error' | 'success',
    severity: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    target_audience: 'all' as 'all' | 'verified' | 'admin' | 'custom',
    action_required: false,
    action_url: '',
    action_label: '',
    is_dismissible: true,
    auto_dismiss_after: '',
    display_from: new Date().toISOString().slice(0, 16),
    display_until: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const notificationData = {
        created_by: user.id,
        title: formData.title,
        message: formData.message,
        notification_type: formData.notification_type,
        severity: formData.severity,
        target_audience: formData.target_audience,
        target_users: null, // For now, we'll handle custom targeting later
        action_required: formData.action_required,
        action_url: formData.action_url || null,
        action_label: formData.action_label || null,
        is_dismissible: formData.is_dismissible,
        auto_dismiss_after: formData.auto_dismiss_after ? parseInt(formData.auto_dismiss_after) : null,
        display_from: formData.display_from,
        display_until: formData.display_until || null,
        is_active: true,
        expires_at: formData.display_until || null,
      };

      const { error } = await supabase
        .from('system_notifications')
        .insert(notificationData);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'System notification created successfully',
      });

      // Reset form
      setFormData({
        title: '',
        message: '',
        notification_type: 'info',
        severity: 'medium',
        target_audience: 'all',
        action_required: false,
        action_url: '',
        action_label: '',
        is_dismissible: true,
        auto_dismiss_after: '',
        display_from: new Date().toISOString().slice(0, 16),
        display_until: '',
      });
    } catch (err) {
      console.error('Error creating notification:', err);
      toast({
        title: 'Error',
        description: 'Failed to create system notification',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SpeakerphoneIcon className="h-5 w-5" />
          Create System Notification
        </CardTitle>
        <CardDescription>
          Broadcast important messages to users across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Notification title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notification_type">Type</Label>
              <Select 
                value={formData.notification_type} 
                onValueChange={(value: 'info' | 'warning' | 'error' | 'success') => 
                  setFormData({ ...formData, notification_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Notification message"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select 
                value={formData.severity} 
                onValueChange={(value: 'low' | 'medium' | 'high' | 'critical') => 
                  setFormData({ ...formData, severity: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target_audience">Target Audience</Label>
              <Select 
                value={formData.target_audience} 
                onValueChange={(value: 'all' | 'verified' | 'admin' | 'custom') => 
                  setFormData({ ...formData, target_audience: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="verified">Verified Users</SelectItem>
                  <SelectItem value="admin">Admins Only</SelectItem>
                  <SelectItem value="custom">Custom List</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="action_url">Action URL (Optional)</Label>
              <Input
                id="action_url"
                value={formData.action_url}
                onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
                placeholder="https://example.com"
                type="url"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="action_label">Action Label (Optional)</Label>
              <Input
                id="action_label"
                value={formData.action_label}
                onChange={(e) => setFormData({ ...formData, action_label: e.target.value })}
                placeholder="Learn More"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_from">Display From</Label>
              <Input
                id="display_from"
                type="datetime-local"
                value={formData.display_from}
                onChange={(e) => setFormData({ ...formData, display_from: e.target.value })}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="display_until">Display Until (Optional)</Label>
              <Input
                id="display_until"
                type="datetime-local"
                value={formData.display_until}
                onChange={(e) => setFormData({ ...formData, display_until: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Action Required</Label>
                <p className="text-sm text-gray-500">Users must take action on this notification</p>
              </div>
              <Switch
                checked={formData.action_required}
                onCheckedChange={(checked) => setFormData({ ...formData, action_required: checked })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dismissible</Label>
                <p className="text-sm text-gray-500">Users can dismiss this notification</p>
              </div>
              <Switch
                checked={formData.is_dismissible}
                onCheckedChange={(checked) => setFormData({ ...formData, is_dismissible: checked })}
              />
            </div>
          </div>

          {formData.is_dismissible && (
            <div className="space-y-2">
              <Label htmlFor="auto_dismiss_after">Auto Dismiss After (minutes, optional)</Label>
              <Input
                id="auto_dismiss_after"
                type="number"
                value={formData.auto_dismiss_after}
                onChange={(e) => setFormData({ ...formData, auto_dismiss_after: e.target.value })}
                placeholder="60"
                min="1"
              />
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Notification'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
