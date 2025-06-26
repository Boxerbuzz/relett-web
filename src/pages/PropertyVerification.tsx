'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MagnifyingGlass, MapPin, FileText, Clock, CheckCircle, AlertTriangle, Eye, Download, Cube, CircleNotch } from 'phosphor-react';
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
    blockchain_hash: string | null;
    blockchain_transaction_id: string | null;
  };
  tokenized_properties?: {
    id: string;
    token_name: string;
    token_symbol: string;
    hedera_token_id: string;
    blockchain_network: string;
    status: string;
    total_supply: string;
    token_price: number;
  };
}

interface HederaValidationResult {
  valid: boolean;
  tokenExists: boolean;
  tokenDetails?: {
    tokenId: string;
    name: string;
    symbol: string;
    totalSupply: string;
    treasury: string;
    decimals: number;
  };
  propertyHash?: string;
  lastUpdated?: string;
  error?: string;
}

interface SearchCriteria {
  propertyTitle: string;
  propertyId: string;
  address: string;
  city: string;
  state: string;
  titleNumber: string;
  ownerName: string;
  ownerEmail: string;
  hederaTokenId: string;
  propertyType: string;
  priceRange: {
    min: string;
    max: string;
  };
  additionalInfo: string;
}

const PropertyVerification = () => {
  const { toast } = useToast();
  const [verificationStep, setVerificationStep] = useState<'input' | 'searching' | 'results'>('input');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    propertyTitle: '',
    propertyId: '',
    address: '',
    city: '',
    state: '',
    titleNumber: '',
    ownerName: '',
    ownerEmail: '',
    hederaTokenId: '',
    propertyType: '',
    priceRange: { min: '', max: '' },
    additionalInfo: ''
  });
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [hederaValidation, setHederaValidation] = useState<HederaValidationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [validatingHedera, setValidatingHedera] = useState(false);

  const handleInputChange = (field: keyof SearchCriteria, value: string) => {
    if (field === 'priceRange') return;
    setSearchCriteria(prev => ({ ...prev, [field]: value }));
  };

  const handlePriceRangeChange = (type: 'min' | 'max', value: string) => {
    setSearchCriteria(prev => ({
      ...prev,
      priceRange: { ...prev.priceRange, [type]: value }
    }));
  };

  const validateWithHedera = async (propertyData: PropertyData) => {
    if (!propertyData.tokenized_properties?.hedera_token_id) {
      return null;
    }

    try {
      setValidatingHedera(true);
      
      // Call Hedera validation edge function
      const { data, error } = await supabase.functions.invoke('validate-hedera-property', {
        body: {
          tokenId: propertyData.tokenized_properties.hedera_token_id,
          propertyId: propertyData.id,
          landTitleHash: propertyData.land_titles?.blockchain_hash
        }
      });

      if (error) {
        console.error('Hedera validation error:', error);
        return {
          valid: false,
          tokenExists: false,
          error: error.message || 'Failed to validate with Hedera network'
        };
      }

      return data as HederaValidationResult;
    } catch (error) {
      console.error('Hedera validation failed:', error);
      return {
        valid: false,
        tokenExists: false,
        error: 'Network error during Hedera validation'
      };
    } finally {
      setValidatingHedera(false);
    }
  };

  const buildSearchQuery = () => {
    let query = supabase
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
          status,
          blockchain_hash,
          blockchain_transaction_id
        ),
        tokenized_properties(
          id,
          token_name,
          token_symbol,
          hedera_token_id,
          blockchain_network,
          status,
          total_supply,
          token_price
        )
      `);

    // Apply filters based on search criteria
    if (searchCriteria.propertyId) {
      query = query.eq('id', searchCriteria.propertyId);
    }
    
    if (searchCriteria.propertyTitle) {
      query = query.ilike('title', `%${searchCriteria.propertyTitle}%`);
    }
    
    if (searchCriteria.propertyType) {
      query = query.eq('type', searchCriteria.propertyType);
    }

    return query;
  };

  const handleVerification = async () => {
    // Check if user provided at least one search criterion
    const hasSearchCriteria = Object.entries(searchCriteria).some(([key, value]) => {
      if (key === 'priceRange') {
        return value.min || value.max;
      }
      return value && value.trim() !== '';
    });

    if (!hasSearchCriteria) {
      toast({
        title: 'Search Criteria Required',
        description: 'Please provide at least one search criterion to find the property.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    setVerificationStep('searching');
    
    try {
      let query = buildSearchQuery();
      
      // Apply additional filters
      if (searchCriteria.titleNumber) {
        // Search by land title number
        const { data: landTitleData } = await supabase
          .from('land_titles')
          .select('id')
          .eq('title_number', searchCriteria.titleNumber)
          .single();
        
        if (landTitleData) {
          query = query.eq('land_title_id', landTitleData.id);
        }
      }

      if (searchCriteria.hederaTokenId) {
        // Search by Hedera token ID
        const { data: tokenData } = await supabase
          .from('tokenized_properties')
          .select('property_id')
          .eq('hedera_token_id', searchCriteria.hederaTokenId)
          .single();
        
        if (tokenData) {
          query = query.eq('id', tokenData.property_id);
        }
      }

      const { data, error } = await query.limit(1).single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        // Try fuzzy search with location data
        const locationSearchQuery = supabase
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
              status,
              blockchain_hash,
              blockchain_transaction_id
            ),
            tokenized_properties(
              id,
              token_name,
              token_symbol,
              hedera_token_id,
              blockchain_network,
              status,
              total_supply,
              token_price
            )
          `);

        if (searchCriteria.address || searchCriteria.city) {
          const searchTerm = `${searchCriteria.address} ${searchCriteria.city}`.trim();
          const { data: locationData, error: locationError } = await locationSearchQuery
            .textSearch('location', searchTerm)
            .limit(1)
            .single();

          if (locationError && locationError.code !== 'PGRST116') {
            throw locationError;
          }

          if (!locationData) {
            toast({
              title: 'Property Not Found',
              description: 'No property found matching your search criteria. Please try different search terms.',
              variant: 'destructive'
            });
            setVerificationStep('input');
            return;
          }

          setPropertyData(locationData);
        } else {
          toast({
            title: 'Property Not Found',
            description: 'No property found matching your search criteria. Please try different search terms.',
            variant: 'destructive'
          });
          setVerificationStep('input');
          return;
        }
      } else {
        setPropertyData(data);
      }

      // Validate with Hedera if property is tokenized
      if (data?.is_tokenized && data?.tokenized_properties) {
        const hederaResult = await validateWithHedera(data);
        setHederaValidation(hederaResult);
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
        <p className="text-gray-600">Search and verify property ownership with comprehensive blockchain validation</p>
      </div>

      {verificationStep === 'input' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MagnifyingGlass className="h-5 w-5" />
              Comprehensive Property Search
            </CardTitle>
            <CardDescription>
              Provide as many details as possible to help us find and verify the right property. All fields are optional but more details improve search accuracy.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Property Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Basic Property Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyTitle">Property Title</Label>
                  <Input
                    id="propertyTitle"
                    placeholder="Enter property title or name"
                    value={searchCriteria.propertyTitle}
                    onChange={(e) => handleInputChange('propertyTitle', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="propertyId">Property ID</Label>
                  <Input
                    id="propertyId"
                    placeholder="Enter property ID if known"
                    value={searchCriteria.propertyId}
                    onChange={(e) => handleInputChange('propertyId', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="propertyType">Property Type</Label>
                  <Select value={searchCriteria.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hederaTokenId">Hedera Token ID</Label>
                  <Input
                    id="hederaTokenId"
                    placeholder="e.g., 0.0.123456"
                    value={searchCriteria.hederaTokenId}
                    onChange={(e) => handleInputChange('hederaTokenId', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Location Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter full street address"
                    value={searchCriteria.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="Enter city"
                    value={searchCriteria.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="Enter state"
                    value={searchCriteria.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Ownership & Legal Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Ownership & Legal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="titleNumber">Land Title Number</Label>
                  <Input
                    id="titleNumber"
                    placeholder="Enter land title number"
                    value={searchCriteria.titleNumber}
                    onChange={(e) => handleInputChange('titleNumber', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    placeholder="Enter property owner's name"
                    value={searchCriteria.ownerName}
                    onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="ownerEmail">Owner Email</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    placeholder="Enter property owner's email"
                    value={searchCriteria.ownerEmail}
                    onChange={(e) => handleInputChange('ownerEmail', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Price Range */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Price Range (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priceMin">Minimum Price</Label>
                  <Input
                    id="priceMin"
                    type="number"
                    placeholder="Enter minimum price"
                    value={searchCriteria.priceRange.min}
                    onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="priceMax">Maximum Price</Label>
                  <Input
                    id="priceMax"
                    type="number"
                    placeholder="Enter maximum price"
                    value={searchCriteria.priceRange.max}
                    onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Additional Information</h3>
              <div>
                <Label htmlFor="additionalInfo">Any Additional Details</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Provide any additional information that might help identify the property..."
                  value={searchCriteria.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <Button 
              onClick={handleVerification}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              <MagnifyingGlass className="h-4 w-4 mr-2" />
              Search & Verify Property
            </Button>
          </CardContent>
        </Card>
      )}

      {verificationStep === 'searching' && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4">
              <CircleNotch className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Searching Property Database</h3>
            <p className="text-gray-600">Searching property records and validating with blockchain...</p>
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
                  Property Found & Verified
                </span>
                <div className="flex gap-2">
                  <Badge className={getStatusColor(propertyData.status)}>
                    {propertyData.status}
                  </Badge>
                  {propertyData.is_tokenized && (
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Cube className="h-3 w-3 mr-1" />
                      Tokenized
                    </Badge>
                  )}
                </div>
              </CardTitle>
              <CardDescription>
                Comprehensive property verification with blockchain validation
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

          {/* Hedera Blockchain Validation */}
          {propertyData.is_tokenized && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cube className="h-5 w-5 text-blue-600" />
                  Hedera Blockchain Validation
                  {validatingHedera && <CircleNotch className="h-4 w-4 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {hederaValidation ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {hederaValidation.valid ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      )}
                      <span className="font-medium">
                        {hederaValidation.valid ? 'Blockchain Verified' : 'Validation Issues Found'}
                      </span>
                    </div>
                    
                    {hederaValidation.tokenDetails && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm text-gray-600">Token ID</p>
                          <p className="font-medium">{hederaValidation.tokenDetails.tokenId}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Token Name</p>
                          <p className="font-medium">{hederaValidation.tokenDetails.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Symbol</p>
                          <p className="font-medium">{hederaValidation.tokenDetails.symbol}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Supply</p>
                          <p className="font-medium">{hederaValidation.tokenDetails.totalSupply}</p>
                        </div>
                      </div>
                    )}
                    
                    {hederaValidation.error && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{hederaValidation.error}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Blockchain validation in progress...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
                  {propertyData.land_titles.blockchain_hash && (
                    <div className="md:col-span-2">
                      <span className="text-gray-600">Blockchain Hash:</span>
                      <p className="font-medium font-mono text-xs break-all">{propertyData.land_titles.blockchain_hash}</p>
                    </div>
                  )}
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
              <MagnifyingGlass className="h-4 w-4 mr-2" />
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
