import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { queryKeys, cacheConfig } from "@/lib/queryClient";
import { useCacheManager } from "@/hooks/useCacheManager";

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
  agent: AgentData | null;
}

interface AgentData {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  avatar: string;
}

export function usePropertyDetails(propertyId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { optimisticUpdates } = useCacheManager();

  // Use React Query for property details with optimized caching
  const {
    data: property,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.properties.detail(propertyId),
    queryFn: async () => {
      if (!propertyId) return null;

      try {
        // Optimistically increment views
        optimisticUpdates.incrementPropertyViews(propertyId);

        // First, get current views count and increment it
        const { data: currentProperty } = await supabase
          .from("properties")
          .select("views")
          .eq("id", propertyId)
          .single();

        const currentViews = currentProperty?.views || 0;

        // Update views count in background
        supabase
          .from("properties")
          .update({ views: currentViews + 1 })
          .eq("id", propertyId)
          .then(() => {
            // Invalidate cache after successful update
            queryClient.invalidateQueries({ 
              queryKey: queryKeys.properties.detail(propertyId) 
            });
          });

        // Fetch basic property data
        const { data: propertyData, error: propertyError } = await supabase
          .from("properties")
          .select(
            "*, agent:users(id, first_name, last_name, email, phone, avatar)"
          )
          .eq("id", propertyId)
          .single();

        if (propertyError) throw propertyError;

        if (!propertyData) {
          throw new Error("Property not found");
        }

        // Fetch property images
        const { data: images } = await supabase
          .from("property_images")
          .select("*")
          .eq("property_id", propertyId)
          .order("sort_order", { ascending: true });

        // Fetch property documents
        const { data: documents } = await supabase
          .from("property_documents")
          .select("*")
          .eq("property_id", propertyId);

        // Fetch tokenized property info if applicable
        let tokenizedProperty = null;
        if (propertyData.is_tokenized) {
          const { data: tokenData } = await supabase
            .from("tokenized_properties")
            .select("*")
            .eq("property_id", propertyId)
            .single();

          tokenizedProperty = tokenData;
        }

        const enrichedProperty: PropertyDetails = {
          ...propertyData,
          property_images: images || [],
          property_documents: documents || [],
          tokenized_property: tokenizedProperty,
        };

        return enrichedProperty;
      } catch (err) {
        console.error("Error fetching property details:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch property details";
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        
        throw err;
      }
    },
    enabled: !!propertyId,
    ...cacheConfig.standard, // Use standard caching for property details
    refetchOnMount: false, // Don't refetch if data is still fresh
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Extract agent data from property
  const agent = property?.agent || null;

  return {
    property,
    loading,
    error: error?.message || null,
    agent,
    refetch,
  };
}
