
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FlowContainer } from '@/components/flows/FlowContainer';
import { getDatabaseDomains, getTablesByDomain } from '@/lib/databaseSchema';
import { 
  Database, 
  Table, 
  Search, 
  GitBranch, 
  Shield, 
  Zap, 
  Users, 
  FileText,
  Activity,
  Settings
} from 'lucide-react';

const DatabaseDocumentation = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const domains = getDatabaseDomains();
  const tablesByDomain = getTablesByDomain();

  const filteredDomains = domains.map(domain => ({
    ...domain,
    tables: domain.tables.filter(table => 
      table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(domain => domain.tables.length > 0);

  const getDomainIcon = (domainName: string) => {
    if (domainName.includes('Property')) return <FileText className="w-5 h-5" />;
    if (domainName.includes('User')) return <Users className="w-5 h-5" />;
    if (domainName.includes('Financial')) return <Activity className="w-5 h-5" />;
    if (domainName.includes('Security')) return <Shield className="w-5 h-5" />;
    if (domainName.includes('Communication')) return <GitBranch className="w-5 h-5" />;
    if (domainName.includes('Analytics')) return <Zap className="w-5 h-5" />;
    return <Database className="w-5 h-5" />;
  };

  const getDomainColor = (domainName: string) => {
    if (domainName.includes('Property')) return 'bg-blue-50 border-blue-200 text-blue-900';
    if (domainName.includes('User')) return 'bg-green-50 border-green-200 text-green-900';
    if (domainName.includes('Financial')) return 'bg-purple-50 border-purple-200 text-purple-900';
    if (domainName.includes('Security')) return 'bg-red-50 border-red-200 text-red-900';
    if (domainName.includes('Communication')) return 'bg-orange-50 border-orange-200 text-orange-900';
    if (domainName.includes('Analytics')) return 'bg-yellow-50 border-yellow-200 text-yellow-900';
    return 'bg-gray-50 border-gray-200 text-gray-900';
  };

  const edgeFunctions = [
    {
      name: 'send-inspection-notification',
      description: 'Sends notifications for inspection status changes',
      triggers: 'Database trigger on inspections table'
    },
    {
      name: 'send-rental-notification', 
      description: 'Sends notifications for rental status changes',
      triggers: 'Database trigger on rentals table'
    },
    {
      name: 'send-booking-notification',
      description: 'Sends notifications for reservation status changes', 
      triggers: 'Database trigger on reservations table'
    },
    {
      name: 'send-chat-notification',
      description: 'Sends notifications for new chat messages',
      triggers: 'Database trigger on chat_messages table'
    },
    {
      name: 'paystack-webhook',
      description: 'Processes Paystack payment webhooks and updates records',
      triggers: 'External webhook from Paystack'
    },
    {
      name: 'create-payment-intent',
      description: 'Creates payment intents for rentals and reservations',
      triggers: 'API call from frontend'
    },
    {
      name: 'process-notification',
      description: 'Processes and delivers notifications via multiple channels',
      triggers: 'Database trigger via create_notification_with_delivery function'
    }
  ];

  const databaseFunctions = [
    {
      name: 'notify_inspection_status_change()',
      description: 'Trigger function that calls inspection notification edge function',
      type: 'Trigger Function'
    },
    {
      name: 'notify_rental_status_change()',
      description: 'Trigger function that calls rental notification edge function', 
      type: 'Trigger Function'
    },
    {
      name: 'notify_reservation_status_change()',
      description: 'Trigger function that calls booking notification edge function',
      type: 'Trigger Function'
    },
    {
      name: 'notify_new_chat_message()',
      description: 'Trigger function that calls chat notification edge function',
      type: 'Trigger Function'
    },
    {
      name: 'create_notification_with_delivery()',
      description: 'Creates notifications and triggers delivery processing',
      type: 'Utility Function'
    },
    {
      name: 'track_property_interaction()',
      description: 'Tracks user interactions with properties',
      type: 'Analytics Function'
    },
    {
      name: 'update_property_analytics()',
      description: 'Updates aggregated property statistics',
      type: 'Analytics Function'
    },
    {
      name: 'has_role()',
      description: 'Checks if user has specific role',
      type: 'Security Function'
    },
    {
      name: 'can_access_property()',
      description: 'Checks if user can access specific property',
      type: 'Security Function'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            Database Documentation
          </h1>
          <p className="text-xl text-gray-600">
            Comprehensive documentation of the Relett platform database architecture, 
            including tables, relationships, functions, and edge functions.
          </p>
        </div>

        <Tabs defaultValue="schema" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schema">Interactive Schema</TabsTrigger>
            <TabsTrigger value="tables">Tables & Domains</TabsTrigger>
            <TabsTrigger value="functions">Functions & APIs</TabsTrigger>
            <TabsTrigger value="data-flow">Data Flow</TabsTrigger>
          </TabsList>

          <TabsContent value="schema" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  Interactive Database Schema
                </CardTitle>
                <CardDescription>
                  Visual representation of all database tables organized by domain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[800px] border rounded-lg">
                  <FlowContainer flowType="database" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tables" className="space-y-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search tables and descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Badge variant="secondary">
                {filteredDomains.reduce((acc, domain) => acc + domain.tables.length, 0)} tables
              </Badge>
            </div>

            <div className="grid gap-6">
              {filteredDomains.map((domain, index) => (
                <Card key={index} className={`${getDomainColor(domain.name)} border-2`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      {getDomainIcon(domain.name)}
                      {domain.name}
                      <Badge variant="outline" className="ml-auto">
                        {domain.tables.length} tables
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3">
                      {domain.tables.map((table, tableIndex) => (
                        <div key={tableIndex} className="flex items-start gap-3 p-3 bg-white/70 rounded-lg">
                          <Table className="w-4 h-4 mt-0.5 text-gray-600 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-mono text-sm font-semibold text-gray-900">
                              {table.name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {table.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="functions" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Edge Functions
                  </CardTitle>
                  <CardDescription>
                    Serverless functions for API endpoints and webhooks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {edgeFunctions.map((func, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="font-mono text-sm font-semibold text-blue-600 mb-2">
                          {func.name}
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          {func.description}
                        </div>
                        <div className="text-xs text-gray-500">
                          <strong>Triggered by:</strong> {func.triggers}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Database Functions
                  </CardTitle>
                  <CardDescription>
                    PostgreSQL functions and triggers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {databaseFunctions.map((func, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-mono text-sm font-semibold text-green-600">
                            {func.name}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {func.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          {func.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="data-flow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  System Data Flow
                </CardTitle>
                <CardDescription>
                  How data flows through the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[600px] border rounded-lg">
                  <FlowContainer flowType="system-architecture" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DatabaseDocumentation;
