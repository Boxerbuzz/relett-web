"use client";

import { useAuth } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Building, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  FileText,
  Activity,
  MessageSquare,
  Star,
  Eye,
  Calendar,
  PlusIcon,
  BarChart3
} from "lucide-react";

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
      icon: Activity,
      content: <UserOverviewSection />,
      roles: ["user", "landowner", "verifier", "agent", "admin"]
    },
    {
      id: "investments",
      title: "My Investments",
      description: "Track your portfolio performance",
      icon: TrendingUp,
      content: <InvestmentSection />,
      roles: ["user", "landowner", "agent"]
    },
    {
      id: "properties",
      title: "My Properties",
      description: "Manage your property listings",
      icon: Building,
      content: <PropertiesSection />,
      roles: ["landowner"]
    },
    {
      id: "verification",
      title: "Verification Queue",
      description: "Review pending property verifications",
      icon: Shield,
      content: <VerificationSection />,
      roles: ["verifier", "admin"]
    },
    {
      id: "clients",
      title: "Client Management",
      description: "Manage your clients and leads",
      icon: Users,
      content: <ClientSection />,
      roles: ["agent"]
    },
    {
      id: "admin",
      title: "System Administration",
      description: "Platform management and oversight",
      icon: Shield,
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
  
  const stats = [
    { label: "Total Investments", value: "$12,500", icon: DollarSign, change: "+12%" },
    { label: "Properties Viewed", value: "24", icon: Eye },
    { label: "Bookings Made", value: "3", icon: Calendar },
    { label: "Portfolio ROI", value: "8.2%", icon: TrendingUp, change: "+2.1%" }
  ];

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
                  {stat.change && (
                    <p className="text-sm text-green-600">{stat.change}</p>
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
          <Building className="w-6 h-6" />
          Browse Properties
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2"
          onClick={() => navigate("/investment")}
        >
          <BarChart3 className="w-6 h-6" />
          View Investments
        </Button>
        <Button 
          variant="outline" 
          className="h-20 flex flex-col gap-2"
          onClick={() => navigate("/bookings")}
        >
          <Calendar className="w-6 h-6" />
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
        <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
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
        <Building className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
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
        <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
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
        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
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
  return (
    <div className="space-y-4">
      <div className="text-center py-8">
        <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">System Administration</h3>
        <p className="text-muted-foreground mb-4">Platform management and oversight</p>
        <Button onClick={() => window.location.href = '/admin'}>
          Access Admin Panel
        </Button>
      </div>
    </div>
  );
}