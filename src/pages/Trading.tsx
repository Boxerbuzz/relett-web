'use client';

import { useState, Suspense, lazy } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  BarChart3, 
  Activity,
  DollarSign
} from 'lucide-react';
import { TokenPortfolioSkeleton } from '@/components/ui/tokens-skeleton';
import { useAuth } from '@/lib/auth';

// Lazy load heavy components for performance
const OrderBookInterface = lazy(() => import('@/components/trading/OrderBookInterface').then(module => ({ default: module.OrderBookInterface })));
const MarketDepth = lazy(() => import('@/components/tokens/MarketDepth').then(module => ({ default: module.MarketDepth })));
const PortfolioAnalyticsDashboard = lazy(() => import('@/components/analytics/PortfolioAnalyticsDashboard').then(module => ({ default: module.PortfolioAnalyticsDashboard })));

const Trading = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('orderbook');
  const [selectedTokenId, setSelectedTokenId] = useState<string>('');

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced Trading</h1>
          <p className="text-muted-foreground">Professional trading tools for tokenized property assets</p>
        </div>
        <Badge className="bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground">
          <Activity className="w-4 h-4 mr-1" />
          Trading Hub
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-1">
          <TabsTrigger value="orderbook" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Order Book
          </TabsTrigger>
          <TabsTrigger value="market-depth" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Market Depth
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Portfolio Analytics
          </TabsTrigger>
          <TabsTrigger value="trading-tools" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Trading Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orderbook">
          <Card>
            <CardHeader>
              <CardTitle>Order Book & Trade Execution</CardTitle>
              <CardDescription>
                View real-time order books and execute trades with advanced order matching
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<TokenPortfolioSkeleton />}>
                <OrderBookInterface 
                  tokenizedPropertyId={selectedTokenId} 
                  currentPrice={100} 
                />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market-depth">
          <Card>
            <CardHeader>
              <CardTitle>Market Depth Analysis</CardTitle>
              <CardDescription>
                Analyze market liquidity and price levels for informed trading decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<TokenPortfolioSkeleton />}>
                <MarketDepth 
                  tokenizedPropertyId={selectedTokenId} 
                  currentPrice={100} 
                />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Suspense fallback={<TokenPortfolioSkeleton />}>
            <PortfolioAnalyticsDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="trading-tools">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Trading Tools</CardTitle>
                <CardDescription>
                  Professional tools for algorithmic trading and risk management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16 text-muted-foreground">
                  <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">Advanced Tools Coming Soon</h3>
                  <p>Algorithmic trading, stop-loss orders, and automated strategies</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Trading;