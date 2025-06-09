
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowUpRight, ArrowDownRight, Clock, CheckCircle } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'purchase' | 'dividend' | 'sale' | 'fee';
  amount: number;
  currency: string;
  propertyName: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

const sampleTransactions: Transaction[] = [
  {
    id: '1',
    type: 'dividend',
    amount: 15000,
    currency: 'NGN',
    propertyName: 'Victoria Island Luxury Apartments',
    date: '2024-05-15',
    status: 'completed'
  },
  {
    id: '2',
    type: 'purchase',
    amount: 250000,
    currency: 'NGN',
    propertyName: 'Ikoyi Commercial Plaza',
    date: '2024-04-02',
    status: 'completed'
  },
  {
    id: '3',
    type: 'dividend',
    amount: 8500,
    currency: 'NGN',
    propertyName: 'Lekki Mixed Development',
    date: '2024-04-30',
    status: 'completed'
  },
  {
    id: '4',
    type: 'purchase',
    amount: 180000,
    currency: 'NGN',
    propertyName: 'Victoria Island Luxury Apartments',
    date: '2024-03-15',
    status: 'completed'
  }
];

export function RecentTransactions() {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your latest property investment activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sampleTransactions.map((transaction) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
