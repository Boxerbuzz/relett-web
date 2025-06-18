
'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PropertyDetailsDialog } from '@/components/dialogs/PropertyDetailsDialog';
import { 
  MapPin, 
  Eye, 
  Heart, 
  TrendingUp, 
  Star,
  CheckCircle,
  Crown
} from 'phosphor-react';

interface PropertyCardProps {
  property: {
    id: string;
    title?: string;
    location: any;
    price: any;
    status?: string;
    category?: string;
    type?: string;
    is_verified?: boolean;
    is_tokenized?: boolean;
    is_featured?: boolean;
    backdrop?: string;
    ratings?: number;
    review_count?: number;
    views?: number;
    likes?: number;
    tokenized_property?: {
      token_price: number;
      expected_roi: number;
    };
    property_images?: Array<{
      url: string;
      is_primary: boolean;
    }>;
  };
  onViewDetails?: () => void;
}

export function PropertyCard({ property, onViewDetails }: PropertyCardProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const getPrimaryImage = () => {
    if (property.property_images?.length) {
      const primaryImage = property.property_images.find(img => img.is_primary);
      return primaryImage?.url || property.property_images[0]?.url;
    }
    return property.backdrop || '/placeholder.svg';
  };

  const getLocationString = () => {
    if (!property.location) return 'Location not specified';
    if (typeof property.location === 'string') return property.location;
    
    const { address, city, state } = property.location;
    return [address, city, state].filter(Boolean).join(', ');
  };

  const formatPrice = (price: any) => {
    if (!price) return 'Price not available';
    if (typeof price === 'string') return price;
    if (typeof price === 'number') return `₦${price.toLocaleString()}`;
    if (price.amount) return `₦${price.amount.toLocaleString()}`;
    return 'Price not available';
  };

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      setDetailsOpen(true);
    }
  };

  return (
    <>
      <Card className="group hover:shadow-lg transition-shadow duration-200 cursor-pointer">
        <div className="relative">
          {/* Property Image */}
          <div className="aspect-video relative overflow-hidden rounded-t-lg">
            <img 
              src={getPrimaryImage()}
              alt={property.title || 'Property'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
            
            {/* Badges Overlay */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1">
              {property.is_featured && (
                <Badge className="bg-orange-500 text-xs">
                  <Crown size={12} className="mr-1" />
                  Featured
                </Badge>
              )}
              {property.is_verified && (
                <Badge className="bg-green-500 text-xs">
                  <CheckCircle size={12} className="mr-1" />
                  Verified
                </Badge>
              )}
              {property.is_tokenized && (
                <Badge className="bg-blue-500 text-xs">
                  <TrendingUp size={12} className="mr-1" />
                  Tokenized
                </Badge>
              )}
            </div>

            {/* Stats Overlay */}
            <div className="absolute top-3 right-3 flex gap-2">
              {property.views && (
                <Badge variant="secondary" className="text-xs bg-black/50 text-white">
                  <Eye size={12} className="mr-1" />
                  {property.views}
                </Badge>
              )}
              {property.likes && (
                <Badge variant="secondary" className="text-xs bg-black/50 text-white">
                  <Heart size={12} className="mr-1" />
                  {property.likes}
                </Badge>
              )}
            </div>
          </div>

          {/* Property Info */}
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Title and Rating */}
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg line-clamp-2">
                  {property.title || 'Untitled Property'}
                </h3>
                {property.ratings && (
                  <div className="flex items-center gap-1 text-sm">
                    <Star size={16} weight="fill" className="text-yellow-400" />
                    <span className="font-medium">{property.ratings.toFixed(1)}</span>
                    <span className="text-gray-500">({property.review_count || 0})</span>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} />
                <span className="text-sm line-clamp-1">{getLocationString()}</span>
              </div>

              {/* Price and ROI */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-gray-900">
                    {formatPrice(property.price)}
                  </p>
                  {property.tokenized_property && (
                    <p className="text-sm text-gray-600">
                      ₦{property.tokenized_property.token_price} per token
                    </p>
                  )}
                </div>
                {property.tokenized_property?.expected_roi && (
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      {property.tokenized_property.expected_roi}% ROI
                    </p>
                    <p className="text-xs text-gray-500">Expected</p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <Button 
                onClick={handleViewDetails}
                className="w-full"
                variant="outline"
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>

      <PropertyDetailsDialog
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        propertyId={property.id}
      />
    </>
  );
}
