import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Order {
  id: string;
  tokenized_property_id: string;
  user_id: string;
  order_type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  status: 'active' | 'filled' | 'cancelled' | 'partial';
  filled_quantity: number;
  created_at: string;
  updated_at: string;
}

interface OrderMatch {
  buy_order_id: string;
  sell_order_id: string;
  quantity: number;
  price: number;
  executed_at: string;
}

interface MarketDepthData {
  buyOrders: Array<{ price: number; quantity: number; total: number; count: number }>;
  sellOrders: Array<{ price: number; quantity: number; total: number; count: number }>;
  spread: number;
  midPrice: number;
}

export function useOrderBook(tokenizedPropertyId: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [marketDepth, setMarketDepth] = useState<MarketDepthData>({
    buyOrders: [],
    sellOrders: [],
    spread: 0,
    midPrice: 0
  });
  const [recentTrades, setRecentTrades] = useState<OrderMatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings' as any)
        .select('*')
        .eq('tokenized_property_id', tokenizedPropertyId)
        .eq('status', 'active')
        .order('price', { ascending: false });

      if (error) throw error;

      const transformedOrders: Order[] = (data || []).map((listing: any) => ({
        id: listing.id,
        tokenized_property_id: listing.tokenized_property_id,
        user_id: listing.seller_id,
        order_type: 'sell' as const,
        quantity: listing.token_amount,
        price: listing.price_per_token,
        total: listing.token_amount * listing.price_per_token,
        status: 'active' as const,
        filled_quantity: 0,
        created_at: listing.created_at,
        updated_at: listing.updated_at
      }));

      setOrders(transformedOrders);
      calculateMarketDepth(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order book data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [tokenizedPropertyId, toast]);

  const calculateMarketDepth = useCallback((orderList: Order[]) => {
    const buyOrders = orderList.filter(o => o.order_type === 'buy');
    const sellOrders = orderList.filter(o => o.order_type === 'sell');

    // Aggregate orders by price
    const buyLevels = new Map<number, { quantity: number; count: number }>();
    const sellLevels = new Map<number, { quantity: number; count: number }>();

    buyOrders.forEach(order => {
      const existing = buyLevels.get(order.price) || { quantity: 0, count: 0 };
      buyLevels.set(order.price, {
        quantity: existing.quantity + order.quantity,
        count: existing.count + 1
      });
    });

    sellOrders.forEach(order => {
      const existing = sellLevels.get(order.price) || { quantity: 0, count: 0 };
      sellLevels.set(order.price, {
        quantity: existing.quantity + order.quantity,
        count: existing.count + 1
      });
    });

    // Convert to sorted arrays
    const buyDepth = Array.from(buyLevels.entries())
      .map(([price, { quantity, count }]) => ({
        price,
        quantity,
        total: price * quantity,
        count
      }))
      .sort((a, b) => b.price - a.price);

    const sellDepth = Array.from(sellLevels.entries())
      .map(([price, { quantity, count }]) => ({
        price,
        quantity,
        total: price * quantity,
        count
      }))
      .sort((a, b) => a.price - b.price);

    // Calculate spread and mid price
    const bestBid = buyDepth[0]?.price || 0;
    const bestAsk = sellDepth[0]?.price || 0;
    const spread = bestAsk - bestBid;
    const midPrice = bestAsk && bestBid ? (bestAsk + bestBid) / 2 : 0;

    setMarketDepth({
      buyOrders: buyDepth,
      sellOrders: sellDepth,
      spread,
      midPrice
    });
  }, []);

  const placeOrder = useCallback(async (
    orderType: 'buy' | 'sell',
    quantity: number,
    price: number
  ) => {
    try {
      // For now, use marketplace_listings for sell orders
      if (orderType === 'sell') {
        const { error } = await supabase
          .from('marketplace_listings' as any)
          .insert({
            tokenized_property_id: tokenizedPropertyId,
            seller_id: (await supabase.auth.getUser()).data.user?.id,
            token_amount: quantity,
            price_per_token: price,
            total_price: quantity * price,
            status: 'active'
          });

        if (error) throw error;
      }

      await fetchOrders();
      
      toast({
        title: "Order Placed",
        description: `${orderType} order for ${quantity} tokens at $${price} placed successfully`
      });
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive"
      });
    }
  }, [tokenizedPropertyId, fetchOrders, toast]);

  const cancelOrder = useCallback(async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings' as any)
        .update({ status: 'cancelled' })
        .eq('id', orderId);

      if (error) throw error;

      await fetchOrders();
      
      toast({
        title: "Order Cancelled",
        description: "Order cancelled successfully"
      });
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast({
        title: "Error",
        description: "Failed to cancel order",
        variant: "destructive"
      });
    }
  }, [fetchOrders, toast]);

  const calculateOptimalPrice = useCallback((
    orderType: 'buy' | 'sell',
    quantity: number
  ): { price: number; impact: number } => {
    const relevantOrders = orderType === 'buy' 
      ? marketDepth.sellOrders 
      : marketDepth.buyOrders;

    let remainingQuantity = quantity;
    let totalCost = 0;
    let avgPrice = 0;

    for (const level of relevantOrders) {
      if (remainingQuantity <= 0) break;
      
      const quantityAtLevel = Math.min(remainingQuantity, level.quantity);
      totalCost += quantityAtLevel * level.price;
      remainingQuantity -= quantityAtLevel;
    }

    if (remainingQuantity > 0) {
      // Not enough liquidity
      return { price: 0, impact: 100 };
    }

    avgPrice = totalCost / quantity;
    const marketPrice = marketDepth.midPrice;
    const impact = marketPrice > 0 ? Math.abs(avgPrice - marketPrice) / marketPrice * 100 : 0;

    return { price: avgPrice, impact };
  }, [marketDepth]);

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('order-book-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'marketplace_listings',
        filter: `tokenized_property_id=eq.${tokenizedPropertyId}`
      }, () => {
        fetchOrders();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [tokenizedPropertyId, fetchOrders]);

  return {
    orders,
    marketDepth,
    recentTrades,
    isLoading,
    placeOrder,
    cancelOrder,
    calculateOptimalPrice,
    refetch: fetchOrders
  };
}