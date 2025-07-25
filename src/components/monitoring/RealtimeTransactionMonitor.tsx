import React, { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { useRealtimeTransactionMonitoring } from '@/hooks/useRealtimeTransactionMonitoring';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { RefreshCw, AlertCircle, CheckCircle, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RealtimeTransactionMonitor() {
  const { user } = useAuth();
  const {
    transactions,
    portfolioBalances,
    isMonitoring,
    retryQueue,
    startMonitoring,
    stopMonitoring,
    retryTransaction,
    refreshData
  } = useRealtimeTransactionMonitoring(user?.id);

  useEffect(() => {
    if (user?.id && !isMonitoring) {
      startMonitoring();
    }
    return () => {
      if (isMonitoring) {
        stopMonitoring();
      }
    };
  }, [user?.id, isMonitoring, startMonitoring, stopMonitoring]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'pending':
      default:
        return 'secondary';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPortfolioValue = portfolioBalances.reduce((sum, balance) => sum + balance.current_value, 0);
  const pendingTransactions = transactions.filter(tx => tx.status === 'pending').length;
  const failedTransactions = transactions.filter(tx => tx.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPortfolioValue)}</div>
            <p className="text-xs text-muted-foreground">
              {portfolioBalances.length} active holdings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitoring Status</CardTitle>
            <div className={cn(
              "h-2 w-2 rounded-full",
              isMonitoring ? "bg-green-500" : "bg-gray-400"
            )} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isMonitoring ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time monitoring
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Balances */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Portfolio Balances</CardTitle>
              <CardDescription>Your current token holdings and values</CardDescription>
            </div>
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {portfolioBalances.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No token holdings found
            </div>
          ) : (
            <div className="space-y-4">
              {portfolioBalances.map((balance) => (
                <div key={balance.tokenized_property_id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{balance.property_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {balance.tokens_owned} tokens
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatCurrency(balance.current_value)}</p>
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDate(balance.last_updated)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest blockchain transactions and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions found
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(tx.status)}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium capitalize">
                          {tx.type.replace('_', ' ')}
                        </p>
                        <Badge variant={getStatusBadgeVariant(tx.status)}>
                          {tx.status}
                        </Badge>
                        {tx.retry_count && tx.retry_count > 0 && (
                          <Badge variant="outline">
                            Retry {tx.retry_count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.created_at)}
                        {tx.hedera_transaction_id && (
                          <span className="ml-2">
                            ID: {tx.hedera_transaction_id.slice(0, 8)}...
                          </span>
                        )}
                      </p>
                      {tx.error_message && (
                        <p className="text-xs text-red-500">{tx.error_message}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {tx.amount && (
                      <p className="text-sm font-medium">
                        {formatCurrency(tx.amount)}
                      </p>
                    )}
                    {tx.status === 'failed' && (
                      <Button
                        onClick={() => retryTransaction(tx.id)}
                        disabled={retryQueue.has(tx.id)}
                        variant="outline"
                        size="sm"
                      >
                        {retryQueue.has(tx.id) ? (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                            Retrying
                          </>
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry
                          </>
                        )}
                      </Button>
                    )}
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