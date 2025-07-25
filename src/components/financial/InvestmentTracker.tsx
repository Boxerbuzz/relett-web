
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Calendar, FileText, Loader2 } from 'lucide-react';
import { useTokenizedProperties } from '@/hooks/useTokenizedProperties';
import { useFinancialReports } from '@/hooks/useFinancialReports';

export function InvestmentTracker() {
  const { 
    tokenizedProperties, 
    totalPortfolioValue, 
    totalROI, 
    loading 
  } = useTokenizedProperties();
  const { reports, generateReport, isLoading: reportsLoading } = useFinancialReports();

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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading investment data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
            <div className="text-2xl font-bold">{tokenizedProperties.length}</div>
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
              {reportsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Generate Report
            </Button>
          </CardContent>
        </Card>
      </div>

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

      <InvestmentList 
        investments={tokenizedProperties}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    </div>
  );
}

function InvestmentList({ 
  investments, 
  formatCurrency, 
  formatDate 
}: { 
  investments: any[];
  formatCurrency: (amount: number) => string;
  formatDate: (dateString: string) => string;
}) {
  if (investments.length === 0) {
    return (
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
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Your Investments</h3>
      {investments.map((investment) => (
        <Card key={investment.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">
                  {investment.token_name || investment.property_title}
                </CardTitle>
                <CardDescription>
                  {investment.tokens_owned} tokens owned
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
                <p className="font-semibold">{formatCurrency(investment.total_investment)}</p>
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

            {investment.recent_dividends && investment.recent_dividends.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Recent Dividends</h4>
                <div className="space-y-1">
                  {investment.recent_dividends.slice(0, 3).map((dividend: any) => (
                    <div key={dividend.id} className="flex justify-between text-sm">
                      <span>{dividend.source_description}</span>
                      <span className="font-medium">
                        {dividend.net_amount ? formatCurrency(dividend.net_amount) : formatCurrency(dividend.revenue_per_token * parseFloat(investment.tokens_owned))}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
