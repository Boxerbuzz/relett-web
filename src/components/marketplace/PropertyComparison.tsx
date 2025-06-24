
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, MapPin, Bed, Shower, Square, Star } from 'phosphor-react';
import { getAmenityById } from '@/types/amenities';

interface Property {
  id: string;
  title: string;
  price: { amount: number; currency: string };
  location: { city: string; state: string };
  specification: { bedrooms?: number; bathrooms?: number; sqft?: number };
  amenities: string[];
  features: string[];
  property_images: Array<{ url: string; is_primary: boolean }>;
  ratings?: number;
  is_featured: boolean;
}

interface PropertyComparisonProps {
  properties: Property[];
  onRemoveProperty: (propertyId: string) => void;
  onClearAll: () => void;
}

export function PropertyComparison({ properties, onRemoveProperty, onClearAll }: PropertyComparisonProps) {
  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            <p>Select properties to compare side by side</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatPrice = (price: Property['price']) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price.amount);
  };

  const getAllAmenities = () => {
    const allAmenities = new Set<string>();
    properties.forEach(property => {
      property.amenities?.forEach(amenity => allAmenities.add(amenity));
    });
    return Array.from(allAmenities);
  };

  const getAllFeatures = () => {
    const allFeatures = new Set<string>();
    properties.forEach(property => {
      property.features?.forEach(feature => allFeatures.add(feature));
    });
    return Array.from(allFeatures);
  };

  const getPrimaryImage = (property: Property) => {
    return property.property_images?.find(img => img.is_primary)?.url || 
           property.property_images?.[0]?.url || 
           '/placeholder.svg';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Property Comparison</CardTitle>
            <CardDescription>
              Compare {properties.length} properties side by side
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onClearAll}>
            Clear All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-max">
            {properties.map((property) => (
              <div key={property.id} className="min-w-80 space-y-4">
                {/* Property Header */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
                    onClick={() => onRemoveProperty(property.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <img
                    src={getPrimaryImage(property)}
                    alt={property.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  {property.is_featured && (
                    <Badge className="absolute top-2 left-2">Featured</Badge>
                  )}
                </div>

                {/* Basic Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg line-clamp-2">{property.title}</h3>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">{property.location.city}, {property.location.state}</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(property.price)}
                  </div>
                  {property.ratings && (
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-sm">{property.ratings.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Specifications */}
                <div className="space-y-2">
                  <h4 className="font-medium">Specifications</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center">
                      <Bed className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{property.specification?.bedrooms || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Shower className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{property.specification?.bathrooms || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <Square className="h-4 w-4 mr-1 text-muted-foreground" />
                      <span>{property.specification?.sqft ? `${property.specification.sqft} ft²` : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Amenities */}
                <div className="space-y-2">
                  <h4 className="font-medium">Amenities</h4>
                  <div className="space-y-1">
                    {getAllAmenities().map((amenity) => (
                      <div key={amenity} className="flex items-center justify-between text-sm">
                        <span>{getAmenityById(amenity)?.name || amenity}</span>
                        <span className={property.amenities?.includes(amenity) ? 'text-green-600' : 'text-red-600'}>
                          {property.amenities?.includes(amenity) ? '✓' : '✗'}
                        </span>
                      </div>
                    ))}
                    {getAllAmenities().length === 0 && (
                      <span className="text-muted-foreground text-sm">No amenities listed</span>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Features */}
                <div className="space-y-2">
                  <h4 className="font-medium">Features</h4>
                  <div className="space-y-1">
                    {getAllFeatures().map((feature) => (
                      <div key={feature} className="flex items-center justify-between text-sm">
                        <span>{feature}</span>
                        <span className={property.features?.includes(feature) ? 'text-green-600' : 'text-red-600'}>
                          {property.features?.includes(feature) ? '✓' : '✗'}
                        </span>
                      </div>
                    ))}
                    {getAllFeatures().length === 0 && (
                      <span className="text-muted-foreground text-sm">No features listed</span>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-2">
                  <Button className="w-full">View Details</Button>
                  <Button variant="outline" className="w-full">Contact Agent</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
