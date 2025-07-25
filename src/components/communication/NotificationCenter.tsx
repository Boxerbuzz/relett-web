"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BellIcon,
  CheckIcon,
  ChatCenteredTextIcon,
  CurrencyDollarSimpleIcon,
  TestTubeIcon,
} from "@phosphor-icons/react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { NotificationDeliveryStatus } from "@/components/notifications/NotificationDeliveryStatus";
import { NotificationTester } from "@/components/notifications/NotificationTester";
import { NotificationsSkeleton } from "@/components/ui/notifications-skeleton";
import { useUserRoles } from "@/hooks/useUserRoles";

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
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showTester, setShowTester] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] =
    useState<string>("");
  const { toast } = useToast();
  const { hasRole } = useUserRoles();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    fetchNotifications();
    setupRealtimeSubscription();
  }, []);

  const fetchNotifications = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications((data as Notification[]) || []);
    } catch (error) {
      handleError(error, "Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      handleError(error, "Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, is_read: true }))
      );

      toast({
        title: "All notifications marked as read",
      });
    } catch (error) {
      handleError(error, "Failed to mark all notifications as read");
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "payment":
        return <CurrencyDollarSimpleIcon className="h-4 w-4" />;
      case "chat":
        return <ChatCenteredTextIcon className="h-4 w-4" />;
      case "general":
        return <CheckIcon className="h-4 w-4" />;
      default:
        return <BellIcon className="h-4 w-4" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  if (isLoading) {
    return <NotificationsSkeleton />;
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold">Notifications</h2>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} unread notifications
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark All Read
            </Button>
          )}
          {hasRole("admin") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTester(!showTester)}
            >
              <TestTubeIcon className="h-4 w-4 mr-2" />
              Test
            </Button>
          )}
        </div>
      </div>

      {/* Test Panel - also restrict to admin */}
      {showTester && hasRole("admin") && <NotificationTester />}

      {/* Delivery Status for selected notification */}
      {selectedNotificationId && (
        <NotificationDeliveryStatus notificationId={selectedNotificationId} />
      )}

      {/* Notifications List */}
      <div className="space-y-3 md:space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <BellIcon className="mx-auto h-12 w-12 mb-4" />
                <p>
                  No notifications yet. We'll notify you about important
                  updates!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`${
                !notification.is_read ? "border-blue-200 bg-blue-50/50" : ""
              }`}
            >
              <CardContent className="p-3 md:p-4">
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="mt-1 flex-shrink-0 rounded-full w-9 h-9 flex items-center justify-center bg-muted">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                      <div className="min-w-0">
                        <h4 className="font-medium text-sm md:text-base break-words">
                          {notification.title}
                        </h4>
                        {notification.message && (
                          <p className="text-xs md:text-sm text-muted-foreground mt-1 break-words">
                            {notification.message}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notification.is_read && (
                          <Badge variant="secondary" className="text-xs">
                            New
                          </Badge>
                        )}
                        {hasRole("admin") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setSelectedNotificationId(
                                selectedNotificationId === notification.id
                                  ? ""
                                  : notification.id
                              )
                            }
                            className="text-xs"
                          >
                            Status
                          </Button>
                        )}
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <CheckIcon className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    {notification.action_url && notification.action_label && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 text-xs"
                        onClick={() =>
                          (window.location.href = notification.action_url!)
                        }
                      >
                        {notification.action_label}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
