
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, MagnifyingGlass, MapPin, Eye, DotsThreeVertical, Heart, Share } from 'phosphor-react';
import { Link } from 'react-router-dom';

const mockProperties = [
  {
    id: 1,
    title: 'Downtown Commercial Plaza',
    location: 'Lagos, Nigeria',
    size: '2.5 acres',
    status: 'verified',
    value: '$1.2M',
    tokenized: true,
    type: 'commercial',
    image: '/placeholder.svg'
  },
  {
    id: 2,
    title: 'Luxury Residential Estate',
    location: 'Abuja, Nigeria',
    size: '1.8 acres',
    status: 'verified',
    value: '$800K',
    tokenized: false,
    type: 'residential',
    image: '/placeholder.svg'
  },
  {
    id: 3,
    title: 'Modern Apartment Complex',
    location: 'Kano, Nigeria',
    size: '5.2 acres',
    status: 'pending',
    value: '$400K',
    tokenized: false,
    type: 'residential',
    image: '/placeholder.svg'
  },
  {
    id: 4,
    title: 'Industrial Warehouse',
    location: 'Port Harcourt, Nigeria',
    size: '3.1 acres',
    status: 'draft',
    value: '$950K',
    tokenized: false,
    type: 'industrial',
    image: '/placeholder.svg'
  }
];

const MyProperty = () => {
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
      case 'industrial':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Property</h1>
          <p className="text-gray-600">Manage your land and property assets</p>
        </div>
        <Link to="/add-property">
          <Button className="w-full sm:w-auto">
            <Plus size={16} className="mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search properties..."
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">All</Button>
              <Button variant="outline" size="sm">Verified</Button>
              <Button variant="outline" size="sm">Pending</Button>
              <Button variant="outline" size="sm">Tokenized</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {mockProperties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-all duration-200 group">
            <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
              <img 
                src={property.image} 
                alt={property.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              {/* Circular Action Buttons Stack */}
              <div className="absolute top-3 right-3 flex flex-col gap-2">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
                >
                  <Heart size={14} />
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
                >
                  <Share size={14} />
                </Button>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-sm"
                >
                  <DotsThreeVertical size={14} />
                </Button>
              </div>
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg line-clamp-2">{property.title}</CardTitle>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin size={14} className="mr-1 flex-shrink-0" />
                <span className="truncate">{property.location}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Size:</span>
                <span className="font-medium">{property.size}</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-1">
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

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-gray-900">{property.value}</p>
                  <p className="text-xs text-gray-500">Est. value</p>
                </div>
                <Link to={`/property/${property.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye size={14} className="mr-2" />
                    <span className="hidden sm:inline">View</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MyProperty;
