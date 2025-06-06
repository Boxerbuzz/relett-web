
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { 
  Calculator, 
  Users, 
  Download,
  Send,
  AlertCircle
} from 'lucide-react';

interface TokenHolder {
  id: string;
  holder_id: string;
  tokens_owned: string;
  total_investment: number;
  holder_email?: string;
  holder_name?: string;
}

interface DistributionCalculation {
  holder_id: string;
  holder_name: string;
  tokens_owned: number;
  ownership_percentage: number;
  revenue_share: number;
  tax_withholding: number;
  net_amount: number;
}

export function RevenueDistributionCalculator() {
  const [tokenizedProperties, setTokenizedProperties] = useState([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [tokenHolders, setTokenHolders] = useState<TokenHolder[]>([]);
  const [distributions, setDistributions] = useState<DistributionCalculation[]>([]);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  
  const [distributionData, setDistributionData] = useState({
    total_revenue: '',
    distribution_type: 'rental_income',
    source_description: '',
    tax_rate: '10', // Default 10% tax withholding
  });

  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchTokenizedProperties();
  }, []);

  useEffect(() => {
    if (selectedProperty) {
      fetchTokenHolders(selectedProperty);
    }
  }, [selectedProperty]);

  const fetchTokenizedProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('tokenized_properties')
        .select('id, token_name, token_symbol, total_supply')
        .eq('status', 'minted');

      if (error) throw error;
      setTokenizedProperties(data || []);
    } catch (error) {
      console.error('Error fetching tokenized properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tokenized properties',
        variant: 'destructive'
      });
    }
  };

  const fetchTokenHolders = async (propertyId: string) => {
    setLoading(true);
    try {
      // First get token holdings
      const { data: holdings, error: holdingsError } = await supabase
        .from('token_holdings')
        .select('*')
        .eq('tokenized_property_id', propertyId);

      if (holdingsError) throw holdingsError;

      if (!holdings || holdings.length === 0) {
        setTokenHolders([]);
        setLoading(false);
        return;
      }

      // Then get user details for each holder
      const holderIds = holdings.map(h => h.holder_id);
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, email')
        .in('id', holderIds);

      if (usersError) throw usersError;

      // Combine holdings with user details
      const holdersWithDetails = holdings.map(holding => {
        const user = users?.find(u => u.id === holding.holder_id);
        return {
          ...holding,
          holder_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : 'Unknown',
          holder_email: user?.email || ''
        };
      });

      setTokenHolders(holdersWithDetails);
    } catch (error) {
      console.error('Error fetching token holders:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch token holders',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDistribution = () => {
    if (!distributionData.total_revenue || !selectedProperty) return;

    setCalculating(true);
    
    const totalRevenue = parseFloat(distributionData.total_revenue);
    const taxRate = parseFloat(distributionData.tax_rate) / 100;
    
    // Get total tokens in circulation
    const totalTokens = tokenHolders.reduce((sum, holder) => 
      sum + parseInt(holder.tokens_owned), 0);
    
    if (totalTokens === 0) {
      toast({
        title: 'Error',
        description: 'No tokens in circulation',
        variant: 'destructive'
      });
      setCalculating(false);
      return;
    }

    // Calculate revenue per token
    const revenuePerToken = totalRevenue / totalTokens;

    // Calculate distribution for each holder
    const calculations: DistributionCalculation[] = tokenHolders.map(holder => {
      const tokensOwned = parseInt(holder.tokens_owned);
      const ownershipPercentage = (tokensOwned / totalTokens) * 100;
      const revenueShare = tokensOwned * revenuePerToken;
      const taxWithholding = revenueShare * taxRate;
      const netAmount = revenueShare - taxWithholding;

      return {
        holder_id: holder.holder_id,
        holder_name: holder.holder_name || 'Unknown',
        tokens_owned: tokensOwned,
        ownership_percentage: ownershipPercentage,
        revenue_share: revenueShare,
        tax_withholding: taxWithholding,
        net_amount: netAmount
      };
    });

    setDistributions(calculations);
    setCalculating(false);
  };

  const processDistribution = async () => {
    if (!selectedProperty || distributions.length === 0) return;

    try {
      // First, create the revenue distribution record
      const { data: revenueDistribution, error: distributionError } = await supabase
        .from('revenue_distributions')
        .insert({
          tokenized_property_id: selectedProperty,
          distribution_date: new Date().toISOString(),
          total_revenue: parseFloat(distributionData.total_revenue),
          revenue_per_token: parseFloat(distributionData.total_revenue) / 
            tokenHolders.reduce((sum, holder) => sum + parseInt(holder.tokens_owned), 0),
          distribution_type: distributionData.distribution_type,
          source_description: distributionData.source_description,
          metadata: {
            tax_rate: parseFloat(distributionData.tax_rate) / 100,
            processed_by: user?.id,
            holder_count: distributions.length
          }
        })
        .select()
        .single();

      if (distributionError) throw distributionError;

      // Create individual dividend payment records
      const dividendPayments = distributions.map(dist => ({
        revenue_distribution_id: revenueDistribution.id,
        recipient_id: dist.holder_id,
        token_holding_id: tokenHolders.find(h => h.holder_id === dist.holder_id)?.id,
        amount: dist.revenue_share,
        net_amount: dist.net_amount,
        tax_withholding: dist.tax_withholding,
        currency: 'USD',
        status: 'pending',
        payment_method: 'bank_transfer'
      }));

      const { error: paymentsError } = await supabase
        .from('dividend_payments')
        .insert(dividendPayments);

      if (paymentsError) throw paymentsError;

      toast({
        title: 'Success',
        description: `Revenue distribution processed for ${distributions.length} investors`,
      });

      // Reset form
      setDistributionData({
        total_revenue: '',
        distribution_type: 'rental_income',
        source_description: '',
        tax_rate: '10',
      });
      setDistributions([]);

    } catch (error) {
      console.error('Error processing distribution:', error);
      toast({
        title: 'Error',
        description: 'Failed to process revenue distribution',
        variant: 'destructive'
      });
    }
  };

  const exportDistribution = () => {
    if (distributions.length === 0) return;

    const csvContent = [
      ['Holder Name', 'Tokens Owned', 'Ownership %', 'Revenue Share', 'Tax Withholding', 'Net Amount'],
      ...distributions.map(dist => [
        dist.holder_name,
        dist.tokens_owned,
        dist.ownership_percentage.toFixed(2) + '%',
        '$' + dist.revenue_share.toFixed(2),
        '$' + dist.tax_withholding.toFixed(2),
        '$' + dist.net_amount.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue_distribution_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalDistribution = distributions.reduce((sum, dist) => sum + dist.revenue_share, 0);
  const totalTax = distributions.reduce((sum, dist) => sum + dist.tax_withholding, 0);
  const totalNet = distributions.reduce((sum, dist) => sum + dist.net_amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Revenue Distribution Calculator</h2>
        <p className="text-gray-600">Calculate and distribute revenue to token holders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Distribution Setup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="property-select">Tokenized Property</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger id="property-select">
                  <SelectValue placeholder="Select property" />
                </SelectTrigger>
                <SelectContent>
                  {tokenizedProperties.map((property: any) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.token_name} ({property.token_symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="total-revenue">Total Revenue ($)</Label>
              <Input
                id="total-revenue"
                type="number"
                placeholder="10000"
                value={distributionData.total_revenue}
                onChange={(e) => setDistributionData(prev => ({ 
                  ...prev, 
                  total_revenue: e.target.value 
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="distribution-type">Distribution Type</Label>
              <Select 
                value={distributionData.distribution_type} 
                onValueChange={(value) => setDistributionData(prev => ({ 
                  ...prev, 
                  distribution_type: value 
                }))}
              >
                <SelectTrigger id="distribution-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rental_income">Rental Income</SelectItem>
                  <SelectItem value="property_sale">Property Sale</SelectItem>
                  <SelectItem value="property_appreciation">Property Appreciation</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source-description">Source Description</Label>
              <Input
                id="source-description"
                placeholder="Monthly rental income for Q1 2024"
                value={distributionData.source_description}
                onChange={(e) => setDistributionData(prev => ({ 
                  ...prev, 
                  source_description: e.target.value 
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-rate">Tax Withholding (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                placeholder="10"
                value={distributionData.tax_rate}
                onChange={(e) => setDistributionData(prev => ({ 
                  ...prev, 
                  tax_rate: e.target.value 
                }))}
              />
            </div>

            <Button 
              onClick={calculateDistribution}
              disabled={!selectedProperty || !distributionData.total_revenue || calculating}
              className="w-full"
            >
              {calculating ? 'Calculating...' : 'Calculate Distribution'}
            </Button>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          {distributions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Distribution Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      ${totalDistribution.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Total Distribution</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-600">
                      ${totalTax.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Total Tax</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      ${totalNet.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">Net Distribution</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {distributions.length}
                    </p>
                    <p className="text-sm text-gray-600">Token Holders</p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button onClick={exportDistribution} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button onClick={processDistribution} className="flex-1">
                    <Send className="w-4 h-4 mr-2" />
                    Process Distribution
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Token Holders Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Token Holders
                {tokenHolders.length > 0 && (
                  <Badge variant="outline">{tokenHolders.length} holders</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : distributions.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Holder</TableHead>
                        <TableHead className="text-right">Tokens</TableHead>
                        <TableHead className="text-right">Ownership</TableHead>
                        <TableHead className="text-right">Revenue Share</TableHead>
                        <TableHead className="text-right">Tax</TableHead>
                        <TableHead className="text-right">Net Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {distributions.map((dist) => (
                        <TableRow key={dist.holder_id}>
                          <TableCell className="font-medium">
                            {dist.holder_name}
                          </TableCell>
                          <TableCell className="text-right">
                            {dist.tokens_owned.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {dist.ownership_percentage.toFixed(2)}%
                          </TableCell>
                          <TableCell className="text-right">
                            ${dist.revenue_share.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right">
                            ${dist.tax_withholding.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ${dist.net_amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : tokenHolders.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Holder</TableHead>
                        <TableHead className="text-right">Tokens Owned</TableHead>
                        <TableHead className="text-right">Total Investment</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tokenHolders.map((holder) => (
                        <TableRow key={holder.id}>
                          <TableCell className="font-medium">
                            {holder.holder_name || 'Unknown'}
                          </TableCell>
                          <TableCell className="text-right">
                            {parseInt(holder.tokens_owned).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            ${holder.total_investment.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : selectedProperty ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No token holders found</p>
                  <p className="text-sm">This property has no token holders yet</p>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Select a property to view token holders</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
