import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PropertyCard } from "@/components/marketplace/PropertyCard";
import { PropertyGridSkeleton } from "@/components/ui/property-skeleton";
import { supabase } from "@/integrations/supabase/client";

interface PropertyWithTokenization {
  id: string;
  title: string;
  location: any;
  price: any;
  views: number;
  is_verified: boolean;
  is_tokenized: boolean;
  backdrop?: string;
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

interface FeaturedPropertiesTabProps {
  isActive: boolean;
}

export function FeaturedPropertiesTab({
  isActive,
}: FeaturedPropertiesTabProps) {
  const [featuredProperties, setFeaturedProperties] = useState<
    PropertyWithTokenization[]
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isActive) {
      fetchFeaturedProperties();
    }
  }, [isActive]);

  // Convert kobo to naira for display
  const convertKoboToNaira = (kobo: number) => kobo / 100;

  const fetchFeaturedProperties = async () => {
    setLoading(true);
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
                token_price: convertKoboToNaira(tokenizedProperty.token_price),
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

      setFeaturedProperties(enrichedProperties as PropertyWithTokenization[]);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setFeaturedProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (propertyId: string) => {
    console.log("View details for property:", propertyId);
    // Navigate to property details page
  };

  const handleInvest = (propertyId: string) => {
    console.log("Invest in property:", propertyId);
    // Open investment dialog
  };

  const getPropertyImage = (property: PropertyWithTokenization) => {
    const primaryImage = property.property_images?.find(
      (img) => img.is_primary
    );
    return (
      primaryImage?.url ||
      property.backdrop ||
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"
    );
  };

  const getTokenizationData = (property: PropertyWithTokenization) => {
    if (!property.is_tokenized || !property.tokenized_properties) {
      return null;
    }

    const tokenData = property.tokenized_properties;
    const totalSupply = parseInt(tokenData.total_supply);
    const soldTokens = tokenData.token_holdings?.length || 0;
    const availableTokens = totalSupply - soldTokens;
    const investorCount = tokenData.token_holdings?.length || 0;

    return {
      tokenPrice: tokenData.token_price,
      totalTokens: totalSupply,
      availableTokens,
      expectedROI: tokenData.expected_roi,
      investorCount,
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Featured Investment Opportunities</CardTitle>
        <CardDescription>
          Discover verified properties available for tokenized investment
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <PropertyGridSkeleton count={6} />
        ) : featuredProperties.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No properties available at the moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProperties.map((property) => {
              const tokenData = getTokenizationData(property);

              // Transform the property data to match PropertyCard expectations
              const propertyForCard = {
                id: property.id,
                title: property.title,
                location: property.location,
                price: {
                  ...property.price,
                  amount: convertKoboToNaira(property.price?.amount || 0),
                },
                is_verified: property.is_verified,
                is_tokenized: property.is_tokenized,
                backdrop: getPropertyImage(property),
                views: property.views || 0,
                tokenized_property: tokenData
                  ? {
                      token_price: tokenData.tokenPrice,
                      expected_roi: tokenData.expectedROI,
                    }
                  : undefined,
                property_images: property.property_images || [],
              };

              return (
                <PropertyCard
                  key={property.id}
                  property={propertyForCard}
                  onViewDetails={() => handleViewDetails(property.id)}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
