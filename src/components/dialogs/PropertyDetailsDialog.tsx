'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BlockchainStatusBadge } from '@/components/property/BlockchainStatusBadge';
import { PropertyBlockchainRegistration } from '@/components/hedera/PropertyBlockchainRegistration';
import { TokenizePropertyDialog } from './TokenizePropertyDialog';
import { usePropertyDetails } from '@/hooks/usePropertyDetails';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Calendar, 
  Home, 
  DollarSign,
  Eye,
  Heart,
  Share2,
  MessageSquare,
  Phone,
  Mail,
  Star,
  Badge as BadgeIcon,
  Shield,
  Coins
} from 'lucide-react';

interface PropertyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
}

export function PropertyDetailsDialog({ 
  open, 
  onOpenChange, 
  propertyId 
}: PropertyDetailsDialogProps) {
  const { property, loading, error, agent } = usePropertyDetails(propertyId);
  const { toast } = useToast();
  const [showBlockchainRegistration, setShowBlockchainRegistration] = useState(false);
  const [showTokenizeDialog, setShowTokenizeDialog] = useState(false);

  const handleRegisterOnBlockchain = () => {
    setShowBlockchainRegistration(true);
  };

  const handleBlockchainRegistrationComplete = (transactionId: string) => {
    setShowBlockchainRegistration(false);
    toast({
      title: "Success!",
      description: "Property registered on blockchain successfully.",
    });
    // Optionally refresh property data here
  };

  const handleBlockchainRegistrationSkip = () => {
    setShowBlockchainRegistration(false);
  };

  const handleTokenizeProperty = () => {
    if (!property) return;
    
    const tokenizeData = {
      id: property.id,
      title: property.title,
      value: formatPrice(property.price),
      location: formatLocation(property.location),
      image: getPropertyImage(),
    };
    
    setShowTokenizeDialog(true);
  };

  const formatPrice = (price: any) => {
    if (!price || typeof price !== 'object') return 'N/A';
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: price.currency || 'USD' 
    }).format(price.amount / 100);
  };

  const formatLocation = (location: any) => {
    if (!location || typeof location !== 'object') return 'N/A';
    return `${location.address}, ${location.city}, ${location.state}`;
  };

  const getPropertyImage = () => {
    return property?.property_images?.[0]?.url || property?.backdrop || 'placeholder-image-url';
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !property) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error || 'Property not found'}</p>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open && !showBlockchainRegistration} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{property.title}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Images and Basic Info */}
            <div className="space-y-4">
              {/* Property Image */}
              <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={getPropertyImage()}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Property Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <Badge variant="outline">{property.type}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <Badge variant="outline">{property.category}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <Badge 
                      variant={property.status === 'active' ? 'default' : 'secondary'}
                    >
                      {property.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Condition:</span>
                    <span className="font-medium">{property.condition}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Blockchain Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Blockchain Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BlockchainStatusBadge
                    isRegistered={!!property.is_tokenized}
                    transactionId={property.tokenized_property?.id}
                    size="md"
                    showRegisterButton={!property.is_tokenized && property.is_verified}
                    onRegister={handleRegisterOnBlockchain}
                  />
                  {property.is_tokenized && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        This property is secured and verified on the Hedera blockchain network.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Detailed Info */}
            <div className="space-y-4">
              {/* Price and Investment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Price & Investment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price:</span>
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(property.price)}
                    </span>
                  </div>
                  
                  {property.is_verified && (
                    <div className="space-y-2">
                      <Separator />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4" />
                          <span className="text-sm text-gray-600">
                            {property.is_tokenized ? 'Tokenized' : 'Tokenization Available'}
                          </span>
                        </div>
                        {!property.is_tokenized && (
                          <Button size="sm" onClick={handleTokenizeProperty}>
                            Tokenize Property
                          </Button>
                        )}
                        {property.is_tokenized && (
                          <Badge variant="outline" className="text-blue-600 border-blue-200">
                            Available for Investment
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Location */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{formatLocation(property.location)}</p>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed">
                    {property.description}
                  </p>
                </CardContent>
              </Card>

              {/* Specifications */}
              {property.specification && Object.keys(property.specification).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Specifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      {property.specification.bedrooms && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bedrooms:</span>
                          <span className="font-medium">{property.specification.bedrooms}</span>
                        </div>
                      )}
                      {property.specification.bathrooms && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Bathrooms:</span>
                          <span className="font-medium">{property.specification.bathrooms}</span>
                        </div>
                      )}
                      {property.specification.area && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Area:</span>
                          <span className="font-medium">
                            {property.specification.area} {property.specification.area_unit || 'sqm'}
                          </span>
                        </div>
                      )}
                      {property.specification.year_built && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Year Built:</span>
                          <span className="font-medium">{property.specification.year_built}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Features & Amenities */}
              {(property.features?.length > 0 || property.amenities?.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Features & Amenities</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {property.features?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Features:</h4>
                        <div className="flex flex-wrap gap-2">
                          {property.features.map((feature, index) => (
                            <Badge key={index} variant="outline">{feature}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {property.amenities?.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Amenities:</h4>
                        <div className="flex flex-wrap gap-2">
                          {property.amenities.map((amenity, index) => (
                            <Badge key={index} variant="outline">{amenity}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Agent Info */}
              {agent && (
                <Card>
                  <CardHeader>
                    <CardTitle>Contact Agent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        {agent.first_name?.[0]}{agent.last_name?.[0]}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{agent.first_name} {agent.last_name}</p>
                        <div className="flex gap-2 mt-1">
                          {agent.phone && (
                            <Button size="sm" variant="outline">
                              <Phone className="w-4 h-4 mr-1" />
                              Call
                            </Button>
                          )}
                          {agent.email && (
                            <Button size="sm" variant="outline">
                              <Mail className="w-4 h-4 mr-1" />
                              Email
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <MessageSquare className="w-4 h-4 mr-1" />
                            Chat
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Eye className="w-4 h-4" />
                <span>{property.views || 0} views</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Heart className="w-4 h-4" />
                <span>{property.likes || 0} likes</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Heart className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Blockchain Registration Dialog */}
      {showBlockchainRegistration && property && (
        <Dialog open={showBlockchainRegistration} onOpenChange={setShowBlockchainRegistration}>
          <DialogContent className="max-w-2xl">
            <PropertyBlockchainRegistration
              propertyData={{
                id: property.id,
                title: property.title,
                type: property.type,
                location: property.location,
                price: property.price,
              }}
              onRegistrationComplete={handleBlockchainRegistrationComplete}
              onRegistrationSkip={handleBlockchainRegistrationSkip}
              autoRegister={false}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Tokenize Property Dialog */}
      {showTokenizeDialog && property && (
        <TokenizePropertyDialog
          open={showTokenizeDialog}
          onOpenChange={setShowTokenizeDialog}
          property={{
            id: property.id,
            title: property.title,
            value: formatPrice(property.price),
            location: formatLocation(property.location),
            image: getPropertyImage(),
          }}
        />
      )}
    </>
  );
}
