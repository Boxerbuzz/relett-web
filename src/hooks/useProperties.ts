
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, cacheConfig } from '@/lib/queryClient';

interface PropertyData {
  id: string;
  title: string;
  location: any;
  price: any;
  status: string;
  category: string;
  type: string;
  is_verified: boolean;
  is_tokenized: boolean;
  is_featured: boolean;
  backdrop: string;
  created_at: string;
  updated_at: string;
  views: number;
  likes: number;
  favorites: number;
  ratings: number;
  review_count: number;
  property_images: Array<{
    url: string;
    is_primary: boolean;
    category: string;
  }>;
  land_title_status?: string;
  verification_metadata?: any;
  favorite_count: number;
  like_count: number;
  average_rating: number;
  tokenized_property?: {
    id: string;
    token_symbol: string;
    token_name: string;
    status: string;
    token_price: number;
    total_supply: string;
  };
}

export function useProperties() {
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    data: properties = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: queryKeys.properties.list({ userId: user?.id }),
    queryFn: async () => {
      if (!user?.id) return [];

      // Fetch properties with images, land title info, and tokenization status
      const { data: propertiesData, error: propertiesError } = await supabase
        .from('properties')
        .select(`
          *,
          land_titles!properties_land_title_id_fkey (
            status,
            verification_metadata
          ),
          tokenized_properties!properties_tokenized_property_id_fkey (
            id,
            token_symbol,
            token_name,
            status,
            token_price,
            total_supply
          )
        `)
        .eq('user_id', user.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });

      if (propertiesError) throw propertiesError;

      // Fetch property images for each property
      const propertyIds = propertiesData?.map(p => p.id) || [];
      const { data: imagesData, error: imagesError } = await supabase
        .from('property_images')
        .select('property_id, url, is_primary, category, sort_order')
        .in('property_id', propertyIds)
        .order('sort_order', { ascending: true });

      if (imagesError) throw imagesError;

      // Fetch engagement metrics
      const { data: favoritesData } = await supabase
        .from('property_favorites')
        .select('property_id')
        .in('property_id', propertyIds);

      const { data: likesData } = await supabase
        .from('property_likes')
        .select('property_id')
        .in('property_id', propertyIds);

      const { data: reviewsData } = await supabase
        .from('property_reviews')
        .select('property_id, rating')
        .in('property_id', propertyIds);

      // Group images by property
      const imagesByProperty = imagesData?.reduce((acc, img) => {
        if (!acc[img.property_id]) acc[img.property_id] = [];
        acc[img.property_id].push(img);
        return acc;
      }, {} as Record<string, any[]>) || {};

      // Calculate metrics
      const favoritesByProperty = favoritesData?.reduce((acc, fav) => {
        acc[fav.property_id] = (acc[fav.property_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const likesByProperty = likesData?.reduce((acc, like) => {
        acc[like.property_id] = (acc[like.property_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const reviewsByProperty = reviewsData?.reduce((acc, review) => {
        if (!acc[review.property_id]) {
          acc[review.property_id] = { total: 0, count: 0 };
        }
        acc[review.property_id].total += review.rating;
        acc[review.property_id].count += 1;
        return acc;
      }, {} as Record<string, { total: number; count: number }>) || {};

      // Combine all data
      const enrichedProperties: PropertyData[] = propertiesData?.map(property => ({
        ...property,
        property_images: imagesByProperty[property.id] || [],
        land_title_status: property.land_titles?.status,
        verification_metadata: property.land_titles?.verification_metadata,
        favorite_count: favoritesByProperty[property.id] || 0,
        like_count: likesByProperty[property.id] || 0,
        average_rating: reviewsByProperty[property.id] 
          ? reviewsByProperty[property.id].total / reviewsByProperty[property.id].count 
          : 0,
        review_count: reviewsByProperty[property.id]?.count || 0,
        tokenized_property: property.tokenized_properties || null
      })) || [];

      return enrichedProperties;
    },
    enabled: !!user?.id,
    ...cacheConfig.standard, // Cache for 5 minutes
    onError: (err) => {
      console.error('Error fetching properties:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch properties';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  });

  const error = queryError?.message || null;

  return {
    properties,
    loading,
    error,
    refetch
  };
}
