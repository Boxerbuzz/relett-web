'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, TrendingUp, Heart, Share, Eye, Star, Calendar, Home, Ruler, Users, Car, Bed, Bath } from 'lucide-react';

interface PropertyDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: {
    id: number;
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
  };
}

export function PropertyDetailsDialog({ open, onOpenChange, property }: PropertyDetailsDialogProps) {
  // Provide default values for optional properties
  const displayPrice = property.value || property.price || 'N/A';
  const displayTokenPrice = property.tokenPrice || 'N/A';
  const displayTotalTokens = property.totalTokens || 0;
  const displayAvailableTokens = property.availableTokens || 0;
  const displayRoi = property.roi || 'N/A';
  const displayCategory = property.category || property.type || 'Unknown';
  const displayFeatured = property.featured || false;
  const displayDescription = property.description || 'No description available';
  const displayCondition = property.condition || 'Good';
  const displayYearBuilt = property.yearBuilt || 'N/A';
  const displaySqrft = property.sqrft || property.size || 'N/A';
  const displayMaxGuest = property.maxGuest || 0;
  const displayGarages = property.garages || 0;
  const displayRatings = property.ratings || 0;
  const displayReviewCount = property.reviewCount || 0;
  const displayAmenities = property.amenities || [];
  const displayFeatures = property.features || [];
  const displayTags = property.tags || [];
  const displayViews = property.views || 0;
  const displayLikes = property.likes || 0;
  const displayFavorites = property.favorites || 0;

  const keySpecs = [
    { label: 'Property Type', value: displayCategory, icon: Home },
    { label: 'Size', value: displaySqrft, icon: Ruler },
    { label: 'Condition', value: displayCondition, icon: Star },
    { label: 'Year Built', value: displayYearBuilt, icon: Calendar },
    { label: 'Max Guests', value: displayMaxGuest.toString(), icon: Users },
    { label: 'Garages', value: displayGarages.toString(), icon: Car }
  ];

  const investmentSpecs = [
    { label: 'Total Value', value: displayPrice },
    { label: 'Token Price', value: displayTokenPrice },
    { label: 'Total Tokens', value: displayTotalTokens.toLocaleString() },
    { label: 'Available Tokens', value: displayAvailableTokens.toLocaleString() },
    { label: 'Expected ROI', value: displayRoi },
    { label: 'Views', value: displayViews.toLocaleString() },
    { label: 'Likes', value: displayLikes.toLocaleString() },
    { label: 'Favorites', value: displayFavorites.toLocaleString() }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {property.title}
              <div className="flex gap-1">
                {displayFeatured && <Badge className="bg-orange-500">Featured</Badge>}
                {property.isVerified && <Badge className="bg-green-500">Verified</Badge>}
                {property.isExclusive && <Badge className="bg-purple-500">Exclusive</Badge>}
                {property.tokenized && <Badge className="bg-blue-500">Tokenized</Badge>}
              </div>
            </DialogTitle>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-1">
            {/* Left Column - Image and Basic Info */}
            <div className="lg:col-span-1 space-y-4">
              {/* Smaller Image */}
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Basic Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin size={16} />
                  <span className="text-sm">{property.location}</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-500" />
                    <span className="text-sm font-medium">{displayRatings.toFixed(1)}</span>
                    <span className="text-sm text-gray-500">({displayReviewCount} reviews)</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Heart size={16} className="mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Share size={16} className="mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Detailed Information */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="overview" className="w-full">
                <div className="sticky top-0 bg-white z-10 pb-4">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="investment">Investment</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="location">Location</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-4">
                  {/* Description */}
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-3">Description</h3>
                      <p className="text-gray-700 text-sm leading-relaxed">{displayDescription}</p>
                    </CardContent>
                  </Card>

                  {/* Property Specifications */}
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Property Specifications</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {keySpecs.map((spec, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <spec.icon size={16} className="text-gray-500" />
                            <div>
                              <p className="text-xs text-gray-600">{spec.label}</p>
                              <p className="font-medium text-sm">{spec.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Tags */}
                  {displayTags.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {displayTags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="investment" className="space-y-4">
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

                  {displayAvailableTokens > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-4">Token Availability</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Available for Investment</span>
                            <div className="text-right">
                              <p className="font-semibold text-sm">{displayAvailableTokens.toLocaleString()} tokens</p>
                              <p className="text-xs text-gray-600">
                                {displayTotalTokens > 0 ? ((displayAvailableTokens / displayTotalTokens) * 100).toFixed(1) : '0'}% available
                              </p>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${displayTotalTokens > 0 ? (displayAvailableTokens / displayTotalTokens) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <TrendingUp size={16} className="text-green-600 mr-1" />
                              <span className="text-green-600 font-medium text-sm">{displayRoi} Expected ROI</span>
                            </div>
                            <span className="text-xs text-gray-600">Annual projected return</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Revenue Breakdown */}
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Revenue Breakdown</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Rental Income</span>
                          <span>8.5% annually</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Property Appreciation</span>
                          <span>4.0% annually</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2 text-sm">
                          <span>Total Expected ROI</span>
                          <span className="text-green-600">{displayRoi}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                  {/* Amenities */}
                  {displayAmenities.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-4">Amenities</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {displayAmenities.map((amenity, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>{amenity}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Features */}
                  {displayFeatures.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-4">Features</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {displayFeatures.map((feature, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>{feature}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Documents */}
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Legal Documents</h3>
                      <div className="space-y-2">
                        {['Property Deed', 'Survey Report', 'Valuation Certificate', 'Legal Opinion'].map((doc, index) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded-lg">
                            <span className="text-sm">{doc}</span>
                            <Button variant="outline" size="sm">
                              <Eye size={14} className="mr-2" />
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="location" className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-4">Location Details</h3>
                      <div className="space-y-4">
                        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                          <p className="text-gray-500 text-sm">Map view would be here</p>
                        </div>
                        <div>
                          <p className="font-medium text-sm">Address</p>
                          <p className="text-gray-600 text-sm">{property.location}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="font-medium text-sm">Nearby Amenities</p>
                            <ul className="text-xs text-gray-600 mt-1 space-y-1">
                              <li>• Shopping Mall (2km)</li>
                              <li>• International Airport (15km)</li>
                              <li>• Business District (5km)</li>
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium text-sm">Transportation</p>
                            <ul className="text-xs text-gray-600 mt-1 space-y-1">
                              <li>• Metro Station (1km)</li>
                              <li>• Bus Stop (500m)</li>
                              <li>• Highway Access (3km)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Fixed Footer Action Buttons */}
        <div className="flex-shrink-0 pt-4 border-t">
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Close
            </Button>
            <Button className="flex-1">
              Invest Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
