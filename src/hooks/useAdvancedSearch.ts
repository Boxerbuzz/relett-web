
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SearchFilters {
  query?: string;
  location?: {
    city?: string;
    state?: string;
    coordinates?: { lat: number; lng: number; radius: number };
  };
  price?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  propertyType?: string[];
  features?: string[];
  amenities?: string[];
  bedrooms?: { min?: number; max?: number };
  bathrooms?: { min?: number; max?: number };
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'date_desc' | 'date_asc';
  limit?: number;
  offset?: number;
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: string;
  price: any;
  location: any;
  images: string[];
  features: string[];
  amenities: string[];
  score?: number;
  highlights?: string[];
}

interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  suggestions: string[];
  facets: {
    locations: Array<{ name: string; count: number }>;
    priceRanges: Array<{ range: string; count: number }>;
    propertyTypes: Array<{ type: string; count: number }>;
  };
}

export function useAdvancedSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const { toast } = useToast();

  const search = async (filters: SearchFilters): Promise<SearchResponse> => {
    setIsSearching(true);
    try {
      // Use edge function for advanced search with Elasticsearch/Algolia
      const { data, error } = await supabase.functions.invoke('advanced-search', {
        body: { filters }
      });

      if (error) throw error;

      const searchResponse: SearchResponse = {
        results: data.results || [],
        totalCount: data.totalCount || 0,
        suggestions: data.suggestions || [],
        facets: data.facets || {
          locations: [],
          priceRanges: [],
          propertyTypes: []
        }
      };

      setSearchResults(searchResponse);
      return searchResponse;

    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: 'Search Failed',
        description: error instanceof Error ? error.message : 'Search failed',
        variant: 'destructive'
      });

      // Fallback to basic Supabase search
      return await fallbackSearch(filters);
    } finally {
      setIsSearching(false);
    }
  };

  const fallbackSearch = async (filters: SearchFilters): Promise<SearchResponse> => {
    let query = supabase
      .from('properties')
      .select(`
        id,
        title,
        description,
        type,
        price,
        location,
        features,
        amenities,
        property_images!inner(url)
      `)
      .eq('status', 'active');

    // Apply basic filters
    if (filters.query) {
      query = query.textSearch('title,description', filters.query);
    }

    if (filters.propertyType && filters.propertyType.length > 0) {
      query = query.in('type', filters.propertyType);
    }

    if (filters.location?.city) {
      query = query.ilike('location->>city', `%${filters.location.city}%`);
    }

    if (filters.price?.min !== undefined) {
      query = query.gte('price->amount', filters.price.min);
    }

    if (filters.price?.max !== undefined) {
      query = query.lte('price->amount', filters.price.max);
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'price_asc':
        query = query.order('price->amount', { ascending: true });
        break;
      case 'price_desc':
        query = query.order('price->amount', { ascending: false });
        break;
      case 'date_asc':
        query = query.order('created_at', { ascending: true });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    const limit = filters.limit || 20;
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    const results: SearchResult[] = (data || []).map(property => ({
      id: property.id,
      title: property.title,
      description: property.description,
      type: property.type,
      price: property.price,
      location: property.location,
      images: Array.isArray(property.property_images) 
        ? property.property_images.map((img: any) => img.url)
        : [],
      features: property.features || [],
      amenities: property.amenities || []
    }));

    return {
      results,
      totalCount: results.length,
      suggestions: [],
      facets: {
        locations: [],
        priceRanges: [],
        propertyTypes: []
      }
    };
  };

  const getSuggestions = async (query: string): Promise<string[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('search-suggestions', {
        body: { query }
      });

      if (error) throw error;
      return data.suggestions || [];
    } catch (error) {
      console.error('Suggestions error:', error);
      return [];
    }
  };

  const indexProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase.functions.invoke('index-property', {
        body: { propertyId }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Indexing error:', error);
    }
  };

  return {
    search,
    getSuggestions,
    indexProperty,
    isSearching,
    searchResults
  };
}
