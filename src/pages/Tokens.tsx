
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InvestmentGroupChat } from '@/components/investment/InvestmentGroupChat';
import { 
  Coins, 
  TrendingUp, 
  DollarSign, 
  Users, 
  MessageSquare,
  BarChart3,
  Calendar,
  ArrowUpRight
} from 'lucide-react';

const Tokens = () => {
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  const tokenizedProperties = [
    {
      id: '1',
      title: 'Downtown Commercial Plot',
      location: 'Lagos, Nigeria',
      totalTokens: 1000,
      ownedTokens: 150,
      tokenPrice: 45.0,
      currentValue: 52.5,
      totalValue: 7875,
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
      tokenPrice: 125.0,
      currentValue: 138.75,
      totalValue: 10406.25,
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
      tokenPrice: 200.0,
      currentValue: 185.0,
      totalValue: 4625,
      roi: -7.5,
      investorCount: 5,
      hasGroupChat: false
    }
  ];

  const totalPortfolioValue = tokenizedProperties.reduce((sum, prop) => sum + prop.totalValue, 0);
  const totalROI = tokenizedProperties.reduce((sum, prop) => sum + prop.roi, 0) / tokenizedProperties.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Token Portfolio</h1>
        <p className="text-gray-600">Manage your tokenized property investments</p>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Portfolio Value</p>
                <p className="text-2xl font-bold text-green-600">${totalPortfolioValue.toLocaleString()}</p>
              </div>
              <DollarSign size={24} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average ROI</p>
                <p className={`text-2xl font-bold ${totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {totalROI.toFixed(1)}%
                </p>
              </div>
              <TrendingUp size={24} className={totalROI >= 0 ? 'text-green-600' : 'text-red-600'} />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Properties</p>
                <p className="text-2xl font-bold text-blue-600">{tokenizedProperties.length}</p>
              </div>
              <Coins size={24} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Chats</p>
                <p className="text-2xl font-bold text-purple-600">
                  {tokenizedProperties.filter(p => p.hasGroupChat).length}
                </p>
              </div>
              <MessageSquare size={24} className="text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="portfolio" className="space-y-4">
        <TabsList>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="group-chat">Group Discussions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolio" className="space-y-4">
          {tokenizedProperties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{property.title}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      {property.location}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={property.roi >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {property.roi >= 0 ? '+' : ''}{property.roi}% ROI
                    </Badge>
                    {property.hasGroupChat && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">
                        <MessageSquare size={12} className="mr-1" />
                        Group Chat
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Owned Tokens:</span>
                    <p className="font-medium">{property.ownedTokens}/{property.totalTokens}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Token Price:</span>
                    <p className="font-medium">${property.tokenPrice}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Current Value:</span>
                    <p className="font-medium">${property.currentValue}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Value:</span>
                    <p className="font-medium text-green-600">${property.totalValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Investors:</span>
                    <p className="font-medium">{property.investorCount}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" className="flex-1">
                    <BarChart3 size={16} className="mr-2" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Calendar size={16} className="mr-2" />
                    Payment History
                  </Button>
                  {property.hasGroupChat && (
                    <Button 
                      className="flex-1"
                      onClick={() => setSelectedProperty(property.id)}
                    >
                      <MessageSquare size={16} className="mr-2" />
                      Join Discussion
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1">
                    <ArrowUpRight size={16} className="mr-2" />
                    Trade Tokens
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="group-chat" className="space-y-4">
          {selectedProperty ? (
            (() => {
              const property = tokenizedProperties.find(p => p.id === selectedProperty);
              if (!property) return null;
              
              const userSharePercentage = (property.ownedTokens / property.totalTokens) * 100;
              
              return (
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedProperty(null)}
                  >
                    ← Back to All Properties
                  </Button>
                  <InvestmentGroupChat 
                    propertyId={property.id}
                    propertyTitle={property.title}
                    investorCount={property.investorCount}
                    userSharePercentage={userSharePercentage}
                  />
                </div>
              );
            })()
          ) : (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Select a property to join the discussion</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tokenizedProperties.filter(p => p.hasGroupChat).map((property) => (
                  <Card key={property.id} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setSelectedProperty(property.id)}>
                    <CardHeader>
                      <CardTitle className="text-base">{property.title}</CardTitle>
                      <CardDescription>{property.location}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-500" />
                          <span className="text-sm">{property.investorCount} investors</span>
                        </div>
                        <Badge variant="outline">
                          <MessageSquare size={12} className="mr-1" />
                          Active Chat
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600">Detailed analytics and performance metrics coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tokens;
