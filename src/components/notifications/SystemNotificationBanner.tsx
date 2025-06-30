
import { useState } from 'react';
import { useSystemNotifications } from '@/hooks/useSystemNotifications';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Info,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SystemNotificationBanner() {
  const { notifications, dismissNotification } = useSystemNotifications();
  const [collapsed, setCollapsed] = useState(false);

  if (notifications.length === 0) return null;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationStyle = (type: string, severity: string) => {
    const baseClasses = "border-l-4 p-4 mb-2 rounded-r-lg";
    
    if (severity === 'critical') {
      return cn(baseClasses, "bg-red-50 border-red-500 text-red-900");
    }
    
    switch (type) {
      case 'success':
        return cn(baseClasses, "bg-green-50 border-green-500 text-green-900");
      case 'warning':
        return cn(baseClasses, "bg-yellow-50 border-yellow-500 text-yellow-900");
      case 'error':
        return cn(baseClasses, "bg-red-50 border-red-500 text-red-900");
      default:
        return cn(baseClasses, "bg-blue-50 border-blue-500 text-blue-900");
    }
  };

  const getSeverityBadge = (severity: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={cn('text-xs', colors[severity as keyof typeof colors])}>
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const highPriorityNotifications = notifications.filter(n => 
    n.severity === 'high' || n.severity === 'critical'
  );
  
  const regularNotifications = notifications.filter(n => 
    n.severity !== 'high' && n.severity !== 'critical'
  );

  return (
    <div className="fixed top-16 left-0 right-0 z-40 max-w-4xl mx-auto px-4">
      {/* High Priority Notifications - Always Visible */}
      {highPriorityNotifications.map((notification) => (
        <div
          key={notification.id}
          className={getNotificationStyle(notification.notification_type, notification.severity)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              {getNotificationIcon(notification.notification_type)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm">{notification.title}</h4>
                  {getSeverityBadge(notification.severity)}
                </div>
                <p className="text-sm">{notification.message}</p>
                {notification.action_url && notification.action_label && (
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 h-auto mt-2 text-inherit"
                    onClick={() => window.open(notification.action_url!, '_blank')}
                  >
                    {notification.action_label}
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
            </div>
            {notification.is_dismissible && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-1 text-inherit hover:bg-transparent hover:text-gray-600"
                onClick={() => dismissNotification(notification.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}

      {/* Regular Notifications - Collapsible */}
      {regularNotifications.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div 
            className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
            onClick={() => setCollapsed(!collapsed)}
          >
            <div className="flex items-center gap-2">
              <Info className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">
                {regularNotifications.length} System Notification{regularNotifications.length > 1 ? 's' : ''}
              </span>
            </div>
            <ChevronRight 
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed ? "rotate-90" : "rotate-0"
              )} 
            />
          </div>
          
          {!collapsed && (
            <div className="border-t border-gray-200 p-3 space-y-3">
              {regularNotifications.map((notification) => (
                <div key={notification.id} className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.notification_type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-sm">{notification.title}</h5>
                        {getSeverityBadge(notification.severity)}
                      </div>
                      <p className="text-sm text-gray-600">{notification.message}</p>
                      {notification.action_url && notification.action_label && (
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto mt-1"
                          onClick={() => window.open(notification.action_url!, '_blank')}
                        >
                          {notification.action_label}
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {notification.is_dismissible && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-1"
                      onClick={() => dismissNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
