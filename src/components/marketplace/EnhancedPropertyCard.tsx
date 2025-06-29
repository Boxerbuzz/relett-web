
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  HeartIcon,
  EyeIcon,
  MapPinIcon,
  StarIcon,
  ArrowRightIcon,
  BedIcon,
  CarIcon,
  HouseIcon,
  CurrencyDollarIcon,
} from "@phosphor-icons/react";
import { useState } from "react";

interface PropertyCardProps {
  property: {
    id: string;
    title?: string;
    location?: {
      address?: string;
      city?: string;
      state?: string;
    };
    price?: {
      amount?: number;
      currency?: string;
      period?: string;
    };
    category?: string;
    type?: string;
    sub_type?: string;
    views?: number;
    likes?: number;
    ratings?: number;
    backdrop?: string;
    is_featured?: boolean;
    is_verified?: boolean;
    is_tokenized?: boolean;
    created_at?: string;
    specification?: {
      bedrooms?: number;
      bathrooms?: number;
      area_sqm?: number;
      parking_spaces?: number;
    };
    amenities?: string[];
    property_images?: Array<{
      url: string;
      is_primary: boolean;
    }>;
    condition?: string;
    features?: string[];
  };
  onViewDetails?: (propertyId: string) => void;
  onToggleFavorite?: (propertyId: string) => void;
  className?: string;
}

export function EnhancedPropertyCard({
  property,
  onViewDetails,
  onToggleFavorite,
  className = "",
}: PropertyCardProps) {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(property.id);
    } else {
      navigate(`/properties/${property.id}`);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(property.id);
    }
  };

  const formatPrice = () => {
    if (!property.price?.amount) return "Price on request";
    const currency = property.price.currency === "USD" ? "$" : "₦";
    const amount = property.price.amount.toLocaleString();
    const period = property.price.period ? `/${property.price.period}` : "";
    return `${currency}${amount}${period}`;
  };

  const getPropertyImages = () => {
    if (property.property_images && property.property_images.length > 0) {
      return property.property_images;
    }
    return property.backdrop ? [{ url: property.backdrop, is_primary: true }] : [];
  };

  const images = getPropertyImages();
  const currentImage = images[currentImageIndex];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const getConditionColor = (condition?: string) => {
    switch (condition?.toLowerCase()) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'needs_renovation':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card
      className={`hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden ${className}`}
      onClick={handleViewDetails}
    >
      <div className="relative">
        {/* Property Image Gallery */}
        <div className="h-48 bg-gray-200 relative overflow-hidden">
          {currentImage ? (
            <>
              <img
                src={currentImage.url}
                alt={property.title || "Property"}
                className="w-full h-full object-cover"
                onLoad={() => setImageLoading(false)}
                onError={() => setImageLoading(false)}
              />
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
                  <HouseIcon className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              {/* Image Navigation */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                  >
                    <ArrowRightIcon className="h-4 w-4 rotate-180" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                  >
                    <ArrowRightIcon className="h-4 w-4" />
                  </button>
                  
                  {/* Image Indicators */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                    {images.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <HouseIcon className="h-12 w-12" />
            </div>
          )}

          {/* Status Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {property.is_featured && (
              <Badge className="bg-yellow-500 text-white text-xs">
                <StarIcon className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            )}
            {property.is_verified && (
              <Badge className="bg-green-500 text-white text-xs">
                Verified
              </Badge>
            )}
            {property.is_tokenized && (
              <Badge className="bg-purple-500 text-white text-xs">
                <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                Tokenized
              </Badge>
            )}
          </div>

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={handleToggleFavorite}
          >
            <HeartIcon className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className="p-4">
          {/* Property Category and Date */}
          <div className="flex justify-between items-start mb-2">
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-xs">
                {property.category || property.type || "Property"}
              </Badge>
              {property.condition && (
                <Badge variant="outline" className={`text-xs ${getConditionColor(property.condition)}`}>
                  {property.condition}
                </Badge>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {property.created_at &&
                new Date(property.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Property Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {property.title || "Untitled Property"}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 mb-3 text-gray-600">
            <MapPinIcon className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm truncate">
              {property.location?.address ||
                `${property.location?.city || ""} ${
                  property.location?.state || ""
                }`.trim() ||
                "Location not specified"}
            </span>
          </div>

          {/* Property Specifications */}
          {property.specification && (
            <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
              {property.specification.bedrooms && (
                <div className="flex items-center gap-1">
                  <BedIcon className="h-4 w-4" />
                  <span>{property.specification.bedrooms}</span>
                </div>
              )}
              {property.specification.bathrooms && (
                <div className="flex items-center gap-1">
                  <HouseIcon className="h-4 w-4" />
                  <span>{property.specification.bathrooms}</span>
                </div>
              )}
              {property.specification.parking_spaces && (
                <div className="flex items-center gap-1">
                  <CarIcon className="h-4 w-4" />
                  <span>{property.specification.parking_spaces}</span>
                </div>
              )}
              {property.specification.area_sqm && (
                <span className="text-xs">
                  {property.specification.area_sqm.toLocaleString()} sqm
                </span>
              )}
            </div>
          )}

          {/* Amenities Preview */}
          {property.amenities && property.amenities.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {property.amenities.slice(0, 3).map((amenity, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {amenity}
                  </Badge>
                ))}
                {property.amenities.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{property.amenities.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Price and Stats */}
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-lg text-green-600">
              {formatPrice()}
            </span>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <EyeIcon className="h-3 w-3" />
                {property.views || 0}
              </div>
              <div className="flex items-center gap-1">
                <HeartIcon className="h-3 w-3" />
                {property.likes || 0}
              </div>
              {property.ratings && property.ratings > 0 && (
                <div className="flex items-center gap-1">
                  <StarIcon className="h-3 w-3 fill-current text-yellow-500" />
                  {property.ratings.toFixed(1)}
                </div>
              )}
            </div>
          </div>

          {/* View Details Button */}
          <Button
            onClick={handleViewDetails}
            className="w-full"
            variant="outline"
          >
            View Details
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}
