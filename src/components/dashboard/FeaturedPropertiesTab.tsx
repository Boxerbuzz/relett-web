import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PropertyCard } from "@/components/marketplace/PropertyCard";
import { PropertyGridSkeleton } from "@/components/ui/property-skeleton";
import { useFeaturedProperties } from "@/hooks/useFeaturedProperties";

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
  const { featuredProperties, loading } = useFeaturedProperties();

  // Convert kobo to naira for display
  const convertKoboToNaira = (kobo: number) => kobo / 100;

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
