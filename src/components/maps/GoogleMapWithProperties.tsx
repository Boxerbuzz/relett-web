import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import loader from '@/lib/google';
import { supabase } from '@/integrations/supabase/client';

interface PropertyMapData {
  id: string;
  title: string;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  price: {
    amount: number;
    currency: string;
  };
  type: string;
  status: string;
  is_verified: boolean;
  is_tokenized: boolean;
}

interface GoogleMapWithPropertiesProps {
  className?: string;
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function GoogleMapWithProperties({ 
  className, 
  center = { lat: 6.5244, lng: 3.3792 }, // Lagos, Nigeria
  zoom = 11 
}: GoogleMapWithPropertiesProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [properties, setProperties] = useState<PropertyMapData[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyMapData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch properties with coordinates
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select(`
            id,
            title,
            location,
            price,
            type,
            status,
            is_verified,
            is_tokenized
          `)
          .eq('is_deleted', false)
          .eq('status', 'active')
          .not('location->>coordinates', 'is', null)
          .limit(50);

        if (error) throw error;

        const propertiesWithCoords = data?.filter(prop => {
          // Type guard and validation
          const location = prop.location as any;
          const price = prop.price as any;
          
          return (
            prop.title &&
            location?.coordinates?.lat && 
            location?.coordinates?.lng &&
            price?.amount &&
            price?.currency
          );
        }).map(prop => ({
          id: prop.id,
          title: prop.title!,
          location: {
            address: (prop.location as any)?.address || 'Location not specified',
            coordinates: {
              lat: (prop.location as any).coordinates.lat,
              lng: (prop.location as any).coordinates.lng
            }
          },
          price: {
            amount: (prop.price as any).amount,
            currency: (prop.price as any).currency
          },
          type: prop.type || 'Unknown',
          status: prop.status || 'draft',
          is_verified: prop.is_verified || false,
          is_tokenized: prop.is_tokenized || false
        })) || [];

        setProperties(propertiesWithCoords);
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties');
      }
    };

    fetchProperties();
  }, []);

  // Initialize Google Map
  useEffect(() => {
    const initMap = async () => {
      try {
        const google = await loader.load();
        
        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          mapTypeControl: true,
          fullscreenControl: true,
          streetViewControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi.business',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        mapInstanceRef.current = map;
        
        // Create info window
        infoWindowRef.current = new google.maps.InfoWindow();
        
        setMapLoaded(true);
      } catch (err) {
        console.error('Error loading map:', err);
        setError('Failed to load map');
      }
    };

    initMap();
  }, [center, zoom]);

  // Add property markers
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !properties.length) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    const google = (window as any).google;
    if (!google) return;

    properties.forEach((property) => {
      const { lat, lng } = property.location.coordinates!;
      
      // Format price for display
      const formatPrice = (amount: number, currency: string) => {
        if (amount >= 1000000) {
          return `${currency === 'NGN' ? '₦' : '$'}${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
          return `${currency === 'NGN' ? '₦' : '$'}${(amount / 1000).toFixed(0)}K`;
        }
        return `${currency === 'NGN' ? '₦' : '$'}${amount.toLocaleString()}`;
      };

      const priceLabel = formatPrice(property.price.amount / 100, property.price.currency);

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current,
        title: property.title,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
            <svg width="60" height="30" xmlns="http://www.w3.org/2000/svg">
              <rect x="0" y="0" width="60" height="20" rx="10" 
                    fill="white" stroke="${property.is_verified ? '#10B981' : '#6B7280'}" stroke-width="2"/>
              <text x="30" y="14" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="600" 
                    fill="${property.is_verified ? '#10B981' : '#374151'}">${priceLabel}</text>
              <polygon points="25,20 30,25 35,20" fill="${property.is_verified ? '#10B981' : '#6B7280'}"/>
            </svg>
          `)}`,
          anchor: new google.maps.Point(30, 25),
          scaledSize: new google.maps.Size(60, 30)
        }
      });

      // Add click listener
      marker.addListener('click', () => {
        setSelectedProperty(property);
        
        const infoContent = `
          <div style="padding: 8px; max-width: 250px;">
            <h3 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 600;">${property.title}</h3>
            <p style="margin: 0 0 4px 0; font-size: 12px; color: #6B7280;">${property.location.address}</p>
            <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #10B981;">
              ${formatPrice(property.price.amount / 100, property.price.currency)}
            </p>
            <div style="display: flex; gap: 4px; margin-bottom: 8px;">
              ${property.is_verified ? '<span style="background: #D1FAE5; color: #065F46; padding: 2px 6px; border-radius: 12px; font-size: 10px;">Verified</span>' : ''}
              ${property.is_tokenized ? '<span style="background: #EDE9FE; color: #5B21B6; padding: 2px 6px; border-radius: 12px; font-size: 10px;">Tokenized</span>' : ''}
            </div>
            <button onclick="window.location.href='/properties/${property.id}'" 
                    style="background: #10B981; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; cursor: pointer;">
              View Details
            </button>
          </div>
        `;

        infoWindowRef.current?.setContent(infoContent);
        infoWindowRef.current?.open(mapInstanceRef.current, marker);
      });

      markersRef.current.push(marker as any);
    });

  }, [mapLoaded, properties]);

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64 text-red-500">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-2" />
              <p>{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      />
      {selectedProperty && (
        <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg max-w-xs">
          <h4 className="font-semibold text-sm">{selectedProperty.title}</h4>
          <p className="text-xs text-gray-600 mb-2">{selectedProperty.location.address}</p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {selectedProperty.type}
            </Badge>
            {selectedProperty.is_verified && (
              <Badge className="text-xs bg-green-100 text-green-800">Verified</Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}