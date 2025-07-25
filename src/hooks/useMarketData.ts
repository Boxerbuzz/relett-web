
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, cacheConfig } from '@/lib/queryClient';

interface MarketData {
  totalProperties: number;
  averagePrice: number;
  priceChange: number;
  totalVolume: number;
  activeListings: number;
  soldThisMonth: number;
  marketTrends: Array<{
    date: string;
    averagePrice: number;
    volume: number;
  }>;
  priceByLocation: Array<{
    location: string;
    averagePrice: number;
    count: number;
  }>;
  propertyTypes: Array<{
    type: string;
    count: number;
    averagePrice: number;
  }>;
}

export function useMarketData() {
  const {
    data: marketData,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: queryKeys.market.analytics(),
    queryFn: async (): Promise<MarketData> => {
      // Get all properties with basic info - use 'type' instead of 'property_type'
      const { data: properties, error: propertiesError } = await supabase
        .from('properties')
        .select('id, title, price, location, type, status, created_at')
        .eq('status', 'active');

      if (propertiesError) throw propertiesError;

      const totalProperties = properties?.length || 0;
      const averagePrice = properties?.length 
        ? properties.reduce((sum, p) => sum + (typeof p.price === 'number' ? p.price : 0), 0) / properties.length 
        : 0;

      // Calculate price change from audit_trails (view transactions)
      const { data: recentTransactions } = await supabase
        .from('audit_trails')
        .select('new_values, created_at')
        .eq('resource_type', 'property')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      // Calculate actual market trends from transaction data
      const marketTrends = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        // Get transactions for this day
        const dayTransactions = recentTransactions?.filter(t => 
          t.created_at.startsWith(dateStr)
        ) || [];
        
        const dayVolume = dayTransactions.length;
        const dayAveragePrice = dayTransactions.length > 0 
          ? dayTransactions.reduce((sum, t) => {
              const price = t.new_values && typeof t.new_values === 'object' && 'price' in t.new_values 
                ? Number(t.new_values.price) || averagePrice 
                : averagePrice;
              return sum + price;
            }, 0) / dayTransactions.length
          : averagePrice;

        return {
          date: dateStr,
          averagePrice: dayAveragePrice,
          volume: dayVolume,
        };
      });

      // Calculate price change (current vs 30 days ago)
      const oldPrice = marketTrends[0]?.averagePrice || averagePrice;
      const currentPrice = marketTrends[marketTrends.length - 1]?.averagePrice || averagePrice;
      const priceChange = oldPrice > 0 ? ((currentPrice - oldPrice) / oldPrice) * 100 : 0;

      // Group by location - safely handle location object
      const locationGroups = (properties || []).reduce((acc, property) => {
        let locationName = 'Unknown';
        if (property.location && typeof property.location === 'object' && !Array.isArray(property.location)) {
          const locationObj = property.location as Record<string, any>;
          locationName = locationObj.state || locationObj.city || locationObj.address || 'Unknown';
        } else if (typeof property.location === 'string') {
          locationName = property.location;
        }
        
        if (!acc[locationName]) {
          acc[locationName] = { prices: [], count: 0 };
        }
        const price = typeof property.price === 'number' ? property.price : 0;
        acc[locationName].prices.push(price);
        acc[locationName].count++;
        return acc;
      }, {} as Record<string, { prices: number[], count: number }>);

      const priceByLocation = Object.entries(locationGroups).map(([location, data]) => ({
        location,
        averagePrice: data.prices.reduce((sum, price) => sum + price, 0) / data.prices.length,
        count: data.count,
      }));

      // Group by property type - use 'type' instead of 'property_type' and handle type casting
      const typeGroups = (properties || []).reduce((acc, property) => {
        const type = typeof property.type === 'string' ? property.type : 'Unknown';
        if (!acc[type]) {
          acc[type] = { prices: [], count: 0 };
        }
        const price = typeof property.price === 'number' ? property.price : 0;
        acc[type].prices.push(price);
        acc[type].count++;
        return acc;
      }, {} as Record<string, { prices: number[], count: number }>);

      const propertyTypes = Object.entries(typeGroups).map(([type, data]) => ({
        type,
        averagePrice: data.prices.reduce((sum, price) => sum + price, 0) / data.prices.length,
        count: data.count,
      }));

      // Get real volume and sales data from existing tables 
      // Use tokenized_properties and token_holdings for investment data
      const { data: investments } = await supabase
        .from('token_holdings')
        .select('total_investment, created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const totalVolume = investments?.reduce((sum, inv) => sum + (inv.total_investment || 0), 0) || 0;
      
      // Count reservations as sales
      const { data: reservations } = await supabase
        .from('reservations')
        .select('id, status')
        .eq('status', 'confirmed')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
      
      const soldThisMonth = reservations?.length || 0;

      return {
        totalProperties,
        averagePrice,
        priceChange,
        totalVolume,
        activeListings: totalProperties,
        soldThisMonth,
        marketTrends,
        priceByLocation,
        propertyTypes,
      };
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - market data changes less frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    marketData: marketData || {
      totalProperties: 0,
      averagePrice: 0,
      priceChange: 0,
      totalVolume: 0,
      activeListings: 0,
      soldThisMonth: 0,
      marketTrends: [],
      priceByLocation: [],
      propertyTypes: [],
    },
    loading,
    error: queryError?.message || null,
    refetch
  };
}
