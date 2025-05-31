
'use client';

import { Button } from '@/components/ui/button';
import { InvestmentGroupChat } from '@/components/investment/InvestmentGroupChat';
import { ArrowLeft } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  location: string;
  totalTokens: number;
  ownedTokens: number;
  investorCount: number;
}

interface GroupDiscussionViewProps {
  property: Property;
  onBack: () => void;
}

export function GroupDiscussionView({ property, onBack }: GroupDiscussionViewProps) {
  const userSharePercentage = (property.ownedTokens / property.totalTokens) * 100;

  return (
    <div className="space-y-4">
      <Button 
        variant="outline" 
        onClick={onBack}
        className="flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back to Portfolio
      </Button>
      
      <InvestmentGroupChat 
        propertyId={property.id}
        propertyTitle={property.title}
        investorCount={property.investorCount}
        userSharePercentage={userSharePercentage}
      />
    </div>
  );
}
