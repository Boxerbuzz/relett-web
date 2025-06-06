
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { filters } = await req.json();

    // In production, this would use Elasticsearch or Algolia
    // For now, we'll implement enhanced Supabase search with better ranking

    let query = supabaseClient
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
        created_at,
        views,
        likes,
        property_images!left(url, is_primary)
      `)
      .eq('status', 'active')
      .eq('is_deleted', false);

    // Text search with ranking
    if (filters.query) {
      query = query.textSearch('title,description', filters.query);
    }

    // Location filtering
    if (filters.location?.city) {
      query = query.ilike('location->>city', `%${filters.location.city}%`);
    }

    if (filters.location?.state) {
      query = query.ilike('location->>state', `%${filters.location.state}%`);
    }

    // Property type filtering
    if (filters.propertyType && filters.propertyType.length > 0) {
      query = query.in('type', filters.propertyType);
    }

    // Price filtering
    if (filters.price?.min !== undefined) {
      query = query.gte('price->amount', filters.price.min);
    }

    if (filters.price?.max !== undefined) {
      query = query.lte('price->amount', filters.price.max);
    }

    // Features filtering
    if (filters.features && filters.features.length > 0) {
      query = query.contains('features', filters.features);
    }

    // Amenities filtering
    if (filters.amenities && filters.amenities.length > 0) {
      query = query.contains('amenities', filters.amenities);
    }

    // Bedroom filtering
    if (filters.bedrooms?.min !== undefined) {
      query = query.gte('specification->bedrooms', filters.bedrooms.min);
    }

    if (filters.bedrooms?.max !== undefined) {
      query = query.lte('specification->bedrooms', filters.bedrooms.max);
    }

    // Bathroom filtering
    if (filters.bathrooms?.min !== undefined) {
      query = query.gte('specification->bathrooms', filters.bathrooms.min);
    }

    if (filters.bathrooms?.max !== undefined) {
      query = query.lte('specification->bathrooms', filters.bathrooms.max);
    }

    // Sorting
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
      case 'date_desc':
        query = query.order('created_at', { ascending: false });
        break;
      case 'relevance':
      default:
        // Custom relevance scoring (views + likes)
        query = query.order('views', { ascending: false });
        break;
    }

    // Pagination
    const limit = Math.min(filters.limit || 20, 100);
    const offset = filters.offset || 0;
    query = query.range(offset, offset + limit - 1);

    const { data: properties, error, count } = await query;

    if (error) throw error;

    // Transform results
    const results = (properties || []).map((property, index) => ({
      id: property.id,
      title: property.title,
      description: property.description,
      type: property.type,
      price: property.price,
      location: property.location,
      images: Array.isArray(property.property_images) 
        ? property.property_images.map((img: any) => img.url).filter(Boolean)
        : [],
      features: property.features || [],
      amenities: property.amenities || [],
      score: calculateRelevanceScore(property, filters.query, index),
      highlights: generateHighlights(property, filters.query)
    }));

    // Generate facets
    const facets = await generateFacets(supabaseClient, filters);

    // Generate suggestions
    const suggestions = filters.query ? await generateSuggestions(filters.query) : [];

    return new Response(JSON.stringify({
      results,
      totalCount: count || 0,
      suggestions,
      facets
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Advanced search error:', error);
    return new Response(JSON.stringify({ 
      error: 'Search failed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateRelevanceScore(property: any, query?: string, position: number = 0): number {
  let score = 100 - position; // Base score decreases with position

  // Boost based on engagement
  score += (property.views || 0) * 0.1;
  score += (property.likes || 0) * 0.5;

  // Boost if query matches title more than description
  if (query) {
    const queryLower = query.toLowerCase();
    const titleMatch = property.title?.toLowerCase().includes(queryLower);
    const descMatch = property.description?.toLowerCase().includes(queryLower);
    
    if (titleMatch) score += 20;
    if (descMatch) score += 10;
  }

  return Math.round(score);
}

function generateHighlights(property: any, query?: string): string[] {
  if (!query) return [];

  const highlights: string[] = [];
  const queryLower = query.toLowerCase();

  // Check title
  if (property.title?.toLowerCase().includes(queryLower)) {
    highlights.push(`Title: ...${property.title}...`);
  }

  // Check description (first 100 chars containing query)
  if (property.description?.toLowerCase().includes(queryLower)) {
    const index = property.description.toLowerCase().indexOf(queryLower);
    const start = Math.max(0, index - 50);
    const end = Math.min(property.description.length, index + 50);
    highlights.push(`...${property.description.substring(start, end)}...`);
  }

  return highlights;
}

async function generateFacets(supabaseClient: any, filters: any) {
  // Generate location facets
  const { data: locationData } = await supabaseClient
    .from('properties')
    .select('location->city')
    .eq('status', 'active')
    .limit(100);

  const locationCounts = new Map();
  locationData?.forEach((item: any) => {
    const city = item.location?.city;
    if (city) {
      locationCounts.set(city, (locationCounts.get(city) || 0) + 1);
    }
  });

  const locations = Array.from(locationCounts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Generate property type facets
  const { data: typeData } = await supabaseClient
    .from('properties')
    .select('type')
    .eq('status', 'active');

  const typeCounts = new Map();
  typeData?.forEach((item: any) => {
    if (item.type) {
      typeCounts.set(item.type, (typeCounts.get(item.type) || 0) + 1);
    }
  });

  const propertyTypes = Array.from(typeCounts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  return {
    locations,
    priceRanges: [
      { range: '0-100000', count: 0 },
      { range: '100000-500000', count: 0 },
      { range: '500000-1000000', count: 0 },
      { range: '1000000+', count: 0 }
    ],
    propertyTypes
  };
}

async function generateSuggestions(query: string): Promise<string[]> {
  // Simple suggestion generation - in production use ML/AI
  const commonTerms = [
    'apartment', 'house', 'condo', 'villa', 'studio',
    'lagos', 'abuja', 'port harcourt', 'kano', 'ibadan',
    'swimming pool', 'parking', 'garden', 'security'
  ];

  return commonTerms
    .filter(term => term.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);
}
