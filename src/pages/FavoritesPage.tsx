
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePropertyFavorites } from '@/hooks/usePropertyFavorites';
import { useProperties } from '@/hooks/useProperties';
import { useNavigate } from 'react-router-dom';
import { 
  HeartIcon, 
  SearchIcon,
  MapPinIcon,
  TrashIcon,
  ArrowLeftIcon
} from '@phosphor-icons/react';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
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

  // Filter favorites based on search term
  const filteredFavorites = favoriteProperties.filter(item =>
    item.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.property?.location?.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <HeartIcon className="h-6 w-6 text-red-500" />
              Favorite Properties
            </h1>
            <p className="text-gray-600">
              Manage your saved properties
            </p>
          </div>
        </div>
        <Badge variant="outline">
          {favoriteProperties.length} saved
        </Badge>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search favorites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Favorites Grid */}
      {filteredFavorites.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <HeartIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {favoriteProperties.length === 0 ? 'No favorites yet' : 'No results found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {favoriteProperties.length === 0 
                ? 'Start exploring properties and save your favorites'
                : 'Try adjusting your search terms'
              }
            </p>
            <Button onClick={() => navigate('/marketplace')}>
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <div className="h-48 bg-gray-200">
                  {item.property?.backdrop && (
                    <img 
                      src={item.property.backdrop} 
                      alt={item.property.title || 'Property'} 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2"
                  onClick={() => removeFromFavorites(item.property_id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2 truncate">
                  {item.property?.title || 'Property'}
                </h3>
                <div className="flex items-center text-gray-600 mb-2">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm truncate">
                    {item.property?.location?.address || 'Location not specified'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold text-green-600">
                    ₦{item.property?.price?.amount?.toLocaleString() || 'Price on request'}
                  </p>
                  <Badge variant="secondary">
                    {item.property?.category}
                  </Badge>
                </div>
                {item.notes && (
                  <p className="text-sm text-gray-500 mt-2 truncate">
                    Note: {item.notes}
                  </p>
                )}
                <Button 
                  className="w-full mt-4"
                  onClick={() => navigate(`/property/${item.property_id}`)}
                >
                  View Property
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
