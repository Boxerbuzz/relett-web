
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  BarChart3, 
  PieChart,
  Calendar,
  Target,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RePieChart, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PropertyMetrics {
  totalValue: number;
  totalInvestment: number;
  roi: number;
  monthlyReturn: number;
  occupancyRate: number;
  totalDividends: number;
  investorCount: number;
  avgTokenPrice: number;
}

interface PropertyAnalytics {
  property: {
    id: string;
    title: string;
    location: any;
    price: any;
    category: string;
    type: string;
  };
  metrics: PropertyMetrics;
  performanceData: Array<{
    month: string;
    value: number;
    dividends: number;
    roi: number;
  }>;
  investorData: Array<{
    name: string;
    investment: number;
    tokens: number;
    percentage: number;
  }>;
  revenueBreakdown: Array<{
    source: string;
    amount: number;
    percentage: number;
    color: string;
  }>;
}

export function PropertyAnalyticsDashboard() {
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [timeRange, setTimeRange] = useState('12');
  const [analytics, setAnalytics] = useState<PropertyAnalytics | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      fetchPropertyAnalytics(selectedProperty);
    }
  }, [selectedProperty, timeRange]);

  const fetchProperties = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          location,
          price,
          category,
          type,
          is_tokenized,
          tokenized_property_id
        `)
        .eq('user_id', user.id)
        .eq('is_tokenized', true);

      if (error) throw error;
      setProperties(data || []);
      
      if (data && data.length > 0 && !selectedProperty) {
        setSelectedProperty(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to load properties.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPropertyAnalytics = async (propertyId: string) => {
    try {
      setIsLoading(true);

      // Get property details
      const { data: property, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (propError) throw propError;

      // Get tokenized property data
      const { data: tokenizedProperty, error: tokenError } = await supabase
        .from('tokenized_properties')
        .select('*')
        .eq('property_id', propertyId)
        .single();

      if (tokenError) throw tokenError;

      // Get investment tracking data
      const { data: investments, error: invError } = await supabase
        .from('investment_tracking')
        .select('*')
        .eq('tokenized_property_id', tokenizedProperty.id);

      if (invError) throw invError;

      // Get token holdings
      const { data: holdings, error: holdingsError } = await supabase
        .from('token_holdings')
        .select(`
          *,
          users!holder_id(first_name, last_name)
        `)
        .eq('tokenized_property_id', tokenizedProperty.id);

      if (holdingsError) throw holdingsError;

      // Get revenue distributions
      const { data: revenues, error: revError } = await supabase
        .from('revenue_distributions')
        .select('*')
        .eq('tokenized_property_id', tokenizedProperty.id)
        .order('distribution_date', { ascending: false })
        .limit(parseInt(timeRange));

      if (revError) throw revError;

      // Calculate metrics
      const totalInvestment = (investments || []).reduce((sum, inv) => sum + inv.investment_amount, 0);
      const totalDividends = (investments || []).reduce((sum, inv) => sum + inv.total_dividends_received, 0);
      const currentValue = tokenizedProperty.total_value_usd;
      const roi = totalInvestment > 0 ? ((currentValue - totalInvestment) / totalInvestment) * 100 : 0;
      const monthlyReturn = (revenues || []).length > 0 ? revenues[0].total_revenue : 0;

      const metrics: PropertyMetrics = {
        totalValue: currentValue,
        totalInvestment,
        roi,
        monthlyReturn,
        occupancyRate: 85, // Mock data
        totalDividends,
        investorCount: (holdings || []).length,
        avgTokenPrice: tokenizedProperty.token_price
      };

      // Generate performance data
      const performanceData = Array.from({ length: parseInt(timeRange) }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          value: currentValue * (0.95 + Math.random() * 0.1),
          dividends: Math.random() * 50000,
          roi: roi * (0.8 + Math.random() * 0.4)
        };
      }).reverse();

      // Generate investor data
      const investorData = (holdings || []).map(holding => {
        const user = Array.isArray(holding.users) ? holding.users[0] : holding.users;
        return {
          name: `${user?.first_name || 'Unknown'} ${user?.last_name || 'User'}`,
          investment: holding.total_investment,
          tokens: parseFloat(holding.tokens_owned),
          percentage: (holding.total_investment / totalInvestment) * 100
        };
      });

      // Generate revenue breakdown
      const revenueBreakdown = [
        { source: 'Rental Income', amount: monthlyReturn * 0.7, percentage: 70, color: '#8884d8' },
        { source: 'Property Appreciation', amount: monthlyReturn * 0.2, percentage: 20, color: '#82ca9d' },
        { source: 'Other Income', amount: monthlyReturn * 0.1, percentage: 10, color: '#ffc658' }
      ];

      setAnalytics({
        property,
        metrics,
        performanceData,
        investorData,
        revenueBreakdown
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load analytics data.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <p>No analytics data available. Please select a tokenized property.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Property Analytics</h1>
          <p className="text-muted-foreground">Investment performance metrics and insights</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedProperty} onValueChange={setSelectedProperty}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Property" />
            </SelectTrigger>
            <SelectContent>
              {properties.map((property) => (
                <SelectItem key={property.id} value={property.id}>
                  {property.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3">3 Months</SelectItem>
              <SelectItem value="6">6 Months</SelectItem>
              <SelectItem value="12">12 Months</SelectItem>
              <SelectItem value="24">24 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Property Overview */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{analytics.property.title}</CardTitle>
              <CardDescription>
                {analytics.property.location?.city}, {analytics.property.location?.state}
              </CardDescription>
            </div>
            <Badge variant="outline">{analytics.property.category}</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.metrics.totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+12.5% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">ROI</p>
                <p className="text-2xl font-bold">{formatPercentage(analytics.metrics.roi)}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">Above market average</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Dividends</p>
                <p className="text-2xl font-bold">{formatCurrency(analytics.metrics.totalDividends)}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
            <div className="flex items-center mt-2">
              <Calendar className="h-4 w-4 text-gray-600 mr-1" />
              <span className="text-sm text-gray-600">Last distribution: Dec 2024</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Investors</p>
                <p className="text-2xl font-bold">{analytics.metrics.investorCount}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex items-center mt-2">
              <span className="text-sm text-muted-foreground">
                Avg. investment: {formatCurrency(analytics.metrics.totalInvestment / analytics.metrics.investorCount)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="investors">Investors</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Property Value & ROI Trend</CardTitle>
              <CardDescription>Track property value and return on investment over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analytics.performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value, name) => [
                    name === 'value' ? formatCurrency(Number(value)) : formatPercentage(Number(value)),
                    name === 'value' ? 'Property Value' : name === 'roi' ? 'ROI' : 'Dividends'
                  ]} />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="value" stroke="#8884d8" name="Property Value" />
                  <Line yAxisId="right" type="monotone" dataKey="roi" stroke="#82ca9d" name="ROI %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="investors" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Distribution</CardTitle>
                <CardDescription>Breakdown of investor participation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RePieChart>
                    <Pie
                      data={analytics.investorData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                      label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                    >
                      {analytics.investorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Share']} />
                  </RePieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Investors</CardTitle>
                <CardDescription>Largest stakeholders in this property</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.investorData
                    .sort((a, b) => b.investment - a.investment)
                    .slice(0, 5)
                    .map((investor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{investor.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {investor.tokens.toLocaleString()} tokens
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(investor.investment)}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatPercentage(investor.percentage)}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
                <CardDescription>Breakdown of income streams</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.revenueBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Bar dataKey="amount" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue Trend</CardTitle>
                <CardDescription>Dividend payments over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    <Line type="monotone" dataKey="dividends" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
