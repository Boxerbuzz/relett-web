
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, MapPin, FileText, Clock, CheckCircle, AlertTriangle, Eye, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface PropertyData {
  id: string;
  title: string;
  location: any;
  price: any;
  specification: any;
  type: string;
  status: string;
  is_verified: boolean;
  is_tokenized: boolean;
  created_at: string;
  user_id: string;
  users?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  property_documents?: Array<{
    id: string;
    document_type: string;
    document_name: string;
    status: string;
    file_url: string;
    verified_at: string | null;
    verified_by: string | null;
  }>;
  land_titles?: {
    title_number: string;
    acquisition_date: string;
    area_sqm: number;
    land_use: string;
    status: string;
  };
}

const PropertyVerification = () => {
  const { toast } = useToast();
  const [verificationStep, setVerificationStep] = useState<'input' | 'searching' | 'results'>('input');
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleVerification = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Search Required',
        description: 'Please enter a property title, address, or ID to search.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setVerificationStep('searching');
    
    try {
      // Search for properties by title, address, or ID
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          location,
          price,
          specification,
          type,
          status,
          is_verified,
          is_tokenized,
          created_at,
          user_id,
          users!properties_user_id_fkey(
            first_name,
            last_name,
            email
          ),
          property_documents(
            id,
            document_type,
            document_name,
            status,
            file_url,
            verified_at,
            verified_by
          ),
          land_titles(
            title_number,
            acquisition_date,
            area_sqm,
            land_use,
            status
          )
        `)
        .or(`title.ilike.%${searchQuery}%,id.eq.${searchQuery}`)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // If no exact match found, try searching by location
        const { data: locationData, error: locationError } = await supabase
          .from('properties')
          .select(`
            id,
            title,
            location,
            price,
            specification,
            type,
            status,
            is_verified,
            is_tokenized,
            created_at,
            user_id,
            users!properties_user_id_fkey(
              first_name,
              last_name,
              email
            ),
            property_documents(
              id,
              document_type,
              document_name,
              status,
              file_url,
              verified_at,
              verified_by
            ),
            land_titles(
              title_number,
              acquisition_date,
              area_sqm,
              land_use,
              status
            )
          `)
          .textSearch('location', searchQuery)
          .limit(1)
          .single();

        if (locationError && locationError.code !== 'PGRST116') {
          throw locationError;
        }

        if (!locationData) {
          toast({
            title: 'Property Not Found',
            description: 'No property found matching your search criteria.',
            variant: 'destructive'
          });
          setVerificationStep('input');
          return;
        }

        setPropertyData(locationData);
      } else {
        setPropertyData(data);
      }

      setVerificationStep('results');
    } catch (error) {
      console.error('Error searching property:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search properties. Please try again.',
        variant: 'destructive'
      });
      setVerificationStep('input');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getLocationString = (location: any) => {
    if (typeof location === 'object' && location !== null) {
      return `${location.address || ''}, ${location.city || ''}, ${location.state || ''}`.trim().replace(/^,|,$/, '');
    }
    return location || 'Location not specified';
  };

  const getPriceString = (price: any) => {
    if (typeof price === 'object' && price !== null) {
      const amount = price.amount || 0;
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: price.currency || 'USD',
        minimumFractionDigits: 0,
      }).format(amount);
    }
    return '$0';
  };

  const getSpecificationDetails = (specification: any) => {
    if (typeof specification === 'object' && specification !== null) {
      return {
        bedrooms: specification.bedrooms || 'N/A',
        bathrooms: specification.bathrooms || 'N/A',
        parking: specification.parking || 'N/A',
        yearBuilt: specification.year_built || 'N/A',
        area: specification.area_sqm ? `${specification.area_sqm} sqm` : 'N/A'
      };
    }
    return {
      bedrooms: 'N/A',
      bathrooms: 'N/A',
      parking: 'N/A',
      yearBuilt: 'N/A',
      area: 'N/A'
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Property Verification</h1>
        <p className="text-gray-600">Search and verify property ownership and access detailed property history</p>
      </div>

      {verificationStep === 'input' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Property Search
            </CardTitle>
            <CardDescription>
              Enter property title, address, or property ID to search for verification details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Input
                placeholder="Search by property title, address, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleVerification()}
                className="flex-1"
              />
              <Button 
                onClick={handleVerification}
                disabled={!searchQuery.trim() || loading}
              >
                <Search className="h-4 w-4 mr-2" />
                Search Property
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {verificationStep === 'searching' && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Searching Property</h3>
            <p className="text-gray-600">Searching property database and verification records...</p>
          </CardContent>
        </Card>
      )}

      {verificationStep === 'results' && propertyData && (
        <div className="space-y-6">
          {/* Property Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {propertyData.is_verified ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  )}
                  Property Found
                </span>
                <Badge className={getStatusColor(propertyData.status)}>
                  {propertyData.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                Property verification details and ownership information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">{propertyData.title}</h4>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {getLocationString(propertyData.location)}
                  </div>
                  <p className="text-sm text-gray-600">Type: {propertyData.type}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Estimated Value</p>
                  <p className="text-xl font-bold text-gray-900">{getPriceString(propertyData.price)}</p>
                  <p className="text-sm text-gray-600">Listed: {new Date(propertyData.created_at).toLocaleDateString()}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Owner</p>
                  <p className="font-medium">
                    {propertyData.users?.first_name} {propertyData.users?.last_name}
                  </p>
                  <p className="text-sm text-gray-600">{propertyData.users?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Property Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const specs = getSpecificationDetails(propertyData.specification);
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div>
                      <span className="text-gray-600">Bedrooms:</span>
                      <p className="font-medium">{specs.bedrooms}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Bathrooms:</span>
                      <p className="font-medium">{specs.bathrooms}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Parking:</span>
                      <p className="font-medium">{specs.parking}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Year Built:</span>
                      <p className="font-medium">{specs.yearBuilt}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Area:</span>
                      <p className="font-medium">{specs.area}</p>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>

          {/* Land Title Information */}
          {propertyData.land_titles && (
            <Card>
              <CardHeader>
                <CardTitle>Land Title Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <span className="text-gray-600">Title Number:</span>
                    <p className="font-medium">{propertyData.land_titles.title_number}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Acquisition Date:</span>
                    <p className="font-medium">{new Date(propertyData.land_titles.acquisition_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Area:</span>
                    <p className="font-medium">{propertyData.land_titles.area_sqm} sqm</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Land Use:</span>
                    <p className="font-medium">{propertyData.land_titles.land_use}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Property Documents</CardTitle>
            </CardHeader>
            <CardContent>
              {propertyData.property_documents && propertyData.property_documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {propertyData.property_documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{doc.document_name}</p>
                          <p className="text-sm text-gray-600 capitalize">{doc.document_type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(doc.status)}>
                          {doc.status}
                        </Badge>
                        <Button size="sm" variant="outline" asChild>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p>No documents uploaded for this property</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button onClick={() => setVerificationStep('input')} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search Another Property
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Download Verification Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyVerification;
