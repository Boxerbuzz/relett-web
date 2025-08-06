"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PropertyMap } from "@/components/maps/PropertyMap";
import { PropertyDocumentViewer } from "@/components/property/PropertyDocumentViewer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import {
  MapPinIcon,
  TrendUpIcon,
  HeartIcon,
  ShareIcon,
  StarIcon,
  CalendarIcon,
  HouseIcon,
  RulerIcon,
  UsersIcon,
  CarIcon,
  SpinnerIcon,
  ArrowLeftIcon,
  CoinsIcon,
  PencilCircleIcon,
  ArchiveBoxIcon,
} from "@phosphor-icons/react";
import { getAmenityById } from "@/types/amenities";
import { TokenizePropertyDialog } from "@/components/dialogs/TokenizePropertyDialog";
import { EditPropertyDialog } from "@/components/dialogs/EditPropertyDialog";
import { DocumentUpload } from "@/components/property/DocumentUpload";
import { capitalize } from "@/lib/utils";
import { usePropertyDocument } from "@/hooks/usePropertyDocument";
import { PropertyBlockchainRegistration } from "../hedera/PropertyBlockchainRegistration";

interface PropertyData {
  id: string;
  title: string | null;
  location: any;
  price: any;
  status: string;
  category: string;
  type: string;
  is_verified: boolean | null;
  is_tokenized: boolean | null;
  is_featured: boolean | null;
  is_blockchain_registered: boolean | null;
  backdrop: string | null;
  description?: string | null;
  condition?: string | null;
  year_built?: string | null;
  sqrft?: string | null;
  max_guest?: number | null;
  garages?: number | null;
  ratings?: number | null;
  review_count?: number | null;
  amenities?: string[] | null;
  features?: string[] | null;
  tags?: string[] | null;
  views?: number | null;
  likes?: number | null;
  favorites?: number | null;
  land_title_id?: string | null;
  user_id?: string | null;
  tokenized_property?: {
    token_price: number | null;
    total_supply: string | null;
    expected_roi: number | null;
  };
  property_images: Array<{
    url: string | null;
    is_primary: boolean | null;
  }>;
  documents: Array<{
    id: string;
    document_name: string;
    document_type: string;
    file_url: string;
    file_size: number;
    mime_type: string;
    status: string | null;
    verified_at?: string | null;
    verified_by?: string | null;
    created_at: string;
    expires_at?: string | null;
  }>;
}

interface PropertyDetailsDialogProps {
  propertyId: string;
  onBack: () => void;
}

export function PropertyDetailsDialog({
  propertyId,
  onBack,
}: PropertyDetailsDialogProps) {
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [loading, setLoading] = useState(false);
  const [showTokenizeDialog, setShowTokenizeDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showBlockchainDialog, setShowBlockchainDialog] = useState(false);
  const { createDocument, updateDocument, deleteDocument } =
    usePropertyDocument();
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("properties")
        .select(
          `
          *,
          tokenized_properties:tokenized_properties_property_id_fkey(*),
          property_images (
            url,
            is_primary
          ),
          documents: property_documents_property_id_fkey(
            *
          )
        `
        )
        .eq("id", propertyId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setProperty({
          ...data,
          property_images: Array.isArray(data.property_images)
            ? data.property_images
            : [],
          documents: Array.isArray(data.documents) ? data.documents : [],
        });
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      toast({
        title: "Error",
        description: "Failed to fetch property details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPrimaryImage = () => {
    if (!property?.property_images?.length)
      return property?.backdrop || "/placeholder.svg";
    const primaryImage = property.property_images.find((img) => img.is_primary);
    return (
      primaryImage?.url ||
      property.property_images[0]?.url ||
      "/placeholder.svg"
    );
  };

  const getLocationString = () => {
    if (!property?.location) return "Location not specified";
    if (typeof property.location === "string") return property.location;

    const { city, state } = property.location;
    return [city, state].filter(Boolean).join(", ");
  };

  const getCoordinates = () => {
    if (!property?.location?.coordinates) return undefined;
    return {
      lat: property.location.coordinates.lat,
      lng: property.location.coordinates.lng,
    };
  };

  const formatPrice = (price: any) => {
    if (!price) return "Price not available";
    if (typeof price === "string") return price;
    if (typeof price === "number") return `₦${(price / 100).toLocaleString()}`;
    if (price.amount) return `₦${(price.amount / 100).toLocaleString()}`;
    return "Price not available";
  };

  const handleTokenizeProperty = () => {
    if (!property) return;
    setShowTokenizeDialog(true);
  };

  const keySpecs = property
    ? [
        {
          label: "Property Type",
          value: property.category || property.type || "N/A",
          icon: HouseIcon,
          id: "type",
        },
        {
          label: "Size",
          value: property.sqrft || "N/A",
          icon: RulerIcon,
          id: "size",
        },
        {
          label: "Condition",
          value: property.condition || "Good",
          icon: StarIcon,
          id: "condition",
        },
        {
          label: "Year Built",
          value: property.year_built || "N/A",
          icon: CalendarIcon,
          id: "year_built",
        },
        {
          label: "Max Guests",
          value: property.max_guest?.toString() || "0",
          icon: UsersIcon,
          id: "max_guest",
        },
        {
          label: "Garages",
          value: property.garages?.toString() || "0",
          icon: CarIcon,
          id: "garages",
        },
      ]
    : [];

  const investmentSpecs = property
    ? [
        {
          label: "Total Value",
          value: formatPrice(property.price),
        },
        {
          label: "Token Price",
          value: property.tokenized_property
            ? `₦${property.tokenized_property.token_price}`
            : "N/A",
        },
        {
          label: "Total Tokens",
          value: property.tokenized_property
            ? parseInt(
                property.tokenized_property.total_supply || "0"
              ).toLocaleString()
            : "N/A",
        },
        {
          label: "Expected ROI",
          value: property.tokenized_property
            ? `${property.tokenized_property.expected_roi}%`
            : "N/A",
        },
        { label: "Views", value: property.views?.toLocaleString() || "0" },
        { label: "Likes", value: property.likes?.toLocaleString() || "0" },
      ]
    : [];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeftIcon size={16} className="mr-2" />
            Back to Properties
          </Button>
        </div>
        <div className="flex items-center justify-center py-12">
          <SpinnerIcon className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeftIcon size={16} className="mr-2" />
            Back to Properties
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-12 gap-2 h-full">
          <ArchiveBoxIcon size={32} className="text-gray-500" />
          <p className="text-gray-900 font-bold text-lg">Property not found</p>
          <p className="text-gray-500 text-sm">
            The property you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  function handleBlockchainRegistrationComplete(transactionId: string): void {
    setShowBlockchainDialog(false);
    fetchPropertyDetails();
    toast({
      title: "Property Registered on Blockchain",
      description:
        "Your property has been successfully registered on the blockchain.",
    });
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeftIcon size={16} className="mr-2" />
            Back
          </Button>
          <div className="flex gap-1">
            {property.is_featured && (
              <Badge className="bg-orange-500">Featured</Badge>
            )}
            {property.is_verified && (
              <Badge className="bg-green-500">Verified</Badge>
            )}
            {property.is_tokenized && (
              <Badge className="bg-blue-500">Tokenized</Badge>
            )}
          </div>
        </div>

        {/* Property Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {property.title}
          </h1>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPinIcon size={16} />
            <span className="text-sm">{getLocationString()}</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Image and Basic Info */}
          <div className="lg:col-span-1 space-y-4">
            {/* Property Image */}
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img
                src={getPrimaryImage()}
                alt={property.title || "Property Image"}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Basic Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <StarIcon size={16} className="text-yellow-500" />
                  <span className="text-sm font-medium">
                    {(property.ratings || 0).toFixed(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({property.review_count || 0} reviews)
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <HeartIcon size={16} className="mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <ShareIcon size={16} className="mr-2" />
                  Share
                </Button>
              </div>

              {/* Property Owner Actions */}
              {property.user_id === user?.id && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setShowEditDialog(true)}
                  >
                    <PencilCircleIcon size={16} className="mr-2" />
                    Edit Property
                  </Button>

                  {property.is_verified && !property.is_blockchain_registered && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowBlockchainDialog(true)}
                    >
                      <CoinsIcon size={16} className="mr-2" />
                      Register on Blockchain
                    </Button>
                  )}

                  {property.is_blockchain_registered && !property.is_tokenized && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTokenizeProperty()}
                    >
                      <CoinsIcon size={16} className="mr-2" />
                      Tokenize
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1">
                <TabsTrigger
                  value="overview"
                  className="text-xs sm:text-sm px-1 sm:px-3 py-1.5"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger
                  value="investment"
                  className="text-xs sm:text-sm px-1 sm:px-3 py-1.5"
                >
                  Investment
                </TabsTrigger>
                <TabsTrigger
                  value="documents"
                  className="text-xs sm:text-sm px-1 sm:px-3 py-1.5"
                >
                  Documents
                </TabsTrigger>
                <TabsTrigger
                  value="location"
                  className="text-xs sm:text-sm px-1 sm:px-3 py-1.5"
                >
                  Location
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Description */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Description</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {property.description ||
                        "No description available for this property."}
                    </p>
                  </CardContent>
                </Card>

                {/* Property Specifications */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-4">
                      Property Specifications
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      {keySpecs.map((spec, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <spec.icon size={16} className="text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-600">
                              {spec.label}
                            </p>
                            <p className="font-medium text-sm">
                              {spec.id === "year_built"
                                ? new Date(spec.value).getFullYear()
                                : capitalize(spec.value)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Features & Amenities */}
                {(property.features?.length || property.amenities?.length) && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">
                        Features & Amenities
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        {property.features?.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>
                              {getAmenityById(feature)?.name || feature}
                            </span>
                          </div>
                        ))}
                        {property.amenities?.map((amenity, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>
                              {getAmenityById(amenity)?.name || amenity}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="investment" className="space-y-4 mt-4">
                {/* Investment Overview */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-4">Investment Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {investmentSpecs.map((spec, index) => (
                        <div key={index} className="space-y-1">
                          <p className="text-xs text-gray-600">{spec.label}</p>
                          <p className="font-medium text-sm">{spec.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {property.is_tokenized && property.tokenized_property && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">
                        Tokenization Details
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Token Price</span>
                          <span className="font-semibold">
                            ₦{property.tokenized_property.token_price}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Total Supply</span>
                          <span className="font-semibold">
                            {parseInt(
                              property.tokenized_property.total_supply || "0"
                            ).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <TrendUpIcon
                              size={16}
                              className="text-green-600 mr-1"
                            />
                            <span className="text-green-600 font-medium text-sm">
                              {property.tokenized_property.expected_roi}%
                              Expected ROI
                            </span>
                          </div>
                          <span className="text-xs text-gray-600">
                            Annual projected return
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="documents" className="space-y-4 mt-4">
                <PropertyDocumentViewer
                  propertyId={property.id}
                  landTitleId={property.land_title_id || undefined}
                  documents={property.documents || []}
                  onDocumentUploaded={fetchPropertyDetails}
                  onDocumentDeleted={fetchPropertyDetails}
                  onDocumentUpdated={fetchPropertyDetails}
                  reloadDocuments={fetchPropertyDetails}
                />

                {/* Document Upload for Property Owner */}
                {property.user_id === user?.id && (
                  <DocumentUpload
                    propertyId={property.id}
                    onDocumentDeleted={(docId) => {
                      deleteDocument(docId, "property-documents");
                    }}
                    onDocumentUploaded={(doc) => {
                      createDocument({
                        property_id: property.id,
                        document_name: doc.name,
                        document_type: doc.type as any,
                        file_url: doc.url,
                        file_size: doc.size,
                        document_hash: doc.hash || "",
                        mime_type: doc.mime_type || "",
                        created_at: new Date().toISOString(),
                        verified_at: null,
                        verified_by: null,
                        status: "pending",
                        expires_at: null,
                      });
                    }}
                  />
                )}
              </TabsContent>

              <TabsContent value="location" className="space-y-4 mt-4">
                <PropertyMap
                  coordinates={getCoordinates()}
                  address={getLocationString()}
                />

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-4">Location Information</h3>
                    <div>
                      <p className="font-medium text-sm">Address</p>
                      <p className="text-gray-600 text-sm">
                        {getLocationString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {property && (
        <TokenizePropertyDialog
          open={showTokenizeDialog}
          onOpenChange={setShowTokenizeDialog}
          property={{
            id: property.id,
            location: getLocationString(),
            value: formatPrice(property.price),
            image: property.backdrop || "",
            title: property.title || "",
          }}
        />
      )}

      {/* Edit Property Dialog */}
      <EditPropertyDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        propertyId={propertyId}
        onPropertyUpdated={fetchPropertyDetails}
      />

      {/* Blockchain Registration Dialog */}
      {property && showBlockchainDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">
              Register Property on Blockchain
            </h2>
            <PropertyBlockchainRegistration
              propertyData={{
                id: property.id,
                title: property.title || "",
                type: property.category || property.type || "",
                location: property.location,
                price: property.price,
              }}
              onRegistrationComplete={handleBlockchainRegistrationComplete}
              onRegistrationSkip={() => setShowBlockchainDialog(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
