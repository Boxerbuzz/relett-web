'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AdvancedPropertySearch } from './AdvancedPropertySearch';
import { PropertyComparison } from './PropertyComparison';
import { TokenizedPropertyMarketplace } from './TokenizedPropertyMarketplace';
import { InvestmentGroupManager } from '../investment/InvestmentGroupManager';
import { usePropertySearch } from '@/hooks/usePropertySearch';
import { 
  MagnifyingGlass, 
  GitDiff, 
  Coins, 
  Users,
  TrendUp
} from 'phosphor-react';

export function AdvancedMarketplace() {
  const [compareProperties, setCompareProperties] = useState([]);
  const [activeTab, setActiveTab] = useState('search');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const { 
    properties, 
    isLoading, 
    totalCount, 
    hasMore, 
    searchProperties, 
    clearResults 
  } = usePropertySearch();

  // Add initial fetch when component mounts
  useEffect(() => {
    // Fetch featured properties or recent listings initially
    const fetchInitialProperties = async () => {
      await searchProperties({
        limit: 12,
        offset: 0,
        sortBy: 'created_desc'
      });
    };

    fetchInitialProperties();
  }, []);

  const handleSearch = async (filters: any) => {
    clearResults();
    await searchProperties({
      ...filters,
      limit: 20,
      offset: 0
    });
  };

  const handleCompareProperty = (property: any) => {
    setCompareProperties(prev => {
      const exists = prev.find(p => p.id === property.id);
      if (exists) {
        return prev.filter(p => p.id !== property.id);
      }
      if (prev.length >= 3) {
        return [property, ...prev.slice(0, 2)];
      }
      return [property, ...prev];
    });
  };

  const removeFromComparison = (propertyId: string) => {
    setCompareProperties(prev => prev.filter(p => p.id !== propertyId));
  };

  const clearComparison = () => {
    setCompareProperties([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Property Marketplace</h1>
          <p className="text-gray-600">Discover, compare, and invest in properties</p>
        </div>
        
        {compareProperties.length > 0 && (
          <Badge className="bg-blue-100 text-blue-800 animate-pulse">
            {compareProperties.length} properties selected for comparison
          </Badge>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <MagnifyingGlass className="w-4 h-4" />
            Search & Browse
          </TabsTrigger>
          <TabsTrigger value="tokenized" className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Tokenized Properties
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Investment Groups
          </TabsTrigger>
          <TabsTrigger value="compare" className="flex items-center gap-2">
            <GitDiff className="w-4 h-4" />
            Compare ({compareProperties.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <AdvancedPropertySearch onSearch={handleSearch} loading={isLoading} />
          
          {/* Search Results */}
          {properties.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Search Results ({totalCount} properties found)
                </h3>
                {compareProperties.length > 0 && (
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer hover:bg-blue-50"
                    onClick={() => setActiveTab('compare')}
                  >
                    <GitDiff className="w-3 h-3 mr-1" />
                    Compare {compareProperties.length} properties
                  </Badge>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onCompare={() => handleCompareProperty(property)}
                    isSelected={compareProperties.some(p => p.id === property.id)}
                  />
                ))}
              </div>
              
              {hasMore && (
                <div className="text-center">
                  <button 
                    onClick={() => searchProperties({ offset: properties.length })}
                    className="text-blue-600 hover:text-blue-800"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Loading...' : 'Load More Properties'}
                  </button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tokenized">
          <TokenizedPropertyMarketplace />
        </TabsContent>

        <TabsContent value="groups">
          <InvestmentGroupManager onGroupSelect={setSelectedGroupId} />
        </TabsContent>

        <TabsContent value="compare">
          <PropertyComparison 
            properties={compareProperties}
            onRemoveProperty={removeFromComparison}
            onClearAll={clearComparison}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Property Card Component for Search Results
function PropertyCard({ property, onCompare, isSelected }: any) {
  const getPrimaryImage = (property: any) => {
    return property.property_images?.find((img: any) => img.is_primary)?.url || 
           property.property_images?.[0]?.url || 
           '/placeholder.svg';
  };

  const formatPrice = (price: any) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: price.currency || 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price.amount);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all ${
      isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <div className="relative">
        <img
          src={getPrimaryImage(property)}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        {property.is_featured && (
          <Badge className="absolute top-2 left-2">Featured</Badge>
        )}
        {property.is_tokenized && (
          <Badge className="absolute top-2 right-2 bg-purple-100 text-purple-800">
            <Coins className="w-3 h-3 mr-1" />
            Tokenized
          </Badge>
        )}
      </div>
      
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{property.title}</h3>
          <p className="text-gray-600 text-sm flex items-center">
            <span>{property.location?.city}, {property.location?.state}</span>
          </p>
        </div>
        
        <div className="flex items-center justify-between">
          <p className="text-2xl font-bold text-green-600">
            {formatPrice(property.price)}
          </p>
          {property.ratings > 0 && (
            <div className="flex items-center text-sm text-gray-600">
              <TrendUp className="w-4 h-4 mr-1" />
              {property.ratings.toFixed(1)}
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onCompare}
            className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
              isSelected 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {isSelected ? 'Remove from Compare' : 'Add to Compare'}
          </button>
          <button className="px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors">
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
