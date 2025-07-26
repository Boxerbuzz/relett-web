import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePropertyDetails } from "@/hooks/usePropertyDetails";
import { usePropertyLikes } from "@/hooks/usePropertyLikes";
import { PropertyReviews } from "@/components/property/PropertyReviews";
import { InvestNowDialog } from "@/components/dialogs/InvestNowDialog";
import { ArrowLeftIcon, HeartIcon, ShareIcon } from "@phosphor-icons/react";
import { getAmenityById } from "@/types/amenities";
import {
  PropertyDetailSkeleton,
  PropertyDetailsNotFound,
} from "@/components/property/PropertyDetailSkeleton";
import { InspectionSheet } from "@/components/property/sheets/InspectionSheet";
import { ReservationSheet } from "@/components/property/sheets/ReservationSheet";
import { OfferSheet } from "@/components/property/sheets/OfferSheet";
import { capitalize } from "@/lib/utils";
import { EnhancedPropertyPricing } from "@/types/property";
import RentalSheet from "@/components/property/sheets/RentalSheet";
import { LocationAnalysis } from "@/components/property/LocationAnalysis";
import { AIValuationWidget } from "@/components/property/AIValuationWidget";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import {
  useUserRentals,
  useUserReservations,
  useUserInspections,
} from "@/hooks/useUserBookings";
import { BookingDetails } from "@/components/bookings/BookingDetails";
import { ActiveBookingsSidebar } from "@/components/property/details/ActiveBookingsSidebar";
import { AgentInfoCard } from "@/components/property/details/AgentInfoCard";
import { QuickActionsCard } from "@/components/property/details/QuickActionsCard";
import { ImageGallery } from "@/components/property/details/ImageGallery";
import { PropertySummaryCard } from "@/components/property/details/PropertySummaryCard";
import { AmenitiesFeaturesCard } from "@/components/property/details/AmenitiesFeaturesCard";
import { PropertyDocumentsDetailsSection } from "@/components/property/details/PropertyDocumentsDetailsSection";
// Add these imports for right panel layout
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import { Dialog } from "@/components/ui/dialog";

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { property, loading, error, agent } = usePropertyDetails(id || "");
  const {
    isLiked,
    likeCount,
    loading: likesLoading,
    toggleLike,
  } = usePropertyLikes(id || "");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showInvestDialog, setShowInvestDialog] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [bookingDialog, setBookingDialog] = useState<{
    open: boolean;
    type: "inspection" | "rental" | "reservation" | null;
    booking: any;
  }>({ open: false, type: null, booking: null });
  const { user } = useAuth();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Fetch user bookings for this property
  const { data: userRentals = [] } = useUserRentals(user?.id || "");
  const { data: userReservations = [] } = useUserReservations(user?.id || "");
  const { data: userInspections = [] } = useUserInspections(user?.id || "");

  if (loading) {
    return <PropertyDetailSkeleton />;
  }

  if (error || !property) {
    return <PropertyDetailsNotFound error={error || "Property not found"} />;
  }

  // Filter for this property and active status (after property is confirmed)
  const activeRentals = userRentals.filter(
    (r) =>
      r.property_id === property.id &&
      r.status !== "completed" &&
      r.status !== "canceled"
  );

  const activeReservations = userReservations.filter(
    (r) =>
      r.property_id === property.id &&
      r.status !== "completed" &&
      r.status !== "canceled"
  );

  const activeInspections = userInspections.filter(
    (i) =>
      i.property_id === property.id &&
      i.status !== "completed" &&
      i.status !== "canceled"
  );

  // Helper to check if a type is disabled
  const isActionDisabled = (type: string) => {
    if (type === "inspection") return activeInspections.length > 0;
    if (type === "rental") return activeRentals.length > 0;
    if (type === "reservation") return activeReservations.length > 0;
    return false;
  };

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
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        toast({
          title: "Link Copied",
          description: "Property link copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive",
        });
      });
  };

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
    <Dialog>
      <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen min-w-0">
          {/* Header - Fixed positioning at top */}
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
                  <HeartIcon
                    size={16}
                    weight={isLiked ? "fill" : "regular"}
                    className={isLiked ? "text-red-500" : ""}
                  />
                  {likeCount > 0 && (
                    <span className="text-sm">{likeCount}</span>
                  )}
                  Save
                </Button>
                <Button variant="outline" onClick={handleShare}>
                  <ShareIcon size={16} className="mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
          {/* Page Content - Properly spaced below fixed header and adjusts for right panel */}
          <main
            className={cn(
              "flex-1 mt-16 overflow-x-hidden overflow-y-auto transition-all duration-300 ease-in-out",
              "pr-0"
            )}
          >
            <div className="max-w-full min-w-0 w-full p-4 md:p-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-8">
                    {/* Image Gallery */}
                    <ImageGallery
                      images={images.map((img: any) => ({
                        url: img.url,
                        is_primary: img.is_primary === true,
                      }))}
                      propertyTitle={property.title}
                      currentImageIndex={currentImageIndex}
                      onPrev={prevImage}
                      onNext={nextImage}
                      isFeatured={property.is_featured}
                      isVerified={property.is_verified}
                      isTokenized={property.is_tokenized}
                    />

                    {/* Property Summary */}
                    <PropertySummaryCard
                      property={property}
                      formatPrice={formatPrice}
                      capitalize={capitalize}
                    />

                    {/* Add Reviews Section */}
                    <PropertyReviews propertyId={property.id} />

                    {/* Property Amenities & Features */}
                    <AmenitiesFeaturesCard
                      amenities={property.amenities}
                      features={property.features}
                      getAmenityById={getAmenityById}
                    />

                    {/* Documents */}
                    <PropertyDocumentsDetailsSection
                      propertyId={property.id}
                      propertyDocuments={property.property_documents}
                    />
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Active Bookings Section */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Your Active Bookings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ActiveBookingsSidebar
                          activeRentals={activeRentals}
                          activeReservations={activeReservations}
                          activeInspections={activeInspections}
                          onBookingClick={(type, booking) =>
                            setBookingDialog({ open: true, type, booking })
                          }
                        />
                      </CardContent>
                    </Card>
                    {/* Booking Details Dialog */}
                    <BookingDetails
                      isOpen={bookingDialog.open}
                      onClose={() =>
                        setBookingDialog({
                          open: false,
                          type: null,
                          booking: null,
                        })
                      }
                      bookingType={bookingDialog.type as any}
                      bookingData={bookingDialog.booking}
                      onStatusUpdate={() => {}}
                    />
                    {/* Agent Info */}
                    <AgentInfoCard agent={agent} />

                    <QuickActionsCard
                      isTokenized={property.is_tokenized}
                      tokenizedProperty={
                        property.tokenized_property || undefined
                      }
                      actions={actions}
                      isActionDisabled={isActionDisabled}
                      onInvestClick={() => setShowInvestDialog(true)}
                    />

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
                    token_symbol:
                      property.tokenized_property.token_symbol || "PROP",
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
          </main>
        </div>
      </div>
    </Dialog>
  );
};

export default PropertyDetails;
