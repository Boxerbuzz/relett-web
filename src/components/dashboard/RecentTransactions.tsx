
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface Transaction {
  id: string;
  type: 'purchase' | 'dividend' | 'sale' | 'fee';
  amount: number;
  currency: string;
  propertyName: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export function RecentTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      // Fetch dividend payments with property names
      const { data: dividendData, error: dividendError } = await supabase
        .from('dividend_payments')
        .select(`
          id,
          amount,
          currency,
          paid_at,
          status,
          token_holdings!inner(
            tokenized_properties!inner(
              token_name
            )
          )
        `)
        .eq('recipient_id', user?.id || '')
        .order('paid_at', { ascending: false })
        .limit(5);

      if (dividendError) throw dividendError;

      // Fetch token purchases
      const { data: tokenData, error: tokenError } = await supabase
        .from('token_holdings')
        .select(`
          id,
          total_investment,
          acquisition_date,
          tokenized_properties!inner(
            token_name
          )
        `)
        .eq('holder_id', user?.id || '')
        .order('acquisition_date', { ascending: false })
        .limit(3);

      if (tokenError) throw tokenError;

      // Format transactions
      const formattedTransactions: Transaction[] = [
        ...(dividendData || []).map(payment => ({
          id: payment.id,
          type: 'dividend' as const,
          amount: payment.amount,
          currency: payment.currency,
          propertyName: payment.token_holdings.tokenized_properties.token_name,
          date: payment.paid_at || '',
          status: payment.status === 'paid' ? 'completed' as const : 'pending' as const
        })),
        ...(tokenData || []).map(holding => ({
          id: holding.id,
          type: 'purchase' as const,
          amount: holding.total_investment,
          currency: 'USD',
          propertyName: holding.tokenized_properties.token_name,
          date: holding.acquisition_date,
          status: 'completed' as const
        }))
      ];

      // Sort by date
      formattedTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setTransactions(formattedTransactions.slice(0, 4));
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'dividend':
        return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case 'purchase':
        return <ArrowUpRight className="h-4 w-4 text-blue-600" />;
      case 'sale':
        return <ArrowUpRight className="h-4 w-4 text-orange-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case 'pending':
        return <Clock className="h-3 w-3 text-yellow-600" />;
      default:
        return <Clock className="h-3 w-3 text-red-600" />;
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency === 'NGN' ? 'NGN' : 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Loading your latest activity...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-3 w-24 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="h-4 w-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest property investment activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>No transactions yet</p>
              <p className="text-sm">Your investment activity will appear here</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.type)}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm truncate">{transaction.propertyName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600 capitalize">{transaction.type}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-600">{new Date(transaction.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className={`font-medium text-sm ${
                      transaction.type === 'dividend' ? 'text-green-600' : 
                      transaction.type === 'purchase' ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {transaction.type === 'dividend' ? '+' : '-'}{formatAmount(transaction.amount, transaction.currency)}
                    </p>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(transaction.status)}
                      <span className="text-xs text-gray-600 capitalize">{transaction.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
