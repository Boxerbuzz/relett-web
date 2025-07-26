"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { DualCurrencyDisplay } from "@/components/ui/currency-display";
import {
  CoinsIcon,
  FileTextIcon,
  CalculatorIcon,
  EyeIcon,
} from "@phosphor-icons/react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";

interface TokenizePropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: {
    id: string;
    title: string;
    value: string;
    location: string;
    image: string;
  };
}

export function TokenizePropertyDialog({
  open,
  onOpenChange,
  property,
}: TokenizePropertyDialogProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    totalTokens: "100000",
    pricePerToken: "25",
    minimumInvestment: "100",
    expectedROI: "12.5",
    distributionFrequency: "quarterly",
    lockupPeriod: "12",
    description: "",
    riskLevel: "medium",
  });

  const steps = [
    { title: "Token Configuration", icon: CoinsIcon },
    { title: "Financial Terms", icon: CalculatorIcon },
    { title: "Legal & Documentation", icon: FileTextIcon },
    { title: "Review & Submit", icon: EyeIcon },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(Math.min(step + 1, 4));
  const prevStep = () => setStep(Math.max(step - 1, 1));

  const handleSubmit = async () => {
    if (!user || !property) {
      toast.error("User authentication or property data missing");
      return;
    }

    setIsLoading(true);
    try {
      // Call the tokenization edge function
      const { data, error } = await supabase.functions.invoke(
        "tokenize-property",
        {
          body: {
            propertyId: property.id,
            tokenName: `${property.title} Token`,
            tokenSymbol: `${property.title.substring(0, 3).toUpperCase()}T`,
            totalSupply: parseInt(formData.totalTokens),
            pricePerToken: parseFloat(formData.pricePerToken),
            minimumInvestment: parseFloat(formData.minimumInvestment),
            expectedROI: parseFloat(formData.expectedROI),
            distributionFrequency: formData.distributionFrequency,
            lockupPeriod: parseInt(formData.lockupPeriod),
            description: formData.description,
            riskLevel: formData.riskLevel,
          },
        }
      );

      if (error) {
        console.error("Tokenization error:", error);
        toast.error(`Tokenization failed: ${error.message}`);
        return;
      }

      if (data?.success) {
        toast.success("Property tokenization submitted successfully!");
        onOpenChange(false);
        // Reset form
        setStep(1);
        setFormData({
          totalTokens: "100000",
          pricePerToken: "25",
          minimumInvestment: "100",
          expectedROI: "12.5",
          distributionFrequency: "quarterly",
          lockupPeriod: "12",
          description: "",
          riskLevel: "medium",
        });
      } else {
        toast.error(data?.message || "Tokenization failed");
      }
    } catch (error) {
      console.error("Tokenization error:", error);
      toast.error("An unexpected error occurred during tokenization");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalTokens">Total Tokens</Label>
                <Input
                  id="totalTokens"
                  type="number"
                  value={formData.totalTokens}
                  onChange={(e) =>
                    handleInputChange("totalTokens", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="pricePerToken">Price per Token</Label>
                <Input
                  id="pricePerToken"
                  type="number"
                  step="0.01"
                  value={formData.pricePerToken}
                  onChange={(e) =>
                    handleInputChange("pricePerToken", e.target.value)
                  }
                />
                {formData.pricePerToken && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    <DualCurrencyDisplay 
                      amount={parseFloat(formData.pricePerToken) || 0}
                      primaryCurrency="USD"
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="minimumInvestment">
                Minimum Investment
              </Label>
              <Input
                id="minimumInvestment"
                type="number"
                value={formData.minimumInvestment}
                onChange={(e) =>
                  handleInputChange("minimumInvestment", e.target.value)
                }
              />
              {formData.minimumInvestment && (
                <div className="mt-1 text-sm text-muted-foreground">
                  <DualCurrencyDisplay 
                    amount={parseFloat(formData.minimumInvestment) || 0}
                    primaryCurrency="USD"
                    size="sm"
                  />
                </div>
              )}
            </div>

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">Projected Total Value</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DualCurrencyDisplay 
                  amount={(parseInt(formData.totalTokens) || 0) * (parseFloat(formData.pricePerToken) || 0)}
                  primaryCurrency="USD"
                  size="lg"
                  className="font-bold text-primary"
                />
                <div className="text-sm text-muted-foreground">
                  <p>Min. Tokens: {Math.ceil(
                    (parseFloat(formData.minimumInvestment) || 0) /
                      (parseFloat(formData.pricePerToken) || 1)
                  )} tokens</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expectedROI">Expected ROI (%)</Label>
                <Input
                  id="expectedROI"
                  type="number"
                  step="0.1"
                  value={formData.expectedROI}
                  onChange={(e) =>
                    handleInputChange("expectedROI", e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="lockupPeriod">Lock-up Period (months)</Label>
                <Input
                  id="lockupPeriod"
                  type="number"
                  min="4"
                  value={formData.lockupPeriod}
                  onChange={(e) =>
                    handleInputChange("lockupPeriod", e.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="distributionFrequency">
                Distribution Frequency
              </Label>
              <Select
                value={formData.distributionFrequency}
                onValueChange={(value) =>
                  handleInputChange("distributionFrequency", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="riskLevel">Risk Level</Label>
              <Select
                value={formData.riskLevel}
                onValueChange={(value) => handleInputChange("riskLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Investment Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the investment opportunity, property details, and expected returns..."
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                rows={4}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Required Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  "Property Valuation Report",
                  "Legal Title Documents",
                  "Property Survey",
                  "Insurance Documents",
                  "Financial Projections",
                  "Legal Opinion Letter",
                ].map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <span className="text-sm">{doc}</span>
                    <Badge variant="outline">Required</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tokenization Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Tokens:</p>
                    <p className="font-semibold">{formData.totalTokens}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Price per Token:</p>
                    <DualCurrencyDisplay 
                      amount={parseFloat(formData.pricePerToken) || 0}
                      primaryCurrency="USD"
                      size="sm"
                      className="font-semibold"
                    />
                  </div>
                  <div>
                    <p className="text-gray-600">Expected ROI:</p>
                    <p className="font-semibold">{formData.expectedROI}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Lock-up Period:</p>
                    <p className="font-semibold">
                      {formData.lockupPeriod} months
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Once submitted, your property will
                go through a verification process that typically takes 5-7
                business days. You'll be notified of any additional
                requirements.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="max-w-2xl flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0 space-y-4">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="flex items-center gap-2">
              <CoinsIcon size={20} />
              Tokenize Property
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>

          {/* Property Info */}
          {property && (
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{property.title}</h3>
                    <p className="text-sm text-gray-600">{property.location}</p>
                    <p className="text-sm font-medium">{property.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              {steps.map((stepInfo, index) => {
                const IconComponent = stepInfo.icon;
                return (
                  <div key={index} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        index + 1 <= step
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      <IconComponent size={16} />
                    </div>
                    <span className="text-xs text-center">
                      {stepInfo.title}
                    </span>
                  </div>
                );
              })}
            </div>
            <Progress value={(step / 4) * 100} className="w-full" />
          </div>
        </div>

        {/* Scrollable Step Content */}
        <div className="flex-1 overflow-y-auto py-4">{renderStep()}</div>

        {/* Fixed Footer Navigation */}
        <div className="flex-shrink-0 pt-4 border-t">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={step === 1 ? () => onOpenChange(false) : prevStep}
            >
              {step === 1 ? "Cancel" : "Previous"}
            </Button>

            {step === 4 ? (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit for Review"}
              </Button>
            ) : (
              <Button onClick={nextStep}>Next</Button>
            )}
          </div>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
