"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { TokenizedPropertyLegalFramework } from "@/components/legal/TokenizedPropertyLegalFramework";
import { LegalFrameworkConfig } from "@/types/legal";
import {
  CoinsIcon,
  FileTextIcon,
  CalculatorIcon,
  EyeIcon,
  ScalesIcon,
  ArrowLeftIcon,
} from "@phosphor-icons/react";
import { Json } from "@/types/database";

interface Property {
  id: string;
  title: string;
  value: string;
  location: Json;
  image: string;
}

export default function TokenizeProperty() {
  const navigate = useNavigate();
  const { propertyId } = useParams();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isTokenized, setIsTokenized] = useState(false);
  const [tokenizationStatus, setTokenizationStatus] = useState<string | null>(
    null
  );
  const [property, setProperty] = useState<Property | null>(null);
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
  const [showLegalFramework, setShowLegalFramework] = useState(false);
  const [legalAgreementId, setLegalAgreementId] = useState<string | null>(null);

  const steps = [
    { title: "Token Configuration", icon: CoinsIcon },
    { title: "Financial Terms", icon: CalculatorIcon },
    { title: "Legal Framework", icon: ScalesIcon },
    { title: "Review & Submit", icon: EyeIcon },
  ];

  // Load property data from URL params or redirect if missing
  useEffect(() => {
    if (!propertyId) {
      toast.error("Property ID is required");
      navigate("/marketplace");
      return;
    }

    const loadProperty = async () => {
      try {
        const { data, error } = await supabase
          .from("properties")
          .select("id, title, price, location, backdrop")
          .eq("id", propertyId)
          .single();

        if (error || !data) {
          toast.error("Property not found");
          navigate("/marketplace");
          return;
        }

        setProperty({
          id: data.id,
          title: data.title || "",
          value: data.price?.toString() || "0",
          location: data.location || "",
          image: data.backdrop || "",
        });
      } catch (error) {
        console.error("Error loading property:", error);
        toast.error("Failed to load property");
        navigate("/marketplace");
      }
    };

    loadProperty();
  }, [propertyId, navigate]);

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

    if (property?.id) {
      checkTokenizationStatus();
    }
  }, [property?.id]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error when user changes input
    if (
      validationError &&
      (field === "totalTokens" || field === "pricePerToken")
    ) {
      setValidationError(null);
    }
  };

  const validateTokenValue = async (
    property: Property | null,
    totalTokens: string,
    pricePerToken: string
  ) => {
    if (!property) throw new Error("Property is required");

    const tokens = parseInt(totalTokens);
    const price = parseFloat(pricePerToken);

    if (isNaN(tokens) || tokens <= 0) {
      throw new Error("Total tokens must be a positive number");
    }

    if (isNaN(price) || price <= 0) {
      throw new Error("Price per token must be a positive number");
    }

    const totalValue = tokens * price;
    const propertyValue = parseFloat(property.value.replace(/[^0-9.-]+/g, ""));

    if (totalValue > propertyValue * 1.1) {
      throw new Error(
        `Total token value (${totalValue.toLocaleString()}) cannot exceed 110% of property value (${propertyValue.toLocaleString()})`
      );
    }
  };

  const nextStep = async () => {
    // Show legal framework before step 4
    if (step === 3 && !legalAgreementId) {
      setShowLegalFramework(true);
      return;
    }

    // Validate token value before moving to next step if on step 1
    if (step === 1) {
      setIsValidating(true);
      try {
        await validateTokenValue(
          property,
          formData.totalTokens,
          formData.pricePerToken
        );
        setValidationError(null);
        setStep(Math.min(step + 1, 4));
      } catch (error) {
        setValidationError(
          error instanceof Error ? error.message : "Validation failed"
        );
      } finally {
        setIsValidating(false);
      }
    } else {
      setStep(Math.min(step + 1, 4));
    }
  };

  const prevStep = () => {
    setStep(Math.max(step - 1, 1));
  };

  const handleSubmit = async () => {
    if (!property || !user) return;

    setIsLoading(true);
    try {
      const tokenData = {
        property_id: property.id,
        token_symbol: "PROP",
        token_name: `${property.title} Token`,
        token_type: "fractional_ownership",
        total_supply: parseInt(formData.totalTokens),
        total_value_usd:
          parseInt(formData.totalTokens) * parseFloat(formData.pricePerToken),
        minimum_investment: parseFloat(formData.minimumInvestment),
        token_price: parseFloat(formData.pricePerToken),
        status: "pending_approval",
        blockchain_network: "hedera",
        investment_terms: formData.description,
        expected_roi: parseFloat(formData.expectedROI),
        revenue_distribution_frequency: formData.distributionFrequency,
        lock_up_period_months: parseInt(formData.lockupPeriod),
        legal_structure: legalAgreementId,
        land_title_id: null,
      };

      const { error } = await supabase
        .from("tokenized_properties")
        .insert(tokenData);

      if (error) throw error;

      toast.success("Property tokenization request submitted successfully!");
      navigate("/marketplace");
    } catch (error) {
      console.error("Error submitting tokenization:", error);
      toast.error("Failed to submit tokenization request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLegalFrameworkComplete = (agreementId: string) => {
    setLegalAgreementId(agreementId);
    setShowLegalFramework(false);
    setStep(4);
  };

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading property...</p>
        </div>
      </div>
    );
  }

  if (showLegalFramework) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <TokenizedPropertyLegalFramework
            config={{
              scenario: 'tokenization',
              propertyDetails: property ? {
                id: property.id,
                title: property.title,
                location: property.location,
                value: parseFloat(property.value.replace(/[^0-9.]/g, '')) || 0
              } : undefined,
              tokenDetails: {
                tokenPrice: parseFloat(formData.pricePerToken) || 0,
                totalTokens: parseInt(formData.totalTokens) || 0,
                minimumInvestment: parseFloat(formData.minimumInvestment) || 0
              },
              minimumReadingTime: 300 // 5 minutes
            }}
            open={showLegalFramework}
            onOpenChange={setShowLegalFramework}
            onAgreementComplete={handleLegalFrameworkComplete}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeftIcon size={16} />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Tokenize Property
              </h1>
              <p className="text-gray-600">{property.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((stepItem, index) => {
              const StepIcon = stepItem.icon;
              const isActive = step === index + 1;
              const isCompleted = step > index + 1;

              return (
                <div key={index} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isCompleted
                        ? "bg-blue-600 border-blue-600 text-white"
                        : isActive
                        ? "border-blue-600 text-blue-600 bg-white"
                        : "border-gray-300 text-gray-400 bg-white"
                    }`}
                  >
                    <StepIcon size={20} />
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-24 h-0.5 mx-4 ${
                        step > index + 1 ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-sm">
            {steps.map((stepItem, index) => (
              <div
                key={index}
                className={`text-center ${
                  step === index + 1
                    ? "text-blue-600 font-medium"
                    : "text-gray-500"
                }`}
              >
                {stepItem.title}
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card className="border-0 shadow-none bg-white">
          <CardContent className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Token Configuration
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="totalTokens">Total Tokens</Label>
                      <Input
                        id="totalTokens"
                        type="number"
                        value={formData.totalTokens}
                        onChange={(e) =>
                          handleInputChange("totalTokens", e.target.value)
                        }
                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pricePerToken">Price per Token ($)</Label>
                      <CurrencyInput
                        id="pricePerToken"
                        value={Number(formData.pricePerToken)}
                        onChange={(value) =>
                          handleInputChange("pricePerToken", value.toString())
                        }
                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  {validationError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-red-600 text-sm">{validationError}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Financial Terms
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="minimumInvestment">
                        Minimum Investment ($)
                      </Label>
                      <CurrencyInput
                        id="minimumInvestment"
                        value={Number(formData.minimumInvestment)}
                        onChange={(value) =>
                          handleInputChange(
                            "minimumInvestment",
                            value.toString()
                          )
                        }
                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
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
                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
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
                        <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="quarterly">Quarterly</SelectItem>
                          <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="lockupPeriod">
                        Lockup Period (months)
                      </Label>
                      <Input
                        id="lockupPeriod"
                        type="number"
                        value={formData.lockupPeriod}
                        onChange={(e) =>
                          handleInputChange("lockupPeriod", e.target.value)
                        }
                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Legal Framework Agreement
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Complete the legal framework agreement before proceeding
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="riskLevel">Risk Level</Label>
                      <Select
                        value={formData.riskLevel}
                        onValueChange={(value) =>
                          handleInputChange("riskLevel", value)
                        }
                      >
                        <SelectTrigger className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low Risk</SelectItem>
                          <SelectItem value="medium">Medium Risk</SelectItem>
                          <SelectItem value="high">High Risk</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Describe the investment opportunity..."
                        className="mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        rows={4}
                      />
                    </div>
                  </div>

                  {legalAgreementId ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-800">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Legal framework agreement completed
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Legal framework agreement required to proceed
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Review & Submit
                  </h3>
                  <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Tokens</p>
                        <p className="font-medium">
                          {Number(formData.totalTokens).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Price per Token</p>
                        <p className="font-medium">
                          ${Number(formData.pricePerToken).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Minimum Investment
                        </p>
                        <p className="font-medium">
                          ${Number(formData.minimumInvestment).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Expected ROI</p>
                        <p className="font-medium">
                          {Number(formData.expectedROI).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Previous
          </Button>

          {step < 4 ? (
            <Button
              onClick={nextStep}
              disabled={isValidating}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              {isValidating ? "Validating..." : "Next"}
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              {isLoading ? "Submitting..." : "Submit for Review"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
