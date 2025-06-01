
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Navigation } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PropertyLocationProps {
  data: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: { lat: number; lng: number } | null;
  };
  onUpdate: (data: any) => void;
}

const nigerianStates = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

export function PropertyLocation({ data, onUpdate }: PropertyLocationProps) {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: string, value: string) => {
    onUpdate({ [field]: value });
  };

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      toast({
        title: 'Location Not Available',
        description: 'Geolocation is not supported by this browser.',
        variant: 'destructive'
      });
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coordinates = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        onUpdate({ coordinates });
        toast({
          title: 'Location Captured',
          description: 'GPS coordinates have been added to your property.',
        });
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          title: 'Location Error',
          description: 'Could not get your current location. Please ensure location permissions are enabled.',
          variant: 'destructive'
        });
        setIsGettingLocation(false);
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Location</CardTitle>
        <CardDescription>
          Provide the exact location details of your property
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="address">Street Address *</Label>
            <Input
              id="address"
              value={data.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="Enter the full street address"
              className="w-full"
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={data.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Enter city"
              className="w-full"
            />
          </div>

          {/* State */}
          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Select 
              value={data.state} 
              onValueChange={(value) => handleChange('state', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {nigerianStates.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={data.country}
              onChange={(e) => handleChange('country', e.target.value)}
              placeholder="Nigeria"
              disabled
              className="w-full bg-gray-50"
            />
          </div>

          {/* GPS Coordinates */}
          <div className="space-y-2">
            <Label>GPS Coordinates</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="flex-1"
              >
                <Navigation className="w-4 h-4 mr-2" />
                {isGettingLocation ? 'Getting Location...' : 'Get Current Location'}
              </Button>
            </div>
            {data.coordinates && (
              <div className="text-sm text-gray-600 mt-2">
                <p>Latitude: {data.coordinates.lat.toFixed(6)}</p>
                <p>Longitude: {data.coordinates.lng.toFixed(6)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Location Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Location Accuracy is Important
          </h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Provide the most accurate address possible</li>
            <li>• GPS coordinates help with precise mapping and verification</li>
            <li>• Accurate location information speeds up the verification process</li>
            <li>• This information will be used for property surveys and inspections</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
