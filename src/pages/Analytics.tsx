'use client';

import { Suspense, lazy } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  PieChart,
  BarChart3
} from 'lucide-react';
import { TokenPortfolioSkeleton } from '@/components/ui/tokens-skeleton';

// Lazy load unified analytics dashboard
const AnalyticsDashboard = lazy(() => import('@/components/analytics/AnalyticsDashboard').then(module => ({ default: module.AnalyticsDashboard })));

const Analytics = () => {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Portfolio Analytics</h1>
          <p className="text-muted-foreground">Comprehensive analysis of your tokenized property investments</p>
        </div>
        <Badge className="bg-gradient-to-r from-primary to-primary-foreground text-primary-foreground">
          <TrendingUp className="w-4 h-4 mr-1" />
          Analytics Hub
        </Badge>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Portfolio Performance Dashboard
            </CardTitle>
            <CardDescription>
              Real-time metrics, performance tracking, and risk analysis for your investment portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<TokenPortfolioSkeleton />}>
              <AnalyticsDashboard />
            </Suspense>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Asset Allocation
              </CardTitle>
              <CardDescription>
                Diversification analysis across property types and locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <PieChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Asset allocation charts coming soon</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Risk Metrics
              </CardTitle>
              <CardDescription>
                Volatility, Sharpe ratio, and risk-adjusted returns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Advanced risk metrics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Analytics;