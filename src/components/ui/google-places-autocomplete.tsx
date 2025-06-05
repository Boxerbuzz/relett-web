
'use client';

import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MapPin, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    google: any;
  }
}

interface PlaceDetails {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  placeId: string;
  formattedAddress: string;
}

interface GooglePlacesAutocompleteProps {
  value?: string;
  onChange: (place: PlaceDetails | null) => void;
  onInputChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function GooglePlacesAutocomplete({
  value = '',
  onChange,
  onInputChange,
  placeholder = "Enter a location...",
  className,
  disabled = false
}: GooglePlacesAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionToken = useRef<any>(null);
  const autocompleteService = useRef<any>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.warn('Google Maps API key not found. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables.');
      return;
    }

    loadGoogleMapsAPI();
  }, []);

  const loadGoogleMapsAPI = async () => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    try {
      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;

      script.onload = async () => {
        try {
          // Import the places library using the new API
          const { AutocompleteSuggestion, AutocompleteSessionToken } = await window.google.maps.importLibrary("places");
          
          autocompleteService.current = AutocompleteSuggestion;
          
          // Create a session token for this autocomplete session
          sessionToken.current = new AutocompleteSessionToken();
          
          setIsScriptLoaded(true);
        } catch (error) {
          console.error('Error loading Google Places library:', error);
        }
      };

      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    } catch (error) {
      console.error('Error loading Google Maps API:', error);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onInputChange?.(newValue);

    if (!newValue.trim()) {
      setPredictions([]);
      setShowPredictions(false);
      onChange(null);
      return;
    }

    if (isScriptLoaded && autocompleteService.current && sessionToken.current) {
      setIsLoading(true);
      
      try {
        const request = {
          input: newValue,
          includedPrimaryTypes: ['address'],
          includedRegionCodes: ['ng'], // Restrict to Nigeria, change as needed
          language: 'en',
          sessionToken: sessionToken.current
        };

        const { suggestions } = await autocompleteService.current.fetchAutocompleteSuggestions(request);
        
        if (suggestions && suggestions.length > 0) {
          setPredictions(suggestions);
          setShowPredictions(true);
        } else {
          setPredictions([]);
          setShowPredictions(false);
        }
      } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
        setPredictions([]);
        setShowPredictions(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePredictionClick = async (suggestion: any) => {
    if (!suggestion.placePrediction) return;

    const displayText = suggestion.placePrediction.text?.text || suggestion.placePrediction.mainText?.text || 'Unknown location';
    setInputValue(displayText);
    setShowPredictions(false);
    setIsLoading(true);

    try {
      // Use the new API to get place details
      const place = suggestion.placePrediction.toPlace();
      
      // Fetch detailed place information
      await place.fetchFields({
        fields: ['addressComponents', 'formattedAddress', 'location', 'displayName']
      });

      const placeDetails = extractPlaceDetails(place, suggestion.placePrediction.placeId);
      onChange(placeDetails);
    } catch (error) {
      console.error('Error fetching place details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractPlaceDetails = (place: any, placeId: string): PlaceDetails => {
    const components = place.addressComponents || [];
    
    let address = '';
    let city = '';
    let state = '';
    let country = '';
    let postalCode = '';

    components.forEach((component: any) => {
      const types = component.types;
      
      if (types.includes('street_number') || types.includes('route')) {
        address += component.longText + ' ';
      } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        city = component.longText;
      } else if (types.includes('administrative_area_level_1')) {
        state = component.longText;
      } else if (types.includes('country')) {
        country = component.longText;
      } else if (types.includes('postal_code')) {
        postalCode = component.longText;
      }
    });

    return {
      address: address.trim() || place.displayName || '',
      city,
      state,
      country,
      postalCode,
      coordinates: {
        lat: place.location?.lat() || 0,
        lng: place.location?.lng() || 0
      },
      placeId,
      formattedAddress: place.formattedAddress || ''
    };
  };

  const handleBlur = () => {
    // Delay hiding predictions to allow click events
    setTimeout(() => {
      setShowPredictions(false);
    }, 200);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => predictions.length > 0 && setShowPredictions(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn("pr-10", className)}
          disabled={disabled}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : (
            <MapPin className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {showPredictions && predictions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {predictions.map((suggestion, index) => {
            const mainText = suggestion.placePrediction?.mainText?.text || suggestion.placePrediction?.text?.text || 'Unknown location';
            const secondaryText = suggestion.placePrediction?.secondaryText?.text || '';
            
            return (
              <div
                key={suggestion.placePrediction?.placeId || index}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handlePredictionClick(suggestion)}
              >
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {mainText}
                    </p>
                    {secondaryText && (
                      <p className="text-xs text-gray-500 truncate">
                        {secondaryText}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!isScriptLoaded && (
        <div className="absolute inset-0 bg-gray-50 bg-opacity-75 flex items-center justify-center rounded-md">
          <div className="text-xs text-gray-500">Loading Google Places...</div>
        </div>
      )}
    </div>
  );
}
