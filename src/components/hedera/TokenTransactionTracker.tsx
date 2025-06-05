
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  History, 
  ExternalLink, 
  ArrowUpRight, 
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';

interface TokenTransaction {
  id: string;
  transaction_type: string;
  from_holder: string | null;
  to_holder: string;
  token_amount: string;
  price_per_token: number;
  total_value: number;
  status: string;
  hedera_transaction_id: string | null;
  blockchain_hash: string | null;
  created_at: string;
  tokenized_properties: {
    token_name: string;
    token_symbol: string;
  };
}

interface TokenTransactionTrackerProps {
  tokenizedPropertyId?: string;
  userId?: string;
}

export function TokenTransactionTracker({ 
  tokenizedPropertyId, 
  userId 
}: TokenTransactionTrackerProps) {
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, [tokenizedPropertyId, userId]);

  const fetchTransactions = async () => {
    try {
      let query = supabase
        .from('token_transactions')
        .select(`
          *,
          tokenized_properties(
            token_name,
            token_symbol
          )
        `)
        .order('created_at', { ascending: false });

      if (tokenizedPropertyId) {
        query = query.eq('tokenized_property_id', tokenizedPropertyId);
      }

      if (userId) {
        query = query.or(`from_holder.eq.${userId},to_holder.eq.${userId}`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch transaction history',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string, fromHolder: string | null, toHolder: string) => {
    if (type === 'mint') {
      return <TrendingUp className="w-4 h-4 text-green-600" />;
    }
    if (userId && fromHolder === userId) {
      return <ArrowUpRight className="w-4 h-4 text-red-600" />;
    }
    return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmed
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionDescription = (transaction: TokenTransaction) => {
    const { transaction_type, from_holder, to_holder, token_amount } = transaction;
    const amount = parseFloat(token_amount);

    if (transaction_type === 'mint') {
      return `Minted ${amount} tokens`;
    }
    if (transaction_type === 'burn') {
      return `Burned ${amount} tokens`;
    }
    if (transaction_type === 'transfer') {
      if (userId && from_holder === userId) {
        return `Sent ${amount} tokens to ${to_holder.substring(0, 8)}...`;
      }
      return `Received ${amount} tokens from ${from_holder?.substring(0, 8) || 'System'}...`;
    }
    return `${transaction_type} ${amount} tokens`;
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'all') return true;
    if (activeTab === 'sent' && userId) return transaction.from_holder === userId;
    if (activeTab === 'received' && userId) return transaction.to_holder === userId;
    if (activeTab === 'minted') return transaction.transaction_type === 'mint';
    return true;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Transaction History
        </CardTitle>
        <CardDescription>
          Track all token transactions and blockchain activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="received">Received</TabsTrigger>
            <TabsTrigger value="minted">Minted</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-6">
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <History className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No transactions found</p>
                <p className="text-sm">Transactions will appear here once you start trading</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.transaction_type, transaction.from_holder, transaction.to_holder)}
                      <div>
                        <p className="font-medium">
                          {getTransactionDescription(transaction)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {transaction.tokenized_properties?.token_symbol} • {new Date(transaction.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold">${transaction.total_value.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{parseFloat(transaction.token_amount)} tokens</p>
                      </div>
                      {getStatusBadge(transaction.status)}
                      {transaction.hedera_transaction_id && (
                        <Button size="sm" variant="outline" asChild>
                          <a 
                            href={`https://hashscan.io/testnet/transaction/${transaction.hedera_transaction_id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
