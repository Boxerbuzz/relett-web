
"use client";

import { UseFormReturn } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {GooglePlacesAutocomplete} from "@/components/ui/google-places-autocomplete";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Info } from "lucide-react";

interface LocationStepProps {
  form: UseFormReturn<any>;
}

export function LocationStep({ form }: LocationStepProps) {
  const handlePlaceSelect = (place: any) => {
    if (place) {
      form.setValue("location.address", place.address);
      form.setValue("location.city", place.city);
      form.setValue("location.state", place.state);
      form.setValue("location.country", place.country);

      if (place.coordinates) {
        form.setValue("location.coordinates.lat", place.coordinates.lat);
        form.setValue("location.coordinates.lng", place.coordinates.lng);
      }

      form.trigger([
        "location.address",
        "location.city",
        "location.state",
        "location.country",
      ]);
    }
  };

  const handleAddressInputChange = (value: string) => {
    form.setValue("location.address", value);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Property Location</h2>
        <p className="text-gray-600 mb-6">
          Provide the exact location of your property for potential buyers/tenants.
        </p>
      </div>

      {/* Google Places Autocomplete */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            Smart Address Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <GooglePlacesAutocomplete
              value={form.watch("location.address") || ""}
              onChange={handlePlaceSelect}
              onInputChange={handleAddressInputChange}
              placeholder="Start typing your property address..."
              className="w-full"
            />
            <div className="flex items-start gap-2 text-sm text-blue-600">
              <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                Start typing your address above and select from the suggestions.
                This will automatically fill in the location details below.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual Address Entry */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-700 border-b pb-2">
          Location Details
        </h3>

        <FormField
          control={form.control}
          name="location.address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address *</FormLabel>
              <FormControl>
                <Input placeholder="123 Main Street" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location.landmark"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Landmark</FormLabel>
                <FormControl>
                  <Input placeholder="Near popular landmark" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location.postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="100001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="location.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City *</FormLabel>
                <FormControl>
                  <Input placeholder="Lagos" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location.state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State *</FormLabel>
                <FormControl>
                  <Input placeholder="Lagos State" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location.country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country *</FormLabel>
                <FormControl>
                  <Input placeholder="Nigeria" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="location.coordinates.lat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude (Auto-filled)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="e.g., 6.5244"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || undefined)
                    }
                    className="bg-gray-50"
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location.coordinates.lng"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude (Auto-filled)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="any"
                    placeholder="e.g., 3.3792"
                    {...field}
                    onChange={(e) =>
                      field.onChange(parseFloat(e.target.value) || undefined)
                    }
                    className="bg-gray-50"
                    readOnly
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Location Preview */}
        {form.watch("location.coordinates.lat") &&
          form.watch("location.coordinates.lng") && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">Location Confirmed</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Coordinates:{" "}
                  {form.watch("location.coordinates.lat")?.toFixed(6)},{" "}
                  {form.watch("location.coordinates.lng")?.toFixed(6)}
                </p>
              </CardContent>
            </Card>
          )}
      </div>
    </div>
  );
}
