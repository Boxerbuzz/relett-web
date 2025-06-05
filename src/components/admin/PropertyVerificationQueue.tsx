
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Search, FileCheck, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Json } from '@/types/database';
import { PropertyMobileCard } from './PropertyMobileCard';

interface Property {
  id: string;
  title: string | null;
  type: string;
  category: string;
  status: string;
  is_verified: boolean | null;
  created_at: string;
  user_id: string;
  users?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  price: Json;
  location: Json;
}

export function PropertyVerificationQueue() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          users:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch properties',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePropertyStatus = async (propertyId: string, isVerified: boolean) => {
    try {
      const { error } = await supabase
        .from('properties')
        .update({ 
          is_verified: isVerified,
          status: isVerified ? 'active' : 'pending'
        })
        .eq('id', propertyId);

      if (error) throw error;

      setProperties(properties.map(property => 
        property.id === propertyId 
          ? { 
              ...property, 
              is_verified: isVerified,
              status: isVerified ? 'active' : 'pending'
            }
          : property
      ));

      toast({
        title: 'Success',
        description: `Property ${isVerified ? 'verified' : 'rejected'} successfully`
      });
    } catch (error) {
      console.error('Error updating property status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update property status',
        variant: 'destructive'
      });
    }
  };

  const filteredProperties = properties.filter(property => {
    const locationData = property.location as any;
    const matchesSearch = 
      property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      locationData?.city?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'verified' && property.is_verified) ||
      (filterStatus === 'pending' && !property.is_verified) ||
      (filterStatus === 'active' && property.status === 'active') ||
      (filterStatus === 'draft' && property.status === 'draft');

    const matchesType = filterType === 'all' || property.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (property: Property) => {
    if (property.is_verified) {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
    }
    if (property.status === 'active') {
      return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
    }
    if (property.status === 'pending') {
      return <Badge variant="secondary">Pending</Badge>;
    }
    return <Badge variant="outline">Draft</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeColors = {
      residential: 'bg-blue-100 text-blue-800',
      commercial: 'bg-purple-100 text-purple-800',
      industrial: 'bg-gray-100 text-gray-800',
      land: 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    );
  };

  const formatPrice = (price: Json) => {
    if (!price || typeof price !== 'object') return 'N/A';
    const priceObj = price as any;
    if (!priceObj.amount) return 'N/A';
    return `${priceObj.currency || '₦'}${priceObj.amount.toLocaleString()}`;
  };

  const getLocationCity = (location: Json) => {
    if (!location || typeof location !== 'object') return 'Location not specified';
    const locationObj = location as any;
    return locationObj.city || 'Location not specified';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Property Verification Queue</CardTitle>
          <CardDescription>Loading properties...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCheck className="h-5 w-5" />
          Property Verification Queue
        </CardTitle>
        <CardDescription>Review and verify property listings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="industrial">Industrial</SelectItem>
              <SelectItem value="land">Land</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Cards - Show on small screens */}
        <div className="md:hidden space-y-4">
          {filteredProperties.map((property) => (
            <PropertyMobileCard
              key={property.id}
              property={property}
              onUpdateStatus={updatePropertyStatus}
            />
          ))}
        </div>

        {/* Desktop Table - Hide on small screens */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProperties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium truncate">{property.title || 'Untitled Property'}</div>
                      <div className="text-sm text-gray-500 truncate">
                        {getLocationCity(property.location)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium truncate">
                        {property.users?.first_name} {property.users?.last_name}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {property.users?.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getTypeBadge(property.type)}
                  </TableCell>
                  <TableCell>
                    <div className="truncate">
                      {formatPrice(property.price)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(property)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(property.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!property.is_verified && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => updatePropertyStatus(property.id, true)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updatePropertyStatus(property.id, false)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No properties found matching your criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
