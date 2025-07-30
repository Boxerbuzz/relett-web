"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import {
  usePropertyCreation,
  propertySchema,
  PropertyFormData,
  steps,
} from "@/hooks/usePropertyCreation";
import { BasicDetailsStep } from "./steps/BasicDetailsStep";
import { LocationStep } from "./steps/LocationStep";
import { SpecificationStep } from "./steps/SpecificationStep";
import { LandTitleStep } from "./steps/LandTitleStep";
import { DocumentsStep } from "./steps/DocumentsStep";
import { MediaStep } from "./steps/MediaStep";
import { ReviewStep } from "./steps/ReviewStep";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AddPropertyForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();
  const { createProperty, isLoading } = usePropertyCreation();
  const navigate = useNavigate();

  const propertyId = crypto.randomUUID();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    mode: "onChange",
    defaultValues: {
      type: "residential",
      sub_type: "",
      category: "sell",
      condition: "good",
      price: {
        amount: 0,
        currency: "NGN",
        term: "month",
        deposit: 0,
        service_charge: 0,
        is_negotiable: false,
      },
      location: {
        country: "Nigeria",
      },
      specification: {
        is_furnished: false,
      },
      features: [],
      amenities: [],
      documents: [],
      images: [],
      tags: [],
      max_guest: 0,
      is_exclusive: false,
      is_featured: false,
      id: propertyId,
      land_title_id: "",
    },
  });

  const getFieldError = (fieldPath: string): string | undefined => {
    const keys = fieldPath.split(".");
    let current: any = form.formState.errors;

    for (const key of keys) {
      if (current && typeof current === "object" && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }

    return current?.message;
  };

  const validateCurrentStep = async () => {
    const values = form.getValues();
    let fieldsToValidate: string[] = [];

    switch (currentStep) {
      case 0: // Basic Details
        fieldsToValidate = [
          "title",
          "description",
          "type",
          "sub_type",
          "category",
          "condition",
          "price.amount",
        ];
        break;
      case 1: // Location
        fieldsToValidate = [
          "location.address",
          "location.city",
          "location.state",
          "location.country",
        ];
        break;
      case 2: // Specifications
        fieldsToValidate = ["sqrft"];
        break;
      case 3: // Land Title
        fieldsToValidate = ["land_title_id"];
        break;
      case 4: // Documents - Make optional
        return true;
        break;
      case 5: // Media
        fieldsToValidate = ["images"];
        break;
      default:
        return true;
    }

    const result = await form.trigger(fieldsToValidate as any);

    if (!result) {
      const errorMessages: string[] = [];

      fieldsToValidate.forEach((field) => {
        const errorMessage = getFieldError(field);
        if (errorMessage) {
          errorMessages.push(errorMessage);
        }
      });

      if (errorMessages.length > 0) {
        toast({
          title: "Validation Error",
          description: errorMessages[0],
          variant: "destructive",
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
    console.log("Submitting property:", data);
    try {
      const isValid = await form.trigger();
      if (!isValid) {
        console.log("Validation error:", form.formState.errors);
        toast({
          title: "Validation Error",
          description: "Please fix all errors before submitting",
          variant: "destructive",
        });
        return;
      }

      if (!data.images || data.images.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one image is required",
          variant: "destructive",
        });
        return;
      }

      const property = await createProperty(data);

      if (property) {
        toast({
          title: "Success",
          description: "Property created successfully",
        });
        setCurrentStep(steps.length - 1);
        form.reset();
        navigate("/my-properties");
      }
    } catch (error) {
      console.error("Error submitting property:", error);
      toast({
        title: "Error",
        description: "Failed to create property. Please try again.",
        variant: "destructive",
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
        return <LandTitleStep form={form} />;
      case 4:
        return <DocumentsStep form={form} />;
      case 5:
        return <MediaStep form={form} />;
      case 6:
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
              <CardTitle className="text-2xl font-bold">
                Add New Property
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Step {currentStep + 1} of {steps.length}:{" "}
                {steps[currentStep].title}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">
                {Math.round(progress)}% Complete
              </p>
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
                    index <= currentStep ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      index <= currentStep
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-1 text-xs hidden md:block">
                    {step.title}
                  </span>
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
            disabled={currentStep === 0 || currentStep === steps.length - 1}
            className="min-w-24"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep === steps.length - 2 ? (
            <Button
              onClick={() => {
                console.log("Submitting property:", form.getValues());
                console.log("Documents:", form.getValues("documents"));
                onSubmit(form.getValues());
              }}
              disabled={isLoading}
              className="min-w-32"
            >
              {isLoading ? "Creating Property..." : "Create Property"}
            </Button>
          ) : currentStep === steps.length - 1 ? (
            <div className="min-w-24" />
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
