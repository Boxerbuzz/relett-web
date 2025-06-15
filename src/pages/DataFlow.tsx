import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FlowSelector } from '@/components/flows/FlowSelector';
import { UserJourneyFlow } from '@/components/flows/flows/UserJourneyFlow';
import { SystemArchitectureFlow } from '@/components/flows/flows/SystemArchitectureFlow';
import { PropertyFlow } from '@/components/flows/flows/PropertyFlow';
import { FinancialFlow } from '@/components/flows/flows/FinancialFlow';

const DataFlow = () => {
  const navigate = useNavigate();
  const [activeFlow, setActiveFlow] = useState('overview');

  const renderFlowContent = () => {
    switch (activeFlow) {
      case 'user-journey':
        return <UserJourneyFlow />;
      case 'system-architecture':
        return <SystemArchitectureFlow />;
      case 'property-flow':
        return <PropertyFlow />;
      case 'financial-flow':
        return <FinancialFlow />;
      default:
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
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
                <CardTitle>Data Flow Principles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <h4 className="font-semibold">Event-Driven Architecture</h4>
                      <p className="text-sm text-gray-600">Database triggers and webhooks drive system responses</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <h4 className="font-semibold">Immutable Audit Trails</h4>
                      <p className="text-sm text-gray-600">All actions are logged for compliance and security</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <h4 className="font-semibold">Blockchain Anchoring</h4>
                      <p className="text-sm text-gray-600">Critical data is anchored to Hedera for immutability</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</div>
                    <div>
                      <h4 className="font-semibold">Real-time Updates</h4>
                      <p className="text-sm text-gray-600">WebSocket connections for live data synchronization</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
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
              <p className="text-sm text-gray-600">Interactive system workflow visualization</p>
            </div>
          </div>
          
          <Button onClick={() => navigate('/database-docs')} variant="outline" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Database Docs
          </Button>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        <FlowSelector activeFlow={activeFlow} onFlowChange={setActiveFlow} />
        
        {renderFlowContent()}

        {/* Key Integration Points */}
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
