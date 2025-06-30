
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, MapPin, DollarSign, Home, Star } from 'lucide-react';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';

interface AdvancedSearchWidgetProps {
  onResults: (results: any) => void;
}

export function AdvancedSearchWidget({ onResults }: AdvancedSearchWidgetProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const { search, getSuggestions, isSearching, searchResults } = useAdvancedSearch();

  const handleSearch = async () => {
    const filters = {
      query: searchQuery,
      location: location ? { city: location } : undefined,
      propertyType: propertyTypes.length > 0 ? propertyTypes : undefined,
      price: {
        min: priceRange.min ? parseInt(priceRange.min) : undefined,
        max: priceRange.max ? parseInt(priceRange.max) : undefined,
      },
      sortBy: 'relevance' as const,
    };

    const results = await search(filters);
    onResults(results);
  };

  const handleQueryChange = async (value: string) => {
    setSearchQuery(value);
    if (value.length > 2) {
      const newSuggestions = await getSuggestions(value);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const togglePropertyType = (type: string) => {
    setPropertyTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Advanced Property Search
        </CardTitle>
        <CardDescription>
          Find properties with advanced filters and intelligent search
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Query */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Search Properties</label>
          <div className="relative">
            <Input
              placeholder="e.g., 3 bedroom apartment with swimming pool"
              value={searchQuery}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="pr-10"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-white border rounded-md shadow-sm max-h-40 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
                  onClick={() => {
                    setSearchQuery(suggestion);
                    setSuggestions([]);
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Location */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Location
          </label>
          <Input
            placeholder="City, State, or Area"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        {/* Property Types */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <Home className="h-4 w-4" />
            Property Types
          </label>
          <div className="flex flex-wrap gap-2">
            {['residential', 'commercial', 'industrial', 'land'].map((type) => (
              <button
                key={type}
                onClick={() => togglePropertyType(type)}
                className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                  propertyTypes.includes(type)
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            Price Range (NGN)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Min price"
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
            />
            <Input
              placeholder="Max price"
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
            />
          </div>
        </div>

        {/* Search Button */}
        <Button 
          onClick={handleSearch} 
          className="w-full"
          disabled={isSearching}
        >
          {isSearching ? 'Searching...' : 'Search Properties'}
        </Button>

        {/* Results Summary */}
        {searchResults && (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium">
                {searchResults.totalCount} properties found
              </span>
              {searchResults.results.length > 0 && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="h-4 w-4" />
                  Sorted by relevance
                </div>
              )}
            </div>

            {/* Facets */}
            {searchResults.facets.locations.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Popular Locations</div>
                <div className="flex flex-wrap gap-1">
                  {searchResults.facets.locations.slice(0, 5).map((loc, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {loc.name} ({loc.count})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
