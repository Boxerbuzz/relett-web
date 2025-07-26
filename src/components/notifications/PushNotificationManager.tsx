import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BellIcon,
  BellSlashIcon,
  DeviceMobileIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { useOneSignalNotifications } from "@/hooks/useOneSignalNotifications";
import { useAuth } from "@/lib/auth";

export function PushNotificationManager() {
  const { user } = useAuth();
  const { isInitialized, playerId, subscribeUser, unsubscribeUser } =
    useOneSignalNotifications();

  useEffect(() => {
    // Auto-subscribe authenticated users
    if (isInitialized && user && !playerId) {
      subscribeUser(user.id);
    }
  }, [isInitialized, user, playerId, subscribeUser]);

  const handleSubscribe = async () => {
    if (user) {
      await subscribeUser(user.id);
    }
  };

  const handleUnsubscribe = async () => {
    await unsubscribeUser();
  };

  if (!isInitialized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DeviceMobileIcon className="h-5 w-5 text-gray-400 animate-pulse" />
            Initializing Notifications...
          </CardTitle>
          <CardDescription>
            Setting up push notification service
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DeviceMobileIcon className="h-5 w-5" />
            Push Notifications
          </div>
          <Badge variant={playerId ? "default" : "secondary"}>
            {playerId ? "Enabled" : "Disabled"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Stay updated with real-time notifications about your properties and
          investments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {playerId ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">
                  Notifications Enabled
                </div>
                <div className="text-sm text-green-700">
                  You'll receive notifications for property updates,
                  investments, and more
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">You'll receive notifications for:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  Property verification updates
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  Investment opportunities
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  Dividend payments
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  Chat messages
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                  Property inquiries and responses
                </li>
              </ul>
            </div>

            <Button
              variant="outline"
              onClick={handleUnsubscribe}
              className="w-full"
            >
              <BellSlashIcon className="h-4 w-4 mr-2" />
              Disable Notifications
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center py-6">
              <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Enable Push Notifications</h3>
              <p className="text-gray-600 mb-4">
                Get instant notifications about your properties, investments,
                and important updates
              </p>
            </div>

            <Button onClick={handleSubscribe} className="w-full">
              <BellIcon className="h-4 w-4 mr-2" />
              Enable Notifications
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 pt-4 border-t">
          <p>
            Notifications are sent securely and you can disable them at any
            time. We respect your privacy and only send relevant updates.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
