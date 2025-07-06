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
import { Input } from "@/components/ui/input";
import {
  Plus,
  MagnifyingGlass,
  MapPin,
  Eye,
  DotsThreeVertical,
  Heart,
  Share,
} from "phosphor-react";
import { Link } from "react-router-dom";
import { PropertyDetailsDialog } from "@/components/dialogs/PropertyDetailsDialog";
import { TokenizePropertyDialog } from "@/components/dialogs/TokenizePropertyDialog";
import { PropertyGridSkeleton } from "@/components/ui/property-skeleton";
import { BlockchainStatusBadge } from "@/components/property/BlockchainStatusBadge";
import { PropertyBlockchainRegistration } from "@/components/hedera/PropertyBlockchainRegistration";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys, cacheConfig } from "@/lib/queryClient";

interface Property {
  id: string;
  title: string;
  location: any;
  specification: any;
  status: string;
  price: any;
  is_tokenized: boolean;
  is_verified: boolean;
  type: string;
  backdrop?: string;
  blockchain_transaction_id?: string;
  property_images?: Array<{
    url: string;
    is_primary: boolean;
  }>;
}

// Extended interface for dialog components
interface PropertyForDialog {
  id: string;
  title: string;
  location: string;
  size: string;
  value?: string;
  price?: string;
  tokenPrice?: string;
  totalTokens?: number;
  availableTokens?: number;
  roi?: string;
  category?: string;
  type?: string;
  status?: string;
  featured?: boolean;
  tokenized?: boolean;
  image: string;
  description?: string;
  condition?: string;
  yearBuilt?: string;
  sqrft?: string;
  maxGuest?: number;
  garages?: number;
  ratings?: number;
  reviewCount?: number;
  amenities?: string[];
  features?: string[];
  tags?: string[];
  views?: number;
  likes?: number;
  favorites?: number;
  isVerified?: boolean;
  isExclusive?: boolean;
  isAd?: boolean;
}

interface TokenizePropertyForDialog {
  id: string;
  title: string;
  value: string;
  location: string;
  image: string;
}

const MyProperty = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [tokenizeDialogOpen, setTokenizeDialogOpen] = useState(false);
  const [blockchainRegistrationOpen, setBlockchainRegistrationOpen] =
    useState(false);
  const [selectedProperty, setSelectedProperty] =
    useState<PropertyForDialog | null>(null);
  const [selectedPropertyForTokenize, setSelectedPropertyForTokenize] =
    useState<TokenizePropertyForDialog | null>(null);
  const [selectedPropertyForBlockchain, setSelectedPropertyForBlockchain] =
    useState<Property | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // React-Query client for cache manipulation
  const queryClient = useQueryClient();

  const userPropertiesKey = queryKeys.properties.userProperties(
    user?.id || ""
  );

  const {
    data,
    isLoading,
    error,
    refetch: refetchProperties,
  } = useQuery<Property[]>({
    queryKey: userPropertiesKey,
    enabled: !!user,
    queryFn: async () => {
      // Fetch properties belonging to the current user
      const { data: propertiesData, error: propertiesError } = await supabase
        .from("properties")
        .select(
          `
          id,
          title,
          location,
          specification,
          status,
          price,
          is_tokenized,
          is_verified,
          type,
          backdrop,
          blockchain_transaction_id
        `
        )
        .eq("user_id", user?.id || "")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (propertiesError) throw propertiesError;

      // Collect property IDs so we can fetch their images in one call
      const propertyIds = propertiesData?.map((p) => p.id) || [];

      let imagesByProperty: Record<string, any[]> = {};

      if (propertyIds.length > 0) {
        const { data: imagesData, error: imagesError } = await supabase
          .from("property_images")
          .select("property_id, url, is_primary")
          .in("property_id", propertyIds);

        if (imagesError) throw imagesError;

        imagesByProperty =
          imagesData?.reduce((acc, img) => {
            if (!acc[img.property_id]) acc[img.property_id] = [];
            acc[img.property_id].push(img);
            return acc;
          }, {} as Record<string, any[]>) || {};
      }

      // Attach images and coerce to strict Property type
      const enrichedProperties: Property[] = (propertiesData || []).map(
        (property) => ({
          id: property.id,
          title: property.title || "",
          location: property.location,
          specification: property.specification,
          status: property.status,
          price: property.price,
          is_tokenized: property.is_tokenized || false,
          is_verified: property.is_verified || false,
          type: property.type,
          backdrop: (property.backdrop as string | null) || undefined,
          blockchain_transaction_id: property.blockchain_transaction_id ?? undefined,
          property_images: imagesByProperty[property.id] || [],
        })
      );

      return enrichedProperties;
    },
    ...cacheConfig.standard,
  });

  // Derived, type-safe list of properties for rendering
  const properties: Property[] = data ?? [];

  // Show toast on error
  useEffect(() => {
    if (error) {
      console.error("Error fetching properties:", error);
      toast({
        title: "Error",
        description: "Failed to fetch properties. Please try again.",
        variant: "destructive",
      });
    }
  }, [error]);

  // If the user changes (e.g., logout), refetch the properties list
  useEffect(() => {
    if (user) {
      refetchProperties();
    }
  }, [user]);

  // Convert kobo to naira for display
  const convertKoboToNaira = (kobo: number) => kobo / 100;

  const handleViewDetails = (property: Property) => {
    // Transform Property to PropertyForDialog
    const propertyForDialog: PropertyForDialog = {
      id: property.id,
      title: property.title,
      location: getLocationString(property.location),
      size: getPropertySize(property.specification),
      value: getPriceString(property.price),
      price: getPriceString(property.price),
      category: property.type,
      type: property.type,
      status: property.status,
      tokenized: property.is_tokenized,
      image: getPropertyImage(property),
      isVerified: property.is_verified,
      views: 0,
      likes: 0,
      favorites: 0,
      ratings: 0,
      reviewCount: 0,
    };

    setSelectedProperty(propertyForDialog);
    setDetailsDialogOpen(true);
  };

  const handleTokenizeProperty = (property: Property) => {
    // Transform Property to TokenizePropertyForDialog
    const propertyForTokenize: TokenizePropertyForDialog = {
      id: property.id,
      title: property.title,
      value: getPriceString(property.price),
      location: getLocationString(property.location),
      image: getPropertyImage(property),
    };

    setSelectedPropertyForTokenize(propertyForTokenize);
    setTokenizeDialogOpen(true);
  };

  const handleRegisterOnBlockchain = (property: Property) => {
    setSelectedPropertyForBlockchain(property);
    setBlockchainRegistrationOpen(true);
  };

  const handleBlockchainRegistrationComplete = (transactionId: string) => {
    if (selectedPropertyForBlockchain) {
      queryClient.setQueryData<Property[]>(
        userPropertiesKey,
        (old) =>
          old?.map((prop) =>
            prop.id === selectedPropertyForBlockchain.id
              ? { ...prop, blockchain_transaction_id: transactionId }
              : prop
          ) || []
      );
    }

    setBlockchainRegistrationOpen(false);
    setSelectedPropertyForBlockchain(null);

    toast({
      title: "Success!",
      description: "Property registered on blockchain successfully.",
    });
  };

  const handleBlockchainRegistrationSkip = () => {
    setBlockchainRegistrationOpen(false);
    setSelectedPropertyForBlockchain(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "commercial":
        return "bg-blue-100 text-blue-800";
      case "residential":
        return "bg-purple-100 text-purple-800";
      case "industrial":
        return "bg-orange-100 text-orange-800";
      case "land":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPropertyImage = (property: Property) => {
    const primaryImage = property.property_images?.find(
      (img) => img.is_primary
    );
    return (
      primaryImage?.url ||
      property.backdrop ||
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"
    );
  };

  const getLocationString = (location: any) => {
    if (typeof location === "object" && location !== null) {
      return (
        `${location.city || ""}, ${location.state || ""}`
          .trim()
          .replace(/^,|,$/, "") || "Location not specified"
      );
    }
    return location || "Location not specified";
  };

  const getPriceString = (price: any) => {
    if (typeof price === "object" && price !== null) {
      const amount = price.amount || 0;
      const convertedAmount = convertKoboToNaira(amount); // Convert from kobo to naira
      return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: price.currency || "NGN",
        minimumFractionDigits: 0,
      }).format(convertedAmount);
    }
    return "₦0";
  };

  const getPropertySize = (specification: any) => {
    if (typeof specification === "object" && specification !== null) {
      if (specification.area_sqm) {
        return `${specification.area_sqm} sqm`;
      }
      if (specification.bedrooms) {
        return `${specification.bedrooms} bed, ${
          specification.bathrooms || 0
        } bath`;
      }
    }
    return "Size not specified";
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getLocationString(property.location)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "verified" && property.is_verified) ||
      (statusFilter === "pending" && property.status === "pending") ||
      (statusFilter === "tokenized" && property.is_tokenized) ||
      (statusFilter === "blockchain" && property.blockchain_transaction_id) ||
      property.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            My Property
          </h1>
          <p className="text-gray-600">Manage your land and property assets</p>
        </div>
        <Link to="/add-property">
          <Button className="w-full sm:w-auto">
            <Plus size={16} className="mr-2" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Search properties..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("all")}
              >
                All
              </Button>
              <Button
                variant={statusFilter === "verified" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("verified")}
              >
                Verified
              </Button>
              <Button
                variant={statusFilter === "pending" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("pending")}
              >
                Pending
              </Button>
              <Button
                variant={statusFilter === "tokenized" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("tokenized")}
              >
                Tokenized
              </Button>
              <Button
                variant={statusFilter === "blockchain" ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter("blockchain")}
              >
                Blockchain
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      {isLoading ? (
        <PropertyGridSkeleton count={8} />
      ) : filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No properties found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Get started by adding your first property."}
            </p>
            <Link to="/add-property">
              <Button>
                <Plus size={16} className="mr-2" />
                Add Property
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 md:gap-6">
          {filteredProperties.map((property) => (
            <Card
              key={property.id}
              className="hover:shadow-lg transition-all duration-200 group"
              onClick={() => handleViewDetails(property)}
            >
              <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                <img
                  src={getPropertyImage(property)}
                  alt={property.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white/900 backdrop-blur-sm hover:bg-white shadow-sm"
                  >
                    <Heart size={14} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white/900 backdrop-blur-sm hover:bg-white shadow-sm"
                  >
                    <Share size={14} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-8 w-8 rounded-full bg-white/900 backdrop-blur-sm hover:bg-white shadow-sm"
                  >
                    <DotsThreeVertical size={14} />
                  </Button>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-base md:text-lg line-clamp-2">
                  {property.title}
                </CardTitle>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin size={14} className="mr-1 flex-shrink-0" />
                  <span className="truncate">
                    {getLocationString(property.location)}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 md:space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Size:</span>
                  <span className="font-medium">
                    {getPropertySize(property.specification)}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  <Badge
                    className={getStatusColor(property.status)}
                    variant="outline"
                  >
                    {property.status}
                  </Badge>
                  <Badge
                    className={getTypeColor(property.type)}
                    variant="outline"
                  >
                    {property.type}
                  </Badge>
                  {property.is_tokenized && (
                    <Badge
                      variant="outline"
                      className="text-blue-600 border-blue-200"
                    >
                      Tokenized
                    </Badge>
                  )}
                </div>

                {/* Blockchain Status Badge */}
                <BlockchainStatusBadge
                  isRegistered={!!property.blockchain_transaction_id}
                  transactionId={property.blockchain_transaction_id}
                  size="sm"
                />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900">
                      {getPriceString(property.price)}
                    </p>
                    <p className="text-xs text-gray-500">Est. value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialogs */}
      {selectedProperty && (
        <PropertyDetailsDialog
          open={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          propertyId={selectedProperty.id.toString()}
        />
      )}
    </div>
  );
};

export default MyProperty;
