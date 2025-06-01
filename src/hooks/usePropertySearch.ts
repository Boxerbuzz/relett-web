
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SearchFilters {
  query?: string;
  category?: string;
  type?: string;
  priceMin?: number;
  priceMax?: number;
  location?: string;
  bedrooms?: number;
  bathrooms?: number;
  amenities?: string[];
  features?: string[];
  sortBy?: 'price_asc' | 'price_desc' | 'created_desc' | 'created_asc' | 'relevance';
  limit?: number;
  offset?: number;
}

interface Property {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  price: any;
  location: any;
  amenities: string[];
  features: string[];
  created_at: string;
  is_featured: boolean;
  property_images: Array<{ url: string; is_primary: boolean }>;
}

export function usePropertySearch() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const { toast } = useToast();

  const searchProperties = async (filters: SearchFilters) => {
    try {
      setIsLoading(true);
      
      let query = supabase
        .from('properties')
        .select(`
          *,
          property_images(url, is_primary)
        `, { count: 'exact' })
        .eq('status', 'active')
        .eq('is_deleted', false);

      // Apply text search
      if (filters.query) {
        query = query.textSearch('title,description', filters.query);
      }

      // Apply category filter
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      // Apply type filter
      if (filters.type) {
        query = query.eq('type', filters.type);
      }

      // Apply price range filter
      if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
        if (filters.priceMin !== undefined) {
          query = query.gte('price->amount', filters.priceMin);
        }
        if (filters.priceMax !== undefined) {
          query = query.lte('price->amount', filters.priceMax);
        }
      }

      // Apply location filter (fuzzy search on location data)
      if (filters.location) {
        query = query.or(`location->>city.ilike.%${filters.location}%,location->>state.ilike.%${filters.location}%,location->>address.ilike.%${filters.location}%`);
      }

      // Apply amenities filter
      if (filters.amenities && filters.amenities.length > 0) {
        query = query.contains('amenities', filters.amenities);
      }

      // Apply features filter
      if (filters.features && filters.features.length > 0) {
        query = query.contains('features', filters.features);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price_asc':
          query = query.order('price->amount', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price->amount', { ascending: false });
          break;
        case 'created_asc':
          query = query.order('created_at', { ascending: true });
          break;
        case 'created_desc':
        default:
          query = query.order('created_at', { ascending: false });
          break;
      }

      // Apply pagination
      const limit = filters.limit || 20;
      const offset = filters.offset || 0;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      setProperties(filters.offset === 0 ? data || [] : prev => [...prev, ...(data || [])]);
      setTotalCount(count || 0);
      setHasMore((data?.length || 0) === limit);

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search failed',
        description: 'Failed to search properties',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveSearch = async (name: string, filters: SearchFilters, alertEnabled = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('saved_searches')
        .insert({
          user_id: user.id,
          name,
          search_criteria: filters,
          alert_enabled: alertEnabled
        });

      if (error) throw error;

      toast({
        title: 'Search saved',
        description: `Search "${name}" has been saved successfully.`,
      });

    } catch (error) {
      console.error('Save search error:', error);
      toast({
        title: 'Save failed',
        description: 'Failed to save search',
        variant: 'destructive'
      });
    }
  };

  const getSavedSearches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('saved_searches')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Get saved searches error:', error);
      return [];
    }
  };

  const clearResults = () => {
    setProperties([]);
    setTotalCount(0);
    setHasMore(false);
  };

  return {
    properties,
    isLoading,
    totalCount,
    hasMore,
    searchProperties,
    saveSearch,
    getSavedSearches,
    clearResults
  };
}
