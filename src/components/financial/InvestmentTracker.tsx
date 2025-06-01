
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Calendar, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFinancialReports } from '@/hooks/useFinancialReports';
import type { InvestmentTracking } from '@/types/preferences';

export function InvestmentTracker() {
  const [investments, setInvestments] = useState<InvestmentTracking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPortfolioValue, setTotalPortfolioValue] = useState(0);
  const [totalROI, setTotalROI] = useState(0);
  const { toast } = useToast();
  const { reports, generateReport, isLoading: reportsLoading } = useFinancialReports();

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Simplified query without complex joins that might fail
      const { data, error } = await supabase
        .from('investment_tracking')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Transform data to match expected interface
      const transformedData: InvestmentTracking[] = (data || []).map(item => ({
        ...item,
        tokenized_property: null // Set to null since we can't guarantee the join works
      }));

      setInvestments(transformedData);
      
      // Calculate portfolio metrics
      const totalValue = transformedData.reduce((sum, inv) => sum + inv.current_value, 0);
      const totalInvested = transformedData.reduce((sum, inv) => sum + inv.investment_amount, 0);
      const overallROI = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;
      
      setTotalPortfolioValue(totalValue);
      setTotalROI(overallROI);
    } catch (error) {
      console.error('Error fetching investments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load investment data.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    await generateReport(
      'investment_summary',
      lastMonth.toISOString().split('T')[0],
      today.toISOString().split('T')[0]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading) {
    return <div className="grid gap-4">
      {[1, 2, 3].map(i => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="h-20 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall ROI</CardTitle>
            {totalROI >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalROI.toFixed(2)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{investments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2 w-full"
              onClick={handleGenerateReport}
              disabled={reportsLoading}
            >
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      {reports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Financial Reports</CardTitle>
            <CardDescription>Your latest investment performance reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reports.slice(0, 3).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{report.report_type.replace(/_/g, ' ').toUpperCase()}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(report.period_start)} - {formatDate(report.period_end)}
                    </p>
                  </div>
                  <Badge variant="outline">{report.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Investments */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Investments</h3>
        {investments.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <PieChart className="mx-auto h-12 w-12 mb-4" />
                <p>No investments found. Start investing in tokenized properties!</p>
                <Button className="mt-4" onClick={() => window.location.href = '/marketplace'}>
                  Browse Properties
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          investments.map((investment) => (
            <Card key={investment.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {investment.tokenized_property?.token_name || `Investment ${investment.id.slice(0, 8)}`}
                    </CardTitle>
                    <CardDescription>
                      {investment.tokenized_property?.token_symbol || 'TOKEN'} • {investment.tokens_owned} tokens
                    </CardDescription>
                  </div>
                  <Badge variant={investment.roi_percentage >= 0 ? 'default' : 'destructive'}>
                    {investment.roi_percentage >= 0 ? '+' : ''}{investment.roi_percentage.toFixed(2)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Initial Investment</p>
                    <p className="font-semibold">{formatCurrency(investment.investment_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Value</p>
                    <p className="font-semibold">{formatCurrency(investment.current_value)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Last Dividend</p>
                    <p className="font-semibold">{formatCurrency(investment.last_dividend_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Dividends</p>
                    <p className="font-semibold">{formatCurrency(investment.total_dividends_received)}</p>
                  </div>
                </div>

                {investment.last_dividend_date && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Last dividend: {formatDate(investment.last_dividend_date)}
                  </div>
                )}

                <Progress 
                  value={Math.max(0, Math.min(100, investment.roi_percentage + 50))} 
                  className="h-2" 
                />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
