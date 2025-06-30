
import { useAuth } from "@/lib/auth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { RoleRequestDialog } from "@/components/dialogs/RoleRequestDialog";
import { RoleRequestStatus } from "./RoleRequestStatus";
import { useState } from "react";

export function DashboardHeader() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [showRoleRequestDialog, setShowRoleRequestDialog] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const displayName = profile?.first_name 
    ? `${profile.first_name} ${profile.last_name || ''}`.trim()
    : user?.email?.split('@')[0] || 'User';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {displayName}!
        </h1>
        <p className="text-gray-600">
          Welcome back to your property management dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RoleRequestStatus 
          onSubmitRequest={() => setShowRoleRequestDialog(true)}
        />
      </div>

      <RoleRequestDialog 
        open={showRoleRequestDialog}
        onOpenChange={setShowRoleRequestDialog}
      />
    </div>
  );
}
