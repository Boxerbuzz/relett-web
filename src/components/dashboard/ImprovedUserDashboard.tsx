
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useInvestmentPortfolio } from "@/hooks/useInvestmentPortfolio";
import { useNavigate } from "react-router-dom";
import { RoleRequestDialog } from "@/components/dialogs/RoleRequestDialog";
import { RecentActivityWidget } from "./RecentActivityWidget";
import { FavoritesWidget } from "./FavoritesWidget";
import { QuickActionsWidget } from "./QuickActionsWidget";
import {
  HeartIcon,
  EyeIcon,
  CreditCardIcon,
  TrendUpIcon,
  MapPinIcon,
  CalendarIcon,
  StarIcon,
  ArrowRightIcon,
  PlusIcon,
  BellIcon,
} from "@phosphor-icons/react";

const ImprovedUserDashboard = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { portfolio } = useInvestmentPortfolio();
  const navigate = useNavigate();
  const [roleRequestOpen, setRoleRequestOpen] = useState(false);

  // Mock user activity data - in real app this would come from database
  const userStats = [
    {
      label: "Properties Viewed",
      value: "24",
      icon: EyeIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      label: "Favorites",
      value: "8",
      icon: HeartIcon,
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      label: "Active Bookings",
      value: "3",
      icon: CalendarIcon,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      label: "Investments",
      value: portfolio?.properties?.length?.toString() || "0",
      icon: TrendUpIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {profile?.first_name || user?.email?.split('@')[0] || 'User'}!
            </h1>
            <p className="text-gray-600 mb-4">
              Discover amazing properties and manage your real estate journey
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate("/marketplace")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <MapPinIcon className="mr-2 h-4 w-4" />
                Explore Properties
              </Button>
              <Button variant="outline" onClick={() => setRoleRequestOpen(true)}>
                <PlusIcon className="mr-2 h-4 w-4" />
                Become an Agent
              </Button>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="mb-2">
              <BellIcon className="mr-1 h-3 w-3" />
              3 new notifications
            </Badge>
            <p className="text-sm text-gray-500">
              Last login: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {userStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Actions & Portfolio */}
        <div className="lg:col-span-1 space-y-6">
          <QuickActionsWidget />
          
          {/* Investment Portfolio Summary */}
          {portfolio && portfolio.properties && portfolio.properties.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendUpIcon className="h-5 w-5 text-green-600" />
                    Portfolio Summary
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate("/tokens")}
                  >
                    View Details
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">
                      Total Value
                    </p>
                    <p className="text-2xl font-bold text-green-800">
                      ${portfolio.totalValue?.toLocaleString() || "0"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Properties</p>
                      <p className="text-xl font-bold text-blue-800">
                        {portfolio.properties.length}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-purple-600 font-medium">ROI</p>
                      <p className="text-xl font-bold text-purple-800">
                        {portfolio.totalROI?.toFixed(2) || "0.00"}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Activity & Favorites */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentActivityWidget />
            <FavoritesWidget />
          </div>
        </div>
      </div>

      {/* Role Request Dialog */}
      <RoleRequestDialog
        open={roleRequestOpen}
        onOpenChange={setRoleRequestOpen}
      />
    </div>
  );
};

export default ImprovedUserDashboard;
