
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, cacheConfig } from '@/lib/queryClient';

interface PropertyAnalytics {
  totalViews: number;
  totalLikes: number;
  totalFavorites: number;
  averageRating: number;
  totalReviews: number;
  conversionRate: number;
  topPerformingProperties: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    favorites: number;
  }>;
  viewsTrend: Array<{
    date: string;
    views: number;
  }>;
}

export function usePropertyAnalytics(propertyId?: string) {
  const {
    data: analytics,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: propertyId 
      ? [...queryKeys.properties.detail(propertyId), 'analytics']
      : [...queryKeys.properties.all(), 'analytics'],
    queryFn: async (): Promise<PropertyAnalytics> => {
      // Get property stats
      let propertiesQuery = supabase
        .from('properties')
        .select('id, title, views, likes, favorites, ratings, review_count');
      
      if (propertyId) {
        propertiesQuery = propertiesQuery.eq('id', propertyId);
      }

      const { data: properties, error: propertiesError } = await propertiesQuery;
      if (propertiesError) throw propertiesError;

      // Calculate analytics
      const totalViews = properties?.reduce((sum, p) => sum + (p.views || 0), 0) || 0;
      const totalLikes = properties?.reduce((sum, p) => sum + (p.likes || 0), 0) || 0;
      const totalFavorites = properties?.reduce((sum, p) => sum + (p.favorites || 0), 0) || 0;
      const totalReviews = properties?.reduce((sum, p) => sum + (p.review_count || 0), 0) || 0;
      const averageRating = properties?.length 
        ? properties.reduce((sum, p) => sum + (p.ratings || 0), 0) / properties.length 
        : 0;

      // Top performing properties (by views) - handle null titles
      const topPerformingProperties = (properties || [])
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 5)
        .map(p => ({
          id: p.id,
          title: p.title || 'Untitled Property',
          views: p.views || 0,
          likes: p.likes || 0,
          favorites: p.favorites || 0,
        }));

      // Mock trend data (in real implementation, you'd get this from audit_trails)
      const viewsTrend = Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        views: Math.floor(Math.random() * 100) + 50,
      }));

      return {
        totalViews,
        totalLikes,
        totalFavorites,
        averageRating,
        totalReviews,
        conversionRate: totalViews > 0 ? (totalLikes / totalViews) * 100 : 0,
        topPerformingProperties,
        viewsTrend,
      };
    },
    ...cacheConfig.standard, // 5 minutes cache for analytics
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    analytics: analytics || {
      totalViews: 0,
      totalLikes: 0,
      totalFavorites: 0,
      averageRating: 0,
      totalReviews: 0,
      conversionRate: 0,
      topPerformingProperties: [],
      viewsTrend: [],
    },
    loading,
    error: queryError?.message || null,
    refetch
  };
}
