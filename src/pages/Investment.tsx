
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvestmentPortfolio } from '@/components/investment/InvestmentPortfolio';
import { InvestmentGroupManager } from '@/components/investment/InvestmentGroupManager';
import { RevenueDistributionCalculator } from '@/components/investment/RevenueDistributionCalculator';
import { PollsList } from '@/components/investment/polling/PollsList';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Calculator, 
  TrendingUp,
  Vote
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePollNotifications } from '@/hooks/usePollNotifications';

const Investment = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [activeTab, setActiveTab] = useState('portfolio');
  
  // Enable poll notifications
  usePollNotifications();

  // Handle URL parameters for direct navigation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const group = params.get('group');
    
    if (tab) setActiveTab(tab);
    if (group) setSelectedGroupId(group);
  }, []);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investment Management</h1>
          <p className="text-gray-600">Manage your property investments and revenue distributions</p>
        </div>
        <Badge className="bg-green-100 text-green-800">
          <TrendingUp className="w-4 h-4 mr-1" />
          Investment Hub
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="portfolio" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Investment Groups
          </TabsTrigger>
          <TabsTrigger value="polls" className="flex items-center gap-2">
            <Vote className="w-4 h-4" />
            Polls & Voting
            {selectedGroupId && <Badge variant="secondary" className="ml-1">Active</Badge>}
          </TabsTrigger>
          <TabsTrigger value="distributions" className="flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Revenue Distribution
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio">
          <InvestmentPortfolio />
        </TabsContent>

        <TabsContent value="groups">
          <InvestmentGroupManager onGroupSelect={setSelectedGroupId} />
        </TabsContent>

        <TabsContent value="polls">
          {selectedGroupId ? (
            <PollsList investmentGroupId={selectedGroupId} />
          ) : (
            <div className="text-center py-16 text-gray-500">
              <Vote className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Select an Investment Group</h3>
              <p>Choose an investment group from the "Investment Groups" tab to view and create polls</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="distributions">
          <RevenueDistributionCalculator />
        </TabsContent>

        <TabsContent value="analytics">
          <div className="text-center py-16 text-gray-500">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Advanced Analytics Coming Soon</h3>
            <p>Comprehensive investment analytics and insights will be available soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Investment;
