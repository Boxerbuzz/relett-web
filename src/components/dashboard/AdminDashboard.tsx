"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserManagement } from "@/components/admin/UserManagement";
import { PropertyVerificationQueue } from "@/components/admin/PropertyVerificationQueue";
import { AdminVerificationHub } from "@/components/admin/AdminVerificationHub";
import { useToast } from "@/hooks/use-toast";
import { useAdminDashboardStats } from "@/hooks/useAdminDashboardStats";
import { useAdminRecentActivity } from "@/hooks/useAdminRecentActivity";
import { Link } from "react-router-dom";
import {
  UsersIcon,
  ShieldIcon,
  HouseIcon,
  CurrencyDollarIcon,
  ActivityIcon,
  EnvelopeIcon,
  ArrowRightIcon,
  FileTextIcon,
} from "@phosphor-icons/react";
import { TokenApprovalTab } from "@/components/admin/TokenApprovalTab";
import { Coins } from "lucide-react";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Use optimized hooks for data fetching
  const {
    stats,
    isLoading: statsLoading,
    error: statsError,
  } = useAdminDashboardStats();
  const { activities, isLoading: activitiesLoading } = useAdminRecentActivity();

  // Handle errors with toast
  if (statsError) {
    toast({
      title: "Error",
      description: "Failed to fetch dashboard statistics",
      variant: "destructive",
    });
  }

  const handleVerificationReview = (type: string) => {
    switch (type) {
      case "identity":
        setActiveTab("verification-hub");
        break;
      case "documents":
        setActiveTab("verification-hub");
        break;
      case "properties":
        setActiveTab("properties");
        break;
      default:
        setActiveTab("verification-hub");
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage users, properties, and system operations
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">Platform users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Verifications
            </CardTitle>
            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats.pendingVerifications}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Properties
            </CardTitle>
            <HouseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats.totalProperties}
            </div>
            <p className="text-xs text-muted-foreground">Listed properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <CurrencyDollarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₦{statsLoading ? "..." : stats.monthlyRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setActiveTab("verification-hub")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              KYC & Role Management
            </CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.pendingVerifications}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              Pending reviews
              <ArrowRightIcon className="ml-2 h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setActiveTab("users")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              User Management
            </CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              Manage all users
              <ArrowRightIcon className="ml-2 h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => setActiveTab("properties")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Property Verification
            </CardTitle>
            <ShieldIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats.pendingDocuments}
            </div>
            <p className="text-xs text-muted-foreground flex items-center">
              Pending reviews
              <ArrowRightIcon className="ml-2 h-3 w-3" />
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <Link to="/admin/contacts">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Contact Messages
              </CardTitle>
              <EnvelopeIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? "..." : stats.contactsCount}
              </div>
              <p className="text-xs text-muted-foreground flex items-center">
                Unread messages
                <ArrowRightIcon className="ml-2 h-3 w-3" />
              </p>
            </CardContent>
          </Link>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <div className="w-full">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6 w-full"
        >
          <TabsList className="grid w-full grid-cols-5 h-auto gap-1">
            <TabsTrigger
              value="overview"
              className="flex items-center justify-center px-2 py-2 text-xs sm:text-sm"
            >
              <ActivityIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="users"
              className="flex items-center justify-center px-2 py-2 text-xs sm:text-sm"
            >
              <UsersIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger
              value="properties"
              className="flex items-center justify-center px-2 py-2 text-xs sm:text-sm"
            >
              <HouseIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Properties</span>
            </TabsTrigger>
            <TabsTrigger
              value="tokens"
              className="flex items-center justify-center px-2 py-2 text-xs sm:text-sm"
            >
              <Coins className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Tokens</span>
            </TabsTrigger>
            <TabsTrigger
              value="verification-hub"
              className="flex items-center justify-center px-2 py-2 text-xs sm:text-sm"
            >
              <ShieldIcon className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">KYC & Roles</span>
            </TabsTrigger>
          </TabsList>

          <div className="w-full">
            <TabsContent value="overview" className="space-y-6 w-full">
              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ActivityIcon className="h-5 w-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">API Status</span>
                      <Badge className="bg-green-100 text-green-800">
                        Healthy
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">Database</span>
                      <Badge className="bg-green-100 text-green-800">
                        Connected
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="text-sm font-medium">Storage</span>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        85% Used
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Latest system activities and user actions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activitiesLoading ? (
                    <div className="space-y-3">
                      {[...Array(4)].map((_, index) => (
                        <div key={index} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activities.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-2 border-b last:border-0"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {activity.action}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {activity.user}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                            {activity.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6 w-full">
              <div className="w-full">
                <UserManagement />
              </div>
            </TabsContent>

            <TabsContent value="properties" className="space-y-6 w-full">
              <div className="w-full">
                <PropertyVerificationQueue />
              </div>
            </TabsContent>

            <TabsContent value="tokens" className="space-y-6 w-full">
              <div className="w-full">
                <TokenApprovalTab />
              </div>
            </TabsContent>

            <TabsContent value="verification-hub" className="space-y-6 w-full">
              <div className="w-full">
                <AdminVerificationHub />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
