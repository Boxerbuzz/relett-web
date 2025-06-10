'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { NotificationsSkeleton } from '@/components/ui/notifications-skeleton';
import { Bell, Check, Archive, Filter, MoreVertical } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  image_url?: string;
}

const Notifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(notif => ({ ...notif, is_read: true })));
      toast({
        title: 'Success',
        description: 'All notifications marked as read',
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark all as read',
        variant: 'destructive'
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'property_updates':
        return '🏠';
      case 'investment':
        return '💰';
      case 'payment':
        return '💳';
      case 'verification_updates':
        return '✅';
      case 'chat':
        return '💬';
      default:
        return '🔔';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'property_updates':
        return 'bg-blue-100 text-blue-800';
      case 'investment':
        return 'bg-green-100 text-green-800';
      case 'payment':
        return 'bg-purple-100 text-purple-800';
      case 'verification_updates':
        return 'bg-orange-100 text-orange-800';
      case 'chat':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'read') return notif.is_read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <NotificationsSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-gray-600">
            Stay updated with your property and investment activities
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
            <Check className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </Button>
            <Button 
              variant={filter === 'unread' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </Button>
            <Button 
              variant={filter === 'read' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setFilter('read')}
            >
              Read ({notifications.length - unreadCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
            <p className="text-gray-600">
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : "You don't have any notifications yet."
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                !notification.is_read ? 'bg-blue-50 border-blue-200' : ''
              }`}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="text-2xl flex-shrink-0">
                    {notification.image_url ? (
                      <img 
                        src={notification.image_url} 
                        alt="" 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        {notification.message && (
                          <p className="text-sm text-gray-600">
                            {notification.message}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-sm text-gray-500">
                          {formatTime(notification.created_at)}
                        </span>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={getTypeColor(notification.type)} variant="outline">
                          {notification.type.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          ID: {notification.id.slice(-8)}
                        </span>
                      </div>
                      {notification.action_url && notification.action_label && (
                        <Button variant="outline" size="sm">
                          {notification.action_label}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;


// 'use client';

// import { useState } from 'react';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Switch } from '@/components/ui/switch';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Bell, CheckCircle, XCircle, Clock, Eye, Trash, Funnel } from 'phosphor-react';
// import { Settings } from 'lucide-react';
// import { NotificationSettingsDialog } from '@/components/dialogs/NotificationSettingsDialog';

// const notifications = [
//   {
//     id: 1,
//     title: 'Property Verification Approved',
//     message: 'Your property "Downtown Commercial Plot" has been successfully verified.',
//     type: 'success',
//     timestamp: '2 hours ago',
//     read: false,
//     category: 'verification'
//   },
//   {
//     id: 2,
//     title: 'New Token Purchase',
//     message: 'Someone purchased 50 tokens of your property for $1,250.',
//     type: 'info',
//     timestamp: '4 hours ago',
//     read: false,
//     category: 'transaction'
//   },
//   {
//     id: 3,
//     title: 'Document Review Required',
//     message: 'Additional documents needed for "Residential Land Parcel" verification.',
//     type: 'warning',
//     timestamp: '1 day ago',
//     read: true,
//     category: 'verification'
//   },
//   {
//     id: 4,
//     title: 'Property Tokenization Complete',
//     message: 'Your property has been successfully tokenized and is now available on the marketplace.',
//     type: 'success',
//     timestamp: '2 days ago',
//     read: true,
//     category: 'tokenization'
//   },
//   {
//     id: 5,
//     title: 'Verification Rejected',
//     message: 'Property "Agricultural Investment Land" verification was rejected. Please review feedback.',
//     type: 'error',
//     timestamp: '3 days ago',
//     read: true,
//     category: 'verification'
//   }
// ];

// type NotificationType = typeof notifications[0];

// const Notifications = () => {
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);
//   const [activeFilter, setActiveFilter] = useState('all');

//   const getNotificationIcon = (type: string) => {
//     switch (type) {
//       case 'success':
//         return <CheckCircle size={20} className="text-green-600" />;
//       case 'error':
//         return <XCircle size={20} className="text-red-600" />;
//       case 'warning':
//         return <Clock size={20} className="text-orange-600" />;
//       case 'info':
//         return <Bell size={20} className="text-blue-600" />;
//       default:
//         return <Bell size={20} className="text-gray-600" />;
//     }
//   };

//   const getNotificationBadge = (type: string) => {
//     switch (type) {
//       case 'success':
//         return 'bg-green-100 text-green-800';
//       case 'error':
//         return 'bg-red-100 text-red-800';
//       case 'warning':
//         return 'bg-orange-100 text-orange-800';
//       case 'info':
//         return 'bg-blue-100 text-blue-800';
//       default:
//         return 'bg-gray-100 text-gray-800';
//     }
//   };

//   const filterNotifications = (notificationsList: NotificationType[], filter: string) => {
//     switch (filter) {
//       case 'unread':
//         return notificationsList.filter(n => !n.read);
//       case 'verification':
//         return notificationsList.filter(n => n.category === 'verification');
//       case 'transaction':
//         return notificationsList.filter(n => n.category === 'transaction');
//       case 'tokenization':
//         return notificationsList.filter(n => n.category === 'tokenization');
//       default:
//         return notificationsList;
//     }
//   };

//   const unreadCount = notifications.filter(n => !n.read).length;
//   const filteredNotifications = filterNotifications(notifications, activeFilter);

//   const getFilterLabel = (filter: string) => {
//     switch (filter) {
//       case 'all': return 'All Notifications';
//       case 'unread': return `Unread (${unreadCount})`;
//       case 'verification': return 'Verification';
//       case 'transaction': return 'Transactions';
//       case 'tokenization': return 'Tokenization';
//       default: return 'All Notifications';
//     }
//   };

//   return (
//     <div className="min-h-0 flex flex-col max-w-full overflow-hidden">
//       {/* Header */}
//       <div className="flex-shrink-0 space-y-4 mb-6">
//         <div className="min-w-0">
//           <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center flex-wrap gap-2">
//             <Bell size={32} className="flex-shrink-0" />
//             <span className="break-words">Notifications</span>
//             {unreadCount > 0 && (
//               <Badge className="bg-red-100 text-red-800 flex-shrink-0">
//                 {unreadCount} new
//               </Badge>
//             )}
//           </h1>
//           <p className="text-gray-600 break-words">Stay updated with your property activities</p>
//         </div>
//         <div className="flex flex-col sm:flex-row gap-2">
//           <Button variant="outline" size="sm" className="flex-shrink-0">
//             Mark All as Read
//           </Button>
//           <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)} className="flex-shrink-0">
//             <Settings size={16} className="mr-2" />
//             Settings
//           </Button>
//         </div>
//       </div>

//       {/* Notification Settings */}
//       <Card className="flex-shrink-0 w-full mb-6">
//         <CardHeader>
//           <CardTitle className="text-lg">Notification Preferences</CardTitle>
//           <CardDescription className="break-words">
//             Manage how you receive notifications.{' '}
//             <Button 
//               variant="link" 
//               className="p-0 ml-1 text-blue-600 inline"
//               onClick={() => setIsSettingsOpen(true)}
//             >
//               Advanced settings
//             </Button>
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             <div className="flex flex-col gap-2 p-3 border rounded-lg">
//               <div className="flex items-center justify-between gap-2">
//                 <div className="min-w-0 flex-1">
//                   <p className="font-medium text-sm">Email Notifications</p>
//                   <p className="text-xs text-gray-600">Receive via email</p>
//                 </div>
//                 <Switch defaultChecked className="flex-shrink-0" />
//               </div>
//             </div>
            
//             <div className="flex flex-col gap-2 p-3 border rounded-lg">
//               <div className="flex items-center justify-between gap-2">
//                 <div className="min-w-0 flex-1">
//                   <p className="font-medium text-sm">Push Notifications</p>
//                   <p className="text-xs text-gray-600">Browser notifications</p>
//                 </div>
//                 <Switch defaultChecked className="flex-shrink-0" />
//               </div>
//             </div>
            
//             <div className="flex flex-col gap-2 p-3 border rounded-lg">
//               <div className="flex items-center justify-between gap-2">
//                 <div className="min-w-0 flex-1">
//                   <p className="font-medium text-sm">Transaction Alerts</p>
//                   <p className="text-xs text-gray-600">Token purchases</p>
//                 </div>
//                 <Switch defaultChecked className="flex-shrink-0" />
//               </div>
//             </div>
            
//             <div className="flex flex-col gap-2 p-3 border rounded-lg">
//               <div className="flex items-center justify-between gap-2">
//                 <div className="min-w-0 flex-1">
//                   <p className="font-medium text-sm">Verification Updates</p>
//                   <p className="text-xs text-gray-600">Property status changes</p>
//                 </div>
//                 <Switch defaultChecked className="flex-shrink-0" />
//               </div>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       {/* Filter Dropdown */}
//       <div className="flex-shrink-0 flex items-center gap-2 mb-4">
//         <Funnel size={20} className="text-gray-600" />
//         <Select value={activeFilter} onValueChange={setActiveFilter}>
//           <SelectTrigger className="w-64">
//             <SelectValue placeholder="Filter notifications" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Notifications</SelectItem>
//             <SelectItem value="unread">Unread ({unreadCount})</SelectItem>
//             <SelectItem value="verification">Verification</SelectItem>
//             <SelectItem value="transaction">Transactions</SelectItem>
//             <SelectItem value="tokenization">Tokenization</SelectItem>
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Notifications List */}
//       <div className="flex-1 min-h-0 space-y-4 overflow-y-auto">
//         {filteredNotifications.map((notification) => (
//           <Card key={notification.id} className={`hover:shadow-md transition-shadow w-full ${!notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}>
//             <CardContent className="p-4">
//               <div className="flex items-start gap-3">
//                 <div className="flex-shrink-0 mt-1">
//                   {getNotificationIcon(notification.type)}
//                 </div>
                
//                 <div className="flex-1 min-w-0">
//                   <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
//                     <h4 className="font-medium text-gray-900 break-words">{notification.title}</h4>
//                     <div className="flex items-center gap-2 flex-shrink-0">
//                       {!notification.read && (
//                         <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
//                       )}
//                       <span className="text-xs text-gray-500 whitespace-nowrap">{notification.timestamp}</span>
//                     </div>
//                   </div>
                  
//                   <p className="text-sm text-gray-600 mb-3 break-words">{notification.message}</p>
                  
//                   <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
//                     <Badge className={`${getNotificationBadge(notification.type)} w-fit`} variant="outline">
//                       {notification.category}
//                     </Badge>
                    
//                     <div className="flex flex-wrap gap-2">
//                       {!notification.read && (
//                         <Button variant="ghost" size="sm" className="text-xs">
//                           <Eye size={14} className="mr-1" />
//                           Mark as Read
//                         </Button>
//                       )}
//                       <Button variant="ghost" size="sm" className="text-xs">
//                         <Trash size={14} className="mr-1" />
//                         Delete
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {/* Notification Settings Dialog */}
//       <NotificationSettingsDialog 
//         open={isSettingsOpen}
//         onOpenChange={setIsSettingsOpen}
//       />
//     </div>
//   );
// };

// export default Notifications;
