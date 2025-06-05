
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { usePropertyCreation } from '@/hooks/usePropertyCreation';
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
  type: z.enum(['residential', 'commercial', 'industrial', 'land']),
  sub_type: z.string().min(1, 'Sub-type is required'),
  category: z.enum(['sell', 'rent', 'shortlet', 'lease']),
  condition: z.enum(['newlyBuilt', 'renovated', 'good', 'needs_renovation']),
  price: z.object({
    amount: z.number().min(0),
    currency: z.string().default('NGN'),
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

interface AddPropertyFormProps {
  onClose?: () => void;
}

export function AddPropertyForm({ onClose }: AddPropertyFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { createProperty, isLoading } = usePropertyCreation();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      type: 'residential',
      sub_type: '',
      category: 'sell',
      condition: 'good',
      price: {
        amount: 0,
        currency: 'NGN',
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
    try {
      console.log('Submitting property:', data);

      // Ensure coordinates are either complete or null
      const coordinates = data.location.coordinates?.lat && data.location.coordinates?.lng 
        ? {
            lat: data.location.coordinates.lat,
            lng: data.location.coordinates.lng
          }
        : null;

      // Transform form data to match the expected structure
      const propertyData = {
        basicInfo: {
          title: data.title,
          description: data.description,
          propertyType: data.type,
          category: data.category,
          status: 'pending'
        },
        location: {
          address: data.location.address,
          city: data.location.city,
          state: data.location.state,
          country: data.location.country,
          coordinates
        },
        documents: data.documents.map(doc => ({
          id: crypto.randomUUID(),
          name: doc.filename,
          type: doc.type,
          url: doc.url,
          size: 0
        })),
        valuation: {
          estimatedValue: data.price.amount,
          currency: data.price.currency,
          valuationMethod: 'user_estimate',
          marketAnalysis: ''
        }
      };

      const property = await createProperty(propertyData);
      
      toast({
        title: 'Success!',
        description: 'Property has been created successfully.',
      });

      // Redirect to property details or list
      navigate('/land');
      
      if (onClose) onClose();
    } catch (error) {
      console.error('Error submitting property:', error);
      toast({
        title: 'Error',
        description: 'Failed to create property. Please try again.',
        variant: 'destructive'
      });
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
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-lg">
        {/* Header */}
        <CardHeader className="rounded-t-md border-b bg-white">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Add New Property</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{Math.round(progress)}% Complete</p>
            </div>
          </div>
        </CardHeader>

        {/* Progress */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`flex flex-col items-center ${
                    index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      index <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-1 text-xs hidden md:block">{step.title}</span>
                </div>
              ))}
            </div>
            <Progress value={progress} className="w-full h-2" />
          </div>
        </div>

        {/* Form Content */}
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {renderStep()}
            </form>
          </Form>
        </CardContent>

        {/* Footer */}
        <div className="flex justify-between p-6 border-t bg-gray-50 rounded-b-md">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="min-w-24"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          
          {currentStep === steps.length - 1 ? (
            <Button 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={isLoading}
              className="min-w-32"
            >
              {isLoading ? 'Creating Property...' : 'Create Property'}
            </Button>
          ) : (
            <Button type="button" onClick={nextStep} className="min-w-24">
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
