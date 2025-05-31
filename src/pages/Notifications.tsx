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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
            <Bell size={32} className="mr-3" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="ml-3 bg-red-100 text-red-800">
                {unreadCount} new
              </Badge>
            )}
          </h1>
          <p className="text-gray-600">Stay updated with your property activities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Mark All as Read
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsSettingsOpen(true)}>
            <Settings size={16} className="mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Preferences</CardTitle>
          <CardDescription>
            Manage how you receive notifications. 
            <Button 
              variant="link" 
              className="p-0 ml-1 text-blue-600"
              onClick={() => setIsSettingsOpen(true)}
            >
              Advanced settings
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-gray-600">Browser notifications</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Transaction Alerts</p>
                <p className="text-sm text-gray-600">Token purchases</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Verification Updates</p>
                <p className="text-sm text-gray-600">Property status changes</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
          <TabsTrigger value="verification">Verification</TabsTrigger>
          <TabsTrigger value="transaction">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={`hover:shadow-md transition-shadow ${!notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                        <span className="text-xs text-gray-500">{notification.timestamp}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={getNotificationBadge(notification.type)} variant="outline">
                        {notification.category}
                      </Badge>
                      
                      <div className="flex gap-2">
                        {!notification.read && (
                          <Button variant="ghost" size="sm">
                            <Eye size={14} className="mr-1" />
                            Mark as Read
                          </Button>
                        )}
                        <Button variant="ghost" size="sm">
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
            <Card key={notification.id} className="border-l-4 border-l-blue-500 bg-blue-50/30 hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-xs text-gray-500">{notification.timestamp}</span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                    
                    <div className="flex items-center justify-between">
                      <Badge className={getNotificationBadge(notification.type)} variant="outline">
                        {notification.category}
                      </Badge>
                      
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye size={14} className="mr-1" />
                          Mark as Read
                        </Button>
                        <Button variant="ghost" size="sm">
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
            <Card key={notification.id} className={`hover:shadow-md transition-shadow ${!notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      <span className="text-xs text-gray-500">{notification.timestamp}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600">{notification.message}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="transaction" className="space-y-4">
          {notifications.filter(n => n.category === 'transaction').map((notification) => (
            <Card key={notification.id} className={`hover:shadow-md transition-shadow ${!notification.read ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      <span className="text-xs text-gray-500">{notification.timestamp}</span>
                    </div>
                    
                    <p className="text-sm text-gray-600">{notification.message}</p>
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
