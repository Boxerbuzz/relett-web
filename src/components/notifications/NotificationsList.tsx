
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  Bell, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Home, 
  MessageSquare,
  Shield,
  DollarSign,
  Loader2
} from 'lucide-react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  action_label?: string;
  metadata: any;
}

export function NotificationsList() {
  const { notifications, loading, markAsRead } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'verification_updates':
        return <Shield className="h-5 w-5 text-blue-600" />;
      case 'investment':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'property_updates':
        return <Home className="h-5 w-5 text-purple-600" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-orange-600" />;
      case 'chat':
        return <MessageSquare className="h-5 w-5 text-indigo-600" />;
      default:
        return <Bell className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'verification_updates':
        return 'bg-blue-100 text-blue-800';
      case 'investment':
        return 'bg-green-100 text-green-800';
      case 'property_updates':
        return 'bg-purple-100 text-purple-800';
      case 'payment':
        return 'bg-orange-100 text-orange-800';
      case 'chat':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading notifications...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
        <CardDescription>
          Stay updated with your property investments and activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="mx-auto h-12 w-12 mb-4 text-gray-300" />
              <p>No notifications yet</p>
              <p className="text-sm">We'll notify you about important updates</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-4 border rounded-lg transition-all ${
                  notification.is_read 
                    ? 'bg-white border-gray-200' 
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {getNotificationIcon(notification.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {notification.title}
                        </h4>
                        {notification.message && (
                          <p className="text-sm text-gray-600 mb-2">
                            {notification.message}
                          </p>
                        )}
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(notification.type)}>
                            {notification.type.replace(/_/g, ' ')}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs"
                          >
                            <CheckCircle className="h-3 w-3" />
                            Mark Read
                          </Button>
                        )}
                        {notification.action_url && notification.action_label && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (notification.action_url) {
                                window.location.href = notification.action_url;
                              }
                            }}
                            className="text-xs"
                          >
                            {notification.action_label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
