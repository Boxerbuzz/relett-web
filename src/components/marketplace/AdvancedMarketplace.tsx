'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, MapPin, Bed, Bath, Square, Heart, Compare, BookmarkPlus } from 'lucide-react';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import { PropertyComparison } from './PropertyComparison';
import { useToast } from '@/hooks/use-toast';

interface MarketplaceFilters {
  search: string;
  location: string;
  priceRange: [number, number];
  riskLevel: string;
  propertyType: string;
  minimumROI: number;
  sortBy: 'newest' | 'price-low' | 'price-high' | 'roi' | 'funding';
}

export function AdvancedMarketplace() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    priceMin: '',
    priceMax: '',
    location: '',
    sortBy: 'created_desc' as const
  });
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonProperties, setComparisonProperties] = useState<any[]>([]);
  const [showSaveSearch, setShowSaveSearch] = useState(false);
  const [searchName, setSearchName] = useState('');

  const { 
    properties, 
    isLoading, 
    totalCount, 
    hasMore, 
    searchProperties, 
    saveSearch,
    clearResults 
  } = usePropertySearch();
  const { toast } = useToast();

  // Perform initial search
  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = () => {
    const searchFilters = {
      query: searchQuery,
      category: filters.category || undefined,
      type: filters.type || undefined,
      priceMin: filters.priceMin ? parseInt(filters.priceMin) : undefined,
      priceMax: filters.priceMax ? parseInt(filters.priceMax) : undefined,
      location: filters.location || undefined,
      sortBy: filters.sortBy,
      limit: 20,
      offset: 0
    };

    clearResults();
    searchProperties(searchFilters);
  };

  const handleLoadMore = () => {
    const searchFilters = {
      query: searchQuery,
      category: filters.category || undefined,
      type: filters.type || undefined,
      priceMin: filters.priceMin ? parseInt(filters.priceMin) : undefined,
      priceMax: filters.priceMax ? parseInt(filters.priceMax) : undefined,
      location: filters.location || undefined,
      sortBy: filters.sortBy,
      limit: 20,
      offset: properties.length
    };

    searchProperties(searchFilters);
  };

  const handleSaveSearch = async () => {
    if (!searchName.trim()) {
      toast({
        title: 'Search name required',
        description: 'Please enter a name for your saved search.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await saveSearch(searchName, {
        query: searchQuery,
        ...filters
      });
      setShowSaveSearch(false);
      setSearchName('');
    } catch (error) {
      // Error handled in hook
    }
  };

  const toggleComparison = (property: any) => {
    setComparisonProperties(prev => {
      const exists = prev.find(p => p.id === property.id);
      if (exists) {
        return prev.filter(p => p.id !== property.id);
      } else if (prev.length < 3) {
        return [...prev, property];
      } else {
        toast({
          title: 'Comparison limit',
          description: 'You can compare up to 3 properties at once.',
          variant: 'destructive'
        });
        return prev;
      }
    });
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: price.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price.amount);
  };

  const getPrimaryImage = (property: any) => {
    return property.property_images?.find((img: any) => img.is_primary)?.url || 
           property.property_images?.[0]?.url || 
           '/placeholder.svg';
  };

  if (showComparison) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Property Comparison</h2>
          <Button onClick={() => setShowComparison(false)}>
            Back to Search
          </Button>
        </div>
        <PropertyComparison
          properties={comparisonProperties}
          onRemoveProperty={(id) => setComparisonProperties(prev => prev.filter(p => p.id !== id))}
          onClearAll={() => setComparisonProperties([])}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle>Advanced Property Search</CardTitle>
          <CardDescription>
            Find your perfect property with our advanced search and filtering options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search properties by title, description, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="residential">Residential</SelectItem>
                <SelectItem value="commercial">Commercial</SelectItem>
                <SelectItem value="land">Land</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="house">House</SelectItem>
                <SelectItem value="apartment">Apartment</SelectItem>
                <SelectItem value="condo">Condo</SelectItem>
                <SelectItem value="office">Office</SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Min Price"
              value={filters.priceMin}
              onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
              type="number"
            />

            <Input
              placeholder="Max Price"
              value={filters.priceMax}
              onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
              type="number"
            />

            <Input
              placeholder="Location"
              value={filters.location}
              onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
            />

            <Select value={filters.sortBy} onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_desc">Newest First</SelectItem>
                <SelectItem value="created_asc">Oldest First</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSaveSearch(true)}>
                <BookmarkPlus className="h-4 w-4 mr-2" />
                Save Search
              </Button>
              {comparisonProperties.length > 0 && (
                <Button variant="outline" onClick={() => setShowComparison(true)}>
                  <Compare className="h-4 w-4 mr-2" />
                  Compare ({comparisonProperties.length})
                </Button>
              )}
            </div>
            <div className="text-sm text-muted-foreground">
              {totalCount} properties found
            </div>
          </div>

          {/* Save Search Dialog */}
          {showSaveSearch && (
            <div className="flex gap-2 p-4 border rounded-lg bg-gray-50">
              <Input
                placeholder="Enter search name..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSaveSearch()}
              />
              <Button onClick={handleSaveSearch}>Save</Button>
              <Button variant="outline" onClick={() => setShowSaveSearch(false)}>Cancel</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading && properties.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              <Search className="mx-auto h-12 w-12 mb-4" />
              <p>No properties found matching your criteria.</p>
              <p>Try adjusting your search filters.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              const isInComparison = comparisonProperties.some(p => p.id === property.id);
              
              return (
                <Card key={property.id} className="hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={getPrimaryImage(property)}
                      alt={property.title}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => toggleComparison(property)}
                        className={isInComparison ? 'bg-blue-600 text-white' : ''}
                      >
                        <Compare className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    {property.is_featured && (
                      <Badge className="absolute top-2 left-2">Featured</Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg line-clamp-2">{property.title}</h3>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1" />
                        <span className="text-sm">{property.location?.city}, {property.location?.state}</span>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(property.price)}
                      </div>
                      {property.specification && (
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {property.specification.bedrooms && (
                            <div className="flex items-center">
                              <Bed className="h-4 w-4 mr-1" />
                              {property.specification.bedrooms}
                            </div>
                          )}
                          {property.specification.bathrooms && (
                            <div className="flex items-center">
                              <Bath className="h-4 w-4 mr-1" />
                              {property.specification.bathrooms}
                            </div>
                          )}
                          {property.specification.sqft && (
                            <div className="flex items-center">
                              <Square className="h-4 w-4 mr-1" />
                              {property.specification.sqft} ft²
                            </div>
                          )}
                        </div>
                      )}
                      <Button className="w-full mt-4">View Details</Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Properties'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
