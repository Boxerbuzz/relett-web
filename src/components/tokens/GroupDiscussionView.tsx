
'use client';

import { InvestmentGroupChat } from '@/components/investment/InvestmentGroupChat';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeftIcon, UsersIcon } from '@phosphor-icons/react';

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
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back to Portfolio
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{property.title} Investors</h1>
        <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
          <UsersIcon className="h-4 w-4 mr-2" />
          Group Discussion
        </Badge>
      </div>
      
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <UsersIcon className="w-5 h-5" />
            Investment Group Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 mb-4">
            Connect with fellow investors in {property.title}. Share insights, discuss strategies, 
            and stay updated on property developments.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Your Share: {userSharePercentage.toFixed(1)}%</Badge>
            <Badge variant="outline">Total Investors: {property.investorCount}</Badge>
            <Badge variant="outline">Your Tokens: {property.ownedTokens}</Badge>
            <Badge variant="outline">Property ROI: {property.roi > 0 ? '+' : ''}{property.roi}%</Badge>
          </div>
        </CardContent>
      </Card>
      
      <div className="max-w-4xl">
        <InvestmentGroupChat 
          conversationId={`property-${property.id}`}
          groupName={`${property.title} Investors`}
          participantCount={property.investorCount}
        />
      </div>
    </div>
  );
}
