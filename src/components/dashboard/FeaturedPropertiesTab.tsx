
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PropertyGridSkeleton } from "@/components/ui/property-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFeaturedProperties } from "@/hooks/useFeaturedProperties";
import { MapPinIcon , EyeIcon} from "@phosphor-icons/react";

interface PropertyWithTokenization {
  id: string;
  title: string;
  location: any;
  price: any;
  views: number;
  is_verified: boolean;
  is_tokenized: boolean;
  type?: string;
  category?: string;
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

  const getLocationString = (location: any) => {
    if (typeof location === "object" && location !== null) {
      return (
        `${location.city || ""}, ${location.state || ""}`
          .trim()
          .replace(/^,|,$/, "") || "Location not specified"
      );
    }
    return location || "Location not specified";
  };

  const getPriceString = (price: any) => {
    if (typeof price === "object" && price !== null) {
      const amount = price.amount || 0;
      const convertedAmount = convertKoboToNaira(amount);
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: price.currency || "NGN",
        minimumFractionDigits: 0,
      }).format(convertedAmount);
    }
    return "₦0";
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
                location: getLocationString(property.location),
                price: getPriceString(property.price),
                image: getPropertyImage(property),
                type: property.type || 'residential',
                category: property.type || 'property',
                isVerified: property.is_verified,
                isTokenized: property.is_tokenized,
                views: property.views || 0,
                expectedROI: tokenData?.expectedROI,
                likes: 0,
              };

              return (
                <FeaturedPropertyCard
                  key={property.id}
                  property={propertyForCard}
                  onView={() => handleViewDetails(property.id)}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Property Card Component for Featured Properties
function FeaturedPropertyCard({ property, onView }: any) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:border-gray-300 transition-all">
      <div className="relative">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        {property.isVerified && (
          <Badge className="absolute top-2 left-2 bg-green-100 text-green-800">
            Verified
          </Badge>
        )}
        {property.isTokenized && (
          <Badge className="absolute top-2 right-2 bg-purple-100 text-purple-800">
            Tokenized
          </Badge>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{property.title}</h3>
        
        <div className="flex items-center text-gray-600 mb-2">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-primary">{property.price}</span>
          <div className="flex items-center text-gray-500 text-sm">
            <EyeIcon className="h-4 w-4 mr-1" />
            {property.views}
          </div>
        </div>
        
        {property.expectedROI && (
          <div className="text-sm text-green-600 mb-3">
            Expected ROI: {property.expectedROI}%
          </div>
        )}
        
        <Button onClick={onView} className="w-full">
          View Details
        </Button>
      </div>
    </div>
  );
}