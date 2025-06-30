
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { usePropertyInteractions } from '@/hooks/usePropertyInteractions';
import { useDeviceTracking } from '@/hooks/useDeviceTracking';
import { PropertyActionButtons } from './PropertyActionButtons';
import { PropertyAnalytics } from './PropertyAnalytics';
import { AIPropertyValuation } from './AIPropertyValuation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function PropertyDetailsEnhanced() {
  const { id } = useParams<{ id: string }>();
  const { trackView } = usePropertyInteractions();
  useDeviceTracking();

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      if (!id) throw new Error('Property ID required');
      
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_images(*),
          users(first_name, last_name, phone, email)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  // Track property view when component mounts
  useEffect(() => {
    if (property?.id) {
      const sessionId = crypto.randomUUID();
      const startTime = Date.now();

      trackView(property.id, {
        sessionId,
        deviceType: navigator.userAgent,
        referrer: document.referrer
      });

      // Track view duration on unmount
      return () => {
        const viewDuration = Math.round((Date.now() - startTime) / 1000);
        if (viewDuration > 5) { // Only track if viewed for more than 5 seconds
          trackView(property.id, {
            sessionId,
            viewDuration,
            deviceType: navigator.userAgent
          });
        }
      };
    }
  }, [property?.id, trackView]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold mb-2">Property Not Found</h2>
            <p className="text-gray-600">The property you're looking for doesn't exist or has been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Property Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{property.title}</h1>
            <p className="text-gray-600 mt-2">{property.location?.address}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ₦{property.price?.amount?.toLocaleString()}
            </div>
            {property.is_featured && (
              <Badge className="mt-2">Featured</Badge>
            )}
          </div>
        </div>

        {/* Property Status Badges */}
        <div className="flex gap-2 flex-wrap">
          {property.is_verified && <Badge variant="secondary">Verified</Badge>}
          {property.is_tokenized && <Badge className="bg-purple-500">Tokenized</Badge>}
          {property.status && <Badge variant="outline">{property.status}</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Images */}
          {property.property_images && property.property_images.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <img
                  src={property.property_images[0].url}
                  alt={property.title}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
              </CardContent>
            </Card>
          )}

          {/* Property Description */}
          <Card>
            <CardHeader>
              <CardTitle>Property Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{property.description}</p>
              
              <Separator className="my-4" />
              
              {/* Property Specifications */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">Type:</span>
                  <span className="ml-2">{property.type}</span>
                </div>
                <div>
                  <span className="font-medium">Category:</span>
                  <span className="ml-2">{property.category}</span>
                </div>
                {property.sqrft && (
                  <div>
                    <span className="font-medium">Size:</span>
                    <span className="ml-2">{property.sqrft} sqft</span>
                  </div>
                )}
                {property.garages && (
                  <div>
                    <span className="font-medium">Garages:</span>
                    <span className="ml-2">{property.garages}</span>
                  </div>
                )}
                {property.year_built && (
                  <div>
                    <span className="font-medium">Year Built:</span>
                    <span className="ml-2">{property.year_built}</span>
                  </div>
                )}
                {property.condition && (
                  <div>
                    <span className="font-medium">Condition:</span>
                    <span className="ml-2">{property.condition}</span>
                  </div>
                )}
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Amenities</h4>
                  <div className="flex flex-wrap gap-1">
                    {property.amenities.map((amenity: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property Analytics */}
          <PropertyAnalytics propertyId={property.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property Actions */}
          <PropertyActionButtons property={property} />

          {/* AI Property Valuation */}
          <AIPropertyValuation property={property} />

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle>Property Owner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">
                  {property.users?.first_name} {property.users?.last_name}
                </p>
                {property.users?.phone && (
                  <p className="text-sm text-gray-600">📞 {property.users.phone}</p>
                )}
                {property.users?.email && (
                  <p className="text-sm text-gray-600">✉️ {property.users.email}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
