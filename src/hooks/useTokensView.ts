
import { useState } from 'react';
import { ViewMode } from '@/types/tokens';

export function useTokensView() {
  const [currentView, setCurrentView] = useState<ViewMode>('portfolio');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [showAgent, setShowAgent] = useState(false);

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

  return {
    currentView,
    selectedPropertyId,
    showAgent,
    handleJoinDiscussion,
    handleViewAnalytics,
    handleViewPaymentHistory,
    handleBackToPortfolio,
    handleShowAgent
  };
}
