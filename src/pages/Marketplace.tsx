'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MagnifyingGlass, MapPin, Heart, TrendUp, Fire } from 'phosphor-react';

const marketplaceProperties = [
  {
    id: 1,
    title: 'Prime Commercial Land',
    location: 'Victoria Island, Lagos',
    size: '1.2 acres',
    price: '$2.5M',
    tokenPrice: '$25',
    totalTokens: 100000,
    availableTokens: 45000,
    roi: '12.5%',
    category: 'Commercial',
    featured: true,
    image: '/placeholder.svg'
  },
  {
    id: 2,
    title: 'Residential Development Plot',
    location: 'Lekki, Lagos',
    size: '3.5 acres',
    price: '$1.8M',
    tokenPrice: '$18',
    totalTokens: 100000,
    availableTokens: 72000,
    roi: '10.2%',
    category: 'Residential',
    featured: false,
    image: '/placeholder.svg'
  },
  {
    id: 3,
    title: 'Agricultural Investment Land',
    location: 'Ogun State',
    size: '10 acres',
    price: '$500K',
    tokenPrice: '$5',
    totalTokens: 100000,
    availableTokens: 88000,
    roi: '8.7%',
    category: 'Agricultural',
    featured: false,
    image: '/placeholder.svg'
  }
];

const Marketplace = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Marketplace</h1>
        <p className="text-gray-600">Discover and invest in tokenized land properties</p>
      </div>

      {/* Featured Properties */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Fire size={20} />
            <CardTitle>Featured Properties</CardTitle>
          </div>
          <CardDescription className="text-blue-100">
            Hand-picked premium investment opportunities
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search properties by location, type..."
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="agricultural">Agricultural</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-500k">$0 - $500K</SelectItem>
                  <SelectItem value="500k-1m">$500K - $1M</SelectItem>
                  <SelectItem value="1m-5m">$1M - $5M</SelectItem>
                  <SelectItem value="5m+">$5M+</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="roi">ROI</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {marketplaceProperties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow">
            {property.featured && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 text-xs font-medium">
                🔥 FEATURED
              </div>
            )}
            
            <div className="aspect-video bg-gray-100 overflow-hidden">
              <img 
                src={property.image} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-2">{property.title}</CardTitle>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin size={14} className="mr-1" />
                    {property.location}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Heart size={16} />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Badge variant="outline">{property.category}</Badge>
                <span className="text-sm text-gray-600">{property.size}</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Value:</span>
                  <span className="font-semibold">{property.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Token Price:</span>
                  <span className="font-semibold text-blue-600">{property.tokenPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expected ROI:</span>
                  <div className="flex items-center">
                    <TrendUp size={14} className="mr-1 text-green-600" />
                    <span className="font-semibold text-green-600">{property.roi}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Available Tokens:</span>
                  <span>{property.availableTokens.toLocaleString()} / {property.totalTokens.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${(property.availableTokens / property.totalTokens) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1">Invest Now</Button>
                <Button variant="outline" size="icon">
                  <Heart size={16} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;
