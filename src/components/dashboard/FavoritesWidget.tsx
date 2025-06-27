
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePropertyFavorites } from '@/hooks/usePropertyFavorites';
import { useProperties } from '@/hooks/useProperties';
import { useNavigate } from 'react-router-dom';
import { 
  HeartIcon, 
  MapPinIcon, 
  ArrowRightIcon,
  XIcon 
} from '@phosphor-icons/react';

export function FavoritesWidget() {
  const navigate = useNavigate();
  const { favorites, loading, removeFromFavorites } = usePropertyFavorites();
  const { properties } = useProperties();

  // Get property details for favorited properties
  const favoriteProperties = favorites.map(fav => {
    const property = properties?.find(p => p.id === fav.property_id);
    return {
      ...fav,
      property
    };
  }).filter(item => item.property);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartIcon className="h-5 w-5 text-red-500" />
            Favorite Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3 animate-pulse">
                <div className="w-16 h-12 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (favoriteProperties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HeartIcon className="h-5 w-5 text-red-500" />
            Favorite Properties
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No favorite properties yet</p>
            <Button 
              onClick={() => navigate('/marketplace')}
              variant="outline"
            >
              Browse Properties
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <HeartIcon className="h-5 w-5 text-red-500" />
            Favorite Properties
          </CardTitle>
          <Badge variant="outline">
            {favoriteProperties.length} saved
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {favoriteProperties.slice(0, 5).map((item) => (
            <div 
              key={item.id} 
              className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden">
                {item.property?.backdrop && (
                  <img 
                    src={item.property.backdrop} 
                    alt={item.property.title || 'Property'} 
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {item.property?.title || 'Property'}
                </h4>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <MapPinIcon className="w-3 h-3 mr-1" />
                  <span className="truncate">
                    {item.property?.location?.address || 'Location not specified'}
                  </span>
                </div>
                <p className="text-xs font-medium text-green-600 mt-1">
                  ₦{item.property?.price?.amount?.toLocaleString() || 'Price on request'}
                </p>
              </div>
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/property/${item.property_id}`)}
                >
                  <ArrowRightIcon className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeFromFavorites(item.property_id)}
                >
                  <XIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        {favoriteProperties.length > 5 && (
          <Button 
            variant="ghost" 
            className="w-full mt-3"
            onClick={() => navigate('/favorites')}
          >
            View All Favorites ({favoriteProperties.length})
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
