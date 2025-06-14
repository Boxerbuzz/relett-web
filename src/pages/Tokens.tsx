
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
import { useTokenizedProperties } from '@/hooks/useTokenizedProperties';
import { useInvestmentPortfolio } from '@/hooks/useInvestmentPortfolio';
import { useAuth } from '@/lib/auth';
import { Bot, ArrowLeft, Brain } from 'lucide-react';

type ViewMode = 'portfolio' | 'discussion' | 'analytics' | 'payments' | 'agent';

const Tokens = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('portfolio');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [showAgent, setShowAgent] = useState(false);
  
  const { user } = useAuth();
  const { tokenizedProperties, totalPortfolioValue, totalROI, loading: tokenizedLoading } = useTokenizedProperties();
  const { portfolio, loading: portfolioLoading } = useInvestmentPortfolio();

  const loading = tokenizedLoading || portfolioLoading;

  const activeChatCount = tokenizedProperties.filter(p => p.has_group_chat).length;

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
        property={{
          id: selectedProperty.id,
          title: selectedProperty.property_title || selectedProperty.token_name,
          location: selectedProperty.property_location?.address || 'Unknown Location',
          totalTokens: parseInt(selectedProperty.total_supply),
          ownedTokens: parseInt(selectedProperty.tokens_owned),
          tokenPrice: selectedProperty.token_price,
          currentValue: selectedProperty.current_value,
          totalValue: selectedProperty.current_value,
          roi: selectedProperty.roi_percentage,
          investorCount: selectedProperty.investor_count,
          hasGroupChat: selectedProperty.has_group_chat
        }}
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
          propertyTitle={property.property_title || property.token_name}
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
          propertyTitle={property.property_title || property.token_name}
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
              userId: user?.id || "current-user-id",
              propertyId: selectedPropertyId || undefined,
              metadata: {
                portfolio_value: totalPortfolioValue,
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
        totalPortfolioValue={totalPortfolioValue}
        totalROI={totalROI}
        propertyCount={tokenizedProperties.length}
        activeChatCount={activeChatCount}
      />

      <PropertyList 
        properties={tokenizedProperties.map(prop => ({
          id: prop.id,
          title: prop.property_title || prop.token_name,
          location: prop.property_location?.address || 'Unknown Location',
          totalTokens: parseInt(prop.total_supply),
          ownedTokens: parseInt(prop.tokens_owned),
          tokenPrice: prop.token_price,
          currentValue: prop.current_value,
          totalValue: prop.current_value,
          roi: prop.roi_percentage,
          investorCount: prop.investor_count,
          hasGroupChat: prop.has_group_chat
        }))}
        onJoinDiscussion={handleJoinDiscussion}
        onViewAnalytics={handleViewAnalytics}
        onViewPaymentHistory={handleViewPaymentHistory}
      />
    </div>
  );
};

export default Tokens;
