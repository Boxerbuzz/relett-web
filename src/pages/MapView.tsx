'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MagnifyingGlass, MapPin, Eye } from 'phosphor-react';
import { Layers, Filter, Fullscreen } from 'lucide-react';

const mapProperties = [
  {
    id: 1,
    title: 'Downtown Commercial Plot',
    location: 'Victoria Island, Lagos',
    coordinates: { lat: 6.4281, lng: 3.4219 },
    size: '2.5 acres',
    value: '$1.2M',
    status: 'verified',
    type: 'commercial',
    tokenized: true
  },
  {
    id: 2,
    title: 'Residential Land Parcel',
    location: 'Lekki, Lagos',
    coordinates: { lat: 6.4474, lng: 3.5611 },
    size: '1.8 acres',
    value: '$800K',
    status: 'verified',
    type: 'residential',
    tokenized: false
  },
  {
    id: 3,
    title: 'Agricultural Investment Land',
    location: 'Ogun State',
    coordinates: { lat: 7.1608, lng: 3.3587 },
    size: '10 acres',
    value: '$500K',
    status: 'pending',
    type: 'agricultural',
    tokenized: false
  }
];

const MapView = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'commercial':
        return 'bg-blue-100 text-blue-800';
      case 'residential':
        return 'bg-purple-100 text-purple-800';
      case 'agricultural':
        return 'bg-green-100 text-green-800';
      case 'industrial':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Map View</h1>
          <p className="text-gray-600">Explore properties on an interactive map</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Layers size={16} className="mr-2" />
            Layers
          </Button>
          <Button variant="outline" size="sm">
            <Fullscreen size={16} className="mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by location, property name..."
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="agricultural">Agricultural</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="tokenized">Tokenized</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Filter size={16} className="mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin size={20} className="mr-2" />
                Interactive Property Map
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-full bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
                <div className="text-center">
                  <MapPin size={64} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Interactive Map</h3>
                  <p className="text-gray-600 mb-4">Map integration will be implemented here</p>
                  <Badge variant="outline">Coming Soon</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Properties on Map</CardTitle>
            </CardHeader>
          </Card>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="tokenized">Tokenized</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {mapProperties.map((property) => (
                <Card key={property.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm line-clamp-2">{property.title}</h4>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Eye size={12} />
                        </Button>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin size={12} className="mr-1" />
                        {property.location}
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        <Badge className={getStatusColor(property.status)} variant="outline">
                          {property.status}
                        </Badge>
                        <Badge className={getTypeColor(property.type)} variant="outline">
                          {property.type}
                        </Badge>
                        {property.tokenized && (
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            Tokenized
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Size: {property.size}</span>
                        <span className="font-medium">{property.value}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="verified">
              {mapProperties.filter(p => p.status === 'verified').map((property) => (
                <Card key={property.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm line-clamp-2">{property.title}</h4>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Eye size={12} />
                        </Button>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin size={12} className="mr-1" />
                        {property.location}
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Size: {property.size}</span>
                        <span className="font-medium">{property.value}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="tokenized">
              {mapProperties.filter(p => p.tokenized).map((property) => (
                <Card key={property.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm line-clamp-2">{property.title}</h4>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Eye size={12} />
                        </Button>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin size={12} className="mr-1" />
                        {property.location}
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Size: {property.size}</span>
                        <span className="font-medium">{property.value}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MapView;
