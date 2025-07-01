import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePropertyDetails } from "@/hooks/usePropertyDetails";
import { usePropertyLikes } from "@/hooks/usePropertyLikes";
import { PropertyDocumentViewer } from "@/components/property/PropertyDocumentViewer";
import { PropertyReviews } from "@/components/property/PropertyReviews";
import { InvestNowDialog } from "@/components/dialogs/InvestNowDialog";
import {
  ArrowLeftIcon,
  HeartIcon,
  ShareNetworkIcon,
  MapPinIcon,
  EyeIcon,
  CalendarIcon,
  StarIcon,
  ImagesIcon,
  CurrencyDollarIcon,
} from "@phosphor-icons/react";
import { Heart, Share } from "lucide-react";
import { getAmenityById } from "@/types/amenities";
import { Bed, Shower, Square, Phone, Envelope, User } from "phosphor-react";
import {
  PropertyDetailSkeleton,
  PropertyDetailsNotFound,
} from "@/components/property/PropertyDetailSkeleton";
import { InspectionSheet } from "@/components/property/sheets/InspectionSheet";
import { ReservationSheet } from "@/components/property/sheets/ReservationSheet";
import { OfferSheet } from "@/components/property/sheets/OfferSheet";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { capitalize } from "@/lib/utils";
import { EnhancedPropertyPricing } from "@/types/property";
import RentalSheet from "@/components/property/sheets/RentalSheet";
import { LocationAnalysis } from "@/components/property/LocationAnalysis";
import { AIValuationWidget } from "@/components/property/AIValuationWidget";
import { AIPropertyValuation } from "@/components/property/AIPropertyValuation";
import { useToast } from "@/hooks/use-toast";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { property, loading, error, agent } = usePropertyDetails(id || "");
  const { isLiked, likeCount, loading: likesLoading, toggleLike } = usePropertyLikes(id || "");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showInvestDialog, setShowInvestDialog] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleShare = async () => {
    if (navigator.share && property) {
      try {
        await navigator.share({
          title: property.title,
          text: `Check out this property: ${property.title}`,
          url: window.location.href,
        });
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      toast({
        title: 'Link Copied',
        description: 'Property link copied to clipboard'
      });
    }).catch(() => {
      toast({
        title: 'Error',
        description: 'Failed to copy link',
        variant: 'destructive'
      });
    });
  };

  if (loading) {
    return <PropertyDetailSkeleton />;
  }

  if (error || !property) {
    return <PropertyDetailsNotFound error={error || "Property not found"} />;
  }

  const images =
    property.property_images?.length > 0
      ? property.property_images
      : property.backdrop
      ? [{ url: property.backdrop, is_primary: true }]
      : [];

  const currentImage = images[currentImageIndex];

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex(
        (prev) => (prev - 1 + images.length) % images.length
      );
    }
  };

  const formatPrice = (price: EnhancedPropertyPricing) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: price.currency || "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price.amount / 100);
  };

  const getActionsByCategory = (category: string) => {
    const actions = {
      rent: [
        {
          label: "Request Inspection",
          action: () => setActiveModal("inspection"),
        },
        {
          label: "Rent Now",
          action: () => setActiveModal("rental"),
          primary: true,
        },
      ],
      shortlet: [
        {
          label: "Request Inspection",
          action: () => setActiveModal("inspection"),
        },
        {
          label: "Reserve Now",
          action: () => setActiveModal("reservation"),
          primary: true,
        },
      ],
      buy: [
        {
          label: "Request Inspection",
          action: () => setActiveModal("inspection"),
        },
        {
          label: "Make an Offer",
          action: () => setActiveModal("offer"),
          primary: true,
        },
      ],
    };

    return actions[category as keyof typeof actions] || [];
  };

  const actions = getActionsByCategory(property.category);

  return (
    <Sheet>
      {/* Header */}
      <div className="bg-white shadow-md py-4 fixed top-0 left-0 right-0 z-50 border-b border-gray-200">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={toggleLike}
              disabled={likesLoading}
              className="flex items-center gap-2"
            >
              <Heart 
                size={16} 
                className={isLiked ? 'fill-red-500 text-red-500' : ''} 
              />
              {likeCount > 0 && <span className="text-sm">{likeCount}</span>}
              Save
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share size={16} className="mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
      <div className="min-h-screen bg-gray-50 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <Card className="relative rounded-lg overflow-hidden h-100">
                <CardContent className="p-0">
                  {currentImage ? (
                    <>
                      <img
                        src={currentImage.url}
                        alt={property.title || "Property"}
                        className="w-full h-full object-cover"
                      />
                      {images.length > 1 && (
                        <>
                          <button
                            title="Previous Image"
                            aria-label="Previous Image"
                            type="button"
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                          >
                            <ArrowLeftIcon className="h-5 w-5" />
                          </button>
                          <button
                            title="Next Image"
                            aria-label="Next Image"
                            type="button"
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                          >
                            <ArrowLeftIcon className="h-5 w-5 rotate-180" />
                          </button>

                          {/* Image Counter */}
                          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                            {currentImageIndex + 1} / {images.length}
                          </div>
                        </>
                      )}

                      {/* Status Badges */}
                      <div className="absolute top-4 left-4 flex gap-2">
                        {property.is_featured && (
                          <Badge className="bg-yellow-500 text-white">
                            <StarIcon className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {property.is_verified && (
                          <Badge className="bg-green-500 text-white">
                            Verified
                          </Badge>
                        )}
                        {property.is_tokenized && (
                          <Badge className="bg-purple-500 text-white">
                            Tokenized
                          </Badge>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImagesIcon className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Property Summary */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-2xl font-bold mb-2">
                        {property.title || "Property Title"}
                      </CardTitle>
                      <div className="flex items-center text-gray-600 mb-4">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        <span>
                          {property.location?.address ||
                            `${property.location?.city || ""} ${
                              property.location?.state || ""
                            }`.trim() ||
                            "Address not specified"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="secondary">
                          {capitalize(property.category)}
                        </Badge>
                        <Badge variant="outline">
                          {capitalize(property.type)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(property.price)}
                        {property.price.term && (
                          <span className="text-sm text-gray-600">
                            /{capitalize(property.price.term)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Price</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Bed className="w-5 h-5 mr-1" />
                        <span className="text-lg font-semibold">
                          {property.specification?.bedrooms || 0}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">Bedrooms</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Shower className="w-5 h-5 mr-1" />
                        <span className="text-lg font-semibold">
                          {property.specification?.bathrooms || 0}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">Bathrooms</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <Square className="w-5 h-5 mr-1" />
                        <span className="text-lg font-semibold">
                          {property.specification?.area || "N/A"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">Sq ft</div>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Description</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {property.description || "No description available."}
                    </p>
                  </div>
                  <div className="flex items-center gap-6 mt-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4" />
                      <span>{property.views || 0} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <HeartIcon className="h-4 w-4" />
                      <span>{property.likes || 0} likes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-4 w-4" />
                      <span>
                        Listed{" "}
                        {new Date(property.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {property.ratings > 0 && (
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-4 w-4 fill-current text-yellow-500" />
                        <span>{property.ratings.toFixed(1)} rating</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Add Reviews Section */}
              <PropertyReviews propertyId={property.id} />

              {/* Property Amenities & Features */}
              <Card>
                <CardHeader>
                  <CardTitle>Property Amenities & Features</CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Amenities */}
                  {property.amenities && property.amenities.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {property.amenities.map((amenity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">
                            {getAmenityById(amenity)?.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Features */}
                  {property.features && property.features.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {property.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Documents */}
              {property.property_documents &&
                property.property_documents.length > 0 && (
                  <PropertyDocumentViewer propertyId={property.id} />
                )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Agent Info */}
              {agent && (
                <Card>
                  <CardHeader>
                    <CardTitle>Property Agent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {agent.avatar ? (
                          <img
                            src={agent.avatar}
                            alt="Agent"
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <User className="w-6 h-6 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold">
                          {agent.first_name} {agent.last_name}
                        </h4>
                        <p className="text-sm text-gray-600">Property Agent</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {agent.phone && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-3 text-gray-500" />
                          <span className="text-sm">{agent.phone}</span>
                        </div>
                      )}
                      {agent.email && (
                        <div className="flex items-center">
                          <Envelope className="w-4 h-4 mr-3 text-gray-500" />
                          <span className="text-sm">{agent.email}</span>
                        </div>
                      )}
                    </div>

                    <Button className="w-full mt-4" variant="outline">
                      Contact Agent
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-4 space-y-4">
                  {/* Investment Section */}
                  {property.is_tokenized && property.tokenized_property?.id && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <CardTitle>Quick Actions</CardTitle>
                        <Badge className="bg-blue-500">Tokenized</Badge>
                      </div>
                      <Button
                        onClick={() => {}}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                        Invest Now
                      </Button>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {actions.map((action, index) => (
                        <SheetTrigger asChild>
                          <Button
                            key={index}
                            variant={action.primary ? "default" : "outline"}
                            onClick={action.action}
                            className="w-full"
                            size="lg"
                          >
                            {action.label}
                          </Button>
                        </SheetTrigger>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {property.is_tokenized && property.tokenized_property && (
                <Card>
                  <CardHeader>
                    <CardTitle>Investment Opportunity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Token Price</p>
                        <p className="font-bold">
                          ${property.tokenized_property.token_price}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Expected ROI</p>
                        <p className="font-bold text-green-600">
                          {property.tokenized_property.expected_roi}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Min Investment</p>
                        <p className="font-bold">
                          ${property.tokenized_property.minimum_investment}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Supply</p>
                        <p className="font-bold">
                          {property.tokenized_property.total_supply}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <LocationAnalysis propertyId={property.id} />

              <AIValuationWidget propertyData={property} />
            </div>
          </div>
        </div>

        {/* Investment Dialog */}
        {property.tokenized_property && (
          <InvestNowDialog
            open={showInvestDialog}
            onOpenChange={setShowInvestDialog}
            tokenizedProperty={{
              id: property.tokenized_property.id,
              token_name:
                property.tokenized_property.token_name ||
                property.title ||
                "Property Token",
              token_symbol: property.tokenized_property.token_symbol || "PROP",
              token_price: property.tokenized_property.token_price,
              minimum_investment:
                property.tokenized_property.minimum_investment,
              expected_roi: property.tokenized_property.expected_roi,
              total_supply: property.tokenized_property.total_supply,
              property_title: property.title,
              hedera_token_id: undefined,
            }}
          />
        )}

        {/* Sheets */}
        <InspectionSheet
          open={activeModal === "inspection"}
          onClose={() => setActiveModal(null)}
          property={property}
        />
        <ReservationSheet
          open={activeModal === "reservation"}
          onOpenChange={() => setActiveModal(null)}
          property={property}
        />
        <OfferSheet
          open={activeModal === "offer"}
          onOpenChange={() => setActiveModal(null)}
          property={property}
        />

        <RentalSheet
          open={activeModal === "rental"}
          onOpenChange={() => setActiveModal(null)}
          property={property}
        />
      </div>
    </Sheet>
  );
};

export default PropertyDetails;
