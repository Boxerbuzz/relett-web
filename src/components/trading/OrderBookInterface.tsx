import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useOrderBook } from '@/hooks/useOrderBook';
import { TrendingUp, TrendingDown, Activity, Target, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderBookInterfaceProps {
  tokenizedPropertyId: string;
  currentPrice: number;
}

export function OrderBookInterface({ tokenizedPropertyId, currentPrice }: OrderBookInterfaceProps) {
  const {
    orders,
    marketDepth,
    isLoading,
    placeOrder,
    cancelOrder,
    calculateOptimalPrice
  } = useOrderBook(tokenizedPropertyId);

  const [orderForm, setOrderForm] = useState({
    type: 'buy' as 'buy' | 'sell',
    quantity: '',
    price: '',
    orderType: 'limit' as 'limit' | 'market'
  });

  const handlePlaceOrder = async () => {
    const quantity = parseInt(orderForm.quantity);
    const price = parseFloat(orderForm.price);

    if (!quantity || !price) return;

    await placeOrder(orderForm.type, quantity, price);
    setOrderForm({ ...orderForm, quantity: '', price: '' });
  };

  const handleMarketOrder = (type: 'buy' | 'sell') => {
    const quantity = parseInt(orderForm.quantity);
    if (!quantity) return;

    const { price } = calculateOptimalPrice(type, quantity);
    if (price > 0) {
      placeOrder(type, quantity, price);
      setOrderForm({ ...orderForm, quantity: '' });
    }
  };

  const calculateTotalDepth = (orders: typeof marketDepth.buyOrders) => {
    return orders.reduce((sum, order) => sum + order.quantity, 0);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <Activity className="w-8 h-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Order Book */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Order Book
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Spread: ${marketDepth.spread.toFixed(2)}</span>
            <span>Mid Price: ${marketDepth.midPrice.toFixed(2)}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buy Orders */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <h3 className="font-semibold text-green-600">Buy Orders</h3>
                <Badge variant="outline">
                  {calculateTotalDepth(marketDepth.buyOrders)} tokens
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground">
                  <span>Price</span>
                  <span>Size</span>
                  <span>Total</span>
                  <span>Depth</span>
                </div>
                {marketDepth.buyOrders.slice(0, 10).map((order, index) => {
                  const maxQuantity = Math.max(...marketDepth.buyOrders.map(o => o.quantity));
                  const depthPercent = (order.quantity / maxQuantity) * 100;
                  
                  return (
                    <div key={index} className="relative">
                      <div className="absolute inset-0 bg-green-500/10 rounded" 
                           style={{ width: `${depthPercent}%` }} />
                      <div className="relative grid grid-cols-4 gap-2 text-sm py-1 px-2">
                        <span className="font-medium text-green-600">
                          ${order.price.toFixed(2)}
                        </span>
                        <span>{order.quantity}</span>
                        <span>${order.total.toFixed(0)}</span>
                        <Progress value={depthPercent} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sell Orders */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="w-4 h-4 text-red-600" />
                <h3 className="font-semibold text-red-600">Sell Orders</h3>
                <Badge variant="outline">
                  {calculateTotalDepth(marketDepth.sellOrders)} tokens
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground">
                  <span>Price</span>
                  <span>Size</span>
                  <span>Total</span>
                  <span>Depth</span>
                </div>
                {marketDepth.sellOrders.slice(0, 10).map((order, index) => {
                  const maxQuantity = Math.max(...marketDepth.sellOrders.map(o => o.quantity));
                  const depthPercent = (order.quantity / maxQuantity) * 100;
                  
                  return (
                    <div key={index} className="relative">
                      <div className="absolute inset-0 bg-red-500/10 rounded" 
                           style={{ width: `${depthPercent}%` }} />
                      <div className="relative grid grid-cols-4 gap-2 text-sm py-1 px-2">
                        <span className="font-medium text-red-600">
                          ${order.price.toFixed(2)}
                        </span>
                        <span>{order.quantity}</span>
                        <span>${order.total.toFixed(0)}</span>
                        <Progress value={depthPercent} className="h-2" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trading Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Place Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="limit" onValueChange={(value) => 
            setOrderForm({ ...orderForm, orderType: value as 'limit' | 'market' })
          }>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="limit">Limit Order</TabsTrigger>
              <TabsTrigger value="market">Market Order</TabsTrigger>
            </TabsList>

            <TabsContent value="limit" className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={orderForm.type === 'buy' ? 'default' : 'outline'}
                  onClick={() => setOrderForm({ ...orderForm, type: 'buy' })}
                  className={cn(
                    orderForm.type === 'buy' && "bg-green-600 hover:bg-green-700"
                  )}
                >
                  Buy
                </Button>
                <Button
                  variant={orderForm.type === 'sell' ? 'default' : 'outline'}
                  onClick={() => setOrderForm({ ...orderForm, type: 'sell' })}
                  className={cn(
                    orderForm.type === 'sell' && "bg-red-600 hover:bg-red-700"
                  )}
                >
                  Sell
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  placeholder="Enter quantity"
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Price per Token</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Enter price"
                  value={orderForm.price}
                  onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                />
              </div>

              {orderForm.quantity && orderForm.price && (
                <div className="p-3 bg-secondary rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Total:</span>
                    <span className="font-medium">
                      ${(parseInt(orderForm.quantity) * parseFloat(orderForm.price)).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handlePlaceOrder}
                disabled={!orderForm.quantity || !orderForm.price}
                className="w-full"
              >
                Place {orderForm.type} Order
              </Button>
            </TabsContent>

            <TabsContent value="market" className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={orderForm.type === 'buy' ? 'default' : 'outline'}
                  onClick={() => setOrderForm({ ...orderForm, type: 'buy' })}
                  className={cn(
                    orderForm.type === 'buy' && "bg-green-600 hover:bg-green-700"
                  )}
                >
                  Buy
                </Button>
                <Button
                  variant={orderForm.type === 'sell' ? 'default' : 'outline'}
                  onClick={() => setOrderForm({ ...orderForm, type: 'sell' })}
                  className={cn(
                    orderForm.type === 'sell' && "bg-red-600 hover:bg-red-700"
                  )}
                >
                  Sell
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  placeholder="Enter quantity"
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })}
                />
              </div>

              {orderForm.quantity && (
                <div className="p-3 bg-secondary rounded-lg space-y-2">
                  {(() => {
                    const quantity = parseInt(orderForm.quantity);
                    const { price, impact } = calculateOptimalPrice(orderForm.type, quantity);
                    return (
                      <>
                        <div className="flex justify-between text-sm">
                          <span>Est. Price:</span>
                          <span className="font-medium">${price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Market Impact:</span>
                          <span className={cn(
                            "font-medium",
                            impact > 5 ? "text-red-600" : impact > 2 ? "text-yellow-600" : "text-green-600"
                          )}>
                            {impact.toFixed(2)}%
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total:</span>
                          <span className="font-medium">${(quantity * price).toFixed(2)}</span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              <Button 
                onClick={() => handleMarketOrder(orderForm.type)}
                disabled={!orderForm.quantity}
                className="w-full flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                Execute Market {orderForm.type}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}