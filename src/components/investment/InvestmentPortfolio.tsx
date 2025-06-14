'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Users
} from 'lucide-react';
import { useInvestmentPortfolio } from '@/hooks/useInvestmentPortfolio';
import { useAuth } from '@/lib/auth';

interface PortfolioMetrics {
  totalInvestment: number;
  currentValue: number;
  unrealizedGains: number;
  realizedGains: number;
  totalROI: number;
  monthlyIncome: number;
  activeProperties: number;
  totalTokens: number;
}

function PortfolioSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-28" />
        </div>
      </div>

      {/* Overview Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs Skeleton */}
      <div className="space-y-4">
        <div className="flex space-x-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-20" />
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-48" />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="space-y-1">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-12" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function InvestmentPortfolio() {
  const { user } = useAuth();
  const { portfolio, loading, error, refetch } = useInvestmentPortfolio();
  const [metrics, setMetrics] = useState<PortfolioMetrics | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    if (portfolio) {
      // Calculate additional metrics
      const calculatedMetrics: PortfolioMetrics = {
        totalInvestment: portfolio.totalInvestment,
        currentValue: portfolio.totalValue,
        unrealizedGains: portfolio.totalValue - portfolio.totalInvestment,
        realizedGains: 0, // This would come from completed sales
        totalROI: portfolio.totalROI,
        monthlyIncome: portfolio.upcomingPayments.reduce((sum, payment) => sum + payment.amount, 0),
        activeProperties: portfolio.properties.length,
        totalTokens: portfolio.properties.reduce((sum, prop) => sum + prop.tokensOwned, 0)
      };
      setMetrics(calculatedMetrics);
    }
  }, [portfolio]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please log in to view your investment portfolio.</p>
      </div>
    );
  }

  if (loading || !portfolio || !metrics) {
    return <PortfolioSkeleton />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-red-600">Error loading portfolio: {error}</p>
        <Button onClick={refetch} variant="outline">Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Investment Portfolio</h1>
          <p className="text-gray-600">Track your real estate investments and performance</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Export Report</Button>
          <Button size="sm">Add Investment</Button>
        </div>
      </div>

      {/* Portfolio Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Investment</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalInvestment)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Value</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.currentValue)}</p>
                <div className="flex items-center mt-1">
                  {metrics.unrealizedGains >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    metrics.unrealizedGains >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(Math.abs(metrics.unrealizedGains))}
                  </span>
                </div>
              </div>
              <PieChart className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total ROI</p>
                <p className={`text-2xl font-bold ${
                  metrics.totalROI >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(metrics.totalROI)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Income</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.monthlyIncome)}</p>
                <p className="text-xs text-gray-500 mt-1">Expected</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Details */}
      <Tabs defaultValue="properties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Holdings</CardTitle>
              <CardDescription>Your tokenized real estate investments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolio.properties.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No property investments found</p>
                    <p className="text-sm">Start investing in tokenized properties to see them here</p>
                  </div>
                ) : (
                  portfolio.properties.map((property) => (
                    <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold">{property.propertyTitle}</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                          <div>
                            <span className="text-gray-600">Tokens Owned:</span>
                            <p className="font-medium">{property.tokensOwned.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Ownership:</span>
                            <p className="font-medium">{property.ownershipPercentage.toFixed(3)}%</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Investment:</span>
                            <p className="font-medium">{formatCurrency(property.initialInvestment)}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Current Value:</span>
                            <p className="font-medium">{formatCurrency(property.currentValue)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 mt-3">
                          <Badge variant={property.roi >= 0 ? "default" : "destructive"}>
                            ROI: {formatPercentage(property.roi)}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            Next Payment: {new Date(property.nextPaymentDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm">View Details</Button>
                        <Button variant="outline" size="sm">Trade</Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest investment activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {portfolio.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'purchase' ? 'bg-green-100' : 
                        transaction.type === 'sale' ? 'bg-red-100' : 'bg-blue-100'
                      }`}>
                        {transaction.type === 'purchase' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600" />
                        ) : transaction.type === 'sale' ? (
                          <ArrowDownLeft className="h-4 w-4 text-red-600" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      
                      <div>
                        <p className="font-medium">{transaction.propertyTitle}</p>
                        <p className="text-sm text-gray-600">
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          {transaction.tokens && ` • ${transaction.tokens} tokens`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === 'purchase' ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.type === 'purchase' ? '-' : '+'}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-sm text-gray-600">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Income Streams</CardTitle>
              <CardDescription>Revenue from your property investments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolio.upcomingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{payment.propertyTitle}</p>
                      <p className="text-sm text-gray-600 capitalize">{payment.type} payment</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-green-600">{formatCurrency(payment.amount)}</p>
                      <p className="text-sm text-gray-600">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
                
                {portfolio.upcomingPayments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No upcoming payments</p>
                    <p className="text-sm">Payments will appear here when properties generate income</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Distribution</CardTitle>
                <CardDescription>Investment allocation by property</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {portfolio.properties.map((property) => {
                    const percentage = (property.initialInvestment / metrics.totalInvestment) * 100;
                    return (
                      <div key={property.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{property.propertyTitle}</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key investment indicators</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-2xl font-bold">{metrics.activeProperties}</p>
                      <p className="text-sm text-gray-600">Properties</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <p className="text-2xl font-bold">{metrics.totalTokens.toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Total Tokens</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Average ROI</span>
                      <span className="font-medium">{formatPercentage(metrics.totalROI)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Diversification Score</span>
                      <span className="font-medium">Good</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk Level</span>
                      <span className="font-medium">Moderate</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
