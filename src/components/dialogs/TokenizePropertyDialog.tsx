"use client";

import { useState, useEffect } from "react";
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

import { CurrencyInput } from "@/components/ui/currency-input";
import { CurrencyExchangeWidget } from "@/components/ui/currency-exchange-widget";
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
  ResponsiveDialogFooter,
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
  const [isTokenized, setIsTokenized] = useState(false);
  const [tokenizationStatus, setTokenizationStatus] = useState<string | null>(
    null
  );
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [resultType, setResultType] = useState<"success" | "error">("success");
  const [resultMessage, setResultMessage] = useState("");
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
  
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const steps = [
    { title: "Token Configuration", icon: CoinsIcon },
    { title: "Financial Terms", icon: CalculatorIcon },
    { title: "Legal & Documentation", icon: FileTextIcon },
    { title: "Review & Submit", icon: EyeIcon },
  ];

  // Check if property is already tokenized or has pending request
  useEffect(() => {
    const checkTokenizationStatus = async () => {
      if (!property?.id) return;

      try {
        const { data, error } = await supabase
          .from("tokenized_properties")
          .select("status")
          .eq("property_id", property.id)
          .maybeSingle();

        if (error && error.code !== "PGRST116") {
          console.error("Error checking tokenization status:", error);
          return;
        }

        if (data) {
          setTokenizationStatus(data.status);
          setIsTokenized(
            data.status === "active" || data.status === "pending_approval"
          );
        }
      } catch (error) {
        console.error("Error checking tokenization status:", error);
      }
    };

    if (open && property?.id) {
      checkTokenizationStatus();
    }
  }, [open, property?.id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear validation error when user changes input
    if (validationError && (field === 'totalTokens' || field === 'pricePerToken')) {
      setValidationError(null);
    }
  };

  const nextStep = async () => {
    // Validate token value before moving to next step if on step 1
    if (step === 1) {
      setIsValidating(true);
      try {
        await validateTokenValue(property, formData.totalTokens, formData.pricePerToken);
        setValidationError(null);
        setStep(Math.min(step + 1, 4));
      } catch (error) {
        setValidationError(error instanceof Error ? error.message : "Validation failed");
      } finally {
        setIsValidating(false);
      }
    } else {
      setStep(Math.min(step + 1, 4));
    }
  };
  
  const prevStep = () => setStep(Math.max(step - 1, 1));

  const validateTokenValue = async (property: any, totalTokens: string, pricePerToken: string) => {
    const tokenValue = (parseInt(totalTokens) || 0) * (parseFloat(pricePerToken) || 0);
    
    try {
      // Try to get AI property valuation first
      const { data: aiValuation, error } = await supabase.functions.invoke(
        'ai-property-valuation',
        {
          body: {
            propertyData: {
              propertyType: 'residential',
              category: 'apartment',
              location: {
                state: 'Lagos',
                city: 'Lagos',
                address: property.location || 'Sample Address'
              },
              value: property.value
            }
          }
        }
      );

      let propertyValue = 0;
      if (!error && aiValuation?.estimatedValue) {
        propertyValue = aiValuation.estimatedValue;
        console.log("Using AI valuation:", propertyValue);
      } else {
        // Fallback to property value or default estimation
        const fallbackValue = property.value ? 
          (typeof property.value === 'string' ? parseFloat(property.value.replace(/[^\d.-]/g, '')) : property.value) :
          tokenValue * 1.2; // Default to 20% above token value as minimum property value
        
        propertyValue = fallbackValue || 50000000; // Default minimum value
        console.log("Using fallback valuation:", propertyValue, "from property value:", property.value);
      }

      // Check if token value exceeds property value
      if (tokenValue > propertyValue) {
        throw new Error(
          `Token value (${tokenValue.toLocaleString()}) cannot exceed property value (${propertyValue.toLocaleString()}). Please adjust token count or price per token.`
        );
      }

      return { valid: true, propertyValue, tokenValue };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to validate token value against property valuation");
    }
  };

  const handleSubmit = async () => {
    if (!user || !property) {
      toast.error("User authentication or property data missing");
      return;
    }

    setIsLoading(true);
    try {
      // Validate token value before submission
      await validateTokenValue(property, formData.totalTokens, formData.pricePerToken);

      // Call the tokenization edge function
      const { data, error } = await supabase.functions.invoke(
        "tokenize-property",
        {
          body: {
            land_title_id: "08ddabb1-df60-4d22-868b-81cd41132164", // Edge function expects land_title_id
            property_id: property.id, // Also send property_id as backup
            token_name: `${property.title} Token`,
            token_symbol: `${property.title.substring(0, 3).toUpperCase()}T`,
            total_supply: formData.totalTokens, // Keep as string as edge function expects
            total_value_usd:
              (parseInt(formData.totalTokens) || 0) *
              (parseFloat(formData.pricePerToken) || 0),
            minimum_investment: parseFloat(formData.minimumInvestment),
            token_price: parseFloat(formData.pricePerToken),
            investment_terms: "fixed",
            expected_roi: parseFloat(formData.expectedROI),
            revenue_distribution_frequency: formData.distributionFrequency,
            lock_up_period_months: parseInt(formData.lockupPeriod),
          },
        }
      );

      if (error) {
        console.error("Tokenization error:", error);
        toast.error(`Tokenization failed: ${error.message}`);
        return;
      }

      if (data?.success) {
        setResultType("success");
        setResultMessage(
          "Your property tokenization request has been submitted successfully! Our team will review your request and notify you within 5-7 business days."
        );
        setShowResultDialog(true);
        setIsTokenized(true);
        setTokenizationStatus("pending_approval");
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
        setResultType("error");
        setResultMessage(
          data?.message ||
            "Failed to submit tokenization request. Please try again."
        );
        setShowResultDialog(true);
      }
    } catch (error) {
      console.error("Tokenization error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during tokenization. Please try again.";
      setResultType("error");
      setResultMessage(errorMessage);
      setShowResultDialog(true);
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
                <CurrencyInput
                  value={parseFloat(formData.pricePerToken) || 0}
                  onChange={(value) =>
                    handleInputChange("pricePerToken", value.toString())
                  }
                  currency="USD"
                  min={0.01}
                />
                {formData.pricePerToken && (
                  <div className="mt-1 text-sm text-muted-foreground">
                    <CurrencyExchangeWidget
                      amount={parseFloat(formData.pricePerToken) || 0}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="minimumInvestment">Minimum Investment</Label>
              <CurrencyInput
                value={parseFloat(formData.minimumInvestment) || 0}
                onChange={(value) =>
                  handleInputChange("minimumInvestment", value.toString())
                }
                currency="USD"
                min={1}
              />
              {formData.minimumInvestment && (
                <div className="mt-1 text-sm text-muted-foreground">
                  <CurrencyExchangeWidget
                    amount={parseFloat(formData.minimumInvestment) || 0}
                    size="sm"
                  />
                </div>
              )}
            </div>

            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-base">
                  Projected Total Value
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <CurrencyExchangeWidget
                  amount={
                    (parseInt(formData.totalTokens) || 0) *
                    (parseFloat(formData.pricePerToken) || 0)
                  }
                  size="lg"
                  className="font-bold text-primary justify-center"
                />
                <div className="text-sm text-muted-foreground">
                  <p>
                    Min. Tokens:{" "}
                    {Math.ceil(
                      (parseFloat(formData.minimumInvestment) || 0) /
                        (parseFloat(formData.pricePerToken) || 1)
                    )}{" "}
                    tokens
                  </p>
                </div>
                {validationError && (
                  <div className="text-xs text-red-600 bg-red-50 p-2 rounded border">
                    ❌ {validationError}
                  </div>
                )}
                <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded border">
                  ⚠️ Token value will be validated against property valuation. 
                  If property valuation is unavailable, a fallback estimation will be used.
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
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    if (value >= 4 || value === 0) {
                      handleInputChange("lockupPeriod", e.target.value);
                    }
                  }}
                />
                {parseInt(formData.lockupPeriod) > 0 &&
                  parseInt(formData.lockupPeriod) < 4 && (
                    <p className="text-sm text-destructive mt-1">
                      Minimum lockup period is 4 months
                    </p>
                  )}
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
                    <CurrencyExchangeWidget
                      amount={parseFloat(formData.pricePerToken) || 0}
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
      <ResponsiveDialogContent
        className="max-w-5xl w-full md:max-h-[80vh] flex flex-col gap-y-0"
        size="3xl"
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 space-y-4  p-2">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="flex items-center gap-2">
              <CoinsIcon size={20} />
              Tokenize Property
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>

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
                    <span className="text-xs text-center hidden">
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
        <div className="flex-1 overflow-y-auto py-4  p-6">
          {renderStep()}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={step === 1 ? () => onOpenChange(false) : prevStep}
            >
              {step === 1 ? "Cancel" : "Previous"}
            </Button>

            {step === 4 ? (
              <Button
                onClick={handleSubmit}
                disabled={isLoading || isTokenized}
                className={isTokenized ? "opacity-50 cursor-not-allowed" : ""}
              >
                {isLoading
                  ? "Submitting..."
                  : isTokenized
                  ? `Already ${
                      tokenizationStatus?.replace("_", " ") || "Tokenized"
                    }`
                  : "Submit for Review"}
              </Button>
            ) : (
              <Button 
                onClick={nextStep}
                disabled={isValidating || validationError !== null}
              >
                {isValidating ? "Validating..." : "Next"}
              </Button>
            )}
          </div>
        </div>
      </ResponsiveDialogContent>

      {/* Success/Error Result Dialog */}
      <ResponsiveDialog
        open={showResultDialog}
        onOpenChange={setShowResultDialog}
      >
        <ResponsiveDialogContent className="max-w-md">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="flex items-center gap-2">
              {resultType === "success" ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  Success!
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  Error
                </>
              )}
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>

          <div className="py-4">
            <p className="text-muted-foreground leading-relaxed">
              {resultMessage}
            </p>
          </div>

          <ResponsiveDialogFooter>
            <Button
              onClick={() => setShowResultDialog(false)}
              className="w-full"
            >
              OK
            </Button>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </ResponsiveDialog>
  );
}
