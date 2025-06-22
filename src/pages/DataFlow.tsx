
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlowContainer } from '@/components/flows/FlowContainer';
import { 
  GitBranch, 
  Database, 
  Zap, 
  Users, 
  CreditCard,
  MessageSquare,
  Activity
} from 'lucide-react';

const DataFlow = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-600" />
            Data Flow Documentation
          </h1>
          <p className="text-xl text-gray-600">
            Visual representation of how data flows through the Relett platform across different processes.
          </p>
        </div>

        <Tabs defaultValue="system" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="system">System Architecture</TabsTrigger>
            <TabsTrigger value="user-journey">User Journey</TabsTrigger>
            <TabsTrigger value="property">Property Flow</TabsTrigger>
            <TabsTrigger value="financial">Financial Flow</TabsTrigger>
            <TabsTrigger value="database">Database Schema</TabsTrigger>
          </TabsList>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  System Architecture Flow
                </CardTitle>
                <CardDescription>
                  High-level overview of how different system components interact
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[700px] border rounded-lg">
                  <FlowContainer flowType="system-architecture" />
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Frontend Layer</h4>
                    <p className="text-blue-700">React app with real-time features, responsive design, and interactive components.</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-2">Backend Services</h4>
                    <p className="text-green-700">Supabase edge functions, database triggers, and real-time subscriptions.</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-semibold text-purple-900 mb-2">External APIs</h4>
                    <p className="text-purple-700">Payment processing, notifications, AI services, and blockchain integration.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user-journey" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Journey Flow
                </CardTitle>
                <CardDescription>
                  How users interact with the platform from registration to investment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[700px] border rounded-lg">
                  <FlowContainer flowType="user-journey" />
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Key User Flows:</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Registration → KYC Verification → Property Discovery</li>
                    <li>• Property Listing → Document Upload → Verification Process</li>
                    <li>• Investment → Payment Processing → Token Holdings</li>
                    <li>• Communication → Chat Systems → Notifications</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="property" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Property Management Flow
                </CardTitle>
                <CardDescription>
                  Property lifecycle from creation to tokenization and investment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[700px] border rounded-lg">
                  <FlowContainer flowType="property" />
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-orange-900 mb-2">Property Creation</h4>
                    <p className="text-orange-700">Multi-step wizard for property listing with document verification and AI valuation.</p>
                  </div>
                  <div className="p-4 bg-teal-50 rounded-lg">
                    <h4 className="font-semibold text-teal-900 mb-2">Tokenization Process</h4>
                    <p className="text-teal-700">Convert verified properties into investable tokens with legal compliance.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Financial & Payment Flow
                </CardTitle>
                <CardDescription>
                  Payment processing, escrow management, and revenue distribution
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[700px] border rounded-lg">
                  <FlowContainer flowType="financial" />
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-4 bg-red-50 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">Payment Processing</h4>
                    <p className="text-red-700">Paystack integration with webhook handling for real-time payment updates.</p>
                  </div>
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 mb-2">Escrow Management</h4>
                    <p className="text-yellow-700">Secure fund holding during property transactions and investments.</p>
                  </div>
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h4 className="font-semibold text-indigo-900 mb-2">Revenue Distribution</h4>
                    <p className="text-indigo-700">Automated dividend payments to token holders and commission distribution.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Schema Relationships
                </CardTitle>
                <CardDescription>
                  Interactive view of database tables and their relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[700px] border rounded-lg">
                  <FlowContainer flowType="database" />
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Database Architecture:</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• <strong>Property Core:</strong> Properties, images, documents, valuations</li>
                    <li>• <strong>User Management:</strong> Authentication, roles, verification, KYC</li>
                    <li>• <strong>Financial System:</strong> Payments, escrow, revenue distribution</li>
                    <li>• <strong>Communication:</strong> Chat, notifications, messaging</li>
                    <li>• <strong>Analytics:</strong> Tracking, performance, AI insights</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DataFlow;
