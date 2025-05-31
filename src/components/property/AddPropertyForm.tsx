
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Form } from '@/components/ui/form';
import { BasicDetailsStep } from './steps/BasicDetailsStep';
import { LocationStep } from './steps/LocationStep';
import { SpecificationStep } from './steps/SpecificationStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { MediaStep } from './steps/MediaStep';
import { ReviewStep } from './steps/ReviewStep';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

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

interface AddPropertyFormProps {
  onClose?: () => void;
}

export function AddPropertyForm({ onClose }: AddPropertyFormProps) {
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
      if (onClose) onClose();
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h2 className="text-2xl font-bold">Add New Property</h2>
          <p className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        )}
      </div>

      {/* Progress */}
      <div className="p-6 border-b">
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>{steps[currentStep].title}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-auto p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {renderStep()}
          </form>
        </Form>
      </div>

      {/* Footer */}
      <div className="flex justify-between p-6 border-t bg-white">
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
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding Property...' : 'Add Property'}
          </Button>
        ) : (
          <Button type="button" onClick={nextStep}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
