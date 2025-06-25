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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { X } from "lucide-react";
import { getAmenities } from "@/types/amenities";

interface SpecificationStepProps {
  form: UseFormReturn<any>;
}

const commonFeatures = getAmenities();

const commonAmenities = [
  "Security System",
  "Gym",
  "Playground",
  "Laundry Room",
  "Storage",
  "Internet",
  "Cable TV",
  "Air Conditioning",
  "Central Heating",
];

export function SpecificationStep({ form }: SpecificationStepProps) {
  const [newFeature, setNewFeature] = useState("");
  const [newAmenity, setNewAmenity] = useState("");

  const features = form.watch("features") || [];
  const amenities = form.watch("amenities") || [];

  const addFeature = (feature: string) => {
    if (feature && !features.includes(feature)) {
      form.setValue("features", [...features, feature]);
    }
    setNewFeature("");
  };

  const removeFeature = (feature: string) => {
    form.setValue(
      "features",
      features.filter((f: string) => f !== feature)
    );
  };

  const addAmenity = (amenity: string) => {
    if (amenity && !amenities.includes(amenity)) {
      form.setValue("amenities", [...amenities, amenity]);
    }
    setNewAmenity("");
  };

  const removeAmenity = (amenity: string) => {
    form.setValue(
      "amenities",
      amenities.filter((a: string) => a !== amenity)
    );
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <FormField
          control={form.control}
          name="specification.bedrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bedrooms</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || undefined)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specification.bathrooms"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bathrooms</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || undefined)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specification.parking"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parking Spaces</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || undefined)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specification.year_built"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year Built</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="2024"
                  {...field}
                  onChange={(e) =>
                    field.onChange(parseInt(e.target.value) || undefined)
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="sqrft"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Square Footage</FormLabel>
            <FormControl>
              <Input placeholder="e.g., 2,500 sq ft" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <FormLabel className="text-base font-medium mb-4 block">
          Features
        </FormLabel>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {features.map((feature: string) => (
              <Badge
                key={feature}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {feature}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => removeFeature(feature)}
                />
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {(commonFeatures || []).map(
              (feature: {
                id: string;
                name: string;
                category: string;
                icon: string;
              }) => (
                <div key={feature.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={features.includes(feature)}
                    onCheckedChange={(checked) => {
                      if (checked) addFeature(feature.id);
                      else removeFeature(feature.id);
                    }}
                  />
                  <label className="text-sm">{feature.name}</label>
                </div>
              )
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Add custom feature"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (e.preventDefault(), addFeature(newFeature))
              }
            />
            <Button type="button" onClick={() => addFeature(newFeature)}>
              Add
            </Button>
          </div>
        </div>
      </div>

      <div>
        <FormLabel className="text-base font-medium mb-4 block">
          Amenities
        </FormLabel>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {amenities.map((amenity: string) => (
              <Badge
                key={amenity}
                variant="secondary"
                className="flex items-center gap-1"
              >
                {amenity}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => removeAmenity(amenity)}
                />
              </Badge>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
            {commonAmenities.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-2">
                <Checkbox
                  checked={amenities.includes(amenity)}
                  onCheckedChange={(checked) => {
                    if (checked) addAmenity(amenity);
                    else removeAmenity(amenity);
                  }}
                />
                <label className="text-sm">{amenity}</label>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Add custom amenity"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (e.preventDefault(), addAmenity(newAmenity))
              }
            />
            <Button type="button" onClick={() => addAmenity(newAmenity)}>
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
