import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useNavigate } from "react-router-dom";
import {
  HouseIcon,
  BuildingsIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  UsersThreeIcon,
  FileTextIcon,
  MapPinIcon,
  BellIcon,
  ChartBarIcon,
  CheckCircleIcon,
  WarningIcon,
  InfoIcon,
  PlayIcon,
} from "@phosphor-icons/react";

const Welcome = () => {
  const { user } = useAuth();
  const { roles } = useUserRoles();
  const navigate = useNavigate();
  const [activeDemo, setActiveDemo] = useState<string | null>(null);

  const featuresStatus = {
    working: [
      {
        name: "User Authentication & Profiles",
        icon: UsersThreeIcon,
        path: "/profile",
      },
      {
        name: "Property Listings & Marketplace",
        icon: HouseIcon,
        path: "/marketplace",
      },
      {
        name: "Property Search & Filtering",
        icon: MapPinIcon,
        path: "/marketplace",
      },
      {
        name: "Investment Tracking",
        icon: CurrencyDollarIcon,
        path: "/tokens",
      },
      {
        name: "Admin Dashboard",
        icon: ChartBarIcon,
        path: "/admin",
        roles: ["admin"],
      },
      { name: "Messaging System", icon: BellIcon, path: "/messaging" },
      {
        name: "Property Verification",
        icon: ShieldCheckIcon,
        path: "/verification",
        roles: ["verifier", "admin"],
      },
      {
        name: "Role Management",
        icon: UsersThreeIcon,
        path: "/admin",
        roles: ["admin"],
      },
    ],
    inProgress: [
      { name: "Property Tokenization", icon: CurrencyDollarIcon },
      { name: "Investment Processing", icon: ChartBarIcon },
      { name: "KYC Verification UI", icon: FileTextIcon },
      { name: "Payment Integration", icon: CurrencyDollarIcon },
    ],
    planned: [
      { name: "Mobile App", icon: HouseIcon },
      { name: "Advanced Analytics", icon: ChartBarIcon },
      { name: "AI Property Valuation", icon: BuildingsIcon },
      { name: "Blockchain Integration", icon: ShieldCheckIcon },
    ],
  };

  const userTypeGuides = {
    user: {
      title: "Regular User Guide",
      description:
        "Browse properties, make investments, and track your portfolio",
      features: [
        {
          title: "Browse Properties",
          description: "Explore available properties in the marketplace",
          action: "Go to Marketplace",
          path: "/marketplace",
          icon: HouseIcon,
        },
        {
          title: "View Property Details",
          description:
            "Click on any property to see detailed information, photos, and investment opportunities",
          action: "Try it now",
          path: "/marketplace",
          icon: InfoIcon,
        },
        {
          title: "Track Investments",
          description: "Monitor your token holdings and returns",
          action: "View Tokens",
          path: "/tokens",
          icon: CurrencyDollarIcon,
        },
        {
          title: "Complete Your Profile",
          description: "Add personal information and complete KYC verification",
          action: "Update Profile",
          path: "/profile",
          icon: UsersThreeIcon,
        },
      ],
    },
    landowner: {
      title: "Landowner Guide",
      description:
        "List your properties, manage tokenization, and track performance",
      features: [
        {
          title: "Add Your Property",
          description:
            "List your property with detailed information and photos",
          action: "Add Property",
          path: "/add-property",
          icon: BuildingsIcon,
        },
        {
          title: "Manage Listings",
          description: "View and edit your property listings",
          action: "My Properties",
          path: "/my-land",
          icon: HouseIcon,
        },
        {
          title: "Tokenization Process",
          description: "Convert your property into tradeable tokens",
          action: "Learn More",
          path: "/tokens",
          icon: CurrencyDollarIcon,
        },
        {
          title: "Handle Inquiries",
          description: "Respond to potential buyers and investors",
          action: "View Messages",
          path: "/messaging",
          icon: BellIcon,
        },
      ],
    },
    agent: {
      title: "Agent Guide",
      description: "Manage inspections, rentals, and client relationships",
      features: [
        {
          title: "Schedule Inspections",
          description: "Coordinate property viewings with clients",
          action: "Manage Inspections",
          path: "/agent/inspections",
          icon: ShieldCheckIcon,
        },
        {
          title: "Handle Rentals",
          description: "Process rental applications and agreements",
          action: "View Rentals",
          path: "/agent/rentals",
          icon: BuildingsIcon,
        },
        {
          title: "Manage Reservations",
          description: "Coordinate property reservations",
          action: "View Reservations",
          path: "/agent/reservations",
          icon: UsersThreeIcon,
        },
        {
          title: "Agent Calendar",
          description: "Track all your appointments and deadlines",
          action: "Open Calendar",
          path: "/agent/calendar",
          icon: MapPinIcon,
        },
      ],
    },
    verifier: {
      title: "Verifier Guide",
      description: "Review and verify property documents and user information",
      features: [
        {
          title: "Property Verification",
          description: "Review property documents and validate authenticity",
          action: "Start Verification",
          path: "/verification",
          icon: ShieldCheckIcon,
        },
        {
          title: "Document Review",
          description: "Examine land titles, surveys, and legal documents",
          action: "Review Documents",
          path: "/verification",
          icon: FileTextIcon,
        },
        {
          title: "KYC Verification",
          description: "Verify user identity documents and information",
          action: "KYC Dashboard",
          path: "/admin",
          icon: UsersThreeIcon,
        },
      ],
    },
    admin: {
      title: "Administrator Guide",
      description: "Manage the entire platform, users, and system operations",
      features: [
        {
          title: "Admin Dashboard",
          description: "Overview of platform metrics and system health",
          action: "Open Dashboard",
          path: "/admin",
          icon: ChartBarIcon,
        },
        {
          title: "User Management",
          description: "Manage user accounts, roles, and permissions",
          action: "Manage Users",
          path: "/admin",
          icon: UsersThreeIcon,
        },
        {
          title: "KYC Review Center",
          description: "Review and approve user verification documents",
          action: "KYC Center",
          path: "/admin",
          icon: FileTextIcon,
        },
        {
          title: "System Monitoring",
          description: "Monitor transactions, security, and performance",
          action: "View Reports",
          path: "/admin",
          icon: ShieldCheckIcon,
        },
      ],
    },
  };

  const getCurrentUserGuide = () => {
    if (roles.includes("admin" as any)) return userTypeGuides.admin;
    if (roles.includes("verifier" as any)) return userTypeGuides.verifier;
    if (roles.includes("agent" as any)) return userTypeGuides.agent;
    if (roles.includes("landowner" as any)) return userTypeGuides.landowner;
    return userTypeGuides.user;
  };

  const currentGuide = getCurrentUserGuide();

  const handleFeatureDemo = (featureName: string) => {
    setActiveDemo(featureName);
    setTimeout(() => setActiveDemo(null), 2000);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Welcome to Relett! 🏡
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Your comprehensive platform for land tokenization and real estate
          investment
        </p>
        <div className="flex justify-center gap-2 mb-4">
          {roles.map((role, index) => (
            <Badge key={index} variant="secondary" className="capitalize">
              {role.role}
            </Badge>
          ))}
        </div>
      </div>

      <Tabs defaultValue="guide" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="guide">Your Guide</TabsTrigger>
          <TabsTrigger value="features">Platform Status</TabsTrigger>
          <TabsTrigger value="quick-start">Quick Start</TabsTrigger>
        </TabsList>

        {/* User Guide Tab */}
        <TabsContent value="guide" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayIcon className="h-5 w-5 text-blue-600" />
                {currentGuide.title}
              </CardTitle>
              <p className="text-gray-600">{currentGuide.description}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentGuide.features.map((feature, index) => (
                  <Card
                    key={index}
                    className="border border-gray-200 hover:border-blue-300 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <feature.icon className="h-6 w-6 text-blue-600 mt-1" />
                        <div className="flex-1">
                          <h3 className="font-semibold mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {feature.description}
                          </p>
                          <Button
                            size="sm"
                            onClick={() => navigate(feature.path)}
                            className="w-full"
                          >
                            {feature.action}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Platform Status Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Working Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <CheckCircleIcon className="h-5 w-5" />
                  Working Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {featuresStatus.working.map((feature, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors
                      ${
                        !feature.roles ||
                        feature.roles.some((role) =>
                          roles.includes(role as any)
                        )
                          ? "hover:bg-green-50"
                          : "opacity-50"
                      }`}
                    onClick={() => {
                      if (
                        !feature.roles ||
                        feature.roles.some((role) =>
                          roles.includes(role as any)
                        )
                      ) {
                        if (feature.path) navigate(feature.path);
                        handleFeatureDemo(feature.name);
                      }
                    }}
                  >
                    <feature.icon
                      className={`h-4 w-4 ${
                        activeDemo === feature.name
                          ? "text-green-600 animate-pulse"
                          : "text-green-500"
                      }`}
                    />
                    <span className="text-sm font-medium">{feature.name}</span>
                    {feature.roles &&
                      !feature.roles.some((role) =>
                        roles.includes(role as any)
                      ) && (
                        <Badge variant="outline" className="text-xs">
                          Restricted
                        </Badge>
                      )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* In Progress Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-700">
                  <WarningIcon className="h-5 w-5" />
                  In Development
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {featuresStatus.inProgress.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-2">
                    <feature.icon className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">{feature.name}</span>
                    <Badge variant="outline" className="text-xs bg-yellow-50">
                      Coming Soon
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Planned Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <InfoIcon className="h-5 w-5" />
                  Roadmap
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {featuresStatus.planned.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-2">
                    <feature.icon className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">{feature.name}</span>
                    <Badge variant="outline" className="text-xs bg-blue-50">
                      Planned
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Quick Start Tab */}
        <TabsContent value="quick-start" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Checklist</CardTitle>
              <p className="text-gray-600">
                Complete these steps to get the most out of Relett
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  <span className="flex-1">Account created successfully</span>
                  <Badge className="bg-green-600">Complete</Badge>
                </div>

                <div
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => navigate("/profile")}
                >
                  <div className="h-5 w-5 border-2 border-gray-400 rounded-full"></div>
                  <span className="flex-1">
                    Complete your profile information
                  </span>
                  <Button size="sm" variant="outline">
                    Complete
                  </Button>
                </div>

                <div
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => navigate("/profile")}
                >
                  <div className="h-5 w-5 border-2 border-gray-400 rounded-full"></div>
                  <span className="flex-1">Upload KYC documents</span>
                  <Button size="sm" variant="outline">
                    Upload
                  </Button>
                </div>

                <div
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => navigate("/marketplace")}
                >
                  <div className="h-5 w-5 border-2 border-gray-400 rounded-full"></div>
                  <span className="flex-1">Explore the marketplace</span>
                  <Button size="sm" variant="outline">
                    Explore
                  </Button>
                </div>

                {roles.includes("landowner" as any) && (
                  <div
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                    onClick={() => navigate("/add-property")}
                  >
                    <div className="h-5 w-5 border-2 border-gray-400 rounded-full"></div>
                    <span className="flex-1">List your first property</span>
                    <Button size="sm" variant="outline">
                      Add Property
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="border border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-700 space-y-2">
              <p>
                <strong>KYC Verification:</strong> Complete your identity
                verification in your profile settings. Admins review and approve
                KYC documents through the admin dashboard.
              </p>
              <p>
                <strong>Investment Features:</strong> Token investment
                functionality is currently in development. You can browse
                properties and track holdings, but investment processing is not
                yet active.
              </p>
              <p>
                <strong>Support:</strong> If you encounter any issues or have
                questions, please use the feedback system or contact support.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Welcome;
