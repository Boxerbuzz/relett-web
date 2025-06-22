
'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { PropertyMap } from '@/components/maps/PropertyMap';
import { PropertyDocumentViewer } from '@/components/property/PropertyDocumentViewer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  TrendingUp, 
  Heart, 
  Share, 
  Star, 
  Calendar, 
  Home, 
  Ruler, 
  Users, 
  Car,
  Loader2
} from 'lucide-react';

interface PropertyData {
  id: string;
  title: string;
  location: any;
  price: any;
  status: string;
  category: string;
  type: string;
  is_verified: boolean;
  is_tokenized: boolean;
  is_featured: boolean;
  backdrop: string;
  description?: string;
  condition?: string;
  year_built?: string;
  sqrft?: string;
  max_guest?: number;
  garages?: number;
  ratings?: number;
  review_count?: number;
  amenities?: string[];
  features?: string[];
  tags?: string[];
  views?: number;
  likes?: number;
  favorites?: number;
  land_title_id?: string;
  tokenized_property?: {
    token_price: number;
    total_supply: string;
    expected_roi: number;
  };
  property_images: Array<{
    url: string;
    is_primary: boolean;
  }>;
}

interface PropertyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
}

export function PropertyDetailsDialog({ open, onOpenChange, propertyId }: PropertyDetailsDialogProps) {
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && propertyId) {
      fetchPropertyDetails();
    }
  }, [open, propertyId]);

  console.log(propertyId);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          tokenized_properties:tokenized_properties_property_id_fkey(*),
          property_images (
            url,
            is_primary
          )
        `)
        .eq('id', propertyId)
        .maybeSingle();

        ///https://wossuijahchhtjzphsgh.supabase.co/rest/v1/properties?select=*%2Ctokenized_properties%3Atokenized_properties_property_id_fkey%28*%29%2Cproperty_images%28url%2Cis_primary%29&id=eq.134994583

      if (error) throw error;
      if (data) {
        setProperty({
          ...data,
          property_images: Array.isArray(data.property_images) ? data.property_images : [],
        });
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch property details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryImage = () => {
    if (!property?.property_images?.length) return property?.backdrop || '/placeholder.svg';
    const primaryImage = property.property_images.find(img => img.is_primary);
    return primaryImage?.url || property.property_images[0]?.url || '/placeholder.svg';
  };

  const getLocationString = () => {
    if (!property?.location) return 'Location not specified';
    if (typeof property.location === 'string') return property.location;
    
    const { address, city, state, country } = property.location;
    return [address, city, state, country].filter(Boolean).join(', ');
  };

  const getCoordinates = () => {
    if (!property?.location?.coordinates) return undefined;
    return {
      lat: property.location.coordinates.lat,
      lng: property.location.coordinates.lng
    };
  };

  const formatPrice = (price: any) => {
    if (!price) return 'Price not available';
    if (typeof price === 'string') return price;
    if (typeof price === 'number') return `₦${price.toLocaleString()}`;
    if (price.amount) return `₦${price.amount.toLocaleString()}`;
    return 'Price not available';
  };

  const keySpecs = property ? [
    { label: 'Property Type', value: property.category || property.type || 'N/A', icon: Home },
    { label: 'Size', value: property.sqrft || 'N/A', icon: Ruler },
    { label: 'Condition', value: property.condition || 'Good', icon: Star },
    { label: 'Year Built', value: property.year_built || 'N/A', icon: Calendar },
    { label: 'Max Guests', value: property.max_guest?.toString() || '0', icon: Users },
    { label: 'Garages', value: property.garages?.toString() || '0', icon: Car }
  ] : [];

  const investmentSpecs = property ? [
    { label: 'Total Value', value: formatPrice(property.price) },
    { label: 'Token Price', value: property.tokenized_property ? `₦${property.tokenized_property.token_price}` : 'N/A' },
    { label: 'Total Tokens', value: property.tokenized_property ? parseInt(property.tokenized_property.total_supply).toLocaleString() : 'N/A' },
    { label: 'Expected ROI', value: property.tokenized_property ? `${property.tokenized_property.expected_roi}%` : 'N/A' },
    { label: 'Views', value: property.views?.toLocaleString() || '0' },
    { label: 'Likes', value: property.likes?.toLocaleString() || '0' }
  ] : [];

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
          <div className="flex items-center justify-center flex-1">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!property) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
          <div className="flex items-center justify-center flex-1">
            <p>Property not found</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {property.title}
              <div className="flex gap-1">
                {property.is_featured && <Badge className="bg-orange-500">Featured</Badge>}
                {property.is_verified && <Badge className="bg-green-500">Verified</Badge>}
                {property.is_tokenized && <Badge className="bg-blue-500">Tokenized</Badge>}
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-1">
            {/* Left Column - Image and Basic Info */}
            <div className="lg:col-span-1 space-y-4">
              {/* Property Image */}
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={getPrimaryImage()} 
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Basic Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span className="text-sm">{getLocationString()}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-500" />
                    <span className="text-sm font-medium">{(property.ratings || 0).toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({property.review_count || 0} reviews)</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Heart size={16} className="mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share size={16} className="mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Detailed Information */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="w-full">
                <div className="sticky top-0 bg-white z-10 pb-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="investment">Investment</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-4">
                  {/* Description */}
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">Description</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {property.description || 'No description available for this property.'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Property Specifications */}
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Property Specifications</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {keySpecs.map((spec, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <spec.icon size={16} className="text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-600">{spec.label}</p>
                              <p className="font-medium text-sm">{spec.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Features & Amenities */}
                  {(property.features?.length || property.amenities?.length) && (
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-3">Features & Amenities</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {property.features?.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>{feature}</span>
                            </div>
                          ))}
                          {property.amenities?.map((amenity, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="investment" className="space-y-4">
                  {/* Investment Overview */}
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Investment Details</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {investmentSpecs.map((spec, index) => (
                          <div key={index} className="space-y-1">
                            <p className="text-xs text-gray-600">{spec.label}</p>
                            <p className="font-medium text-sm">{spec.value}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {property.is_tokenized && property.tokenized_property && (
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-4">Tokenization Details</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Token Price</span>
                            <span className="font-semibold">₦{property.tokenized_property.token_price}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Total Supply</span>
                            <span className="font-semibold">{parseInt(property.tokenized_property.total_supply).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <TrendingUp size={16} className="text-green-600 mr-1" />
                              <span className="text-green-600 font-medium text-sm">{property.tokenized_property.expected_roi}% Expected ROI</span>
                            </div>
                            <span className="text-xs text-gray-600">Annual projected return</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="documents" className="space-y-4">
                  <PropertyDocumentViewer 
                    propertyId={property.id}
                    landTitleId={property.land_title_id}
                  />
                </TabsContent>

                <TabsContent value="location" className="space-y-4">
                  <PropertyMap 
                    coordinates={getCoordinates()}
                    address={getLocationString()}
                  />
                  
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Location Information</h3>
                      <div>
                        <p className="font-medium text-sm">Address</p>
                        <p className="text-gray-600 text-sm">{getLocationString()}</p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Fixed Footer Action Buttons */}
        <div className="flex-shrink-0 pt-4 border-t">
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Close
            </Button>
            {property.is_tokenized && (
              <Button className="flex-1">
                Invest Now
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
