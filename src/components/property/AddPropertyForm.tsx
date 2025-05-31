
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BasicDetailsStep } from './steps/BasicDetailsStep';
import { LocationStep } from './steps/LocationStep';
import { SpecificationStep } from './steps/SpecificationStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { MediaStep } from './steps/MediaStep';
import { ReviewStep } from './steps/ReviewStep';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const propertySchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['residential', 'commercial', 'industrial', 'agricultural']),
  type: z.string().min(1, 'Property type is required'),
  status: z.enum(['for_sale', 'for_rent', 'tokenized', 'draft']),
  condition: z.enum(['newlyBuilt', 'renovated', 'good', 'needs_renovation']),
  price: z.object({
    amount: z.number().min(0),
    currency: z.string().default('USD'),
    type: z.enum(['sale', 'rent_monthly', 'rent_yearly'])
  }),
  location: z.object({
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    country: z.string().min(1, 'Country is required'),
    coordinates: z.object({
      lat: z.number().optional(),
      lng: z.number().optional()
    }).optional()
  }),
  specification: z.object({
    bedrooms: z.number().min(0).optional(),
    bathrooms: z.number().min(0).optional(),
    parking: z.number().min(0).optional(),
    year_built: z.number().min(1800).max(2024).optional()
  }),
  sqrft: z.string().optional(),
  features: z.array(z.string()).default([]),
  amenities: z.array(z.string()).default([]),
  documents: z.array(z.object({
    type: z.enum(['deed', 'survey', 'certificate', 'other']),
    filename: z.string(),
    url: z.string()
  })).default([]),
  images: z.array(z.object({
    url: z.string(),
    is_primary: z.boolean().default(false),
    category: z.string().default('general')
  })).default([])
});

type PropertyFormData = z.infer<typeof propertySchema>;

const steps = [
  { title: 'Basic Details', description: 'Property information' },
  { title: 'Location', description: 'Address and coordinates' },
  { title: 'Specifications', description: 'Size and features' },
  { title: 'Documents', description: 'Legal documents' },
  { title: 'Media', description: 'Photos and videos' },
  { title: 'Review', description: 'Confirm details' }
];

export function AddPropertyForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      category: 'residential',
      status: 'draft',
      condition: 'good',
      price: {
        amount: 0,
        currency: 'USD',
        type: 'sale'
      },
      specification: {},
      features: [],
      amenities: [],
      documents: [],
      images: []
    }
  });

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: PropertyFormData) => {
    setIsSubmitting(true);
    try {
      console.log('Submitting property:', data);
      // TODO: Integrate with Supabase
      alert('Property added successfully!');
    } catch (error) {
      console.error('Error submitting property:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <BasicDetailsStep form={form} />;
      case 1:
        return <LocationStep form={form} />;
      case 2:
        return <SpecificationStep form={form} />;
      case 3:
        return <DocumentsStep form={form} />;
      case 4:
        return <MediaStep form={form} />;
      case 5:
        return <ReviewStep form={form} />;
      default:
        return null;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add New Property</CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="w-full" />
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{steps[currentStep].title}</h3>
                <p className="text-sm text-gray-500">{steps[currentStep].description}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {renderStep()}
            
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>
              
              {currentStep === steps.length - 1 ? (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Adding Property...' : 'Add Property'}
                </Button>
              ) : (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
