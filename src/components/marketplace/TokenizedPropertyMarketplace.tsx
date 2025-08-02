"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BuyTokenDialog } from "@/components/dialogs/BuyTokenDialog";
import { CoinsIcon, CalendarIcon, MapPinIcon, TargetIcon, ShieldIcon } from "@phosphor-icons/react";

interface TokenizedProperty {
  id: string;
  token_name: string;
  token_symbol: string;
  token_price: number;
  total_supply: string;
  total_value_usd: number;
  minimum_investment: number;
  expected_roi: number;
  lock_up_period_months: number;
  status: string;
  revenue_distribution_frequency: string;
  investment_terms: string;
  property?: {
    id: string;
    title: string;
    description: string;
    location: any;
    property_images?: Array<{ url: string; is_primary: boolean }>;
  };
  land_title?: {
    location_address: string;
  };
  available_tokens?: number;
  investor_count?: number;
  funding_progress?: number;
}

export function TokenizedPropertyMarketplace() {
  const [properties, setProperties] = useState<TokenizedProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] =
    useState<TokenizedProperty | null>(null);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    fetchTokenizedProperties();
  }, []);

  const fetchTokenizedProperties = async () => {
    try {
      // First fetch tokenized properties with basic property and land title info
      const { data: tokenizedData, error } = await supabase
        .from("tokenized_properties")
        .select(
          `
          *,
          property:properties!tokenized_properties_property_id_fkey(
            id,
            title,
            description,
            location
          ),
          land_title:land_titles(location_address)
        `
        )
        .in("status", ["approved", "minted", "active"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Calculate additional metrics for each property
      const propertiesWithMetrics = await Promise.all(
        (tokenizedData || []).map(async (property) => {
          // Get token holdings to calculate available tokens and investor count
          const { data: holdings } = await supabase
            .from("token_holdings")
            .select("tokens_owned, holder_id")
            .eq("tokenized_property_id", property.id);

          // Get property images separately if property exists
          let propertyImages: Array<{ url: string; is_primary: boolean }> = [];
          if (property.property?.id) {
            const { data: images } = await supabase
              .from("property_images")
              .select("url, is_primary")
              .eq("property_id", property.property.id);

            propertyImages =
              (images as Array<{ url: string; is_primary: boolean }>) || [];
          }

          const totalSold =
            holdings?.reduce(
              (sum, holding) => sum + parseInt(holding.tokens_owned),
              0
            ) || 0;
          const availableTokens = parseInt(property.total_supply) - totalSold;
          const investorCount = new Set(holdings?.map((h) => h.holder_id) || [])
            .size;
          const fundingProgress =
            (totalSold / parseInt(property.total_supply)) * 100;

          return {
            ...property,
            property: property.property
              ? {
                  ...property.property,
                  property_images: propertyImages,
                }
              : undefined,
            available_tokens: availableTokens,
            investor_count: investorCount,
            funding_progress: fundingProgress,
          };
        })
      );

      setProperties(propertiesWithMetrics as TokenizedProperty[]);
    } catch (error) {
      console.error("Error fetching tokenized properties:", error);
      toast({
        title: "Error",
        description: "Failed to fetch tokenized properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBuyTokens = (property: TokenizedProperty) => {
    setSelectedProperty(property);
    setShowBuyDialog(true);
  };

  const getPrimaryImage = (property: TokenizedProperty) => {
    const images = property.property?.property_images || [];
    return (
      images.find((img) => img.is_primary)?.url ||
      images[0]?.url ||
      "/placeholder.svg"
    );
  };

  const getStatusBadge = (status: string, fundingProgress: number = 0) => {
    if (status === "active" && fundingProgress < 100) {
      return <Badge className="bg-green-100 text-green-800">Funding</Badge>;
    }
    if (fundingProgress >= 100) {
      return <Badge className="bg-blue-100 text-blue-800">Fully Funded</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const getRiskLevel = (roi: number) => {
    if (roi < 8) return { level: "Low", color: "text-green-600" };
    if (roi < 15) return { level: "Medium", color: "text-yellow-600" };
    return { level: "High", color: "text-red-600" };
  };

  const filteredProperties = properties.filter((property) => {
    switch (activeTab) {
      case "funding":
        return (property.funding_progress || 0) < 100;
      case "funded":
        return (property.funding_progress || 0) >= 100;
      case "high-roi":
        return property.expected_roi >= 12;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tokenized Properties</h2>
          <p className="text-gray-600">
            Invest in fractional real estate ownership
          </p>
        </div>
        <Badge className="bg-blue-100 text-blue-800">
          {properties.length} Properties Available
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Properties</TabsTrigger>
          <TabsTrigger value="funding">Funding</TabsTrigger>
          <TabsTrigger value="funded">Fully Funded</TabsTrigger>
          <TabsTrigger value="high-roi">High ROI</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-6">
          {filteredProperties.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <CoinsIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No tokenized properties found</p>
                  <p className="text-sm">
                    Check back later for new investment opportunities
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProperties.map((property) => {
                const risk = getRiskLevel(property.expected_roi);

                return (
                  <Card key={property.id} className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={getPrimaryImage(property)}
                        alt={property.token_name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {getStatusBadge(
                          property.status,
                          property.funding_progress
                        )}
                        <Badge className={`${risk.color} bg-white`}>
                          {risk.level} Risk
                        </Badge>
                      </div>
                    </div>

                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">
                        {property.token_name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1">
                        <MapPinIcon className="w-4 h-4" />
                        {property.land_title?.location_address ||
                          "Location not specified"}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">Token Price</p>
                          <p className="font-semibold">
                            ${property.token_price}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">Expected ROI</p>
                          <p className="font-semibold text-green-600">
                            {property.expected_roi}%
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">
                            Min Investment
                          </p>
                          <p className="font-semibold">
                            ${property.minimum_investment}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">Lock Period</p>
                          <p className="font-semibold">
                            {property.lock_up_period_months}m
                          </p>
                        </div>
                      </div>

                      {/* Funding Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Funding Progress</span>
                          <span>
                            {(property.funding_progress || 0).toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={property.funding_progress || 0}
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{property.investor_count || 0} investors</span>
                          <span>
                            {property.available_tokens || 0} tokens available
                          </span>
                        </div>
                      </div>

                      {/* Investment Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <TargetIcon className="w-4 h-4" />
                          <span>
                            Total Value: $
                            {property.total_value_usd.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <CalendarIcon  className="w-4 h-4" />
                          <span>
                            Dividends: {property.revenue_distribution_frequency}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ShieldIcon className="w-4 h-4" />
                          <span>Terms: {property.investment_terms}</span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={() => handleBuyTokens(property)}
                        className="w-full"
                        disabled={(property.available_tokens || 0) === 0}
                      >
                        {(property.available_tokens || 0) === 0
                          ? "Sold Out"
                          : "Invest Now"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedProperty && (
        <BuyTokenDialog
          open={showBuyDialog}
          onOpenChange={(open) => {
            setShowBuyDialog(open);
            if (!open) setSelectedProperty(null);
          }}
          tokenizedProperty={{
            id: selectedProperty.id,
            token_name: selectedProperty.token_name,
            token_symbol: selectedProperty.token_symbol,
            token_price: selectedProperty.token_price,
            hedera_token_id: selectedProperty.id || "",
            minimum_investment: selectedProperty.minimum_investment,
            available_tokens: selectedProperty.available_tokens,
          }}
        />
      )}
    </div>
  );
}
