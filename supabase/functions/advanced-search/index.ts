
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  createTypedSupabaseClient,
  createSuccessResponse, 
  createResponse,
  createCorsResponse 
} from '../shared/supabase-client.ts';

interface SearchFilters {
  query?: string;
  category?: string;
  type?: string;
  status?: string;
  location?: {
    state?: string;
    city?: string;
    lga?: string;
  };
  price?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  size?: {
    min?: number;
    max?: number;
  };
  amenities?: string[];
  features?: string[];
  yearBuilt?: {
    min?: number;
    max?: number;
  };
  ratings?: {
    min?: number;
  };
  isVerified?: boolean;
  isTokenized?: boolean;
  isFeatured?: boolean;
}

interface SearchOptions {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  includeFacets?: boolean;
  includeAnalytics?: boolean;
}

interface SearchFacets {
  categories: Array<{ value: string; count: number }>;
  types: Array<{ value: string; count: number }>;
  locations: Array<{ value: string; count: number }>;
  priceRanges: Array<{ range: string; count: number }>;
  amenities: Array<{ value: string; count: number }>;
}

interface SearchResponse {
  results: unknown[];
  total: number;
  page: number;
  limit: number;
  facets?: SearchFacets;
  suggestions?: string[];
  executionTime: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  const startTime = performance.now();

  try {
    const { filters, options }: { filters: SearchFilters; options: SearchOptions } = await req.json();
    
    const supabase = createTypedSupabaseClient();
    
    // Build the query
    let query = supabase.from('properties').select(`
      id,
      title,
      description,
      category,
      type,
      status,
      price,
      location,
      specification,
      amenities,
      features,
      year_built,
      ratings,
      review_count,
      views,
      likes,
      favorites,
      is_verified,
      is_tokenized,
      is_featured,
      backdrop,
      created_at,
      updated_at,
      user_id
    `);

    // Apply filters
    if (filters.query) {
      query = query.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
    }

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.location?.state) {
      query = query.eq('location->>state', filters.location.state);
    }

    if (filters.location?.city) {
      query = query.eq('location->>city', filters.location.city);
    }

    if (filters.location?.lga) {
      query = query.eq('location->>lga', filters.location.lga);
    }

    if (filters.price?.min !== undefined || filters.price?.max !== undefined) {
      const currency = filters.price.currency || 'NGN';
      if (filters.price.min !== undefined) {
        query = query.gte(`price->${currency}`, filters.price.min);
      }
      if (filters.price.max !== undefined) {
        query = query.lte(`price->${currency}`, filters.price.max);
      }
    }

    if (filters.size?.min !== undefined || filters.size?.max !== undefined) {
      if (filters.size.min !== undefined) {
        query = query.gte('specification->>area', filters.size.min);
      }
      if (filters.size.max !== undefined) {
        query = query.lte('specification->>area', filters.size.max);
      }
    }

    if (filters.amenities && filters.amenities.length > 0) {
      query = query.overlaps('amenities', filters.amenities);
    }

    if (filters.features && filters.features.length > 0) {
      query = query.overlaps('features', filters.features);
    }

    if (filters.yearBuilt?.min !== undefined || filters.yearBuilt?.max !== undefined) {
      if (filters.yearBuilt.min !== undefined) {
        query = query.gte('year_built', filters.yearBuilt.min.toString());
      }
      if (filters.yearBuilt.max !== undefined) {
        query = query.lte('year_built', filters.yearBuilt.max.toString());
      }
    }

    if (filters.ratings?.min !== undefined) {
      query = query.gte('ratings', filters.ratings.min);
    }

    if (filters.isVerified !== undefined) {
      query = query.eq('is_verified', filters.isVerified);
    }

    if (filters.isTokenized !== undefined) {
      query = query.eq('is_tokenized', filters.isTokenized);
    }

    if (filters.isFeatured !== undefined) {
      query = query.eq('is_featured', filters.isFeatured);
    }

    // Apply sorting
    const sortBy = options.sortBy || 'created_at';
    const sortOrder = options.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const offset = (page - 1) * limit;

    query = query.range(offset, offset + limit - 1);

    // Execute query
    const { data: results, error, count } = await query;

    if (error) {
      throw error;
    }

    // Generate facets if requested
    let facets: SearchFacets | undefined;
    if (options.includeFacets) {
      facets = await generateFacets(supabase, filters);
    }

    // Generate suggestions if requested
    let suggestions: string[] | undefined;
    if (filters.query && filters.query.length > 2) {
      suggestions = await generateSuggestions(filters.query);
    }

    const executionTimeMs = performance.now() - startTime;

    const response: SearchResponse = {
      results: results || [],
      total: count || 0,
      page,
      limit,
      facets,
      suggestions,
      executionTime: Math.round(executionTimeMs)
    };

    return createResponse(createSuccessResponse(response));

  } catch (error) {
    console.error('Advanced search error:', error);
    const executionTimeMs = performance.now() - startTime;
    
    return createResponse(createSuccessResponse({
      results: [],
      total: 0,
      page: 1,
      limit: 20,
      executionTime: Math.round(executionTimeMs),
      error: error instanceof Error ? error.message : 'Search failed'
    }));
  }
});

async function generateFacets(supabase: ReturnType<typeof createTypedSupabaseClient>, _filters: SearchFilters): Promise<SearchFacets> {
  try {
    // Get category counts
    const { data: categories } = await supabase
      .from('properties')
      .select('category')
      .not('category', 'is', null);

    // Get type counts
    const { data: types } = await supabase
      .from('properties')
      .select('type')
      .not('type', 'is', null);

    // Get location counts (states)
    const { data: locations } = await supabase
      .from('properties')
      .select('location')
      .not('location', 'is', null);

    // Process and count facets
    const categoryFacets = processFacetCounts(categories, 'category');
    const typeFacets = processFacetCounts(types, 'type');
    const locationFacets = processLocationFacets(locations);

    return {
      categories: categoryFacets,
      types: typeFacets,
      locations: locationFacets,
      priceRanges: [],
      amenities: []
    };

  } catch (error) {
    console.error('Error generating facets:', error);
    return {
      categories: [],
      types: [],
      locations: [],
      priceRanges: [],
      amenities: []
    };
  }
}

function processFacetCounts(data: unknown[] | null, field: string): Array<{ value: string; count: number }> {
  if (!data) return [];
  
  const counts: Record<string, number> = {};
  data.forEach(item => {
    const value = (item as Record<string, unknown>)[field] as string;
    if (value) {
      counts[value] = (counts[value] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function processLocationFacets(data: unknown[] | null): Array<{ value: string; count: number }> {
  if (!data) return [];
  
  const counts: Record<string, number> = {};
  data.forEach(item => {
    const location = (item as Record<string, unknown>).location as Record<string, unknown>;
    if (location?.state) {
      const state = location.state as string;
      counts[state] = (counts[state] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function generateSuggestions(query: string): Promise<string[]> {
  // Simple suggestion generation based on common property terms
  const commonTerms = [
    'apartment', 'house', 'villa', 'duplex', 'bungalow',
    'office', 'shop', 'warehouse', 'land', 'commercial',
    '2 bedroom', '3 bedroom', '4 bedroom', 'studio',
    'furnished', 'unfurnished', 'serviced', 'luxury'
  ];

  const suggestions = commonTerms
    .filter(term => term.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  return Promise.resolve(suggestions);
}
