
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Eye, 
  MapPin, 
  Calendar,
  Star,
  ArrowRight
} from '@phosphor-icons/react';

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
    };
    category?: string;
    type?: string;
    views?: number;
    likes?: number;
    ratings?: number;
    backdrop?: string;
    is_featured?: boolean;
    created_at?: string;
  };
  onViewDetails?: (propertyId: string) => void;
  onToggleFavorite?: (propertyId: string) => void;
  className?: string;
}

export function PropertyCard({ 
  property, 
  onViewDetails,
  onToggleFavorite,
  className = "" 
}: PropertyCardProps) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(property.id);
    } else {
      navigate(`/property/${property.id}`);
    }
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite(property.id);
    }
  };

  const formatPrice = () => {
    if (!property.price?.amount) return 'Price on request';
    const currency = property.price.currency === 'USD' ? '$' : '₦';
    return `${currency}${property.price.amount.toLocaleString()}`;
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${className}`}>
      <div className="relative">
        {/* Property Image */}
        <div 
          className="h-48 bg-gray-200 rounded-t-lg bg-cover bg-center"
          style={{ 
            backgroundImage: property.backdrop ? `url(${property.backdrop})` : 'none' 
          }}
        >
          {!property.backdrop && (
            <div className="h-full flex items-center justify-center text-gray-400">
              <MapPin className="h-12 w-12" />
            </div>
          )}
          
          {/* Featured Badge */}
          {property.is_featured && (
            <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}

          {/* Favorite Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={handleToggleFavorite}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        <CardContent className="p-4">
          {/* Property Category */}
          <div className="flex justify-between items-start mb-2">
            <Badge variant="secondary" className="text-xs">
              {property.category || property.type || 'Property'}
            </Badge>
            <span className="text-xs text-gray-500">
              {property.created_at && new Date(property.created_at).toLocaleDateString()}
            </span>
          </div>

          {/* Property Title */}
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {property.title || 'Untitled Property'}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 mb-3 text-gray-600">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="text-sm truncate">
              {property.location?.address || 
               `${property.location?.city || ''} ${property.location?.state || ''}`.trim() || 
               'Location not specified'}
            </span>
          </div>

          {/* Price and Stats */}
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-lg text-green-600">
              {formatPrice()}
            </span>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                {property.views || 0}
              </div>
              <div className="flex items-center gap-1">
                <Heart className="h-3 w-3" />
                {property.likes || 0}
              </div>
              {property.ratings && property.ratings > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current text-yellow-500" />
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
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </div>
    </Card>
  );
}
