
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownLeft,
  Eye,
  Plus
} from 'phosphor-react';

const tokenHoldings = [
  {
    id: 1,
    propertyName: 'Downtown Commercial Plot',
    location: 'Lagos, Nigeria',
    tokensOwned: 2500,
    totalTokens: 100000,
    currentPrice: '$25.50',
    purchasePrice: '$25.00',
    totalValue: '$63,750',
    change: '+2.0%',
    changeValue: '+$1,250',
    isPositive: true
  },
  {
    id: 2,
    propertyName: 'Residential Land Parcel',
    location: 'Abuja, Nigeria',
    tokensOwned: 1800,
    totalTokens: 100000,
    currentPrice: '$17.75',
    purchasePrice: '$18.00',
    totalValue: '$31,950',
    change: '-1.4%',
    changeValue: '-$450',
    isPositive: false
  }
];

const transactionHistory = [
  {
    id: 1,
    type: 'buy',
    propertyName: 'Downtown Commercial Plot',
    tokens: 500,
    price: '$25.00',
    total: '$12,500',
    date: '2024-01-15',
    status: 'completed'
  },
  {
    id: 2,
    type: 'sell',
    propertyName: 'Agricultural Land',
    tokens: 200,
    price: '$5.50',
    total: '$1,100',
    date: '2024-01-10',
    status: 'completed'
  },
  {
    id: 3,
    type: 'buy',
    propertyName: 'Residential Land Parcel',
    tokens: 1800,
    price: '$18.00',
    total: '$32,400',
    date: '2024-01-05',
    status: 'completed'
  }
];

const Tokens = () => {
  const totalValue = tokenHoldings.reduce((sum, holding) => {
    return sum + parseFloat(holding.totalValue.replace('$', '').replace(',', ''));
  }, 0);

  const totalChange = tokenHoldings.reduce((sum, holding) => {
    return sum + parseFloat(holding.changeValue.replace(/[\$\+\,]/g, ''));
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Tokens</h1>
          <p className="text-gray-600">Track your tokenized land investments</p>
        </div>
        <Button>
          <Plus size={16} className="mr-2" />
          Buy Tokens
        </Button>
      </div>

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <Coins size={20} className="text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className={`text-xs ${totalChange >= 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
              {totalChange >= 0 ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
              {totalChange >= 0 ? '+' : ''}${Math.abs(totalChange).toLocaleString()} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
            <Eye size={20} className="text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tokenHoldings.length}</div>
            <p className="text-xs text-gray-600 mt-1">Properties with tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
            <Coins size={20} className="text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tokenHoldings.reduce((sum, holding) => sum + holding.tokensOwned, 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">Across all properties</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Holdings and Transactions */}
      <Tabs defaultValue="holdings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="holdings">Token Holdings</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>

        <TabsContent value="holdings" className="space-y-4">
          {tokenHoldings.map((holding) => (
            <Card key={holding.id}>
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{holding.propertyName}</h3>
                    <p className="text-sm text-gray-600">{holding.location}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <span>
                        <strong>{holding.tokensOwned.toLocaleString()}</strong> tokens 
                        ({((holding.tokensOwned / holding.totalTokens) * 100).toFixed(2)}% ownership)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                    <div className="text-center lg:text-right">
                      <p className="text-sm text-gray-600">Current Price</p>
                      <p className="font-semibold">{holding.currentPrice}</p>
                    </div>
                    
                    <div className="text-center lg:text-right">
                      <p className="text-sm text-gray-600">Purchase Price</p>
                      <p className="font-semibold">{holding.purchasePrice}</p>
                    </div>
                    
                    <div className="text-center lg:text-right">
                      <p className="text-sm text-gray-600">Total Value</p>
                      <p className="font-semibold text-lg">{holding.totalValue}</p>
                    </div>
                    
                    <div className="text-center lg:text-right">
                      <p className="text-sm text-gray-600">P&L</p>
                      <div className={`flex items-center justify-center lg:justify-end ${holding.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {holding.isPositive ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                        <span className="font-semibold ml-1">{holding.change}</span>
                      </div>
                      <p className={`text-sm ${holding.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {holding.changeValue}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm">Buy More</Button>
                  <Button variant="outline" size="sm">Sell</Button>
                  <Button variant="ghost" size="sm">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {transactionHistory.map((transaction) => (
            <Card key={transaction.id}>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${transaction.type === 'buy' ? 'bg-green-100' : 'bg-red-100'}`}>
                      {transaction.type === 'buy' ? 
                        <ArrowUpRight size={20} className="text-green-600" /> : 
                        <ArrowDownLeft size={20} className="text-red-600" />
                      }
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {transaction.type === 'buy' ? 'Bought' : 'Sold'} {transaction.tokens} tokens
                      </h3>
                      <p className="text-sm text-gray-600">{transaction.propertyName}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end gap-1">
                    <p className="font-semibold">{transaction.total}</p>
                    <p className="text-sm text-gray-600">@ {transaction.price} per token</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600">
                        {transaction.status}
                      </Badge>
                      <span className="text-sm text-gray-500">{transaction.date}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tokens;
