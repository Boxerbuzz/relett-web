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
import { Badge } from "@/components/ui/badge";

import { CurrencyInput } from "@/components/ui/currency-input";
import { CurrencyExchangeWidget } from "@/components/ui/currency-exchange-widget";
import { TokenizedPropertyLegalFramework } from "@/components/legal/TokenizedPropertyLegalFramework";
import {
  CoinsIcon,
  FileTextIcon,
  CalculatorIcon,
  EyeIcon,
  ScalesIcon,
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
  const [showLegalFramework, setShowLegalFramework] = useState(false);
  const [legalAgreementId, setLegalAgreementId] = useState<string | null>(null);

  const steps = [
    { title: "Token Configuration", icon: CoinsIcon },
    { title: "Financial Terms", icon: CalculatorIcon },
    { title: "Legal Framework", icon: ScalesIcon },
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
    // Show legal framework before step 4
    if (step === 3 && !legalAgreementId) {
      setShowLegalFramework(true);
      return;
    }
    
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

  const handleLegalAgreementComplete = (agreementId: string) => {
    setLegalAgreementId(agreementId);
    setShowLegalFramework(false);
    setStep(4);
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
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Configure Token Parameters
              </h3>
              <p className="text-slate-600 text-sm">
                Set up your property tokenization with precise parameters
              </p>
            </div>

            {/* Token Configuration Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total Tokens */}
              <div className="p-4 rounded-2xl border-2 border-slate-200/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 hover:border-blue-300/60 transition-all duration-300">
                <Label htmlFor="totalTokens" className="text-sm font-semibold text-slate-700 mb-2 block">
                  Total Token Supply
                </Label>
                <Input
                  id="totalTokens"
                  type="number"
                  value={formData.totalTokens}
                  onChange={(e) =>
                    handleInputChange("totalTokens", e.target.value)
                  }
                  className="border-0 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 text-lg font-semibold"
                  placeholder="100,000"
                />
                <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                  <CoinsIcon size={12} />
                  <span>Individual ownership units</span>
                </div>
              </div>

              {/* Price per Token */}
              <div className="p-4 rounded-2xl border-2 border-slate-200/50 bg-gradient-to-br from-green-50/50 to-emerald-50/30 hover:border-green-300/60 transition-all duration-300">
                <Label htmlFor="pricePerToken" className="text-sm font-semibold text-slate-700 mb-2 block">
                  Token Price
                </Label>
                <CurrencyInput
                  value={parseFloat(formData.pricePerToken) || 0}
                  onChange={(value) =>
                    handleInputChange("pricePerToken", value.toString())
                  }
                  currency="USD"
                  min={0.01}
                  className="border-0 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 text-lg font-semibold"
                />
                {formData.pricePerToken && (
                  <div className="mt-3">
                    <CurrencyExchangeWidget
                      amount={parseFloat(formData.pricePerToken) || 0}
                      size="sm"
                      variant="swap"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Minimum Investment */}
            <div className="p-4 rounded-2xl border-2 border-slate-200/50 bg-gradient-to-br from-purple-50/50 to-pink-50/30 hover:border-purple-300/60 transition-all duration-300">
              <Label htmlFor="minimumInvestment" className="text-sm font-semibold text-slate-700 mb-2 block">
                Minimum Investment Threshold
              </Label>
              <CurrencyInput
                value={parseFloat(formData.minimumInvestment) || 0}
                onChange={(value) =>
                  handleInputChange("minimumInvestment", value.toString())
                }
                currency="USD"
                min={1}
                className="border-0 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 text-lg font-semibold"
              />
              {formData.minimumInvestment && (
                <div className="mt-3">
                  <CurrencyExchangeWidget
                    amount={parseFloat(formData.minimumInvestment) || 0}
                    size="sm"
                    variant="swap"
                  />
                </div>
              )}
            </div>

            {/* Total Value Projection */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200/50 bg-gradient-to-br from-yellow-50/30 via-orange-50/20 to-red-50/30">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/10" />
              
              <div className="relative p-6 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <CalculatorIcon size={20} className="text-amber-600" />
                  <h4 className="text-lg font-bold text-slate-800">
                    Total Tokenization Value
                  </h4>
                </div>
                
                <CurrencyExchangeWidget
                  amount={
                    (parseInt(formData.totalTokens) || 0) *
                    (parseFloat(formData.pricePerToken) || 0)
                  }
                  size="lg"
                  variant="swap"
                  className="font-bold"
                />
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/50">
                  <div className="text-center">
                    <p className="text-xs text-slate-600 mb-1">Min. Tokens Required</p>
                    <p className="text-lg font-bold text-slate-800">
                      {Math.ceil(
                        (parseFloat(formData.minimumInvestment) || 0) /
                          (parseFloat(formData.pricePerToken) || 1)
                      )}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-600 mb-1">Total Supply</p>
                    <p className="text-lg font-bold text-slate-800">
                      {parseInt(formData.totalTokens) || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Validation Messages */}
            {validationError && (
              <div className="p-4 rounded-xl border-2 border-red-200 bg-red-50/50 text-red-700">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-xs">❌</span>
                  </div>
                  <span className="text-sm font-medium">{validationError}</span>
                </div>
              </div>
            )}
            
            <div className="p-4 rounded-xl border-2 border-amber-200 bg-amber-50/50 text-amber-700">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-xs">⚠️</span>
                </div>
                <span className="text-sm">
                  Token value will be validated against property valuation for accuracy and compliance.
                </span>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                Financial Terms & Returns
              </h3>
              <p className="text-slate-600 text-sm">
                Define the investment structure and expected returns
              </p>
            </div>

            {/* ROI and Lock-up Period */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expected ROI */}
              <div className="p-4 rounded-2xl border-2 border-slate-200/50 bg-gradient-to-br from-emerald-50/50 to-green-50/30 hover:border-emerald-300/60 transition-all duration-300">
                <Label htmlFor="expectedROI" className="text-sm font-semibold text-slate-700 mb-2 block">
                  Expected Annual ROI
                </Label>
                <div className="relative">
                  <Input
                    id="expectedROI"
                    type="number"
                    step="0.1"
                    value={formData.expectedROI}
                    onChange={(e) =>
                      handleInputChange("expectedROI", e.target.value)
                    }
                    className="border-0 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 text-lg font-semibold pr-8"
                    placeholder="12.5"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">
                    %
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
                  <CalculatorIcon size={12} />
                  <span>Projected annual returns</span>
                </div>
              </div>

              {/* Lock-up Period */}
              <div className="p-4 rounded-2xl border-2 border-slate-200/50 bg-gradient-to-br from-orange-50/50 to-amber-50/30 hover:border-orange-300/60 transition-all duration-300">
                <Label htmlFor="lockupPeriod" className="text-sm font-semibold text-slate-700 mb-2 block">
                  Investment Lock-up Period
                </Label>
                <div className="relative">
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
                    className="border-0 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 text-lg font-semibold pr-16"
                    placeholder="12"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 font-medium">
                    months
                  </span>
                </div>
                {parseInt(formData.lockupPeriod) > 0 &&
                  parseInt(formData.lockupPeriod) < 4 && (
                    <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                      <span>⚠️</span>
                      Minimum lockup period is 4 months
                    </p>
                  )}
                <div className="mt-2 flex items-center gap-2 text-xs text-orange-600">
                  <CoinsIcon size={12} />
                  <span>Minimum investment duration</span>
                </div>
              </div>
            </div>

            {/* Distribution and Risk */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Distribution Frequency */}
              <div className="p-4 rounded-2xl border-2 border-slate-200/50 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 hover:border-blue-300/60 transition-all duration-300">
                <Label htmlFor="distributionFrequency" className="text-sm font-semibold text-slate-700 mb-2 block">
                  Revenue Distribution
                </Label>
                <Select
                  value={formData.distributionFrequency}
                  onValueChange={(value) =>
                    handleInputChange("distributionFrequency", value)
                  }
                >
                  <SelectTrigger className="border-0 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 text-lg font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-slate-200/50 bg-white/95 backdrop-blur-sm">
                    <SelectItem value="monthly" className="rounded-lg">Monthly</SelectItem>
                    <SelectItem value="quarterly" className="rounded-lg">Quarterly</SelectItem>
                    <SelectItem value="semi-annually" className="rounded-lg">Semi-Annually</SelectItem>
                    <SelectItem value="annually" className="rounded-lg">Annually</SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                  <FileTextIcon size={12} />
                  <span>How often returns are paid</span>
                </div>
              </div>

              {/* Risk Level */}
              <div className="p-4 rounded-2xl border-2 border-slate-200/50 bg-gradient-to-br from-purple-50/50 to-pink-50/30 hover:border-purple-300/60 transition-all duration-300">
                <Label htmlFor="riskLevel" className="text-sm font-semibold text-slate-700 mb-2 block">
                  Investment Risk Level
                </Label>
                <Select
                  value={formData.riskLevel}
                  onValueChange={(value) => handleInputChange("riskLevel", value)}
                >
                  <SelectTrigger className="border-0 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 text-lg font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-2 border-slate-200/50 bg-white/95 backdrop-blur-sm">
                    <SelectItem value="low" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Low Risk
                      </div>
                    </SelectItem>
                    <SelectItem value="medium" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                        Medium Risk
                      </div>
                    </SelectItem>
                    <SelectItem value="high" className="rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                        High Risk
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-2 flex items-center gap-2 text-xs text-purple-600">
                  <ScalesIcon size={12} />
                  <span>Investment risk assessment</span>
                </div>
              </div>
            </div>

            {/* Investment Summary */}
            <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200/50 bg-gradient-to-br from-slate-50/50 to-gray-50/30">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/10" />
              
              <div className="relative p-6 space-y-4">
                <h4 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <EyeIcon size={20} className="text-slate-600" />
                  Investment Overview
                </h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-600 mb-1">Annual ROI</p>
                    <p className="text-lg font-bold text-emerald-600">{formData.expectedROI}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-600 mb-1">Lock-up</p>
                    <p className="text-lg font-bold text-orange-600">{formData.lockupPeriod}mo</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-600 mb-1">Frequency</p>
                    <p className="text-lg font-bold text-blue-600 capitalize">{formData.distributionFrequency}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-600 mb-1">Risk</p>
                    <p className={`text-lg font-bold capitalize ${
                      formData.riskLevel === 'low' ? 'text-green-600' :
                      formData.riskLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {formData.riskLevel}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center">
              <ScalesIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Legal Framework Agreement</h3>
              <p className="text-sm text-muted-foreground">
                Complete the legal framework agreement before proceeding
              </p>
            </div>

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

            {legalAgreementId ? (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Legal framework agreement completed
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-yellow-800">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Legal framework agreement required to proceed
                  </div>
                </CardContent>
              </Card>
            )}
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
                      variant="swap"
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
        className="max-w-5xl w-full md:max-h-[85vh] flex flex-col gap-y-0 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200/50 p-0"
        size="3xl"
      >
        {/* Fixed Header */}
        <div className="flex-shrink-0 space-y-4 p-4 border-b border-slate-200/50 bg-white/80 backdrop-blur-sm">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle className="flex items-center gap-3 text-2xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tokenize Property
              </span>
            </ResponsiveDialogTitle>
          </ResponsiveDialogHeader>

          {/* Progress */}
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              {steps.map((stepInfo, index) => {
                const IconComponent = stepInfo.icon;
                const isActive = index + 1 <= step;
                const isCurrent = index + 1 === step;
                return (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        isActive
                          ? isCurrent
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 scale-110"
                            : "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-md"
                          : "bg-slate-200 text-slate-500 hover:bg-slate-300"
                      }`}
                    >
                      <IconComponent size={18} />
                    </div>
                    <span className={`text-xs text-center font-medium transition-colors duration-300 ${
                      isActive ? "text-slate-700" : "text-slate-400"
                    }`}>
                      {stepInfo.title}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="relative">
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(step / 4) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Step Content */}
        <div className="flex-1 overflow-y-auto py-6 px-6 space-y-6">
          {renderStep()}
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 p-6 border-t border-slate-200/50 bg-white/80 backdrop-blur-sm">
          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={step === 1 ? () => onOpenChange(false) : prevStep}
              className="px-6 py-2.5 rounded-xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
            >
              {step === 1 ? "Cancel" : "Previous"}
            </Button>

            {step === 4 ? (
              <Button
                onClick={handleSubmit}
                disabled={isLoading || isTokenized}
                className={`px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                  isTokenized ? "opacity-50 cursor-not-allowed" : ""
                }`}
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
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isValidating ? "Validating..." : "Continue"}
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

      {/* Legal Framework Dialog */}
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
        onAgreementComplete={handleLegalAgreementComplete}
      />
    </ResponsiveDialog>
  );
}
