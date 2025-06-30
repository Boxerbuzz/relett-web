"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Search, Filter, X, Coins } from "lucide-react";

interface SearchFilters {
  query: string;
  propertyType: string;
  location: string;
  priceRange: [number, number];
  tokenPriceRange: [number, number];
  isTokenized: boolean | null;
  minROI: number;
  amenities: string[];
  features: string[];
}

interface AdvancedPropertySearchProps {
  onSearch: (filters: SearchFilters) => void;
  loading?: boolean;
}

const PROPERTY_TYPES = [
  { value: "all", label: "All Types" },
  { value: "residential", label: "Residential" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
  { value: "mixed_use", label: "Mixed Use" },
];

const AMENITIES = [
  "Swimming Pool",
  "Gym",
  "Parking",
  "Security",
  "Generator",
  "Wi-Fi",
  "Air Conditioning",
  "Balcony",
  "Garden",
  "Elevator",
];

const FEATURES = [
  "Furnished",
  "Pet Friendly",
  "Newly Built",
  "Renovated",
  "Gated Community",
  "Close to Schools",
  "Close to Hospital",
  "Public Transport",
  "Shopping Center",
  "Beach Front",
];

export function AdvancedPropertySearch({
  onSearch,
  loading = false,
}: AdvancedPropertySearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    propertyType: "all",
    location: "",
    priceRange: [0, 1000000000],
    tokenPriceRange: [0, 10000],
    isTokenized: null,
    minROI: 0,
    amenities: [],
    features: [],
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleArrayToggle = (key: "amenities" | "features", value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value],
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: "",
      propertyType: "all",
      location: "",
      priceRange: [0, 1000000000],
      tokenPriceRange: [0, 10000],
      isTokenized: null,
      minROI: 0,
      amenities: [],
      features: [],
    });
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Property Search
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Search */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search-query">Search Properties</Label>
            <Input
              id="search-query"
              placeholder="Search by title, description..."
              value={filters.query}
              onChange={(e) => handleFilterChange("query", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="property-type">Property Type</Label>
            <Select
              value={filters.propertyType}
              onValueChange={(value) =>
                handleFilterChange("propertyType", value)
              }
            >
              <SelectTrigger id="property-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="City, State, or Address"
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            />
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Advanced Filters
            {showAdvanced ? <X className="w-4 h-4" /> : null}
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={clearFilters}>
              Clear All
            </Button>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? "Searching..." : "Search Properties"}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6 border-t pt-6">
            {/* Price Range */}
            <div className="space-y-4">
              <Label>Price Range</Label>
              <div className="px-4">
                <Slider
                  value={filters.priceRange}
                  onValueChange={(value) =>
                    handleFilterChange("priceRange", value)
                  }
                  max={1000000000}
                  min={0}
                  step={1000000}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>{formatCurrency(filters.priceRange[0])}</span>
                  <span>{formatCurrency(filters.priceRange[1])}</span>
                </div>
              </div>
            </div>

            {/* Tokenization Filter */}
            <div className="space-y-3">
              <Label>Property Status</Label>
              <div className="flex gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all-properties"
                    checked={filters.isTokenized === null}
                    onCheckedChange={() =>
                      handleFilterChange("isTokenized", null)
                    }
                  />
                  <Label htmlFor="all-properties">All Properties</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="tokenized"
                    checked={filters.isTokenized === true}
                    onCheckedChange={() =>
                      handleFilterChange("isTokenized", true)
                    }
                  />
                  <Label
                    htmlFor="tokenized"
                    className="flex items-center gap-1"
                  >
                    <Coins className="w-4 h-4" />
                    Tokenized Only
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="traditional"
                    checked={filters.isTokenized === false}
                    onCheckedChange={() =>
                      handleFilterChange("isTokenized", false)
                    }
                  />
                  <Label htmlFor="traditional">Traditional Only</Label>
                </div>
              </div>
            </div>

            {/* Token Price Range (for tokenized properties) */}
            {filters.isTokenized !== false && (
              <div className="space-y-4">
                <Label>Token Price Range (USD)</Label>
                <div className="px-4">
                  <Slider
                    value={filters.tokenPriceRange}
                    onValueChange={(value) =>
                      handleFilterChange("tokenPriceRange", value)
                    }
                    max={10000}
                    min={0}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-gray-600 mt-2">
                    <span>${filters.tokenPriceRange[0]}</span>
                    <span>${filters.tokenPriceRange[1]}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Minimum ROI */}
            {filters.isTokenized !== false && (
              <div className="space-y-4">
                <Label>Minimum Expected ROI (%)</Label>
                <div className="px-4">
                  <Slider
                    value={[filters.minROI]}
                    onValueChange={(value) =>
                      handleFilterChange("minROI", value[0])
                    }
                    max={50}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600 mt-2">
                    Minimum {filters.minROI}% ROI
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Amenities */}
            <div className="space-y-3">
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {AMENITIES.map((amenity) => (
                  <div key={amenity} className="flex items-center space-x-2">
                    <Checkbox
                      id={`amenity-${amenity}`}
                      checked={filters.amenities.includes(amenity)}
                      onCheckedChange={() =>
                        handleArrayToggle("amenities", amenity)
                      }
                    />
                    <Label htmlFor={`amenity-${amenity}`} className="text-sm">
                      {amenity}
                    </Label>
                  </div>
                ))}
              </div>
              {filters.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {filters.amenities.map((amenity) => (
                    <Badge
                      key={amenity}
                      variant="secondary"
                      className="text-xs"
                    >
                      {amenity}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => handleArrayToggle("amenities", amenity)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Features */}
            <div className="space-y-3">
              <Label>Features</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {FEATURES.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={`feature-${feature}`}
                      checked={filters.features.includes(feature)}
                      onCheckedChange={() =>
                        handleArrayToggle("features", feature)
                      }
                    />
                    <Label htmlFor={`feature-${feature}`} className="text-sm">
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
              {filters.features.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {filters.features.map((feature) => (
                    <Badge
                      key={feature}
                      variant="secondary"
                      className="text-xs"
                    >
                      {feature}
                      <X
                        className="w-3 h-3 ml-1 cursor-pointer"
                        onClick={() => handleArrayToggle("features", feature)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


//So we have agent_interactions, agent_performance_metrics, learning_patterns, property_views, saved_searches, smart_contracts, user_devices, user_behaviour_profiles