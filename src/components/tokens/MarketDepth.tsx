
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useOrderBook } from '@/hooks/useOrderBook';

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
  const { marketDepth, isLoading } = useOrderBook(tokenizedPropertyId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
          {marketDepth.buyOrders.slice(0, 5).map((order, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-green-600 font-medium">${order.price.toFixed(2)}</span>
              <span>{order.quantity}</span>
              <span className="text-gray-600">${order.total.toFixed(2)}</span>
            </div>
          ))}
          {marketDepth.buyOrders.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">No buy orders</p>
          )}
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
          {marketDepth.sellOrders.slice(0, 5).map((order, index) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="text-red-600 font-medium">${order.price.toFixed(2)}</span>
              <span>{order.quantity}</span>
              <span className="text-gray-600">${order.total.toFixed(2)}</span>
            </div>
          ))}
          {marketDepth.sellOrders.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">No sell orders</p>
          )}
        </CardContent>
      </Card>

      <div className="md:col-span-2 flex justify-center gap-4">
        <Badge variant="outline" className="px-4 py-2">
          Current Price: ${currentPrice.toFixed(2)}
        </Badge>
        {marketDepth.midPrice > 0 && (
          <Badge variant="outline" className="px-4 py-2">
            Mid Price: ${marketDepth.midPrice.toFixed(2)}
          </Badge>
        )}
        {marketDepth.spread > 0 && (
          <Badge variant="outline" className="px-4 py-2">
            Spread: ${marketDepth.spread.toFixed(2)}
          </Badge>
        )}
      </div>
    </div>
  );
}
