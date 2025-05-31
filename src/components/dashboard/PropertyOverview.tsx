
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Eye, MoreHorizontal } from 'lucide-react';

const mockProperties = [
  {
    id: 1,
    title: 'Downtown Commercial Plot',
    location: 'Lagos, Nigeria',
    size: '2.5 acres',
    status: 'verified',
    value: '$1.2M',
    tokenized: true
  },
  {
    id: 2,
    title: 'Residential Land Parcel',
    location: 'Abuja, Nigeria',
    size: '1.8 acres',
    status: 'verified',
    value: '$800K',
    tokenized: false
  },
  {
    id: 3,
    title: 'Agricultural Land',
    location: 'Kano, Nigeria',
    size: '5.2 acres',
    status: 'pending',
    value: '$400K',
    tokenized: false
  }
];

export function PropertyOverview() {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Properties</CardTitle>
            <CardDescription>Manage and track your land assets</CardDescription>
          </div>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockProperties.map((property) => (
            <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{property.title}</h4>
                  <p className="text-sm text-gray-500">{property.location} • {property.size}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getStatusColor(property.status)}>
                      {property.status}
                    </Badge>
                    {property.tokenized && (
                      <Badge variant="outline" className="text-blue-600 border-blue-200">
                        Tokenized
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right">
                  <p className="font-medium text-gray-900">{property.value}</p>
                  <p className="text-sm text-gray-500">Est. value</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
