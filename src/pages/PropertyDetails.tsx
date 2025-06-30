
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePropertyDetails } from "@/hooks/usePropertyDetails";
import { PropertyActionButtons } from "@/components/property/PropertyActionButtons";
import { PropertyDocumentViewer } from "@/components/property/PropertyDocumentViewer";
import { InvestNowDialog } from "@/components/dialogs/InvestNowDialog";
import {
  ArrowLeftIcon,
  HeartIcon,
  ShareNetworkIcon,
  MapPinIcon,
  BedIcon,
  HouseIcon,
  CarIcon,
  EyeIcon,
  CalendarIcon,
  StarIcon,
  ImagesIcon,
} from "@phosphor-icons/react";
import { getAmenityById } from "@/types/amenities";

const PropertyDetails = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { property, loading, error } = usePropertyDetails(propertyId || '');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showInvestDialog, setShowInvestDialog] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-md py-4">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        <div className="relative h-96 w-full bg-gray-200 animate-pulse"></div>

        <div className="container mx-auto mt-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Card className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-32 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-md py-4">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
        <div className="container mx-auto py-12 px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The property you are looking for does not exist.'}</p>
          <Button onClick={() => navigate('/marketplace')}>
            Browse Properties
          </Button>
        </div>
      </div>
    );
  }

  const images = property.property_images?.length > 0 
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
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const formatPrice = () => {
    if (!property.price?.amount) return "Price on request";
    const currency = property.price.currency === "USD" ? "$" : "₦";
    const amount = property.price.amount.toLocaleString();
    const period = property.price.period ? `/${property.price.period}` : "";
    return `${currency}${amount}${period}`;
  };

  const getPropertyActions = () => {
    const actions = [];
    
    // Determine which actions to show based on property type
    if (property.type === 'rent' || property.sub_type === 'rent') {
      actions.push('rent');
    }
    
    if (property.type === 'shortlet' || property.sub_type === 'shortlet') {
      actions.push('reservation');
    }
    
    if (property.type === 'sale' || property.sub_type === 'sale') {
      actions.push('inspection', 'viewing');
    }
    
    if (property.is_tokenized && property.tokenized_property) {
      actions.push('invest');
    }
    
    return actions;
  };

  const propertyActions = getPropertyActions();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <HeartIcon className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="outline">
              <ShareNetworkIcon className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Property Image Gallery */}
      <div className="relative h-96 w-full bg-gray-200">
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
      </div>

      {/* Property Details */}
      <div className="container mx-auto mt-8 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Basic Information */}
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
                       `${property.location?.city || ""} ${property.location?.state || ""}`.trim() || 
                       "Address not specified"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600 mb-1">
                    {formatPrice()}
                  </p>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{property.category}</Badge>
                    <Badge variant="outline">{property.type}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Property Stats */}
              <div className="flex items-center gap-6 mb-6 text-sm text-gray-600">
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
                  <span>Listed {new Date(property.created_at).toLocaleDateString()}</span>
                </div>
                {property.ratings > 0 && (
                  <div className="flex items-center gap-1">
                    <StarIcon className="h-4 w-4 fill-current text-yellow-500" />
                    <span>{property.ratings.toFixed(1)} rating</span>
                  </div>
                )}
              </div>

              {/* Specifications */}
              {property.specification && (
                <>
                  <h3 className="font-semibold mb-3">Specifications</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {property.specification.bedrooms && (
                      <div className="flex items-center gap-2">
                        <BedIcon className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium">{property.specification.bedrooms}</p>
                          <p className="text-sm text-gray-600">Bedrooms</p>
                        </div>
                      </div>
                    )}
                    {property.specification.bathrooms && (
                      <div className="flex items-center gap-2">
                        <HouseIcon className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium">{property.specification.bathrooms}</p>
                          <p className="text-sm text-gray-600">Bathrooms</p>
                        </div>
                      </div>
                    )}
                    {property.specification.parking_spaces && (
                      <div className="flex items-center gap-2">
                        <CarIcon className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium">{property.specification.parking_spaces}</p>
                          <p className="text-sm text-gray-600">Parking</p>
                        </div>
                      </div>
                    )}
                    {property.specification.area_sqm && (
                      <div className="flex items-center gap-2">
                        <HouseIcon className="h-5 w-5 text-gray-600" />
                        <div>
                          <p className="font-medium">{property.specification.area_sqm.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">sqm</p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <Separator className="my-6" />

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-3">Description</h3>
                <p className="text-gray-700 leading-relaxed">
                  {property.description || "No description available for this property."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          {property.amenities && property.amenities.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">{getAmenityById(amenity)?.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Features */}
          {property.features && property.features.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {property.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {property.property_documents && property.property_documents.length > 0 && (
            <PropertyDocumentViewer propertyId={property.id} />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Property Actions */}
          <PropertyActionButtons
            property={property}
            onInvestClick={() => setShowInvestDialog(true)}
          />

          {/* Investment Information */}
          {property.is_tokenized && property.tokenized_property && (
            <Card>
              <CardHeader>
                <CardTitle>Investment Opportunity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Token Price</p>
                    <p className="font-bold">${property.tokenized_property.token_price}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Expected ROI</p>
                    <p className="font-bold text-green-600">{property.tokenized_property.expected_roi}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Min Investment</p>
                    <p className="font-bold">${property.tokenized_property.minimum_investment}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Supply</p>
                    <p className="font-bold">{property.tokenized_property.total_supply}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Investment Dialog */}
      {property.tokenized_property && (
        <InvestNowDialog
          open={showInvestDialog}
          onOpenChange={setShowInvestDialog}
          tokenizedProperty={{
            id: property.tokenized_property.id,
            token_name: property.tokenized_property.token_name || property.title || "Property Token",
            token_symbol: property.tokenized_property.token_symbol || "PROP",
            token_price: property.tokenized_property.token_price,
            minimum_investment: property.tokenized_property.minimum_investment,
            expected_roi: property.tokenized_property.expected_roi,
            total_supply: property.tokenized_property.total_supply,
            property_title: property.title,
            hedera_token_id: undefined,
          }}
        />
      )}
    </div>
  );
};

export default PropertyDetails;
