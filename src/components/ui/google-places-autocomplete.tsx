"use client";

import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MapPin, Loader2 } from "lucide-react";

declare global {
  interface Window {
    google: any;
    initGooglePlaces: () => void;
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
  value = "",
  onChange,
  onInputChange,
  placeholder = "Enter a location...",
  className,
  disabled = false,
}: GooglePlacesAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteService = useRef<any>(null);
  const placesService = useRef<any>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      console.warn(
        "Google Maps API key not found. Please add VITE_GOOGLE_MAPS_API_KEY to your environment variables."
      );
      return;
    }

    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initializeServices();
      setIsScriptLoaded(true);
      return;
    }

    // Load Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGooglePlaces`;
    script.async = true;
    script.defer = true;

    window.initGooglePlaces = () => {
      initializeServices();
      setIsScriptLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
      delete window.initGooglePlaces;
    };
  }, []);

  

  const initializeServices = () => {
    if (window.google && window.google.maps) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteSuggestion();
      // Create a dummy div for PlacesService
      const dummyDiv = document.createElement("div");
      placesService.current = new window.google.maps.places.PlacesService(
        dummyDiv
      );
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onInputChange?.(newValue);

    if (!newValue.trim()) {
      setPredictions([]);
      setShowPredictions(false);
      onChange(null);
      return;
    }

    if (isScriptLoaded && autocompleteService.current) {
      setIsLoading(true);

      const request = {
        input: newValue,
        types: ["address"],
        componentRestrictions: { country: "ng" }, // Restrict to Nigeria, change as needed
      };

      autocompleteService.current.getPlacePredictions(
        request,
        (predictions: any[], status: any) => {
          setIsLoading(false);
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            predictions
          ) {
            setPredictions(predictions);
            setShowPredictions(true);
          } else {
            setPredictions([]);
            setShowPredictions(false);
          }
        }
      );
    }
  };

  const handlePredictionClick = (prediction: any) => {
    setInputValue(prediction.description);
    setShowPredictions(false);
    setIsLoading(true);

    if (placesService.current) {
      const request = {
        placeId: prediction.place_id,
        fields: ["address_components", "formatted_address", "geometry", "name"],
      };

      placesService.current.getDetails(request, (place: any, status: any) => {
        setIsLoading(false);

        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          place
        ) {
          const placeDetails = extractPlaceDetails(place);
          onChange(placeDetails);
        }
      });
    }
  };

  const extractPlaceDetails = (place: any): PlaceDetails => {
    const components = place.address_components || [];

    let address = "";
    let city = "";
    let state = "";
    let country = "";
    let postalCode = "";

    components.forEach((component: any) => {
      const types = component.types;

      if (types.includes("street_number") || types.includes("route")) {
        address += component.long_name + " ";
      } else if (types.includes("locality")) {
        city = component.long_name;
      } else if (types.includes("administrative_area_level_2") && !city) {
        city = component.long_name;
      } else if (types.includes("administrative_area_level_1")) {
        state = component.long_name;
      } else if (types.includes("country")) {
        country = component.long_name;
      } else if (types.includes("postal_code")) {
        postalCode = component.long_name;
      }
    });

    return {
      address: address.trim() || place.name || "",
      city,
      state,
      country,
      postalCode,
      coordinates: {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      },
      placeId: place.place_id,
      formattedAddress: place.formatted_address,
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
          {predictions.map((prediction) => (
            <div
              key={prediction.place_id}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handlePredictionClick(prediction)}
            >
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {prediction.structured_formatting?.main_text ||
                      prediction.description}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {prediction.structured_formatting?.secondary_text || ""}
                  </p>
                </div>
              </div>
            </div>
          ))}
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
