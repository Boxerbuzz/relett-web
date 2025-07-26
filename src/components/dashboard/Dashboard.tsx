"use client";

import { useAuth } from "@/lib/auth";
import { WelcomeCard } from "./WelcomeCard";
import { LandownerDashboard } from "./LandownerDashboard";
import { VerifierDashboard } from "./VerifierDashboard";
import { AgentDashboard } from "./AgentDashboard";
import { EmailVerificationStatus } from "../profile/EmailVerificationStatus";
import { ProfileCompletionBanner } from "../profile/ProfileCompletionBanner";
import { DashboardSkeleton } from "../ui/dashboard-skeleton";
import UserDashboard from "./UserDashboard";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Show loading state while profile is loading
  if (!user) {
    return <DashboardSkeleton />;
  }

  const handleCompleteProfile = () => {
    navigate("/profile");
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
    </div>
  );
}
