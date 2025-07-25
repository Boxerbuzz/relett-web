"use client";

import { useAuth } from "@/lib/auth";
import { AdaptiveDashboard } from "./AdaptiveDashboard";
import { EmailVerificationStatus } from "../profile/EmailVerificationStatus";
import { ProfileCompletionBanner } from "../profile/ProfileCompletionBanner";
import { DashboardSkeleton } from "../ui/dashboard-skeleton";
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

  return (
    <div className="space-y-4 md:space-y-6 w-full min-w-0">
      {/* Email Verification Status */}
      <EmailVerificationStatus />

      {/* Profile Completion Banner */}
      <ProfileCompletionBanner onCompleteProfile={handleCompleteProfile} />

      {/* Unified Adaptive Dashboard */}
      <AdaptiveDashboard />
    </div>
  );
}
