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
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyInput } from "@/components/ui/currency-input";
import { TokenizedPropertyLegalFramework } from "@/components/legal/TokenizedPropertyLegalFramework";
import {
  CoinsIcon,
  CalculatorIcon,
  EyeIcon,
  ScalesIcon,
  ArrowLeftIcon,
  Info,
} from "@phosphor-icons/react";
import { Json } from "@/types/database";
import { CurrencyExchangeWidget } from "@/components/ui/currency-exchange-widget";
import { CurrencyDisplay } from "@/components/ui/currency-display";
import { useFormattedNumber } from "@/hooks/useNumberFormatter";
import { cn } from "@/lib/utils";
import { SingleDatePicker } from "@/components/ui/single-date-picker";
import { 
  validateSaleStartDate, 
  validateSaleEndDate, 
  validateSaleDateRange,
  getDisabledDatesForSaleStart,
  getDisabledDatesForSaleEnd 
} from "@/utils/dateUtils";

interface Property {
  id: string;
  title: string;
  value: string;
  location: Json;
  image: string;
  landTitleId: string;
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
  const [isLoadingProperty, setIsLoadingProperty] = useState(true);
  const [formData, setFormData] = useState({
    totalTokens: "100000",
    pricePerToken: "25",
    minimumInvestment: "1000",
    expectedROI: "8.0",
    distributionFrequency: "quarterly",
    lockupPeriod: "12",
    description: "",
    riskLevel: "medium",
    tokenName: "",
    tokenSymbol: "",
    investmentTerms: "fixed",
    saleStartDate: "",
    saleEndDate: "",
  });

  const [tokenValidationErrors, setTokenValidationErrors] = useState({
    tokenName: "",
    tokenSymbol: "",
  });

  const [dateValidationErrors, setDateValidationErrors] = useState({
    saleStartDate: "",
    saleEndDate: "",
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
    // Add a small delay to ensure React Router has fully initialized
    const timer = setTimeout(() => {
      // Try to get propertyId from useParams first, then fallback to URL parsing
      let finalPropertyId = propertyId;

      if (!finalPropertyId) {
        // Fallback: Extract propertyId from URL path
        const pathParts = window.location.pathname.split("/");
        const tokenizeIndex = pathParts.findIndex(
          (part) => part === "tokenize-property"
        );
        if (tokenizeIndex !== -1 && pathParts[tokenizeIndex + 1]) {
          finalPropertyId = pathParts[tokenizeIndex + 1];
        }
      }

      if (!finalPropertyId) {
        toast.error("Property ID is required");
        navigate("/my-properties");
        return;
      }

      const loadProperty = async () => {
        setIsLoadingProperty(true);
        try {
          const { data, error } = await supabase
            .from("properties")
            .select("id, title, price, location, backdrop, land_title_id")
            .eq("id", finalPropertyId)
            .single();

          if (error || !data) {
            toast.error("Property not found");
            navigate("/my-properties");
            return;
          }

          setProperty({
            id: data.id,
            title: data.title || "",
            value: data.price?.toString() || "0",
            location: data.location || "",
            image: data.backdrop || "",
            landTitleId: data.land_title_id || "",
          });
        } catch (error) {
          console.error("Error loading property:", error);
          toast.error("Failed to load property");
          navigate("/marketplace");
        } finally {
          setIsLoadingProperty(false);
        }
      };

      loadProperty();
    }, 100); // Small delay to ensure React Router is ready

    return () => clearTimeout(timer);
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

  // Add this effect to generate smart defaults when property loads
  useEffect(() => {
    if (property && !formData.tokenName && !formData.tokenSymbol) {
      const defaultName = generateTokenName(property.title, property.id);
      const defaultSymbol = generateTokenSymbol(property.title, property.id);
      
      setFormData(prev => ({
        ...prev,
        tokenName: defaultName,
        tokenSymbol: defaultSymbol,
      }));
    }
  }, [property]);

  // Update the handleInputChange function to include token validation
  const handleInputChange = (field: string, value: string) => {
    if (field === "tokenSymbol") {
      // Auto-uppercase and remove invalid characters for symbol
      const cleanValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
      setFormData(prev => ({ ...prev, [field]: cleanValue }));
      
      // Validate symbol
      const error = validateTokenSymbol(cleanValue);
      setTokenValidationErrors(prev => ({ ...prev, tokenSymbol: error || "" }));
    } else if (field === "tokenName") {
      setFormData(prev => ({ ...prev, [field]: value }));
      
      // Validate name
      const error = validateTokenName(value);
      setTokenValidationErrors(prev => ({ ...prev, tokenName: error || "" }));
    } else if (field === "saleStartDate" || field === "saleEndDate") {
      setFormData(prev => ({ ...prev, [field]: value }));
      
      // Validate dates when they change
      if (field === "saleStartDate") {
        const error = validateSaleStartDate(value);
        setDateValidationErrors(prev => ({ ...prev, saleStartDate: error || "" }));
        
        // Re-validate end date when start date changes
        if (formData.saleEndDate) {
          const endError = validateSaleEndDate(value, formData.saleEndDate);
          setDateValidationErrors(prev => ({ ...prev, saleEndDate: endError || "" }));
        }
      } else if (field === "saleEndDate") {
        const error = validateSaleEndDate(formData.saleStartDate, value);
        setDateValidationErrors(prev => ({ ...prev, saleEndDate: error || "" }));
      }
    } else {
      const numericValue = value.replace(/,/g, "");
      if (/^\d*$/.test(numericValue)) {
        setFormData(prev => ({
          ...prev,
          [field]: numericValue,
        }));
      }

      setFormData(prev => ({ ...prev, [field]: value }));

      // Clear validation error when user changes input
      if (
        validationError &&
        (field === "totalTokens" || field === "pricePerToken")
      ) {
        setValidationError(null);
      }
    }
  };

  const formatNumberWithCommas = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const removeCommas = (value) => {
    return value.replace(/,/g, "");
  };

  // Updated handleInputChange
  const handleTotalTokensChange = (field, value) => {
    const numericValue = removeCommas(value);
    if (/^\d*$/.test(numericValue)) {
      setFormData((prev) => ({
        ...prev,
        [field]: numericValue,
      }));
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

  // Add a function to check for token uniqueness
  const checkTokenUniqueness = async (tokenName: string, tokenSymbol: string) => {
    try {
      // Check for existing tokens with same name or symbol
      const { data, error } = await supabase
        .from("tokenized_properties")
        .select("token_name, token_symbol")
        .or(`token_name.eq.${tokenName},token_symbol.eq.${tokenSymbol}`);

      if (error) throw error;

      const conflicts: string[] = [];
      if (data?.some(token => token.token_name === tokenName)) {
        conflicts.push("Token name already exists");
      }
      if (data?.some(token => token.token_symbol === tokenSymbol)) {
        conflicts.push("Token symbol already exists");
      }

      return conflicts;
    } catch (error) {
      console.error("Error checking token uniqueness:", error);
      return [];
    }
  };

  // Update the nextStep function to include token validation
  const nextStep = async () => {
    // Show legal framework before step 4
    if (step === 3 && !legalAgreementId) {
      setShowLegalFramework(true);
      return;
    }

    // Validate token fields if on step 1
    if (step === 1) {
      setIsValidating(true);
      try {
        // Validate token value
        await validateTokenValue(
          property,
          formData.totalTokens,
          formData.pricePerToken
        );
        
        // Validate token name and symbol
        const nameError = validateTokenName(formData.tokenName);
        const symbolError = validateTokenSymbol(formData.tokenSymbol);
        
        if (nameError || symbolError) {
          setTokenValidationErrors({
            tokenName: nameError || "",
            tokenSymbol: symbolError || "",
          });
          return;
        }
        
        // Check for uniqueness
        const conflicts = await checkTokenUniqueness(formData.tokenName, formData.tokenSymbol);
        if (conflicts.length > 0) {
          setValidationError(conflicts.join(", "));
          return;
        }
        
        setValidationError(null);
        setTokenValidationErrors({ tokenName: "", tokenSymbol: "" });
        setStep(Math.min(step + 1, 4));
      } catch (error) {
        setValidationError(
          error instanceof Error ? error.message : "Validation failed"
        );
      } finally {
        setIsValidating(false);
      }
    } else if (step === 2) {
      // Validate sale dates if on step 2
      const dateValidation = validateSaleDateRange(formData.saleStartDate, formData.saleEndDate);
      
      if (!dateValidation.isValid) {
        const startError = validateSaleStartDate(formData.saleStartDate);
        const endError = validateSaleEndDate(formData.saleStartDate, formData.saleEndDate);
        
        setDateValidationErrors({
          saleStartDate: startError || "",
          saleEndDate: endError || "",
        });
        
        toast.error("Please fix the sale date validation errors before proceeding");
        return;
      }
      
      setDateValidationErrors({ saleStartDate: "", saleEndDate: "" });
      setStep(Math.min(step + 1, 4));
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
      // Call the tokenize-property Edge Function instead
      const { data, error } = await supabase.functions.invoke('tokenize-property', {
        body: {
          land_title_id: property.landTitleId,
          property_id: property.id,
          token_symbol: formData.tokenSymbol || "PROP",
          token_name: formData.tokenName || `${property.title} Token`,
          total_supply: formData.totalTokens,
          total_value_usd: parseInt(formData.totalTokens) * parseFloat(formData.pricePerToken),
          minimum_investment: parseFloat(formData.minimumInvestment) || 1000,
          token_price: parseFloat(formData.pricePerToken),
          investment_terms: formData.investmentTerms,
          expected_roi: parseFloat(formData.expectedROI) || 8.0,
          revenue_distribution_frequency: formData.distributionFrequency,
          lock_up_period_months: parseInt(formData.lockupPeriod) || 12,
          sale_start_date: formData.saleStartDate ? new Date(formData.saleStartDate).toISOString() : null,
          sale_end_date: formData.saleEndDate ? new Date(formData.saleEndDate).toISOString() : null,
        }
      });

      if (error) throw error;

      toast.success("Property tokenization request submitted successfully!");
      navigate("/my-properties");
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

  // Show loading state while propertyId is being determined or property is loading
  if (!propertyId || isLoadingProperty || !property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {!propertyId
              ? "Initializing..."
              : isLoadingProperty
              ? "Loading property..."
              : "Property not found"}
          </p>
          {!propertyId && (
            <p className="text-xs text-gray-500 mt-2">
              Please wait while we load the property details...
            </p>
          )}
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
              scenario: "tokenization",
              propertyDetails: property
                ? {
                    id: property.id,
                    title: property.title,
                    location: "getLocationString()",
                    value:
                      parseFloat(property.value.replace(/[^0-9.]/g, "")) || 0,
                  }
                : undefined,
              tokenDetails: {
                tokenPrice: parseFloat(formData.pricePerToken) || 0,
                totalTokens: parseInt(formData.totalTokens) || 0,
                minimumInvestment: parseFloat(formData.minimumInvestment) || 0,
              },
              minimumReadingTime: 300, // 5 minutes
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
              <h3 className="text-md font-bold text-gray-900">
                Tokenize Property
              </h3>
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
                  
                  {/* Token Name and Symbol */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Label htmlFor="tokenName">Token Name</Label>
                      <Input
                        id="tokenName"
                        type="text"
                        value={formData.tokenName}
                        onChange={(e) =>
                          handleInputChange("tokenName", e.target.value)
                        }
                        placeholder="Enter token name"
                        maxLength={50}
                        className={cn(
                          "mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                          tokenValidationErrors.tokenName && "border-red-300 focus:border-red-500"
                        )}
                      />
                      {tokenValidationErrors.tokenName && (
                        <p className="text-xs text-red-600 mt-1">
                          {tokenValidationErrors.tokenName}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Full name of your token (5-50 characters, letters, numbers, spaces, hyphens, parentheses)
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="tokenSymbol">Token Symbol</Label>
                      <Input
                        id="tokenSymbol"
                        type="text"
                        value={formData.tokenSymbol}
                        onChange={(e) =>
                          handleInputChange("tokenSymbol", e.target.value)
                        }
                        placeholder="Enter symbol"
                        maxLength={10}
                        className={cn(
                          "mt-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500",
                          tokenValidationErrors.tokenSymbol && "border-red-300 focus:border-red-500"
                        )}
                      />
                      {tokenValidationErrors.tokenSymbol && (
                        <p className="text-xs text-red-600 mt-1">
                          {tokenValidationErrors.tokenSymbol}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        Short symbol (3-10 characters, uppercase letters and numbers only)
                      </p>
                    </div>
                  </div>

                  {/* Smart Defaults Info */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-800 mb-1">Smart Defaults Applied</p>
                        <p className="text-blue-700">
                          Token name and symbol have been automatically generated based on your property details. 
                          You can customize them to match your branding preferences.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Token Supply and Price */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="totalTokens">Total Tokens</Label>
                      <Input
                        id="totalTokens"
                        type="text"
                        value={formatNumberWithCommas(formData.totalTokens)}
                        onChange={(e) =>
                          handleTotalTokensChange("totalTokens", e.target.value)
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
                
                {formData.pricePerToken && (
                  <div className="mt-3">
                    <CurrencyExchangeWidget
                      amount={Number(formData.pricePerToken) || 0}
                      size="sm"
                      variant="swap"
                    />
                  </div>
                )}

                {/* Total Value Calculation */}
                {formData.totalTokens && formData.pricePerToken && (
                  <div className="mt-6 p-4 bg-white border border-gray-300 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Total Token Value
                        </p>
                        <div className="text-2xl font-bold text-gray-900">
                          <CurrencyDisplay
                            amount={
                              parseInt(formData.totalTokens.replace(/,/g, "")) *
                              parseFloat(formData.pricePerToken)
                            }
                            size="lg"
                            showBothCurrencies={true}
                            respectUserPreference={true}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">
                          {formData.totalTokens}
                        </p>
                        <p className="text-xs text-gray-500">
                          ×{" "}
                          <CurrencyDisplay
                            amount={parseFloat(formData.pricePerToken)}
                            size="sm"
                            showBothCurrencies={false}
                            respectUserPreference={true}
                          />{" "}
                          each
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                    
                    {/* Sale Period Configuration */}
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Sale Period (Required)</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <Label htmlFor="saleStartDate" className="text-sm font-medium text-gray-700">
                            Sale Start Date <span className="text-red-500">*</span>
                          </Label>
                          <SingleDatePicker
                            date={formData.saleStartDate ? new Date(formData.saleStartDate) : undefined}
                            onDateChange={(date) => {
                              const dateString = date ? date.toISOString().slice(0, 16) : "";
                              handleInputChange("saleStartDate", dateString);
                            }}
                            disabled={getDisabledDatesForSaleStart()}
                            placeholder="Select start date"
                            className={cn(
                              "w-full mt-1",
                              dateValidationErrors.saleStartDate && "border-red-300 focus:border-red-500"
                            )}
                          />
                          {dateValidationErrors.saleStartDate && (
                            <p className="text-xs text-red-600 mt-1">
                              {dateValidationErrors.saleStartDate}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Token sale start date (minimum 24 hours from now)
                          </p>
                        </div>
                        <div>
                          <Label htmlFor="saleEndDate" className="text-sm font-medium text-gray-700">
                            Sale End Date <span className="text-red-500">*</span>
                          </Label>
                          <SingleDatePicker
                            date={formData.saleEndDate ? new Date(formData.saleEndDate) : undefined}
                            onDateChange={(date) => {
                              const dateString = date ? date.toISOString().slice(0, 16) : "";
                              handleInputChange("saleEndDate", dateString);
                            }}
                            disabled={getDisabledDatesForSaleEnd(formData.saleStartDate)}
                            placeholder="Select end date"
                            className={cn(
                              "w-full mt-1",
                              dateValidationErrors.saleEndDate && "border-red-300 focus:border-red-500"
                            )}
                          />
                          {dateValidationErrors.saleEndDate && (
                            <p className="text-xs text-red-600 mt-1">
                              {dateValidationErrors.saleEndDate}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Token sale end date (7 days to 2 years after start date)
                          </p>
                        </div>
                      </div>
                      
                      {/* Date Range Summary */}
                      {formData.saleStartDate && formData.saleEndDate && !dateValidationErrors.saleStartDate && !dateValidationErrors.saleEndDate && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 text-green-800">
                            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">
                              Sale Period: {new Date(formData.saleStartDate).toLocaleDateString()} - {new Date(formData.saleEndDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      )}
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
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg mt-5">
                      <div className="flex items-center gap-2 text-green-800">
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Legal framework agreement completed
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mt-5">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <svg
                          className="h-5 w-5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
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
                    {/* Token Details */}
                    <div className="border-b border-gray-200 pb-4">
                      <h4 className="font-medium text-gray-900 mb-3">Token Details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Token Name</p>
                          <p className="font-medium">
                            {formData.tokenName || `${property?.title} Token`}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Token Symbol</p>
                          <p className="font-medium">
                            {formData.tokenSymbol || "PROP"}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Financial Details */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Financial Details</h4>
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
                            $
                            {Number(formData.pricePerToken).toLocaleString(
                              undefined,
                              {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              }
                            )}
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

const generateTokenName = (propertyTitle: string, propertyId: string) => {
  // Clean the property title and create a standardized name
  const cleanTitle = propertyTitle
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
  
  // Create a unique identifier using property ID
  const uniqueId = propertyId.slice(-6).toUpperCase();
  
  return `${cleanTitle} Token (${uniqueId})`;
};

const generateTokenSymbol = (propertyTitle: string, propertyId: string) => {
  // Extract meaningful words from property title
  const words = propertyTitle
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .split(' ')
    .filter(word => word.length > 2)
    .slice(0, 3); // Take first 3 meaningful words
  
  // Create symbol from first letters
  let symbol = words.map(word => word.charAt(0).toUpperCase()).join('');
  
  // Add unique identifier if symbol is too short
  if (symbol.length < 3) {
    const uniqueId = propertyId.slice(-3).toUpperCase();
    symbol = symbol + uniqueId;
  }
  
  // Ensure it's exactly 4-6 characters
  if (symbol.length > 6) {
    symbol = symbol.slice(0, 6);
  }
  
  return symbol;
};

const validateTokenName = (name: string) => {
  if (!name.trim()) return "Token name is required";
  if (name.length < 5) return "Token name must be at least 5 characters";
  if (name.length > 50) return "Token name must be less than 50 characters";
  if (!/^[a-zA-Z0-9\s\-\(\)]+$/.test(name)) {
    return "Token name can only contain letters, numbers, spaces, hyphens, and parentheses";
  }
  return null;
};

const validateTokenSymbol = (symbol: string) => {
  if (!symbol.trim()) return "Token symbol is required";
  if (symbol.length < 3) return "Token symbol must be at least 3 characters";
  if (symbol.length > 10) return "Token symbol must be less than 10 characters";
  if (!/^[A-Z0-9]+$/.test(symbol)) {
    return "Token symbol can only contain uppercase letters and numbers";
  }
  return null;
};
