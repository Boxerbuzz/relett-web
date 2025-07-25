"use client";

import { useAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAdminDashboardStats } from "@/hooks/useAdminDashboardStats";
import { useUserDashboardStats } from "@/hooks/useUserDashboardStats";
import { 
  BuildingIcon, 
  UsersIcon, 
  CurrencyDollarIcon, 
  TrendUpIcon, 
  ShieldIcon, 
  FileTextIcon,
  ActivityIcon,
  ChatCircleIcon,
  StarIcon,
  EyeIcon,
  CalendarIcon,
  PlusIcon,
  ChartBarIcon
} from "@phosphor-icons/react";

interface DashboardSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  roles?: string[];
}

export function AdaptiveDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  // Define role-based sections
  const sections: DashboardSection[] = [
    // User sections
    {
      id: "overview",
      title: "Overview",
      description: "Your dashboard overview",
      icon: ActivityIcon,
      content: <UserOverviewSection />,
      roles: ["user", "landowner", "verifier", "agent", "admin"]
    },
    {
      id: "investments",
      title: "My Investments",
      description: "Track your portfolio performance",
      icon: TrendUpIcon,
      content: <InvestmentSection />,
      roles: ["user", "landowner", "agent"]
    },
    {
      id: "properties",
      title: "My Properties",
      description: "Manage your property listings",
      icon: BuildingIcon,
      content: <PropertiesSection />,
      roles: ["landowner"]
    },
    {
      id: "verification",
      title: "Verification Queue",
      description: "Review pending property verifications",
      icon: ShieldIcon,
      content: <VerificationSection />,
      roles: ["verifier", "admin"]
    },
    {
      id: "clients",
      title: "Client Management",
      description: "Manage your clients and leads",
      icon: UsersIcon,
      content: <ClientSection />,
      roles: ["agent"]
    },
    {
      id: "admin",
      title: "System Administration",
      description: "Platform management and oversight",
      icon: ShieldIcon,
      content: <AdminSection />,
      roles: ["admin"]
    }
  ];

  // Filter sections based on user role
  const availableSections = sections.filter(section => 
    !section.roles || section.roles.includes(user.role || 'user')
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.email}
          </p>
        </div>
        <Badge variant="outline">{user.role}</Badge>
      </div>

      <Tabs defaultValue={availableSections[0]?.id} className="space-y-6">
        <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${availableSections.length}, 1fr)` }}>
          {availableSections.map((section) => (
            <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
              <section.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{section.title}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {availableSections.map((section) => (
          <TabsContent key={section.id} value={section.id}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <section.icon className="w-5 h-5" />
                  {section.title}
                </CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {section.content}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Section Components
function UserOverviewSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats: userStats, isLoading: userLoading } = useUserDashboardStats();
  const { stats: adminStats, isLoading: adminLoading } = useAdminDashboardStats();
  
  // Show different stats based on user role
  const stats = user?.role === 'admin' ? [
    { label: "Total Users", value: adminStats.totalUsers.toString(), icon: UsersIcon },
    { label: "Total Properties", value: adminStats.totalProperties.toString(), icon: BuildingIcon },
    { label: "Pending Verifications", value: adminStats.pendingVerifications.toString(), icon: ShieldIcon },
    { label: "Monthly Revenue", value: `$${adminStats.monthlyRevenue.toFixed(2)}`, icon: CurrencyDollarIcon }
  ] : [
    { label: "My Properties", value: userStats.ownedProperties.toString(), icon: BuildingIcon },
    { label: "Investment Value", value: `$${userStats.totalInvestmentValue.toFixed(2)}`, icon: CurrencyDollarIcon },
    { label: "Token Holdings", value: userStats.totalInvestments.toString(), icon: TrendUpIcon },
    { label: "Inspections Made", value: userStats.bookingsMade.toString(), icon: CalendarIcon }
  ];

  const isLoading = user?.role === 'admin' ? adminLoading : userLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                  </div>
                  <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  {user?.role !== 'admin' && userStats.portfolioROI !== 0 && stat.label === "Token Holdings" && (
                    <p className={`text-sm ${userStats.portfolioROI > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {userStats.portfolioROI > 0 ? '+' : ''}{userStats.portfolioROI.toFixed(2)}% ROI
                    </p>
                  )}
                </div>
                <stat.icon className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2"
          onClick={() => navigate("/marketplace")}
        >
          <BuildingIcon className="w-6 h-6" />
          Browse Properties
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2"
          onClick={() => navigate("/investment")}
        >
          <ChartBarIcon className="w-6 h-6" />
          View Investments
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2"
          onClick={() => navigate("/bookings")}
        >
          <CalendarIcon className="w-6 h-6" />
          My Bookings
        </Button>
      </div>
    </div>
  );
}

function InvestmentSection() {
  return (
    <div className="space-y-4">
      <div className="text-center py-8">
        <TrendUpIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Investment Portfolio</h3>
        <p className="text-muted-foreground mb-4">Track your tokenized property investments</p>
        <Button onClick={() => window.location.href = '/investment'}>
          View Full Portfolio
        </Button>
      </div>
    </div>
  );
}

function PropertiesSection() {
  return (
    <div className="space-y-4">
      <div className="text-center py-8">
        <BuildingIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Property Management</h3>
        <p className="text-muted-foreground mb-4">List and manage your properties</p>
        <Button onClick={() => window.location.href = '/properties'}>
          <PlusIcon className="w-4 h-4 mr-2" />
          Add New Property
        </Button>
      </div>
    </div>
  );
}

function VerificationSection() {
  return (
    <div className="space-y-4">
      <div className="text-center py-8">
        <ShieldIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Verification Queue</h3>
        <p className="text-muted-foreground mb-4">Review pending property verifications</p>
        <Button onClick={() => window.location.href = '/verification'}>
          View Queue
        </Button>
      </div>
    </div>
  );
}

function ClientSection() {
  return (
    <div className="space-y-4">
      <div className="text-center py-8">
        <UsersIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Client Management</h3>
        <p className="text-muted-foreground mb-4">Manage your clients and leads</p>
        <Button onClick={() => window.location.href = '/clients'}>
          View Clients
        </Button>
      </div>
    </div>
  );
}

function AdminSection() {
  const navigate = useNavigate();
  const { stats } = useAdminDashboardStats();
  
  const adminStats = [
    { label: "Total Users", value: stats.totalUsers, icon: UsersIcon },
    { label: "Pending Verifications", value: stats.pendingVerifications, icon: ShieldIcon },
    { label: "Active Tokens", value: stats.activeTokens, icon: ActivityIcon },
    { label: "Pending Documents", value: stats.pendingDocuments, icon: FileTextIcon },
    { label: "Contact Messages", value: stats.contactsCount, icon: ChatCircleIcon },
    { label: "Waitlist Count", value: stats.waitlistCount, icon: StarIcon }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2"
          onClick={() => navigate("/admin")}
        >
          <ShieldIcon className="w-6 h-6" />
          Admin Hub
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2"
          onClick={() => navigate("/verification")}
        >
          <FileTextIcon className="w-6 h-6" />
          Verification Queue
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2"
          onClick={() => navigate("/analytics")}
        >
          <ChartBarIcon className="w-6 h-6" />
          Analytics
        </Button>
      </div>
    </div>
  );
}