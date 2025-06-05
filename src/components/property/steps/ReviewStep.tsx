
'use client';

import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface ReviewStepProps {
  form: UseFormReturn<any>;
}

export function ReviewStep({ form }: ReviewStepProps) {
  const formData = form.getValues();

  const getSubTypeLabel = (type: string, subType: string) => {
    const subTypeLabels: Record<string, Record<string, string>> = {
      residential: {
        apartment: 'Apartment',
        villa: 'Villa',
        house: 'House',
        condo: 'Condo',
        townhouse: 'Townhouse',
        duplex: 'Duplex',
        penthouse: 'Penthouse',
        studio: 'Studio',
      },
      commercial: {
        office: 'Office',
        retail: 'Retail',
        warehouse: 'Warehouse',
        hotel: 'Hotel',
        restaurant: 'Restaurant',
        shop: 'Shop',
        mall: 'Mall',
      },
      industrial: {
        factory: 'Factory',
        manufacturing: 'Manufacturing',
        logistics: 'Logistics',
        warehouse: 'Industrial Warehouse',
      },
      land: {
        residential_land: 'Residential Land',
        commercial_land: 'Commercial Land',
        industrial_land: 'Industrial Land',
        farmland: 'Farmland',
        agricultural: 'Agricultural Land',
      },
    };

    return subTypeLabels[type]?.[subType] || subType;
  };

  const getCategoryLabel = (category: string) => {
    const categoryLabels = {
      sell: 'For Sale',
      rent: 'For Rent',
      shortlet: 'Short Let',
      lease: 'Lease',
    };
    return categoryLabels[category as keyof typeof categoryLabels] || category;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div><strong>Title:</strong> {formData.title}</div>
          <div><strong>Type:</strong> <Badge variant="outline">{formData.type}</Badge></div>
          <div><strong>Sub-Type:</strong> <Badge variant="secondary">{getSubTypeLabel(formData.type, formData.sub_type)}</Badge></div>
          <div><strong>Category:</strong> <Badge>{getCategoryLabel(formData.category)}</Badge></div>
          <div><strong>Condition:</strong> {formData.condition}</div>
          <div><strong>Price:</strong> ₦{formData.price?.amount?.toLocaleString()} ({getCategoryLabel(formData.category)})</div>
          <div><strong>Description:</strong> {formData.description}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div>{formData.location?.address}</div>
          <div>{formData.location?.city}, {formData.location?.state}</div>
          <div>{formData.location?.country}</div>
          {formData.location?.coordinates?.lat && (
            <div className="mt-2 text-sm text-gray-600">
              Coordinates: {formData.location.coordinates.lat}, {formData.location.coordinates.lng}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Specifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {formData.specification?.bedrooms && <div><strong>Bedrooms:</strong> {formData.specification.bedrooms}</div>}
          {formData.specification?.bathrooms && <div><strong>Bathrooms:</strong> {formData.specification.bathrooms}</div>}
          {formData.specification?.parking && <div><strong>Parking:</strong> {formData.specification.parking}</div>}
          {formData.specification?.year_built && <div><strong>Year Built:</strong> {formData.specification.year_built}</div>}
          {formData.sqrft && <div><strong>Square Footage:</strong> {formData.sqrft}</div>}
          
          {formData.features?.length > 0 && (
            <div>
              <strong>Features:</strong>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.features.map((feature: string) => (
                  <Badge key={feature} variant="secondary">{feature}</Badge>
                ))}
              </div>
            </div>
          )}
          
          {formData.amenities?.length > 0 && (
            <div>
              <strong>Amenities:</strong>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.amenities.map((amenity: string) => (
                  <Badge key={amenity} variant="outline">{amenity}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documents & Media</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Documents:</strong> {formData.documents?.length || 0} uploaded
          </div>
          <div>
            <strong>Images:</strong> {formData.images?.length || 0} uploaded
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
