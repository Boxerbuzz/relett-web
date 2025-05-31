
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Plus, MagnifyingGlass, MapPin, Eye, DotsThreeVertical } from 'phosphor-react';
import { Link } from 'react-router-dom';

const mockProperties = [
  {
    id: 1,
    title: 'Downtown Commercial Plot',
    location: 'Lagos, Nigeria',
    size: '2.5 acres',
    status: 'verified',
    value: '$1.2M',
    tokenized: true,
    image: '/placeholder.svg'
  },
  {
    id: 2,
    title: 'Residential Land Parcel',
    location: 'Abuja, Nigeria',
    size: '1.8 acres',
    status: 'verified',
    value: '$800K',
    tokenized: false,
    image: '/placeholder.svg'
  },
  {
    id: 3,
    title: 'Agricultural Land',
    location: 'Kano, Nigeria',
    size: '5.2 acres',
    status: 'pending',
    value: '$400K',
    tokenized: false,
    image: '/placeholder.svg'
  },
  {
    id: 4,
    title: 'Industrial Plot',
    location: 'Port Harcourt, Nigeria',
    size: '3.1 acres',
    status: 'draft',
    value: '$950K',
    tokenized: false,
    image: '/placeholder.svg'
  }
];

const MyLand = () => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Land</h1>
          <p className="text-gray-600">Manage your land assets and track their progress</p>
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
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search properties..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">All</Button>
              <Button variant="outline" size="sm">Verified</Button>
              <Button variant="outline" size="sm">Pending</Button>
              <Button variant="outline" size="sm">Tokenized</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProperties.map((property) => (
          <Card key={property.id} className="hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
              <img 
                src={property.image} 
                alt={property.title}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg line-clamp-2">{property.title}</CardTitle>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <DotsThreeVertical size={16} />
                </Button>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin size={14} className="mr-1" />
                {property.location}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Size:</span>
                <span className="font-medium">{property.size}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(property.status)}>
                  {property.status}
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
                    View
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

export default MyLand;
