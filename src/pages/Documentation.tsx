import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DatabaseIcon,
  ShieldIcon,
  BookIcon,
  ChartLineIcon,
  LightningIcon,
  ArrowRightIcon,
  GearIcon,
} from "@phosphor-icons/react";
import { Link } from "react-router-dom";

const Documentation = () => {
  const [activeSection, setActiveSection] = useState("overview");

  const documentationSections = [
    {
      id: "database",
      title: "Database Documentation",
      description: "Complete database schema, tables, and relationships",
      icon: <DatabaseIcon className="w-5 h-5" />,
      path: "/database",
      color: "blue",
    },
    {
      id: "data-flow",
      title: "Data Flow Diagrams",
      description: "Visual representation of system data flows",
      icon: <ChartLineIcon className="w-5 h-5" />,
      path: "/dataflow",
      color: "green",
    },
    {
      id: "api",
      title: "API Documentation",
      description: "Edge functions, webhooks, and API endpoints",
      icon: <LightningIcon className="w-5 h-5" />,
      path: "#api",
      color: "purple",
    },
    {
      id: "auth",
      title: "Authentication & Security",
      description: "User management, roles, and security features",
      icon: <ShieldIcon className="w-5 h-5" />,
      path: "#auth",
      color: "red",
    },
  ];

  const edgeFunctions = [
    {
      name: "send-inspection-notification",
      description: "Handles inspection status change notifications",
      method: "POST",
      trigger: "Database trigger",
    },
    {
      name: "send-rental-notification",
      description: "Handles rental status change notifications",
      method: "POST",
      trigger: "Database trigger",
    },
    {
      name: "send-booking-notification",
      description: "Handles reservation status change notifications",
      method: "POST",
      trigger: "Database trigger",
    },
    {
      name: "send-chat-notification",
      description: "Handles new chat message notifications",
      method: "POST",
      trigger: "Database trigger",
    },
    {
      name: "paystack-webhook",
      description: "Processes Paystack payment webhooks",
      method: "POST",
      trigger: "External webhook",
    },
    {
      name: "create-payment-intent",
      description: "Creates payment intents for transactions",
      method: "POST",
      trigger: "API call",
    },
    {
      name: "process-notification",
      description: "Multi-channel notification delivery",
      method: "POST",
      trigger: "Internal call",
    },
  ];

  const systemFeatures = [
    {
      title: "Property Management",
      description:
        "Complete property lifecycle management from listing to tokenization",
      features: [
        "Property creation wizard",
        "Document verification",
        "AI valuations",
        "Media management",
      ],
    },
    {
      title: "User Authentication",
      description: "Secure user management with role-based access control",
      features: [
        "Multi-role support",
        "KYC verification",
        "Identity checks",
        "Session management",
      ],
    },
    {
      title: "Payment Processing",
      description:
        "Integrated payment system with escrow and revenue distribution",
      features: [
        "Paystack integration",
        "Escrow accounts",
        "Commission splitting",
        "Webhook handling",
      ],
    },
    {
      title: "Real-time Communication",
      description: "Chat system with notifications and file sharing",
      features: [
        "Multi-channel notifications",
        "Real-time messaging",
        "File attachments",
        "Push notifications",
      ],
    },
    {
      title: "Investment Platform",
      description: "Property tokenization and investment management",
      features: [
        "Token creation",
        "Investment tracking",
        "Revenue distribution",
        "Portfolio analytics",
      ],
    },
    {
      title: "Analytics & AI",
      description: "Data insights and AI-powered features",
      features: [
        "Property valuations",
        "Market analytics",
        "User behavior tracking",
        "Performance metrics",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <BookIcon className="w-8 h-8 text-blue-600" />
            Platform Documentation
          </h1>
          <p className="text-xl text-gray-600">
            Comprehensive documentation for the Relett property tokenization
            platform.
          </p>
        </div>

        <Tabs
          value={activeSection}
          onValueChange={setActiveSection}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="api">API & Functions</TabsTrigger>
            <TabsTrigger value="system">System Architecture</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {documentationSections.map((section) => (
                <Card
                  key={section.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg bg-${section.color}-100 text-${section.color}-600`}
                      >
                        {section.icon}
                      </div>
                      {section.title}
                    </CardTitle>
                    <CardDescription>{section.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link to={section.path}>
                      <Button className="w-full" variant="outline">
                        View Documentation
                        <ArrowRightIcon className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>System Features Overview</CardTitle>
                <CardDescription>
                  Key features and capabilities of the Relett platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {systemFeatures.map((feature, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {feature.description}
                      </p>
                      <div className="space-y-1">
                        {feature.features.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="text-xs text-gray-500 flex items-center gap-2"
                          >
                            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DatabaseIcon className="w-5 h-5" />
                  Database Documentation
                </CardTitle>
                <CardDescription>
                  Access detailed database schema and documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  The database documentation provides a comprehensive overview
                  of all tables, relationships, and data structures used in the
                  platform.
                </p>
                <div className="flex gap-4">
                  <Link to="/database-docs">
                    <Button>
                      <DatabaseIcon className="w-4 h-4 mr-2" />
                      View Database Docs
                    </Button>
                  </Link>
                  <Link to="/data-flow">
                    <Button variant="outline">
                      <ChartLineIcon className="w-4 h-4 mr-2" />
                      View Data Flow
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LightningIcon className="w-5 h-5" />
                  Edge Functions & API Endpoints
                </CardTitle>
                <CardDescription>
                  Serverless functions and API endpoints available in the
                  platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {edgeFunctions.map((func, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="font-mono">
                            {func.method}
                          </Badge>
                          <code className="text-sm font-semibold text-blue-600">
                            /functions/v1/{func.name}
                          </code>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {func.trigger}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {func.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GearIcon className="w-5 h-5" />
                  System Architecture
                </CardTitle>
                <CardDescription>
                  Technical architecture and system design
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">
                      Frontend Technologies
                    </h3>
                    <ul className="text-sm space-y-2 text-gray-600">
                      <li>• React 18 with TypeScript</li>
                      <li>• Vite for build tooling</li>
                      <li>• Tailwind CSS for styling</li>
                      <li>• Shadcn/ui component library</li>
                      <li>• React Query for data fetching</li>
                      <li>• React Router for navigation</li>
                    </ul>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">
                      Backend Infrastructure
                    </h3>
                    <ul className="text-sm space-y-2 text-gray-600">
                      <li>• Supabase for backend services</li>
                      <li>• PostgreSQL database</li>
                      <li>• Edge Functions (Deno runtime)</li>
                      <li>• Real-time subscriptions</li>
                      <li>• Row Level Security (RLS)</li>
                      <li>• Database triggers and functions</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Documentation;
