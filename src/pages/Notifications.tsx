
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Bell, CheckCircle, XCircle, Clock, Eye, Trash } from 'phosphor-react';
import { Settings } from 'lucide-react';
import { NotificationSettingsDialog } from '@/components/dialogs/NotificationSettingsDialog';

const notifications = [
  {
    id: 1,
    title: 'Property Verification Approved',
    message: 'Your property "Downtown Commercial Plot" has been successfully verified.',
    type: 'success',
    timestamp: '2 hours ago',
    read: false,
    category: 'verification'
  },
  {
    id: 2,
    title: 'New Token Purchase',
    message: 'Someone purchased 50 tokens of your property for $1,250.',
    type: 'info',
    timestamp: '4 hours ago',
    read: false,
    category: 'transaction'
  },
  {
    id: 3,
    title: 'Document Review Required',
    message: 'Additional documents needed for "Residential Land Parcel" verification.',
    type: 'warning',
    timestamp: '1 day ago',
    read: true,
    category: 'verification'
  },
  {
    id: 4,
    title: 'Property Tokenization Complete',
    message: 'Your property has been successfully tokenized and is now available on the marketplace.',
    type: 'success',
    timestamp: '2 days ago',
    read: true,
    category: 'tokenization'
  },
  {
    id: 5,
    title: 'Verification Rejected',
    message: 'Property "Agricultural Investment Land" verification was rejected. Please review feedback.',
    type: 'error',
    timestamp: '3 days ago',
    read: true,
    category: 'verification'
  }
];

const Notifications = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'error':
        return <XCircle size={20} className="text-red-600" />;
      case 'warning':
        return <Clock size={20} className="text-orange-600" />;
      case 'info':
        return <Bell size={20} className="text-blue-600" />;
      default:
        return <Bell size={20} className="text-gray-600" />;
    }
  };

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-orange-100 text-orange-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center flex-wrap gap-2">
            <Bell size={32} className="flex-shrink-0" />
            <span className="break-words">Notifications</span>
            {unreadCount > 0 && (
              <Badge className="bg-red-100 text-red-800 flex-shrink-0">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-gray-600 break-words">Stay updated with your property activities</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" className="flex-shrink-0">
            Mark All as Read
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)} className="flex-shrink-0">
            <Settings size={16} className="mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Notification Settings */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Notification Preferences</CardTitle>
          <CardDescription className="break-words">
            Manage how you receive notifications.{' '}
            <Button 
              variant="link" 
              className="p-0 ml-1 text-blue-600 inline"
              onClick={() => setIsSettingsOpen(true)}
            >
              Advanced settings
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2 p-3 border rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">Email Notifications</p>
                  <p className="text-xs text-gray-600">Receive via email</p>
                </div>
                <Switch defaultChecked className="flex-shrink-0" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2 p-3 border rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">Push Notifications</p>
                  <p className="text-xs text-gray-600">Browser notifications</p>
                </div>
                <Switch defaultChecked className="flex-shrink-0" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2 p-3 border rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">Transaction Alerts</p>
                  <p className="text-xs text-gray-600">Token purchases</p>
                </div>
                <Switch defaultChecked className="flex-shrink-0" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2 p-3 border rounded-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm">Verification Updates</p>
                  <p className="text-xs text-gray-600">Property status changes</p>
                </div>
                <Switch defaultChecked className="flex-shrink-0" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Tabs defaultValue="all" className="space-y-4 w-full">
        <div className="overflow-x-auto">
          <TabsList className="w-full min-w-max">
            <TabsTrigger value="all">All Notifications</TabsTrigger>
            <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            <TabsTrigger value="transaction">Transactions</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`hover:shadow-md transition-shadow w-full ${!notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 break-words">{notification.title}</h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                        <span className="text-xs text-gray-500 whitespace-nowrap">{notification.timestamp}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 break-words">{notification.message}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <Badge className={`${getNotificationBadge(notification.type)} w-fit`} variant="outline">
                        {notification.category}
                      </Badge>
                      
                      <div className="flex flex-wrap gap-2">
                        {!notification.read && (
                          <Button variant="ghost" size="sm" className="text-xs">
                            <Eye size={14} className="mr-1" />
                            Mark as Read
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Trash size={14} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="unread" className="space-y-4">
          {notifications.filter(n => !n.read).map((notification) => (
            <Card key={notification.id} className="border-l-4 border-l-blue-500 bg-blue-50/30 hover:shadow-md transition-shadow w-full">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 break-words">{notification.title}</h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-xs text-gray-500 whitespace-nowrap">{notification.timestamp}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 break-words">{notification.message}</p>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <Badge className={`${getNotificationBadge(notification.type)} w-fit`} variant="outline">
                        {notification.category}
                      </Badge>
                      
                      <div className="flex flex-wrap gap-2">
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Eye size={14} className="mr-1" />
                          Mark as Read
                        </Button>
                        <Button variant="ghost" size="sm" className="text-xs">
                          <Trash size={14} className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="verification" className="space-y-4">
          {notifications.filter(n => n.category === 'verification').map((notification) => (
            <Card key={notification.id} className={`hover:shadow-md transition-shadow w-full ${!notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 break-words">{notification.title}</h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">{notification.timestamp}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 break-words">{notification.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="transaction" className="space-y-4">
          {notifications.filter(n => n.category === 'transaction').map((notification) => (
            <Card key={notification.id} className={`hover:shadow-md transition-shadow w-full ${!notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                      <h4 className="font-medium text-gray-900 break-words">{notification.title}</h4>
                      <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">{notification.timestamp}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600 break-words">{notification.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Notification Settings Dialog */}
      <NotificationSettingsDialog 
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />
    </div>
  );
};

export default Notifications;
