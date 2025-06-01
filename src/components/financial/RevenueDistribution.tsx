
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Users, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TokenizedProperty {
  id: string;
  token_name: string;
  token_symbol: string;
  total_supply: string;
  total_value_usd: number;
  token_holdings: Array<{
    id: string;
    holder_id: string;
    tokens_owned: string;
    user_profiles: {
      first_name: string;
      last_name: string;
    };
  }>;
}

interface RevenueDistribution {
  id: string;
  distribution_date: string;
  total_revenue: number;
  revenue_per_token: number;
  distribution_type: string;
  source_description: string;
  tokenized_property: {
    token_name: string;
    token_symbol: string;
  };
}

export function RevenueDistribution() {
  const [properties, setProperties] = useState<TokenizedProperty[]>([]);
  const [distributions, setDistributions] = useState<RevenueDistribution[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [distributionData, setDistributionData] = useState({
    totalRevenue: '',
    distributionType: 'rental_income',
    sourceDescription: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user is admin or property owner
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const hasAccess = roles?.some(r => r.role === 'admin' || r.role === 'landowner');
      if (!hasAccess) {
        toast({
          title: 'Access Denied',
          description: 'You need appropriate privileges to access this feature.',
          variant: 'destructive'
        });
        return;
      }

      // Fetch tokenized properties
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('tokenized_properties')
        .select(`
          *,
          token_holdings(
            id,
            holder_id,
            tokens_owned,
            user_profiles(first_name, last_name)
          )
        `)
        .eq('status', 'active');

      if (propertiesError) throw propertiesError;

      // Fetch recent distributions
      const { data: distributionsData, error: distributionsError } = await supabase
        .from('revenue_distributions')
        .select(`
          *,
          tokenized_property:tokenized_properties(token_name, token_symbol)
        `)
        .order('distribution_date', { ascending: false })
        .limit(20);

      if (distributionsError) throw distributionsError;

      setProperties(propertiesData || []);
      setDistributions(distributionsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load revenue distribution data.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createDistribution = async () => {
    if (!selectedProperty || !distributionData.totalRevenue || !distributionData.sourceDescription) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    setIsCreating(true);
    try {
      const property = properties.find(p => p.id === selectedProperty);
      if (!property) throw new Error('Property not found');

      const totalRevenue = parseFloat(distributionData.totalRevenue);
      const totalSupply = parseFloat(property.total_supply);
      const revenuePerToken = totalRevenue / totalSupply;

      // Create revenue distribution record
      const { data: distribution, error: distributionError } = await supabase
        .from('revenue_distributions')
        .insert({
          tokenized_property_id: selectedProperty,
          distribution_date: new Date().toISOString().split('T')[0],
          total_revenue: totalRevenue,
          revenue_per_token: revenuePerToken,
          distribution_type: distributionData.distributionType,
          source_description: distributionData.sourceDescription,
          metadata: {}
        })
        .select()
        .single();

      if (distributionError) throw distributionError;

      // Create dividend payment records for each token holder
      const dividendPayments = property.token_holdings.map(holding => ({
        revenue_distribution_id: distribution.id,
        token_holding_id: holding.id,
        recipient_id: holding.holder_id,
        amount: revenuePerToken * parseFloat(holding.tokens_owned),
        net_amount: revenuePerToken * parseFloat(holding.tokens_owned), // After taxes/fees
        currency: 'USD',
        status: 'pending'
      }));

      const { error: paymentsError } = await supabase
        .from('dividend_payments')
        .insert(dividendPayments);

      if (paymentsError) throw paymentsError;

      // Update investment tracking for each holder
      for (const holding of property.token_holdings) {
        const dividendAmount = revenuePerToken * parseFloat(holding.tokens_owned);
        
        const { error: trackingError } = await supabase
          .from('investment_tracking')
          .upsert({
            user_id: holding.holder_id,
            tokenized_property_id: selectedProperty,
            last_dividend_amount: dividendAmount,
            last_dividend_date: new Date().toISOString(),
            total_dividends_received: dividendAmount // This should be incremented, not replaced
          }, {
            onConflict: 'user_id,tokenized_property_id'
          });

        if (trackingError) console.error('Error updating investment tracking:', trackingError);

        // Create notification for each investor
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: holding.holder_id,
            type: 'dividend',
            title: 'Dividend Payment Available',
            message: `You've received a dividend of $${dividendAmount.toFixed(2)} from ${property.token_name}.`,
            metadata: {
              amount: dividendAmount,
              property_id: selectedProperty,
              distribution_id: distribution.id
            }
          });

        if (notificationError) console.error('Error creating notification:', notificationError);
      }

      // Reset form
      setDistributionData({
        totalRevenue: '',
        distributionType: 'rental_income',
        sourceDescription: ''
      });
      setSelectedProperty('');

      fetchData();
      toast({
        title: 'Distribution Created',
        description: `Revenue distribution of $${totalRevenue} has been processed.`,
      });
    } catch (error) {
      console.error('Error creating distribution:', error);
      toast({
        title: 'Error',
        description: 'Failed to create revenue distribution.',
        variant: 'destructive'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </CardContent>
      </Card>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Revenue Distribution</h2>
        <p className="text-muted-foreground">Distribute revenue to token holders</p>
      </div>

      {/* Create New Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Create Revenue Distribution</CardTitle>
          <CardDescription>
            Distribute revenue from property operations to token holders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="property">Select Property</Label>
              <select
                id="property"
                value={selectedProperty}
                onChange={(e) => setSelectedProperty(e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Choose a tokenized property</option>
                {properties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.token_name} ({property.token_symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="revenue">Total Revenue Amount ($)</Label>
              <Input
                id="revenue"
                type="number"
                value={distributionData.totalRevenue}
                onChange={(e) => setDistributionData(prev => ({ ...prev, totalRevenue: e.target.value }))}
                placeholder="Enter total revenue"
              />
            </div>

            <div>
              <Label htmlFor="type">Distribution Type</Label>
              <select
                id="type"
                value={distributionData.distributionType}
                onChange={(e) => setDistributionData(prev => ({ ...prev, distributionType: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="rental_income">Rental Income</option>
                <option value="property_appreciation">Property Appreciation</option>
                <option value="development_profits">Development Profits</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Source Description</Label>
              <Textarea
                id="description"
                value={distributionData.sourceDescription}
                onChange={(e) => setDistributionData(prev => ({ ...prev, sourceDescription: e.target.value }))}
                placeholder="Describe the source of this revenue (e.g., Q4 2024 rental income)"
                rows={3}
              />
            </div>
          </div>

          {selectedProperty && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Distribution Preview</h4>
              {(() => {
                const property = properties.find(p => p.id === selectedProperty);
                const totalRevenue = parseFloat(distributionData.totalRevenue) || 0;
                const totalSupply = property ? parseFloat(property.total_supply) : 0;
                const revenuePerToken = totalSupply > 0 ? totalRevenue / totalSupply : 0;
                
                return (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Total Revenue</p>
                      <p className="font-semibold">{formatCurrency(totalRevenue)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Total Tokens</p>
                      <p className="font-semibold">{totalSupply.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Revenue per Token</p>
                      <p className="font-semibold">{formatCurrency(revenuePerToken)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Token Holders</p>
                      <p className="font-semibold">{property?.token_holdings.length || 0}</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          <Button 
            onClick={createDistribution}
            disabled={isCreating || !selectedProperty || !distributionData.totalRevenue}
            className="w-full"
          >
            {isCreating ? 'Processing...' : 'Create Distribution'}
          </Button>
        </CardContent>
      </Card>

      {/* Recent Distributions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Distributions</CardTitle>
          <CardDescription>
            View history of revenue distributions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {distributions.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <DollarSign className="mx-auto h-12 w-12 mb-4" />
              <p>No revenue distributions found.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {distributions.map((distribution) => (
                <div 
                  key={distribution.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">
                      {distribution.tokenized_property.token_name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {distribution.source_description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(distribution.distribution_date).toLocaleDateString()}
                      </span>
                      <Badge variant="outline">
                        {distribution.distribution_type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {formatCurrency(distribution.total_revenue)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(distribution.revenue_per_token)} per token
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
