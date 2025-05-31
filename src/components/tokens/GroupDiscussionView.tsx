
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
    <div className="h-screen flex flex-col">
      <InvestmentGroupChat 
        propertyId={property.id}
        propertyTitle={property.title}
        propertyLocation={property.location}
        investorCount={property.investorCount}
        userSharePercentage={userSharePercentage}
        tokenPrice={property.tokenPrice}
        currentValue={property.currentValue}
        totalValue={property.totalValue}
        roi={property.roi}
        ownedTokens={property.ownedTokens}
        totalTokens={property.totalTokens}
        onBack={onBack}
      />
    </div>
  );
}
