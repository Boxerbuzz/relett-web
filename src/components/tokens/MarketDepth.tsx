
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MarketOrder {
  price: number;
  quantity: number;
  total: number;
}

interface MarketDepthProps {
  tokenizedPropertyId: string;
  currentPrice: number;
}

export function MarketDepth({ tokenizedPropertyId, currentPrice }: MarketDepthProps) {
  const [buyOrders, setBuyOrders] = useState<MarketOrder[]>([]);
  const [sellOrders, setSellOrders] = useState<MarketOrder[]>([]);

  useEffect(() => {
    // Mock market depth data - in real implementation, this would come from database
    const mockBuyOrders: MarketOrder[] = [
      { price: currentPrice - 0.5, quantity: 100, total: 100 * (currentPrice - 0.5) },
      { price: currentPrice - 1.0, quantity: 250, total: 250 * (currentPrice - 1.0) },
      { price: currentPrice - 1.5, quantity: 150, total: 150 * (currentPrice - 1.5) },
    ];

    const mockSellOrders: MarketOrder[] = [
      { price: currentPrice + 0.5, quantity: 80, total: 80 * (currentPrice + 0.5) },
      { price: currentPrice + 1.0, quantity: 200, total: 200 * (currentPrice + 1.0) },
      { price: currentPrice + 1.5, quantity: 120, total: 120 * (currentPrice + 1.5) },
    ];

    setBuyOrders(mockBuyOrders);
    setSellOrders(mockSellOrders);
  }, [currentPrice, tokenizedPropertyId]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            Buy Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {buyOrders.map((order, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-green-600 font-medium">${order.price.toFixed(2)}</span>
              <span>{order.quantity}</span>
              <span className="text-gray-600">${order.total.toFixed(2)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            Sell Orders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sellOrders.map((order, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-red-600 font-medium">${order.price.toFixed(2)}</span>
              <span>{order.quantity}</span>
              <span className="text-gray-600">${order.total.toFixed(2)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="md:col-span-2 flex justify-center">
        <Badge variant="outline" className="px-4 py-2">
          Current Price: ${currentPrice.toFixed(2)}
        </Badge>
      </div>
    </div>
  );
}
