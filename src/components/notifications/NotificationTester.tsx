
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotificationDelivery } from '@/hooks/useNotificationDelivery';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function NotificationTester() {
  const [formData, setFormData] = useState({
    type: 'general',
    title: '',
    message: '',
    actionUrl: '',
    actionLabel: ''
  });
  const { sendNotification, isLoading } = useNotificationDelivery();
  const { toast } = useToast();

  const handleSendTestNotification = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to send test notifications',
          variant: 'destructive'
        });
        return;
      }

      if (!formData.title || !formData.message) {
        toast({
          title: 'Missing fields',
          description: 'Title and message are required',
          variant: 'destructive'
        });
        return;
      }

      await sendNotification(
        user.id,
        formData.type,
        formData.title,
        formData.message,
        { test: true },
        formData.actionUrl || undefined,
        formData.actionLabel || undefined
      );

      // Reset form
      setFormData({
        type: 'general',
        title: '',
        message: '',
        actionUrl: '',
        actionLabel: ''
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Notifications</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="payment">Payment</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="rental">Rental</SelectItem>
                <SelectItem value="reservation">Reservation</SelectItem>
                <SelectItem value="inspection">Inspection</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Notification title"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="message">Message</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            placeholder="Notification message"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="actionUrl">Action URL (optional)</Label>
            <Input
              id="actionUrl"
              value={formData.actionUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, actionUrl: e.target.value }))}
              placeholder="/some-page"
            />
          </div>
          <div>
            <Label htmlFor="actionLabel">Action Label (optional)</Label>
            <Input
              id="actionLabel"
              value={formData.actionLabel}
              onChange={(e) => setFormData(prev => ({ ...prev, actionLabel: e.target.value }))}
              placeholder="View Details"
            />
          </div>
        </div>

        <Button 
          onClick={handleSendTestNotification} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Sending...' : 'Send Test Notification'}
        </Button>
      </CardContent>
    </Card>
  );
}
