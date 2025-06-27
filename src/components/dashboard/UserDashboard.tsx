
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useProperties } from "@/hooks/useProperties";
import { useInvestmentPortfolio } from "@/hooks/useInvestmentPortfolio";
import { useNavigate } from "react-router-dom";
import { RoleRequestDialog } from "@/components/dialogs/RoleRequestDialog";
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
} from "@phosphor-icons/react";

const UserDashboard = () => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { properties } = useProperties();
  const { portfolio } = useInvestmentPortfolio();
  const navigate = useNavigate();
  const [roleRequestOpen, setRoleRequestOpen] = useState(false);

  // Filter user's favorite properties and recent views
  const favoriteProperties =
    properties?.filter((p) => p.favorites && p.favorites > 0)?.slice(0, 3) ||
    [];
  const recentProperties = properties?.slice(0, 4) || [];

  // Mock user activity data - in real app this would come from database
  const userStats = [
    {
      label: "Properties Viewed",
      value: "24",
      icon: EyeIcon,
      color: "text-blue-600",
    },
    {
      label: "Favorites",
      value: favoriteProperties.length.toString(),
      icon: HeartIcon,
      color: "text-red-500",
    },
    {
      label: "Bookings",
      value: "3",
      icon: CalendarIcon,
      color: "text-green-600",
    },
    {
      label: "Investments",
      value: portfolio?.properties?.length?.toString() || "0",
      icon: TrendUpIcon,
      color: "text-purple-600",
    },
  ];

  const handleViewProperty = (propertyId: string) => {
    navigate(`/property/${propertyId}`);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {profile?.first_name || user?.email}!
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {userStats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StarIcon className="h-5 w-5 text-yellow-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => navigate("/marketplace")}
            >
              <MapPinIcon className="h-6 w-6" />
              <span>Browse Properties</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => navigate("/tokens")}
            >
              <CreditCardIcon className="h-6 w-6" />
              <span>View Investments</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => navigate("/me")}
            >
              <CalendarIcon className="h-6 w-6" />
              <span>My Bookings</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Properties */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Properties</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/marketplace")}
            >
              View All
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentProperties.map((property) => (
              <div
                key={property.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleViewProperty(property.id)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-sm truncate">
                    {property.title}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {property.category}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2 truncate">
                  {property.location?.address || "Location not specified"}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-green-600">
                    ₦
                    {property.price?.amount?.toLocaleString() ||
                      "Price on request"}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <EyeIcon className="h-3 w-3" />
                    {property.views || 0}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Investment Portfolio Summary */}
      {portfolio && portfolio.properties && portfolio.properties.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendUpIcon className="h-5 w-5 text-green-600" />
                Investment Portfolio
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-green-600 font-medium">
                  Total Value
                </p>
                <p className="text-2xl font-bold text-green-800">
                  ${portfolio.totalValue?.toLocaleString() || "0"}
                </p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Properties</p>
                <p className="text-2xl font-bold text-blue-800">
                  {portfolio.properties.length}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">ROI</p>
                <p className="text-2xl font-bold text-purple-800">
                  {portfolio.totalROI?.toFixed(2) || "0.00"}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role Request Dialog */}
      <RoleRequestDialog
        open={roleRequestOpen}
        onOpenChange={setRoleRequestOpen}
      />
    </div>
  );
};

export default UserDashboard;
