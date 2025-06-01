'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Upload, MapPin, FileText, DollarSign } from 'lucide-react';
import { BasicPropertyInfo } from './creation-steps/BasicPropertyInfo';
import { PropertyLocation } from './creation-steps/PropertyLocation';
import { PropertyDocuments } from './creation-steps/PropertyDocuments';
import { PropertyValuation } from './creation-steps/PropertyValuation';
import { PropertyReview } from './creation-steps/PropertyReview';
import { usePropertyCreation } from '@/hooks/usePropertyCreation';
import { useToast } from '@/hooks/use-toast';

interface PropertyWizardData {
  basicInfo: {
    title: string;
    description: string;
    propertyType: string;
    category: string;
    status: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: { lat: number; lng: number } | null;
  };
  documents: {
    titleDeed: File | null;
    surveyPlan: File | null;
    taxClearance: File | null;
    other: File[];
  };
  valuation: {
    estimatedValue: number;
    currency: string;
    valuationMethod: string;
    marketAnalysis: string;
  };
}

const steps = [
  { id: 1, title: 'Basic Info', icon: FileText, description: 'Property details' },
  { id: 2, title: 'Location', icon: MapPin, description: 'Location & coordinates' },
  { id: 3, title: 'Documents', icon: Upload, description: 'Required documents' },
  { id: 4, title: 'Valuation', icon: DollarSign, description: 'Property value' },
  { id: 5, title: 'Review', icon: CheckCircle, description: 'Final review' },
];

export function PropertyCreationWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyData, setPropertyData] = useState<PropertyWizardData>({
    basicInfo: {
      title: '',
      description: '',
      propertyType: '',
      category: '',
      status: 'draft'
    },
    location: {
      address: '',
      city: '',
      state: '',
      country: 'Nigeria',
      coordinates: null
    },
    documents: {
      titleDeed: null,
      surveyPlan: null,
      taxClearance: null,
      other: []
    },
    valuation: {
      estimatedValue: 0,
      currency: 'NGN',
      valuationMethod: 'comparative',
      marketAnalysis: ''
    }
  });

  const navigate = useNavigate();
  const { toast } = useToast();
  const { createProperty, isLoading: isSubmitting } = usePropertyCreation();

  const updatePropertyData = (section: keyof PropertyWizardData, data: any) => {
    setPropertyData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(propertyData.basicInfo.title && 
                 propertyData.basicInfo.propertyType && 
                 propertyData.basicInfo.category);
      case 2:
        return !!(propertyData.location.address && 
                 propertyData.location.city && 
                 propertyData.location.state);
      case 3:
        return !!(propertyData.documents.titleDeed && 
                 propertyData.documents.surveyPlan);
      case 4:
        return propertyData.valuation.estimatedValue > 0;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast({
        title: 'Validation Error',
        description: 'Please complete all required fields before proceeding.',
        variant: 'destructive'
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Transform wizard data to match createProperty expected format
      const transformedData = {
        basicInfo: propertyData.basicInfo,
        location: propertyData.location,
        documents: [] as any[], // Will be populated by file processing
        valuation: propertyData.valuation
      };

      const property = await createProperty(transformedData);
      navigate('/my-land');
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const progress = (currentStep / steps.length) * 100;

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicPropertyInfo 
            data={propertyData.basicInfo}
            onUpdate={(data) => updatePropertyData('basicInfo', data)}
          />
        );
      case 2:
        return (
          <PropertyLocation 
            data={propertyData.location}
            onUpdate={(data) => updatePropertyData('location', data)}
          />
        );
      case 3:
        return (
          <PropertyDocuments 
            data={propertyData.documents}
            onUpdate={(data) => updatePropertyData('documents', data)}
          />
        );
      case 4:
        return (
          <PropertyValuation 
            data={propertyData.valuation}
            onUpdate={(data) => updatePropertyData('valuation', data)}
          />
        );
      case 5:
        return (
          <PropertyReview 
            data={propertyData}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Add New Property</h1>
        <p className="text-gray-600 mt-2">Follow the steps below to add your property to the platform</p>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Step {currentStep} of {steps.length}</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Steps Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div 
              key={step.id}
              className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
                isActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : isCompleted 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex flex-col items-center text-center space-y-2">
                <div className={`p-2 rounded-full ${
                  isActive 
                    ? 'bg-blue-500 text-white' 
                    : isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className={`text-xs md:text-sm font-medium ${
                    isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 hidden md:block">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Current Step Content */}
      <div className="min-h-[400px]">
        {renderCurrentStep()}
      </div>

      {/* Navigation Buttons */}
      {currentStep < steps.length && (
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          <Button onClick={handleNext}>
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
