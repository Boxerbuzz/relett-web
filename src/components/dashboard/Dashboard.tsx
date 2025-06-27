"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { WelcomeCard } from "./WelcomeCard";
import { LandownerDashboard } from "./LandownerDashboard";
import { VerifierDashboard } from "./VerifierDashboard";
import { AgentDashboard } from "./AgentDashboard";
import { EmailVerificationStatus } from "../profile/EmailVerificationStatus";
import { ProfileCompletionBanner } from "../profile/ProfileCompletionBanner";
import { ProfileCompletionWizard } from "../profile/ProfileCompletionWizard";
import { DashboardSkeleton } from "../ui/dashboard-skeleton";
import UserDashboard from "./UserDashboard";

export function Dashboard() {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const [showProfileWizard, setShowProfileWizard] = useState(false);

  // Show loading state while profile is loading
  if (!user) {
    return <DashboardSkeleton />;
  }

  const handleCompleteProfile = () => {
    setShowProfileWizard(true);
  };

  const renderRoleSpecificDashboard = () => {
    switch (user.role) {
      case "landowner":
        return <LandownerDashboard />;
      case "verifier":
        return <VerifierDashboard />;
      case "agent":
        return <AgentDashboard />;
      case "user":
        return <UserDashboard />;
      default:
        return <LandownerDashboard />; // Default fallback
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 w-full min-w-0">
      {/* Email Verification Status */}
      <EmailVerificationStatus />

      {/* Profile Completion Banner */}
      <ProfileCompletionBanner onCompleteProfile={handleCompleteProfile} />

      {/* Welcome Card */}
      <WelcomeCard />

      {/* Role-specific Dashboard Content */}
      <div className="w-full min-w-0">{renderRoleSpecificDashboard()}</div>

      {/* Profile Completion Wizard */}
      <ProfileCompletionWizard
        open={showProfileWizard}
        onOpenChange={setShowProfileWizard}
      />
    </div>
  );
}
