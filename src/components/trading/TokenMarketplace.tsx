"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TradingService } from "@/lib/services/TradingService";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Activity,
  Users,
  Coins
} from "lucide-react";

interface MarketListing {
  id: string;
  tokenized_property_id: string;
  seller_id: string;
  token_amount: number;
  price_per_token: number;
  total_price: number;
  status: string;
  created_at: string;
  tokenized_property: {
    token_name: string;
    token_symbol: string;
    token_price: number;
  };
}

interface OrderBookEntry {
  price: number;
  quantity: number;
  total: number;
  type: 'buy' | 'sell';
}

interface TradeHistory {
  id: string;
  timestamp: string;
  price: number;
  quantity: number;
  type: 'buy' | 'sell';
  transaction_id?: string;
}

export function TokenMarketplace() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [orderBook, setOrderBook] = useState<{
    buys: OrderBookEntry[];
    sells: OrderBookEntry[];
  }>({ buys: [], sells: [] });
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [orderPrice, setOrderPrice] = useState<string>("");
  const [orderQuantity, setOrderQuantity] = useState<string>("");
  const [isTrading, setIsTrading] = useState(false);
  const [loading, setLoading] = useState(true);

  const tradingService = new TradingService();

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      await Promise.all([
        fetchActiveListings(),
        fetchOrderBook(),
        fetchTradeHistory()
      ]);
    } catch (error) {
      console.error('Error fetching market data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveListings = async () => {
    try {
      // Mock data for now since marketplace_listings table doesn't exist yet
      const mockListings: MarketListing[] = [
        {
          id: '1',
          tokenized_property_id: 'prop1',
          seller_id: 'seller1',
          token_amount: 100,
          price_per_token: 50,
          total_price: 5000,
          status: 'active',
          created_at: new Date().toISOString(),
          tokenized_property: {
            token_name: 'Property Token 1',
            token_symbol: 'PT1',
            token_price: 55
          }
        }
      ];
      setListings(mockListings);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const fetchOrderBook = async () => {
    if (!selectedProperty) return;

    try {
      // Mock order book data for now
      const buyOrders = [
        { price_per_token: 52, token_amount: 50 },
        { price_per_token: 51, token_amount: 75 }
      ];
      const sellOrders = [
        { price_per_token: 53, token_amount: 30 },
        { price_per_token: 54, token_amount: 40 }
      ];

      // No error handling needed for mock data

      // Aggregate orders by price
      const aggregateBuys = aggregateOrders(buyOrders || [], 'buy');
      const aggregateSells = aggregateOrders(sellOrders || [], 'sell');

      setOrderBook({
        buys: aggregateBuys,
        sells: aggregateSells
      });
    } catch (error) {
      console.error('Error fetching order book:', error);
    }
  };

  const aggregateOrders = (orders: any[], type: 'buy' | 'sell'): OrderBookEntry[] => {
    const priceMap = new Map<number, number>();
    
    orders.forEach(order => {
      const price = order.price_per_token;
      const quantity = order.token_amount;
      priceMap.set(price, (priceMap.get(price) || 0) + quantity);
    });

    return Array.from(priceMap.entries())
      .map(([price, quantity]) => ({
        price,
        quantity,
        total: price * quantity,
        type
      }))
      .slice(0, 10); // Show top 10 price levels
  };

  const fetchTradeHistory = async () => {
    if (!selectedProperty) return;

    try {
      // Mock trade history for now
      const history: TradeHistory[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          price: 52,
          quantity: 25,
          type: 'buy',
          transaction_id: 'tx_123'
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          price: 51,
          quantity: 50,
          type: 'sell',
          transaction_id: 'tx_124'
        }
      ];

      setTradeHistory(history);
    } catch (error) {
      console.error('Error fetching trade history:', error);
    }
  };

  const handleTrade = async () => {
    if (!user || !selectedProperty || !orderPrice || !orderQuantity) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsTrading(true);
    try {
      const result = await tradingService.executeTrade({
        userId: user.id,
        tokenizedPropertyId: selectedProperty,
        tokenAmount: parseInt(orderQuantity),
        pricePerToken: parseFloat(orderPrice),
        tradeType: orderType,
        orderType: 'market'
      });

      if (result.success) {
        toast({
          title: "Trade Executed",
          description: `${orderType.toUpperCase()} order for ${orderQuantity} tokens completed`,
        });
        
        // Reset form and refresh data
        setOrderPrice("");
        setOrderQuantity("");
        fetchMarketData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Trade execution error:', error);
      toast({
        title: "Trade Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsTrading(false);
    }
  };

  const handleBuyFromListing = async (listing: MarketListing) => {
    if (!user) return;

    setIsTrading(true);
    try {
      const result = await tradingService.executeTrade({
        userId: user.id,
        tokenizedPropertyId: listing.tokenized_property_id,
        tokenAmount: listing.token_amount,
        pricePerToken: listing.price_per_token,
        tradeType: 'buy',
        orderType: 'market'
      });

      if (result.success) {
        toast({
          title: "Purchase Successful",
          description: `Bought ${listing.token_amount} tokens for $${listing.total_price}`,
        });
        fetchMarketData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsTrading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Token Marketplace</h1>
          <p className="text-muted-foreground">
            Trade tokenized property shares with other investors
          </p>
        </div>
        <Badge variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          {listings.length} Active Listings
        </Badge>
      </div>

      <Tabs defaultValue="listings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="listings">Active Listings</TabsTrigger>
          <TabsTrigger value="orderbook">Order Book</TabsTrigger>
          <TabsTrigger value="trade">Place Order</TabsTrigger>
          <TabsTrigger value="history">Trade History</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <Card key={listing.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center justify-between">
                    {listing.tokenized_property.token_name}
                    <Badge variant="secondary">
                      {listing.tokenized_property.token_symbol}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Quantity</p>
                      <p className="font-semibold">{listing.token_amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Price per Token</p>
                      <p className="font-semibold">${listing.price_per_token}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Price</p>
                      <p className="font-semibold text-primary">${listing.total_price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Market Price</p>
                      <p className="font-semibold">${listing.tokenized_property.token_price}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {new Date(listing.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {listing.price_per_token < listing.tokenized_property.token_price && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Discount
                      </Badge>
                    )}
                  </div>

                  <Button 
                    onClick={() => handleBuyFromListing(listing)}
                    disabled={isTrading || listing.seller_id === user?.id}
                    className="w-full"
                  >
                    {listing.seller_id === user?.id ? "Your Listing" : "Buy Now"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {listings.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <Coins className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No active listings available</p>
                <p className="text-sm text-muted-foreground">Check back later for trading opportunities</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="orderbook" className="space-y-4">
          <div className="space-y-4">
            <div>
              <Label>Select Property</Label>
              <select 
                value={selectedProperty} 
                onChange={(e) => {
                  setSelectedProperty(e.target.value);
                  fetchOrderBook();
                }}
                className="w-full mt-1 p-2 border rounded-md"
              >
                <option value="">Select a tokenized property</option>
                {Array.from(new Set(listings.map(l => l.tokenized_property_id))).map(id => {
                  const listing = listings.find(l => l.tokenized_property_id === id);
                  return (
                    <option key={id} value={id}>
                      {listing?.tokenized_property.token_name}
                    </option>
                  );
                })}
              </select>
            </div>

            {selectedProperty && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-600">
                      <TrendingUp className="w-5 h-5" />
                      Buy Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-sm font-medium text-muted-foreground">
                        <span>Price</span>
                        <span>Quantity</span>
                        <span>Total</span>
                      </div>
                      {orderBook.buys.map((order, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2 text-sm py-1">
                          <span className="text-green-600 font-medium">${order.price}</span>
                          <span>{order.quantity.toLocaleString()}</span>
                          <span>${order.total.toLocaleString()}</span>
                        </div>
                      ))}
                      {orderBook.buys.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">No buy orders</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600">
                      <TrendingDown className="w-5 h-5" />
                      Sell Orders
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-sm font-medium text-muted-foreground">
                        <span>Price</span>
                        <span>Quantity</span>
                        <span>Total</span>
                      </div>
                      {orderBook.sells.map((order, index) => (
                        <div key={index} className="grid grid-cols-3 gap-2 text-sm py-1">
                          <span className="text-red-600 font-medium">${order.price}</span>
                          <span>{order.quantity.toLocaleString()}</span>
                          <span>${order.total.toLocaleString()}</span>
                        </div>
                      ))}
                      {orderBook.sells.length === 0 && (
                        <p className="text-muted-foreground text-center py-4">No sell orders</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="trade" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Place Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Property</Label>
                  <select 
                    value={selectedProperty} 
                    onChange={(e) => setSelectedProperty(e.target.value)}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">Select property</option>
                    {Array.from(new Set(listings.map(l => l.tokenized_property_id))).map(id => {
                      const listing = listings.find(l => l.tokenized_property_id === id);
                      return (
                        <option key={id} value={id}>
                          {listing?.tokenized_property.token_name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <Label>Order Type</Label>
                  <div className="flex gap-2 mt-1">
                    <Button
                      variant={orderType === 'buy' ? 'default' : 'outline'}
                      onClick={() => setOrderType('buy')}
                      className="flex-1"
                    >
                      Buy
                    </Button>
                    <Button
                      variant={orderType === 'sell' ? 'default' : 'outline'}
                      onClick={() => setOrderType('sell')}
                      className="flex-1"
                    >
                      Sell
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Price per Token ($)</Label>
                  <Input
                    type="number"
                    value={orderPrice}
                    onChange={(e) => setOrderPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>

                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              {orderPrice && orderQuantity && (
                <div className="p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm font-medium">Order Summary</p>
                  <div className="flex justify-between mt-2">
                    <span>Total Cost:</span>
                    <span className="font-semibold">
                      ${(parseFloat(orderPrice) * parseInt(orderQuantity || "0")).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleTrade}
                disabled={isTrading || !selectedProperty || !orderPrice || !orderQuantity}
                className="w-full"
              >
                {isTrading ? "Processing..." : `Place ${orderType.toUpperCase()} Order`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="grid grid-cols-4 gap-2 text-sm font-medium text-muted-foreground">
                  <span>Time</span>
                  <span>Type</span>
                  <span>Price</span>
                  <span>Quantity</span>
                </div>
                {tradeHistory.map((trade) => (
                  <div key={trade.id} className="grid grid-cols-4 gap-2 text-sm py-2 border-b">
                    <span>{new Date(trade.timestamp).toLocaleTimeString()}</span>
                    <Badge 
                      variant={trade.type === 'buy' ? 'default' : 'secondary'}
                      className={trade.type === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                    >
                      {trade.type.toUpperCase()}
                    </Badge>
                    <span>${trade.price}</span>
                    <span>{trade.quantity.toLocaleString()}</span>
                  </div>
                ))}
                {tradeHistory.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No trade history available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}