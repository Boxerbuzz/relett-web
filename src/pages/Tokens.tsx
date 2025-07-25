
'use client';

import { PortfolioSummary } from '@/components/tokens/PortfolioSummary';
import { PropertyList } from '@/components/tokens/PropertyList';
import { GroupDiscussionView } from '@/components/tokens/GroupDiscussionView';
import { AnalyticsView } from '@/components/tokens/AnalyticsView';
import { PaymentHistoryView } from '@/components/tokens/PaymentHistoryView';
import { TokensHeader } from '@/components/tokens/TokensHeader';
import { AIAssistantView } from '@/components/tokens/AIAssistantView';
import { TokenPortfolioSkeleton } from '@/components/ui/tokens-skeleton';
import { Button } from '@/components/ui/button';
import { useTokenizedProperties } from '@/hooks/useTokenizedProperties';
import { useInvestmentPortfolio } from '@/hooks/useInvestmentPortfolio';
import { useTokensView } from '@/hooks/useTokensView';
import { useAuth } from '@/lib/auth';
import { transformTokenizedProperties } from '@/utils/tokenDataTransformer';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Tokens = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tokenizedProperties, totalPortfolioValue, totalROI, loading: tokenizedLoading, refetch: refetchTokenizedProperties } = useTokenizedProperties();
  const { portfolio, loading: portfolioLoading, refetch: refetchPortfolio } = useInvestmentPortfolio();
  
  const {
    currentView,
    selectedPropertyId,
    handleJoinDiscussion,
    handleViewAnalytics,
    handleViewPaymentHistory,
    handleBackToPortfolio,
    handleShowAgent
  } = useTokensView();

  const loading = tokenizedLoading || portfolioLoading;
  const activeChatCount = tokenizedProperties.filter(p => p.has_group_chat).length;
  const selectedProperty = selectedPropertyId 
    ? tokenizedProperties.find(p => p.id === selectedPropertyId)
    : null;

  const handleRefreshData = () => {
    refetchTokenizedProperties();
    refetchPortfolio();
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
        property={transformTokenizedProperties([selectedProperty])[0]}
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
      <AIAssistantView
        userId={user?.id || "current-user-id"}
        selectedPropertyId={selectedPropertyId}
        totalPortfolioValue={totalPortfolioValue}
        totalROI={totalROI}
        propertyCount={tokenizedProperties.length}
        onBack={handleBackToPortfolio}
      />
    );
  }

  const transformedProperties = transformTokenizedProperties(tokenizedProperties);

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <TokensHeader onShowAgent={handleShowAgent} />

      <PortfolioSummary 
        totalPortfolioValue={totalPortfolioValue}
        totalROI={totalROI}
        propertyCount={tokenizedProperties.length}
        activeChatCount={activeChatCount}
      />

      {/* Quick Access Navigation */}
      <div className="flex gap-3 mb-6">
        <Button 
          onClick={() => navigate('/trading')}
          className="flex items-center gap-2"
          variant="outline"
        >
          <BarChart3 className="w-4 h-4" />
          Advanced Trading
        </Button>
        <Button 
          onClick={() => navigate('/analytics')}
          className="flex items-center gap-2"
          variant="outline"
        >
          <TrendingUp className="w-4 h-4" />
          Portfolio Analytics
        </Button>
      </div>

      <PropertyList 
        properties={transformedProperties}
        onJoinDiscussion={handleJoinDiscussion}
        onViewAnalytics={handleViewAnalytics}
        onViewPaymentHistory={handleViewPaymentHistory}
        onRefreshData={handleRefreshData}
      />
    </div>
  );
};

export default Tokens;
