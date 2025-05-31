
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, DollarSign, Calendar } from 'lucide-react';

interface PaymentHistoryViewProps {
  propertyId: string;
  propertyTitle: string;
  onBack: () => void;
}

interface PaymentRecord {
  id: string;
  date: string;
  type: 'dividend' | 'rental' | 'sale' | 'expense';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
}

export function PaymentHistoryView({ propertyId, propertyTitle, onBack }: PaymentHistoryViewProps) {
  const payments: PaymentRecord[] = [
    {
      id: '1',
      date: '2024-01-15',
      type: 'dividend',
      amount: 125.50,
      description: 'Quarterly dividend payment',
      status: 'completed'
    },
    {
      id: '2',
      date: '2024-01-10',
      type: 'rental',
      amount: 1250.00,
      description: 'Monthly rental income',
      status: 'completed'
    },
    {
      id: '3',
      date: '2024-01-05',
      type: 'expense',
      amount: -180.00,
      description: 'Property maintenance',
      status: 'completed'
    },
    {
      id: '4',
      date: '2023-12-15',
      type: 'dividend',
      amount: 118.75,
      description: 'Quarterly dividend payment',
      status: 'completed'
    }
  ];

  const totalIncome = payments
    .filter(p => p.amount > 0)
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalExpenses = Math.abs(payments
    .filter(p => p.amount < 0)
    .reduce((sum, p) => sum + p.amount, 0));

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'dividend': return 'bg-green-100 text-green-800';
      case 'rental': return 'bg-blue-100 text-blue-800';
      case 'sale': return 'bg-purple-100 text-purple-800';
      case 'expense': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Button 
        variant="outline" 
        onClick={onBack}
        className="flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back to Portfolio
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{propertyTitle} - Payment History</h2>
          <p className="text-gray-600">Track all payments and transactions</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download size={16} />
          Export
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Income</p>
                <p className="text-2xl font-bold text-green-600">${totalIncome.toLocaleString()}</p>
              </div>
              <DollarSign size={24} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">${totalExpenses.toLocaleString()}</p>
              </div>
              <DollarSign size={24} className="text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            Payment Records
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <span className="font-medium">{payment.description}</span>
                    <div className="flex gap-2">
                      <Badge className={getPaymentTypeColor(payment.type)}>
                        {payment.type}
                      </Badge>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{new Date(payment.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right mt-2 sm:mt-0">
                  <p className={`text-lg font-bold ${payment.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {payment.amount >= 0 ? '+' : ''}${Math.abs(payment.amount).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
