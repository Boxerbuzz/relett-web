
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

      // Calculate price change (mock data - in reality you'd compare with historical data)
      const priceChange = Math.random() * 10 - 5; // Random between -5% and +5%

      // Mock market trends (last 30 days)
      const marketTrends = Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        averagePrice: averagePrice + (Math.random() * 100000 - 50000),
        volume: Math.floor(Math.random() * 20) + 5,
      }));

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

      return {
        totalProperties,
        averagePrice,
        priceChange,
        totalVolume: totalProperties * 0.1, // Mock volume
        activeListings: totalProperties,
        soldThisMonth: Math.floor(totalProperties * 0.05), // Mock sold count
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
