
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, ArrowLeft, Database, GitBranch, Workflow, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const DataFlow = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <div className="ml-4">
            <h1 className="text-xl font-bold text-gray-900">Data Flow & System Architecture</h1>
            <p className="text-sm text-gray-600">Understanding data movement and relationships</p>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Workflow className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold">Data Flow & System Architecture</h1>
            <p className="text-gray-600">Understanding data movement and relationships in our real estate platform</p>
          </div>
        </div>
        
        <Button onClick={() => navigate('/database-docs')} variant="outline" className="flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          View Database Documentation
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="user-journey">User Journey</TabsTrigger>
          <TabsTrigger value="property-flow">Property Flow</TabsTrigger>
          <TabsTrigger value="financial-flow">Financial Flow</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  System Architecture
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Our platform follows a modern microservices architecture with clear separation of concerns:
                </p>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold text-blue-600">Frontend Layer</h4>
                    <p className="text-sm text-gray-600">React + TypeScript with shadcn/ui components</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold text-green-600">API Layer</h4>
                    <p className="text-sm text-gray-600">Supabase Edge Functions for business logic</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold text-purple-600">Database Layer</h4>
                    <p className="text-sm text-gray-600">PostgreSQL with Row Level Security (RLS)</p>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h4 className="font-semibold text-orange-600">Blockchain Layer</h4>
                    <p className="text-sm text-gray-600">Hedera Hashgraph for tokenization and consensus</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  Data Flow Principles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">1</Badge>
                    <div>
                      <h4 className="font-semibold">Event-Driven Architecture</h4>
                      <p className="text-sm text-gray-600">Database triggers and webhooks drive system responses</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">2</Badge>
                    <div>
                      <h4 className="font-semibold">Immutable Audit Trails</h4>
                      <p className="text-sm text-gray-600">All actions are logged for compliance and security</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">3</Badge>
                    <div>
                      <h4 className="font-semibold">Blockchain Anchoring</h4>
                      <p className="text-sm text-gray-600">Critical data is anchored to Hedera for immutability</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">4</Badge>
                    <div>
                      <h4 className="font-semibold">Real-time Updates</h4>
                      <p className="text-sm text-gray-600">WebSocket connections for live data synchronization</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="user-journey">
          <Card>
            <CardHeader>
              <CardTitle>User Registration & Verification Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Badge className="bg-blue-100 text-blue-800">1</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold">User Registration</h3>
                    <p className="text-sm text-gray-600">User signs up → Triggers handle_new_user() → Creates records in users, user_profiles, accounts, notification_preferences</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Badge className="bg-green-100 text-green-800">2</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold">Identity Verification</h3>
                    <p className="text-sm text-gray-600">User uploads documents → kyc_documents table → Third-party verification → identity_verifications table → Status update triggers notifications</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Badge className="bg-purple-100 text-purple-800">3</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold">Role Assignment</h3>
                    <p className="text-sm text-gray-600">Based on verification → user_roles table → Permissions calculated → Access controls applied across platform</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Badge className="bg-orange-100 text-orange-800">4</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold">Profile Completion</h3>
                    <p className="text-sm text-gray-600">User preferences → user_preferences table → Notification settings → Saved searches → Personalized experience</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="property-flow">
          <Card>
            <CardHeader>
              <CardTitle>Property Listing & Transaction Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Badge className="bg-blue-100 text-blue-800">1</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold">Property Creation</h3>
                    <p className="text-sm text-gray-600">User starts listing → property_creation_workflows tracks progress → properties table entry → property_images upload → property_documents verification</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Badge className="bg-green-100 text-green-800">2</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold">Land Title Verification</h3>
                    <p className="text-sm text-gray-600">Land title check → land_titles table → Government verification → legal_agreements → compliance_records → Verification approval</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Badge className="bg-purple-100 text-purple-800">3</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold">Property Valuation</h3>
                    <p className="text-sm text-gray-600">AI valuation → ai_property_valuations → Professional valuation → property_valuations → Market analysis → Pricing recommendations</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Badge className="bg-orange-100 text-orange-800">4</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold">Property Goes Live</h3>
                    <p className="text-sm text-gray-600">Verification complete → Property status active → Search indexing → User notifications → property_views tracking begins</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Badge className="bg-red-100 text-red-800">5</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold">User Engagement</h3>
                    <p className="text-sm text-gray-600">property_views → property_likes → property_favorites → property_inquiries → conversations → reservations/rentals</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial-flow">
          <Card>
            <CardHeader>
              <CardTitle>Financial Transaction & Tokenization Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Badge className="bg-blue-100 text-blue-800">1</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold">Payment Processing</h3>
                    <p className="text-sm text-gray-600">User initiates payment → payment_sessions → AML checks (aml_checks) → payment_methods validation → payments table → Account balance update</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Badge className="bg-green-100 text-green-800">2</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold">Property Tokenization</h3>
                    <p className="text-sm text-gray-600">Property approved → tokenized_properties creation → Hedera token deployment → smart_contracts table → Token supply allocated</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Badge className="bg-purple-100 text-purple-800">3</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold">Investment Group Formation</h3>
                    <p className="text-sm text-gray-600">investment_groups created → Investors join → token_holdings allocated → investment_discussions active → investment_polls for decisions</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Badge className="bg-orange-100 text-orange-800">4</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold">Token Trading</h3>
                    <p className="text-sm text-gray-600">Trade request → escrow_accounts → token_transactions → Hedera consensus → token_holdings updated → investment_tracking recalculated</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Badge className="bg-red-100 text-red-800">5</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold">Revenue Distribution</h3>
                    <p className="text-sm text-gray-600">Property income → revenue_distributions → Automated calculation → dividend_payments to token holders → investment_analytics updated</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="flex items-center gap-4 p-4 border rounded-lg">
                  <Badge className="bg-teal-100 text-teal-800">6</Badge>
                  <div className="flex-1">
                    <h3 className="font-semibold">Reporting & Analytics</h3>
                    <p className="text-sm text-gray-600">financial_reports generated → portfolio_allocations analyzed → market_analytics updated → User dashboards refreshed</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Key Integration Points</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-blue-600 mb-2">Hedera Blockchain</h3>
              <p className="text-sm text-gray-600">Token creation, consensus timestamps, immutable voting records, smart contract deployment</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-green-600 mb-2">Payment Providers</h3>
              <p className="text-sm text-gray-600">Paystack, Flutterwave integration for Nigerian market, multi-currency support</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-purple-600 mb-2">Identity Verification</h3>
              <p className="text-sm text-gray-600">NIN, BVN verification through Nigerian identity APIs, document OCR processing</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-orange-600 mb-2">AI Services</h3>
              <p className="text-sm text-gray-600">Property valuation, market analysis, document processing, fraud detection</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-red-600 mb-2">Communication</h3>
              <p className="text-sm text-gray-600">Real-time chat, email notifications, SMS alerts, push notifications</p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-teal-600 mb-2">Government APIs</h3>
              <p className="text-sm text-gray-600">Land registry integration, compliance checking, regulatory reporting</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
};

export default DataFlow;
