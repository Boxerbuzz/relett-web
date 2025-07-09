import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserCache } from "@/hooks/use-user-cache";
import { RefreshCw, User, Clock } from "lucide-react";

/**
 * Component that demonstrates user cache functionality
 * Shows current user data and provides a way to refresh it
 */
export function UserDataRefresh() {
  const { user, isLoading, refreshUserData } = useUserCache();

  const handleRefresh = async () => {
    try {
      await refreshUserData();
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No user data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Data
          </CardTitle>
          <Button
            onClick={handleRefresh}
            disabled={isLoading}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="h-4 w-4 animate-spin" />
            Loading user data...
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">Email:</span>
            <span className="text-gray-600">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Role:</span>
            <span className="text-gray-600 capitalize">{user.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Phone:</span>
            <span className="text-gray-600">{user.phone || "Not provided"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Created:</span>
            <span className="text-gray-600">
              {new Date(user.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mt-4 p-2 bg-gray-50 rounded">
          <p>💡 Tip: User data is cached for 5 minutes to improve performance.</p>
          <p>Click "Refresh" to fetch the latest data from the database.</p>
        </div>
      </CardContent>
    </Card>
  );
} 