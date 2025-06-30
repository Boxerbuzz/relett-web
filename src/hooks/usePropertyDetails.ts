import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  const [property, setProperty] = useState<PropertyDetails | null>(null);
  const [agent, setAgent] = useState<AgentData | null>(null);
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

      // First, get current views count and increment it
      const { data: currentProperty } = await supabase
        .from("properties")
        .select("views")
        .eq("id", propertyId)
        .single();

      const currentViews = currentProperty?.views || 0;

      // Update views count
      await supabase
        .from("properties")
        .update({ views: currentViews + 1 })
        .eq("id", propertyId);

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
        setError("Property not found");
        return;
      }

      // Fetch property images
      const { data: images } = await supabase
        .from("property_images")
        .select("*")
        .eq("property_id", propertyId)
        .order("sort_order", { ascending: true });

      // Fetch property documents (only if user owns the property or is admin/verifier)
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

      setProperty(enrichedProperty);
      setAgent(enrichedProperty.agent);
    } catch (err) {
      console.error("Error fetching property details:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch property details";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
    agent,
    refetch,
  };
}
