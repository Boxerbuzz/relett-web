"use client";

import { useState, useEffect } from "react";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";

const DashboardPage = () => {
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // Simulate initial dashboard loading
  useEffect(() => {
    const timer = setTimeout(() => setDashboardLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (dashboardLoading) {
    return (
      <div className="space-y-6 w-full max-w-full overflow-hidden">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <DashboardHeader />

      <Dashboard />
    </div>
  );
};

export default DashboardPage;
