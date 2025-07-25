
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

const marketData = [
  {
    metric: 'Avg. Property Value',
    value: '$1.2M',
    change: '+12%',
    isPositive: true,
    period: 'vs last month'
  },
  {
    metric: 'Token Trading Volume',
    value: '$2.8M',
    change: '+24%',
    isPositive: true,
    period: 'this week'
  },
  {
    metric: 'Verification Time',
    value: '2.3 days',
    change: '-18%',
    isPositive: true,
    period: 'average'
  }
];

export function MarketInsights() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Market Insights</CardTitle>
        <CardDescription>Key metrics and trends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {marketData.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.metric}</p>
                <p className="text-xs text-gray-500">{item.period}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{item.value}</p>
                <div className={`flex items-center text-xs ${
                  item.isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {item.change}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
