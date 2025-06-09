
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
  title: z.string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title must be less than 100 characters')
    .regex(/^[a-zA-Z0-9\s\-,.']+$/, 'Title contains invalid characters'),
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description must be less than 1000 characters'),
  type: z.enum(['residential', 'commercial', 'industrial', 'land'], {
    required_error: 'Property type is required'
  }),
  sub_type: z.string()
    .min(1, 'Sub-type is required')
    .max(50, 'Sub-type must be less than 50 characters'),
  category: z.enum(['sell', 'rent', 'shortlet', 'lease'], {
    required_error: 'Listing category is required'
  }),
  condition: z.enum(['newlyBuilt', 'renovated', 'good', 'needs_renovation'], {
    required_error: 'Property condition is required'
  }),
  price: z.object({
    amount: z.number()
      .min(1000, 'Price must be at least ₦1,000')
      .max(1000000000, 'Price cannot exceed ₦1 billion'),
    currency: z.string().default('NGN'),
    type: z.enum(['sale', 'rent_monthly', 'rent_yearly'])
  }),
  location: z.object({
    address: z.string()
      .min(5, 'Address must be at least 5 characters')
      .max(200, 'Address must be less than 200 characters'),
    city: z.string()
      .min(2, 'City must be at least 2 characters')
      .max(50, 'City must be less than 50 characters')
      .regex(/^[a-zA-Z\s\-']+$/, 'City contains invalid characters'),
    state: z.string()
      .min(2, 'State must be at least 2 characters')
      .max(50, 'State must be less than 50 characters')
      .regex(/^[a-zA-Z\s\-']+$/, 'State contains invalid characters'),
    country: z.string()
      .min(2, 'Country must be at least 2 characters')
      .max(50, 'Country must be less than 50 characters')
      .regex(/^[a-zA-Z\s\-']+$/, 'Country contains invalid characters'),
    coordinates: z.object({
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional()
    }).optional()
  }),
  specification: z.object({
    bedrooms: z.number().min(0).max(20).optional(),
    bathrooms: z.number().min(0).max(20).optional(),
    parking: z.number().min(0).max(50).optional(),
    year_built: z.number()
      .min(1800, 'Year built cannot be before 1800')
      .max(new Date().getFullYear(), `Year built cannot be in the future`)
      .optional()
  }),
  sqrft: z.string()
    .optional()
    .refine((val) => !val || /^\d+(\.\d+)?$/.test(val), 'Square footage must be a valid number'),
  features: z.array(z.string().min(1, 'Feature cannot be empty')).default([]),
  amenities: z.array(z.string().min(1, 'Amenity cannot be empty')).default([]),
  documents: z.array(z.object({
    type: z.enum(['deed', 'survey', 'certificate', 'other']),
    filename: z.string().min(1, 'Document filename is required'),
    url: z.string().url('Invalid document URL')
  })).min(1, 'At least one document is required'),
  images: z.array(z.object({
    url: z.string().url('Invalid image URL'),
    is_primary: z.boolean().default(false),
    category: z.string().default('general')
  })).min(1, 'At least one image is required')
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
    mode: 'onChange',
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

  const validateCurrentStep = async () => {
    const values = form.getValues();
    let fieldsToValidate: string[] = [];

    switch (currentStep) {
      case 0: // Basic Details
        fieldsToValidate = ['title', 'description', 'type', 'category', 'condition', 'price.amount'];
        break;
      case 1: // Location
        fieldsToValidate = ['location.address', 'location.city', 'location.state', 'location.country'];
        break;
      case 2: // Specifications
        fieldsToValidate = ['sqrft'];
        break;
      case 3: // Documents
        fieldsToValidate = ['documents'];
        break;
      case 4: // Media
        fieldsToValidate = ['images'];
        break;
      default:
        return true;
    }

    const result = await form.trigger(fieldsToValidate as any);
    
    if (!result) {
      const errors = form.formState.errors;
      const errorMessages = [];
      
      fieldsToValidate.forEach(field => {
        const fieldPath = field.split('.');
        let error = errors;
        for (const path of fieldPath) {
          error = error?.[path] as any;
        }
        if (error?.message) {
          errorMessages.push(error.message);
        }
      });

      if (errorMessages.length > 0) {
        toast({
          title: 'Validation Error',
          description: errorMessages[0],
          variant: 'destructive'
        });
      }
    }

    return result;
  };

  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length - 1) {
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
      // Final validation
      const isValid = await form.trigger();
      if (!isValid) {
        toast({
          title: 'Validation Error',
          description: 'Please fix all errors before submitting',
          variant: 'destructive'
        });
        return;
      }

      console.log('Submitting property:', data);

      // Validate required fields
      if (!data.documents || data.documents.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'At least one document is required',
          variant: 'destructive'
        });
        return;
      }

      if (!data.images || data.images.length === 0) {
        toast({
          title: 'Validation Error',
          description: 'At least one image is required',
          variant: 'destructive'
        });
        return;
      }

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
