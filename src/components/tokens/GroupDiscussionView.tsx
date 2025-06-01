
'use client';

import { InvestmentGroupChat } from '@/components/investment/InvestmentGroupChat';

interface Property {
  id: string;
  title: string;
  location: string;
  totalTokens: number;
  ownedTokens: number;
  investorCount: number;
  tokenPrice: number;
  currentValue: number;
  totalValue: number;
  roi: number;
}

interface GroupDiscussionViewProps {
  property: Property;
  onBack: () => void;
}

export function GroupDiscussionView({ property, onBack }: GroupDiscussionViewProps) {
  const userSharePercentage = (property.ownedTokens / property.totalTokens) * 100;

  return (
    <div className="absolute inset-0 bg-white z-50">
      <InvestmentGroupChat 
        conversationId={`property-${property.id}`}
        groupName={`${property.title} Investors`}
        participantCount={property.investorCount}
      />
    </div>
  );
}
