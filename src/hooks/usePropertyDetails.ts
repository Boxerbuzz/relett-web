
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PropertyDetails {
  id: string;
  title: string;
  description: string;
  location: any;
  price: any;
  category: string;
  type: string;
  sub_type: string;
  status: string;
  is_verified: boolean;
  is_tokenized: boolean;
  is_featured: boolean;
  specification: any;
  amenities: string[];
  features: string[];
  condition: string;
  views: number;
  likes: number;
  ratings: number;
  backdrop: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  property_images: Array<{
    id: string;
    url: string;
    is_primary: boolean;
    category: string;
    sort_order: number;
  }>;
  property_documents: Array<{
    id: string;
    document_name: string;
    document_type: string;
    file_url: string;
    status: string;
    verified_at: string;
  }>;
  tokenized_property: {
    id: string;
    token_symbol: string;
    token_name: string;
    token_price: number;
    total_supply: string;
    expected_roi: number;
    minimum_investment: number;
  } | null;
}

export function usePropertyDetails(propertyId: string) {
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, increment the view count
      await supabase.rpc('increment_property_views', { property_id: propertyId });

      // Use the database function to get property details with related data
      const { data, error: functionError } = await supabase.rpc('get_property_details', {
        property_id: propertyId
      });

      if (functionError) {
        console.error('Function error:', functionError);
        // Fallback to manual queries if function fails
        await fetchPropertyDetailsFallback();
        return;
      }

      if (!data || data.length === 0) {
        setError('Property not found');
        return;
      }

      const result = data[0];
      const propertyData = result.property_data;
      const images = result.images || [];
      const documents = result.documents || [];
      const tokenizedInfo = result.tokenized_info;

      // Combine all data into a single property object
      const enrichedProperty: PropertyDetails = {
        ...propertyData,
        property_images: images,
        property_documents: documents,
        tokenized_property: Object.keys(tokenizedInfo).length > 0 ? tokenizedInfo : null,
      };

      setProperty(enrichedProperty);
    } catch (err) {
      console.error('Error fetching property details:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch property details';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPropertyDetailsFallback = async () => {
    try {
      // Fetch basic property data
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (propertyError) throw propertyError;

      if (!propertyData) {
        setError('Property not found');
        return;
      }

      // Fetch property images
      const { data: images } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', propertyId)
        .order('sort_order', { ascending: true });

      // Fetch property documents (only if user owns the property or is admin/verifier)
      const { data: documents } = await supabase
        .from('property_documents')
        .select('*')
        .eq('property_id', propertyId);

      // Fetch tokenized property info if applicable
      let tokenizedProperty = null;
      if (propertyData.is_tokenized && propertyData.tokenized_property_id) {
        const { data: tokenData } = await supabase
          .from('tokenized_properties')
          .select('*')
          .eq('id', propertyData.tokenized_property_id)
          .single();
        
        tokenizedProperty = tokenData;
      }

      const enrichedProperty: PropertyDetails = {
        ...propertyData,
        property_images: images || [],
        property_documents: documents || [],
        tokenized_property: tokenizedProperty,
      };

      setProperty(enrichedProperty);
    } catch (err) {
      console.error('Fallback fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch property details';
      setError(errorMessage);
    }
  };

  const refetch = () => {
    if (propertyId) {
      fetchPropertyDetails();
    }
  };

  return {
    property,
    loading,
    error,
    refetch
  };
}
