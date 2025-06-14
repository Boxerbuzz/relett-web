
'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Navigation, Clock } from 'lucide-react';
import loader from '@/lib/google';

interface PropertyMapProps {
  coordinates?: {
    lat: number;
    lng: number;
  };
  address: string;
  className?: string;
}

export function PropertyMap({ coordinates, address, className }: PropertyMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        const google = await loader.load();
        
        if (!mapRef.current || !coordinates) return;

        const map = new google.maps.Map(mapRef.current, {
          center: coordinates,
          zoom: 16,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: true,
          zoomControl: true,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });

        // Add property marker
        new google.maps.Marker({
          position: coordinates,
          map: map,
          title: address,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#3B82F6',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2
          }
        });

        // Add nearby places
        const service = new google.maps.places.PlacesService(map);
        const request = {
          location: coordinates,
          radius: 2000,
          type: 'establishment' // use string, not PlaceType
        };

        service.nearbySearch(request, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && results) {
            results.slice(0, 5).forEach((place) => {
              if (place.geometry?.location) {
                new google.maps.Marker({
                  position: place.geometry.location,
                  map: map,
                  title: place.name,
                  icon: {
                    url: place.icon,
                    scaledSize: new google.maps.Size(20, 20)
                  }
                });
              }
            });
          }
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);
      } catch (err) {
        console.error('Error loading map:', err);
        setError('Failed to load map');
      }
    };

    initMap();
  }, [coordinates, address]);

  if (!coordinates) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Location coordinates not available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
    <Card className={className}>
      <CardContent className="p-0">
        <div 
          ref={mapRef} 
          className="h-64 w-full rounded-lg"
          style={{ minHeight: '256px' }}
        />
        {mapLoaded && (
          <div className="p-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <MapPin className="h-4 w-4" />
              <span>{address}</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="flex items-center gap-1">
                <Navigation className="h-3 w-3" />
                <span>Get Directions</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Street View</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
