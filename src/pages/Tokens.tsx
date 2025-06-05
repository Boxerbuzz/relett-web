'use client';

import { useState } from 'react';
import { PortfolioSummary } from '@/components/tokens/PortfolioSummary';
import { PropertyList } from '@/components/tokens/PropertyList';
import { GroupDiscussionView } from '@/components/tokens/GroupDiscussionView';
import { AnalyticsView } from '@/components/tokens/AnalyticsView';
import { PaymentHistoryView } from '@/components/tokens/PaymentHistoryView';
import { AgentChat } from '@/components/agents/AgentChat';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bot, ArrowLeft } from 'lucide-react';

type ViewMode = 'portfolio' | 'discussion' | 'analytics' | 'payments' | 'agent';

const Tokens = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('portfolio');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [showAgent, setShowAgent] = useState(false);

  const tokenizedProperties = [
    {
      id: '1',
      title: 'Downtown Commercial Plot',
      location: 'Lagos, Nigeria',
      totalTokens: 1000,
      ownedTokens: 150,
      tokenPrice: 45.0,
      currentValue: 52.5,
      totalValue: 7875,
      roi: 16.7,
      investorCount: 12,
      hasGroupChat: true
    },
    {
      id: '2',
      title: 'Luxury Apartment Complex',
      location: 'Abuja, Nigeria',
      totalTokens: 2000,
      ownedTokens: 75,
      tokenPrice: 125.0,
      currentValue: 138.75,
      totalValue: 10406.25,
      roi: 11.0,
      investorCount: 8,
      hasGroupChat: true
    },
    {
      id: '3',
      title: 'Industrial Warehouse',
      location: 'Port Harcourt, Nigeria',
      totalTokens: 500,
      ownedTokens: 25,
      tokenPrice: 200.0,
      currentValue: 185.0,
      totalValue: 4625,
      roi: -7.5,
      investorCount: 5,
      hasGroupChat: false
    }
  ];

  const totalPortfolioValue = tokenizedProperties.reduce((sum, prop) => sum + prop.totalValue, 0);
  const totalROI = tokenizedProperties.reduce((sum, prop) => sum + prop.roi, 0) / tokenizedProperties.length;
  const activeChatCount = tokenizedProperties.filter(p => p.hasGroupChat).length;

  const selectedProperty = selectedPropertyId 
    ? tokenizedProperties.find(p => p.id === selectedPropertyId)
    : null;

  const handleJoinDiscussion = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setCurrentView('discussion');
  };

  const handleViewAnalytics = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setCurrentView('analytics');
  };

  const handleViewPaymentHistory = (propertyId: string) => {
    setSelectedPropertyId(propertyId);
    setCurrentView('payments');
  };

  const handleBackToPortfolio = () => {
    setCurrentView('portfolio');
    setSelectedPropertyId(null);
    setShowAgent(false);
  };

  const handleShowAgent = () => {
    setCurrentView('agent');
    setShowAgent(true);
  };

  if (currentView === 'discussion' && selectedProperty) {
    return (
      <GroupDiscussionView 
        property={selectedProperty}
        onBack={handleBackToPortfolio}
      />
    );
  }

  if (currentView === 'analytics' && selectedPropertyId) {
    const property = tokenizedProperties.find(p => p.id === selectedPropertyId);
    if (property) {
      return (
        <AnalyticsView 
          propertyId={property.id}
          propertyTitle={property.title}
          onBack={handleBackToPortfolio}
        />
      );
    }
  }

  if (currentView === 'payments' && selectedPropertyId) {
    const property = tokenizedProperties.find(p => p.id === selectedPropertyId);
    if (property) {
      return (
        <PaymentHistoryView 
          propertyId={property.id}
          propertyTitle={property.title}
          onBack={handleBackToPortfolio}
        />
      );
    }
  }

  if (currentView === 'agent') {
    return (
      <div className="space-y-6 w-full max-w-full overflow-hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackToPortfolio}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Portfolio
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">AI Assistant</h1>
        </div>
        
        <div className="max-w-4xl">
          <AgentChat
            agentId="reservation-agent"
            context={{
              userId: "current-user-id", // This would come from auth
              propertyId: selectedPropertyId || undefined
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between min-w-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Token Portfolio</h1>
          <p className="text-gray-600">Manage your tokenized property investments</p>
        </div>
        <Button onClick={handleShowAgent} className="flex items-center gap-2">
          <Bot className="w-4 h-4" />
          AI Assistant
        </Button>
      </div>

      <PortfolioSummary 
        totalPortfolioValue={totalPortfolioValue}
        totalROI={totalROI}
        propertyCount={tokenizedProperties.length}
        activeChatCount={activeChatCount}
      />

      <PropertyList 
        properties={tokenizedProperties}
        onJoinDiscussion={handleJoinDiscussion}
        onViewAnalytics={handleViewAnalytics}
        onViewPaymentHistory={handleViewPaymentHistory}
      />
    </div>
  );
};

export default Tokens;
