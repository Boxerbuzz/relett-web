import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, cacheConfig } from "@/lib/queryClient";

interface PropertyWithTokenization {
  id: string;
  title: string;
  location: any;
  price: any;
  views: number;
  is_verified: boolean;
  is_tokenized: boolean;
  type: string;
  backdrop?: string;
  tokenized_property_id?: string;
  tokenized_properties?: {
    token_price: number;
    total_supply: string;
    expected_roi: number;
    token_holdings: any[];
  };
  property_images?: Array<{
    url: string;
    is_primary: boolean;
  }>;
}

export function useFeaturedProperties() {
  const convertKoboToNaira = (kobo: number) => kobo / 100;

  const {
    data: featuredProperties = [],
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.properties.featured(),
    queryFn: async (): Promise<PropertyWithTokenization[]> => {
      console.log("Fetching featured properties...");

      try {
        const { data, error } = await supabase
          .from("properties")
          .select(
            `
            id,
            title,
            location,
            price,
            views,
            is_verified,
            is_tokenized,
            type,
            backdrop,
            tokenized_property_id
          `
          )
          .eq("status", "active")
          .eq("is_verified", true)
          .order("created_at", { ascending: false })
          .limit(6);

        if (error) throw error;

        // Fetch additional data for each property
        const enrichedProperties = await Promise.all(
          (data || []).map(async (property) => {
            // Fetch property images
            const { data: images } = await supabase
              .from("property_images")
              .select("url, is_primary")
              .eq("property_id", property.id)
              .order("sort_order", { ascending: true });

            // Fetch tokenized property data if tokenized
            let tokenizedData: {
              token_price: number;
              total_supply: string;
              expected_roi: number;
              token_holdings: any[];
            } | null = null;
            if (property.is_tokenized && property.tokenized_property_id) {
              const { data: tokenizedProperty } = await supabase
                .from("tokenized_properties")
                .select(
                  `
                  token_price,
                  total_supply,
                  expected_roi,
                  token_holdings(id)
                `
                )
                .eq("id", property.tokenized_property_id)
                .single();

              if (tokenizedProperty) {
                tokenizedData = {
                  token_price: convertKoboToNaira(
                    tokenizedProperty.token_price
                  ),
                  total_supply: tokenizedProperty.total_supply,
                  expected_roi: tokenizedProperty.expected_roi,
                  token_holdings: tokenizedProperty.token_holdings || [],
                };
              }
            }

            return {
              ...property,
              property_images: images || [],
              tokenized_properties: tokenizedData,
            };
          })
        );

        console.log(
          "Successfully fetched featured properties:",
          enrichedProperties.length
        );
        return enrichedProperties as PropertyWithTokenization[];
      } catch (err) {
        console.error("Error fetching featured properties:", err);
        throw err;
      }
    },
    ...cacheConfig.standard, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const error = queryError?.message || null;

  return {
    featuredProperties,
    loading,
    error,
    refetch,
  };
}
