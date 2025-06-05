
'use client';

import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BasicDetailsStepProps {
  form: UseFormReturn<any>;
}

const propertySubTypes = {
  residential: [
    { value: 'apartment', label: 'Apartment' },
    { value: 'villa', label: 'Villa' },
    { value: 'house', label: 'House' },
    { value: 'condo', label: 'Condo' },
    { value: 'townhouse', label: 'Townhouse' },
    { value: 'duplex', label: 'Duplex' },
    { value: 'penthouse', label: 'Penthouse' },
    { value: 'studio', label: 'Studio' },
  ],
  commercial: [
    { value: 'office', label: 'Office' },
    { value: 'retail', label: 'Retail' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'hotel', label: 'Hotel' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'shop', label: 'Shop' },
    { value: 'mall', label: 'Mall' },
  ],
  industrial: [
    { value: 'factory', label: 'Factory' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'logistics', label: 'Logistics' },
    { value: 'warehouse', label: 'Industrial Warehouse' },
  ],
  land: [
    { value: 'residential_land', label: 'Residential Land' },
    { value: 'commercial_land', label: 'Commercial Land' },
    { value: 'industrial_land', label: 'Industrial Land' },
    { value: 'farmland', label: 'Farmland' },
    { value: 'agricultural', label: 'Agricultural Land' },
  ],
};

export function BasicDetailsStep({ form }: BasicDetailsStepProps) {
  const selectedType = form.watch('type');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Modern 3BR Villa with Garden" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Type</FormLabel>
              <Select onValueChange={(value) => {
                field.onChange(value);
                // Reset sub_type when type changes
                form.setValue('sub_type', '');
              }} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sub_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Sub-Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedType}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sub-type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {selectedType && propertySubTypes[selectedType as keyof typeof propertySubTypes]?.map((subType) => (
                    <SelectItem key={subType.value} value={subType.value}>
                      {subType.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Listing Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="sell">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                  <SelectItem value="shortlet">Short Let</SelectItem>
                  <SelectItem value="lease">Lease</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condition</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="newlyBuilt">Newly Built</SelectItem>
                  <SelectItem value="renovated">Recently Renovated</SelectItem>
                  <SelectItem value="good">Good Condition</SelectItem>
                  <SelectItem value="needs_renovation">Needs Renovation</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price.amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  placeholder="0" 
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe your property in detail..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
