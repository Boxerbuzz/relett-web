'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SpinnerIcon, MapPinIcon } from '@phosphor-icons/react';

interface EditPropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  onPropertyUpdated?: () => void;
}

interface PropertyFormData {
  title: string;
  description: string;
  category: string;
  type: string;
  condition: string;
  price: {
    amount: number;
    currency: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
  };
  specification: {
    bedrooms: number;
    bathrooms: number;
    area_sqm: number;
  };
  amenities: string[];
  features: string[];
}

export function EditPropertyDialog({ open, onOpenChange, propertyId, onPropertyUpdated }: EditPropertyDialogProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: '',
    description: '',
    category: '',
    type: '',
    condition: 'good',
    price: {
      amount: 0,
      currency: 'NGN'
    },
    location: {
      address: '',
      city: '',
      state: '',
      country: 'Nigeria'
    },
    specification: {
      bedrooms: 0,
      bathrooms: 0,
      area_sqm: 0
    },
    amenities: [],
    features: []
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open && propertyId) {
      fetchPropertyData();
    }
  }, [open, propertyId]);

  const fetchPropertyData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) throw error;

      if (data) {
        // Safely parse JSON data
        const price = data.price as any;
        const location = data.location as any;
        const specification = data.specification as any;

        setFormData({
          title: data.title || '',
          description: data.description || '',
          category: data.category || '',
          type: data.type || '',
          condition: data.condition || 'good',
          price: {
            amount: price && typeof price === 'object' && price.amount ? price.amount / 100 : 0,
            currency: price && typeof price === 'object' && price.currency || 'NGN'
          },
          location: {
            address: location && typeof location === 'object' && location.address || '',
            city: location && typeof location === 'object' && location.city || '',
            state: location && typeof location === 'object' && location.state || '',
            country: location && typeof location === 'object' && location.country || 'Nigeria'
          },
          specification: {
            bedrooms: specification && typeof specification === 'object' && specification.bedrooms || 0,
            bathrooms: specification && typeof specification === 'object' && specification.bathrooms || 0,
            area_sqm: specification && typeof specification === 'object' && specification.area_sqm || 0
          },
          amenities: Array.isArray(data.amenities) ? data.amenities : [],
          features: Array.isArray(data.features) ? data.features : []
        });
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      toast({
        title: 'Error',
        description: 'Failed to load property data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      const updateData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        type: formData.type,
        condition: formData.condition,
        price: {
          amount: formData.price.amount * 100, // Convert naira to kobo
          currency: formData.price.currency
        },
        location: formData.location,
        specification: formData.specification,
        amenities: formData.amenities,
        features: formData.features,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('properties')
        .update(updateData)
        .eq('id', propertyId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Property updated successfully'
      });

      onPropertyUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating property:', error);
      toast({
        title: 'Error',
        description: 'Failed to update property',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => {
      if (field.includes('.')) {
        const keys = field.split('.');
        const newData = { ...prev };
        let current: any = newData;
        
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        
        return newData;
      } else {
        return { ...prev, [field]: value };
      }
    });
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <SpinnerIcon className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Property</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Basic Information</h3>
              
              <div>
                <Label htmlFor="title">Property Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => updateFormData('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="commercial">Commercial</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => updateFormData('type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="villa">Villa</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="plot">Plot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="condition">Condition</Label>
                <Select value={formData.condition} onValueChange={(value) => updateFormData('condition', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="needs_renovation">Needs Renovation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Price */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Pricing</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount">Price (₦)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={formData.price.amount}
                    onChange={(e) => updateFormData('price.amount', parseFloat(e.target.value) || 0)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={formData.price.currency} onValueChange={(value) => updateFormData('price.currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">Nigerian Naira (₦)</SelectItem>
                      <SelectItem value="USD">US Dollar ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPinIcon size={16} />
                Location
              </h3>
              
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.location.address}
                  onChange={(e) => updateFormData('location.address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.location.city}
                    onChange={(e) => updateFormData('location.city', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.location.state}
                    onChange={(e) => updateFormData('location.state', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Specifications</h3>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={formData.specification.bedrooms}
                    onChange={(e) => updateFormData('specification.bedrooms', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    value={formData.specification.bathrooms}
                    onChange={(e) => updateFormData('specification.bathrooms', parseInt(e.target.value) || 0)}
                  />
                </div>

                <div>
                  <Label htmlFor="area">Area (sqm)</Label>
                  <Input
                    id="area"
                    type="number"
                    value={formData.specification.area_sqm}
                    onChange={(e) => updateFormData('specification.area_sqm', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />}
              Update Property
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}