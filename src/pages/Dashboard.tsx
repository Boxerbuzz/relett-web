"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { MarketOverview } from "@/components/dashboard/MarketOverview";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { DashboardSkeleton } from "@/components/ui/dashboard-skeleton";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { FeaturedPropertiesTab } from "@/components/dashboard/FeaturedPropertiesTab";

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
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

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

        <TabsContent value="overview" className="space-y-6">
          <Dashboard />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <RecentTransactions />
            <NotificationsList />
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <MarketOverview />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationsList />
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <FeaturedPropertiesTab isActive={activeTab === "properties"} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
