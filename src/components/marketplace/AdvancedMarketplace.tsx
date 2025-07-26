"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AdvancedPropertySearch } from "./AdvancedPropertySearch";
import { PropertyComparison } from "./PropertyComparison";
import { TokenizedPropertyMarketplace } from "./TokenizedPropertyMarketplace";
import { InvestmentGroupManager } from "../investment/InvestmentGroupManager";
import { Property, usePropertySearch } from "@/hooks/usePropertySearch";
import {
  MagnifyingGlassIcon,
  GitDiffIcon,
  CoinsIcon,
  UsersIcon,
  CheckCircleIcon,
  MapPinIcon,
  BedIcon,
  ShowerIcon,
  SquareIcon,
  CarIcon,
  EyeIcon,
  HeartIcon,
  ArrowRightIcon,
  StarIcon,
  CornersInIcon,
  FrameCornersIcon,
} from "@phosphor-icons/react";
import { getAmenityById } from "@/types/amenities";
import { EnhancedPropertyPricing } from "@/types/property";
import { capitalize } from "@/lib/utils";
import { useFullscreen } from "@/hooks/useFullscreen";
import { Button } from "@/components/ui/button";

export function AdvancedMarketplace() {
  const [compareProperties, setCompareProperties] = useState<Property[]>([]);
  const [activeTab, setActiveTab] = useState("search");
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const {
    properties,
    isLoading,
    totalCount,
    hasMore,
    searchProperties,
    clearResults,
  } = usePropertySearch();

  // Add initial fetch when component mounts
  useEffect(() => {
    // Fetch featured properties or recent listings initially
    const fetchInitialProperties = async () => {
      await searchProperties({
        limit: 12,
        offset: 0,
        sortBy: "created_desc",
      });
    };

    fetchInitialProperties();
  }, []);

  const handleSearch = async (filters: any) => {
    clearResults();
    await searchProperties({
      ...filters,
      limit: 20,
      offset: 0,
    });
  };

  const handleCompareProperty = (property: Property) => {
    setCompareProperties((prev) => {
      const exists = prev.find((p) => p.id === property.id);
      if (exists) {
        return prev.filter((p) => p.id !== property.id);
      }
      if (prev.length >= 3) {
        return [property, ...prev.slice(0, 2)];
      }
      return [property, ...prev];
    });
  };

  const removeFromComparison = (propertyId: string) => {
    setCompareProperties((prev) => prev.filter((p) => p.id !== propertyId));
  };

  const clearComparison = () => {
    setCompareProperties([]);
  };

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Property Marketplace</h1>
          <p className="text-gray-600">
            Discover, compare, and invest in properties
          </p>
        </div>

        <div className="flex items-center gap-3">
          {compareProperties.length > 0 && (
            <Badge className="bg-blue-100 text-blue-800 animate-pulse">
              {compareProperties.length} properties selected for comparison
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <CornersInIcon className="h-4 w-4 mr-2" />
            ) : (
              <FrameCornersIcon className="h-4 w-4 mr-2" />
            )}
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full relative"
      >
        <TabsList className="w-full flex md:grid md:grid-cols-4 px-2 md:px-0">
          <TabsTrigger
            value="search"
            className="flex items-center gap-2 flex-1 md:flex-none"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            <span className="hidden md:inline">Search & Browse</span>
          </TabsTrigger>
          <TabsTrigger
            value="tokenized"
            className="flex items-center gap-2 flex-1 md:flex-none"
          >
            <CoinsIcon className="w-4 h-4" />
            <span className="hidden md:inline">Tokenized Properties</span>
          </TabsTrigger>
          <TabsTrigger
            value="groups"
            className="flex items-center gap-2 flex-1 md:flex-none"
          >
            <UsersIcon className="w-4 h-4" />
            <span className="hidden md:inline">Investment Groups</span>
          </TabsTrigger>
          <TabsTrigger
            value="compare"
            className="flex items-center gap-2 flex-1 md:flex-none"
          >
            <GitDiffIcon className="w-4 h-4" />
            <span className="hidden md:inline">
              Compare ({compareProperties.length})
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <AdvancedPropertySearch onSearch={handleSearch} loading={isLoading} />

          {/* Search Results */}
          {properties.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Search Results ({totalCount} properties found)
                </h3>
                {compareProperties.length > 0 && (
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => setActiveTab("compare")}
                  >
                    <GitDiffIcon className="w-3 h-3 mr-1" />
                    Compare {compareProperties.length} properties
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 lg:gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onCompare={() => handleCompareProperty(property)}
                    isSelected={compareProperties.some(
                      (p) => p.id === property.id
                    )}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() =>
                      searchProperties({ offset: properties.length })
                    }
                    className="text-blue-600 hover:text-blue-800"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Load More Properties"}
                  </button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tokenized">
          <TokenizedPropertyMarketplace />
        </TabsContent>

        <TabsContent value="groups">
          <InvestmentGroupManager onGroupSelect={setSelectedGroupId} />
        </TabsContent>

        <TabsContent value="compare">
          <PropertyComparison
            properties={compareProperties}
            onRemoveProperty={removeFromComparison}
            onClearAll={clearComparison}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Property Card Component for Search Results
function PropertyCard({ property, onCompare, isSelected }: any) {
  const navigate = useNavigate();
  const getPrimaryImage = (property: any) => {
    return (
      property.property_images?.find((img: any) => img.is_primary)?.url ||
      property.property_images?.[0]?.url ||
      "/placeholder.svg"
    );
  };

  const formatPrice = (price: EnhancedPropertyPricing) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: price.currency || "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price.amount / 100);
  };

  const formatArea = (area: number) => {
    return `${area?.toLocaleString()} sqm`;
  };

  const getTopAmenities = (amenities: string[]) => {
    if (!amenities || amenities.length === 0) return [];
    return amenities
      .slice(0, 3)
      .map((amenity) => getAmenityById(amenity)?.name);
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all ${
        isSelected
          ? "border-blue-500 ring-2 ring-blue-200"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      <div className="relative">
        <img
          src={getPrimaryImage(property)}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        {property.is_featured && (
          <Badge className="absolute top-2 left-2">Featured</Badge>
        )}
        {property.is_tokenized && (
          <Badge className="absolute top-2 right-2 bg-purple-100 text-purple-800">
            <CoinsIcon className="w-3 h-3 mr-1" />
            Tokenized
          </Badge>
        )}
        {property.is_verified && (
          <Badge className="absolute bottom-2 left-2 bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Verified
          </Badge>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg line-clamp-1">
              {property.title}
            </h3>
            {property.condition && (
              <span className="text-xs px-2 py-1 bg-blue-50 text-blue-600 rounded-full">
                {capitalize(property.condition)}
              </span>
            )}
          </div>
          <p className="text-gray-600 text-sm flex items-center">
            <MapPinIcon className="w-3 h-3 mr-1" />
            {property.location?.city}, {property.location?.state}
          </p>
          {property.type && (
            <p className="text-xs text-gray-500 mt-1">
              {capitalize(property.category)} • {capitalize(property.type)}
            </p>
          )}
        </div>

        {/* Property Specifications */}
        {property.specification && (
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {property.specification.bedrooms && (
              <div className="flex items-center">
                <BedIcon className="w-4 h-4 mr-1" />
                {property.specification.bedrooms}
              </div>
            )}
            {property.specification.bathrooms && (
              <div className="flex items-center">
                <ShowerIcon className="w-4 h-4 mr-1" />
                {property.specification.bathrooms}
              </div>
            )}
            {property.specification.area_sqm && (
              <div className="flex items-center">
                <SquareIcon className="w-4 h-4 mr-1" />
                {formatArea(property.specification.area)}
              </div>
            )}
            {property.specification.parking_spaces > 0 && (
              <div className="flex items-center">
                <CarIcon className="w-4 h-4 mr-1" />
                {property.specification.parking_spaces}
              </div>
            )}
          </div>
        )}

        {/* Top Amenities */}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {getTopAmenities(property.amenities).map((amenity, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
              >
                {amenity}
              </span>
            ))}
            {property.amenities.length > 3 && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                +{property.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <p className="text-2xl font-bold text-green-600">
              {formatPrice(property.price)}
            </p>
            {property.price?.term && (
              <p className="text-xs text-gray-500 font-semibold mt-1">
                /{capitalize(property.price.term)}
              </p>
            )}
          </div>
          <div className="text-right">
            {property.ratings > 0 && (
              <div className="flex items-center text-sm text-gray-600 mb-1">
                <StarIcon className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                {property.ratings.toFixed(1)}
              </div>
            )}
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {property.views > 0 && (
                <span className="flex items-center">
                  <EyeIcon className="w-3 h-3 mr-1" />
                  {property.views}
                </span>
              )}
              {property.likes > 0 && (
                <span className="flex items-center">
                  <HeartIcon className="w-3 h-3 mr-1" />
                  {property.likes}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Year Built */}
        {property.year_built && (
          <div className="text-xs text-gray-500">
            Built in {new Date(property.year_built).getFullYear()}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCompare}
            className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
              isSelected
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isSelected ? "Remove from Compare" : "Add to Compare"}
          </button>
          <button
            type="button"
            className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center"
            onClick={() => navigate(`/properties/${property.id}`)}
          >
            View Details
            <ArrowRightIcon className="w-3 h-3 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
}
