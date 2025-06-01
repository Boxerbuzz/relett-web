
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface BasicPropertyInfoProps {
  data: {
    title: string;
    description: string;
    propertyType: string;
    category: string;
    status: string;
  };
  onUpdate: (data: any) => void;
}

const propertyTypes = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'agricultural', label: 'Agricultural' },
  { value: 'mixed_use', label: 'Mixed Use' },
];

const categories = [
  { value: 'land', label: 'Land/Plot' },
  { value: 'house', label: 'House' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'office', label: 'Office Building' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'retail', label: 'Retail Space' },
  { value: 'farm', label: 'Farm' },
];

export function BasicPropertyInfo({ data, onUpdate }: BasicPropertyInfoProps) {
  const handleChange = (field: string, value: string) => {
    onUpdate({ [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Property Information</CardTitle>
        <CardDescription>
          Provide the essential details about your property
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Property Title */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="title">Property Title *</Label>
            <Input
              id="title"
              value={data.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter a descriptive title for your property"
              className="w-full"
            />
          </div>

          {/* Property Type */}
          <div className="space-y-2">
            <Label htmlFor="propertyType">Property Type *</Label>
            <Select 
              value={data.propertyType} 
              onValueChange={(value) => handleChange('propertyType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select property type" />
              </SelectTrigger>
              <SelectContent>
                {propertyTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={data.category} 
              onValueChange={(value) => handleChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description">Property Description</Label>
            <Textarea
              id="description"
              value={data.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe your property in detail. Include unique features, condition, and any relevant information."
              rows={4}
              className="w-full"
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">Tips for a Great Property Listing</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use a clear, descriptive title that highlights the property's main features</li>
            <li>• Choose the most accurate property type and category</li>
            <li>• Provide a detailed description including location benefits and unique features</li>
            <li>• Mention any recent improvements or special characteristics</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
