
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPinIcon, EyeIcon, DotsThreeIcon, PlusIcon } from '@phosphor-icons/react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Property {
  id: string;
  title: string;
  location: string;
  size?: string;
  status: string;
  value?: string;
  tokenized?: boolean;
  type?: string;
}

export function PropertyOverview() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('id, title, location, status, category')
        .limit(10);
      
      if (error) throw error;
      
      const mappedProperties = (data || []).map(prop => ({
        ...prop,
        title: prop.title || 'Untitled Property',
        location: JSON.stringify(prop.location) || 'Unknown',
        size: '1.0 acres',
        value: '$500K',
        tokenized: false,
        type: prop.category || 'residential'
      }));
      
      setProperties(mappedProperties);
    } catch (error) {
      console.error('Error fetching properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

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
            <CardDescription>Manage and track your property assets</CardDescription>
          </div>
          <Button size="sm">
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Property
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Loading properties...</div>
        ) : properties.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No properties found. Add your first property to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPinIcon className="w-6 h-6 text-blue-600" />
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
                    <EyeIcon className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <DotsThreeIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
