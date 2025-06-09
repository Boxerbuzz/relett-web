
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { MarketOverview } from '@/components/dashboard/MarketOverview';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { NotificationsList } from '@/components/notifications/NotificationsList';
import { PropertyCard } from '@/components/marketplace/PropertyCard';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Bell, Home, Search } from 'lucide-react';

const sampleProperties = [
  {
    id: '1',
    title: 'Victoria Island Luxury Apartments',
    location: 'Victoria Island, Lagos',
    price: 850000,
    tokenPrice: 85,
    totalTokens: 10000,
    availableTokens: 2500,
    expectedROI: 12.5,
    investorCount: 156,
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
    isVerified: true,
    views: 1247
  },
  {
    id: '2',
    title: 'Ikoyi Commercial Plaza',
    location: 'Ikoyi, Lagos',
    price: 1200000,
    tokenPrice: 80,
    totalTokens: 15000,
    availableTokens: 3200,
    expectedROI: 15.2,
    investorCount: 98,
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
    isVerified: true,
    views: 892
  },
  {
    id: '3',
    title: 'Lekki Mixed Development',
    location: 'Lekki Phase 1, Lagos',
    price: 650000,
    tokenPrice: 81.25,
    totalTokens: 8000,
    availableTokens: 1800,
    expectedROI: 18.7,
    investorCount: 67,
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop',
    isVerified: true,
    views: 654
  }
];

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const handleViewDetails = (propertyId: string) => {
    console.log('View details for property:', propertyId);
    // Navigate to property details page
  };

  const handleInvest = (propertyId: string) => {
    console.log('Invest in property:', propertyId);
    // Open investment dialog
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your investment overview</p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          Live Data
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="market" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Market
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="properties" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Explore
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Dashboard />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RecentTransactions />
            <NotificationsList />
          </div>
        </TabsContent>

        <TabsContent value="market" className="space-y-6">
          <MarketOverview />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationsList />
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Featured Investment Opportunities</CardTitle>
              <CardDescription>
                Discover verified properties available for tokenized investment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sampleProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    {...property}
                    onViewDetails={handleViewDetails}
                    onInvest={handleInvest}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;
