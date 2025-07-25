
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, XCircle, Clock, Mail, MessageSquare, Bell } from 'lucide-react';
import { useNotificationDelivery } from '@/hooks/useNotificationDelivery';

interface NotificationDeliveryStatusProps {
  notificationId: string;
}

export function NotificationDeliveryStatus({ notificationId }: NotificationDeliveryStatusProps) {
  const { getDeliveryStatus, retryFailedDelivery, deliveryStatuses, isLoading } = useNotificationDelivery();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (notificationId) {
      getDeliveryStatus(notificationId);
    }
  }, [notificationId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await getDeliveryStatus(notificationId);
    setIsRefreshing(false);
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'sms':
        return <MessageSquare className="h-4 w-4" />;
      case 'push':
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (deliveryStatuses.length === 0 && !isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-500 text-center">No delivery status available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Delivery Status</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {deliveryStatuses.map((delivery) => (
          <div key={delivery.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              {getChannelIcon(delivery.channel)}
              <div>
                <p className="font-medium text-sm capitalize">{delivery.channel}</p>
                {delivery.delivered_at && (
                  <p className="text-xs text-gray-500">
                    {new Date(delivery.delivered_at).toLocaleString()}
                  </p>
                )}
                {delivery.error_message && (
                  <p className="text-xs text-red-600">{delivery.error_message}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(delivery.status)} variant="outline">
                <div className="flex items-center gap-1">
                  {getStatusIcon(delivery.status)}
                  {delivery.status}
                </div>
              </Badge>
              {delivery.status === 'failed' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => retryFailedDelivery(delivery.id)}
                >
                  Retry
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
