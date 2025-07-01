
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlockchainStatusBadge } from '@/components/property/BlockchainStatusBadge';
import { 
  MapPin, 
  Eye, 
  Heart, 
  Share2, 
  Star,
  Bed,
  Bath,
  Square,
  TrendingUp
} from 'lucide-react';

interface PropertyCardProps {
  property: {
    id: string;
    title: string;
    location: string;
    price: string;
    image: string;
    bedrooms?: number;
    bathrooms?: number;
    area?: string;
    type: string;
    category: string;
    isVerified?: boolean;
    isTokenized?: boolean;
    isBlockchainRegistered?: boolean;
    blockchainTransactionId?: string;
    expectedROI?: number;
    rating?: number;
    reviewCount?: number;
    views?: number;
    likes?: number;
  };
  onView?: () => void;
  onLike?: () => void;
  onShare?: () => void;
  className?: string;
}

export function PropertyCard({ 
  property, 
  onView, 
  onLike, 
  onShare,
  className = "" 
}: PropertyCardProps) {
  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-all duration-200 group ${className}`}>
      {/* Property Image */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {property.isVerified && (
            <Badge className="bg-green-600 text-white border-0">
              Verified
            </Badge>
          )}
          {property.expectedROI && (
            <Badge className="bg-blue-600 text-white border-0">
              <TrendingUp className="w-3 h-3 mr-1" />
              {property.expectedROI}% ROI
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
            onClick={onLike}
          >
            <Heart className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
            onClick={onShare}
          >
            <Share2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Bottom category badge */}
        <div className="absolute bottom-3 left-3">
          <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
            {property.category}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        {/* Title and Location */}
        <div>
          <h3 className="font-semibold text-lg line-clamp-2 mb-1">
            {property.title}
          </h3>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{property.location}</span>
          </div>
        </div>

        {/* Property specs */}
        {(property.bedrooms || property.bathrooms || property.area) && (
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-3">
              {property.bedrooms && (
                <div className="flex items-center gap-1">
                  <Bed className="w-4 h-4" />
                  <span>{property.bedrooms}</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4" />
                  <span>{property.bathrooms}</span>
                </div>
              )}
              {property.area && (
                <div className="flex items-center gap-1">
                  <Square className="w-4 h-4" />
                  <span>{property.area}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Property type and tokenization status */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{property.type}</Badge>
          {property.isTokenized && (
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              Tokenized
            </Badge>
          )}
        </div>

        {/* Blockchain Status */}
        <BlockchainStatusBadge
          isRegistered={property.isBlockchainRegistered || false}
          transactionId={property.blockchainTransactionId}
          size="sm"
        />

        {/* Rating and Stats */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-4">
            {property.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{property.rating}</span>
                {property.reviewCount && (
                  <span>({property.reviewCount})</span>
                )}
              </div>
            )}
            <div className="flex items-center gap-3">
              {property.views && (
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{property.views}</span>
                </div>
              )}
              {property.likes && (
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{property.likes}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Price and Action */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div>
            <p className="text-xl font-bold text-primary">{property.price}</p>
            <p className="text-xs text-gray-500">
              {property.category === 'rent' ? 'per month' : 'total price'}
            </p>
          </div>
          <Button onClick={onView} className="flex-shrink-0">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
