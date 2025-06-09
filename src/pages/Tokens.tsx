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
import { TokenPortfolioSkeleton } from '@/components/ui/tokens-skeleton';
import { Bot, ArrowLeft, Brain } from 'lucide-react';

type ViewMode = 'portfolio' | 'discussion' | 'analytics' | 'payments' | 'agent';

const Tokens = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('portfolio');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [showAgent, setShowAgent] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulate loading for demo
  useState(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  });

  const tokenizedProperties = [
    {
      id: '1',
      title: 'Downtown Commercial Plot',
      location: 'Lagos, Nigeria',
      totalTokens: 1000,
      ownedTokens: 150,
      tokenPrice: 4500.0, // Amount in kobo (₦45.00)
      currentValue: 5250.0, // Amount in kobo (₦52.50)
      totalValue: 787500, // Amount in kobo (₦7,875.00)
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
      tokenPrice: 12500.0, // Amount in kobo (₦125.00)
      currentValue: 13875.0, // Amount in kobo (₦138.75)
      totalValue: 1040625, // Amount in kobo (₦10,406.25)
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
      tokenPrice: 20000.0, // Amount in kobo (₦200.00)
      currentValue: 18500.0, // Amount in kobo (₦185.00)
      totalValue: 462500, // Amount in kobo (₦4,625.00)
      roi: -7.5,
      investorCount: 5,
      hasGroupChat: false
    }
  ];

  // Convert kobo to naira for display
  const convertKoboToNaira = (kobo: number) => kobo / 100;

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

  if (loading) {
    return (
      <div className="space-y-6 w-full max-w-full overflow-hidden">
        <TokenPortfolioSkeleton />
      </div>
    );
  }

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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">AI Investment Assistant</h1>
          <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
            <Brain className="w-3 h-3 mr-1" />
            Learning AI
          </Badge>
        </div>
        
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Brain className="w-5 h-5" />
              Adaptive AI Assistant
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 mb-4">
              This AI assistant learns from your interactions to provide personalized investment advice, 
              property recommendations, and portfolio insights tailored to your preferences and behavior.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Personalized Recommendations</Badge>
              <Badge variant="outline">Learning from Feedback</Badge>
              <Badge variant="outline">Adaptive Communication</Badge>
              <Badge variant="outline">Portfolio Optimization</Badge>
            </div>
          </CardContent>
        </Card>
        
        <div className="max-w-4xl">
          <AgentChat
            agentId="adaptive-property-agent"
            context={{
              userId: "current-user-id", // This would come from auth
              propertyId: selectedPropertyId || undefined,
              metadata: {
                portfolio_value: convertKoboToNaira(totalPortfolioValue),
                portfolio_roi: totalROI,
                property_count: tokenizedProperties.length,
                context: 'token_portfolio'
              }
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
        <Button onClick={handleShowAgent} className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
          <Brain className="w-4 h-4" />
          AI Assistant
          <Badge className="bg-yellow-400 text-yellow-900 ml-1">Learning</Badge>
        </Button>
      </div>

      <PortfolioSummary 
        totalPortfolioValue={convertKoboToNaira(totalPortfolioValue)}
        totalROI={totalROI}
        propertyCount={tokenizedProperties.length}
        activeChatCount={activeChatCount}
      />

      <PropertyList 
        properties={tokenizedProperties.map(prop => ({
          ...prop,
          tokenPrice: convertKoboToNaira(prop.tokenPrice),
          currentValue: convertKoboToNaira(prop.currentValue),
          totalValue: convertKoboToNaira(prop.totalValue)
        }))}
        onJoinDiscussion={handleJoinDiscussion}
        onViewAnalytics={handleViewAnalytics}
        onViewPaymentHistory={handleViewPaymentHistory}
      />
    </div>
  );
};

export default Tokens;
