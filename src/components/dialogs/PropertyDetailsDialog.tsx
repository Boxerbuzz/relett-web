
'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, TrendingUp, Heart, Share, Eye } from 'lucide-react';

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

  const specs = [
    { label: 'Size', value: property.size },
    { label: 'Category', value: displayCategory },
    { label: 'Total Value', value: displayPrice },
    { label: 'Token Price', value: displayTokenPrice },
    { label: 'Total Tokens', value: displayTotalTokens.toLocaleString() },
    { label: 'Available Tokens', value: displayAvailableTokens.toLocaleString() },
    { label: 'Expected ROI', value: displayRoi }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {property.title}
            {displayFeatured && <Badge className="bg-orange-500">Featured</Badge>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Gallery */}
          <div className="aspect-video rounded-lg overflow-hidden bg-gray-100">
            <img 
              src={property.image} 
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Basic Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin size={16} />
              <span>{property.location}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Heart size={16} className="mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm">
                <Share size={16} className="mr-2" />
                Share
              </Button>
            </div>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Property Specifications</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {specs.map((spec, index) => (
                      <div key={index} className="space-y-1">
                        <p className="text-sm text-gray-600">{spec.label}</p>
                        <p className="font-medium">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {displayAvailableTokens > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4">Investment Opportunity</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Available for Investment</span>
                        <div className="text-right">
                          <p className="font-semibold">{displayAvailableTokens.toLocaleString()} tokens</p>
                          <p className="text-sm text-gray-600">
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
                          <span className="text-green-600 font-medium">{displayRoi} Expected ROI</span>
                        </div>
                        <span className="text-sm text-gray-600">Annual projected return</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="financials" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Financial Details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Property Value</p>
                        <p className="text-2xl font-bold">{displayPrice}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Price per Token</p>
                        <p className="text-2xl font-bold text-blue-600">{displayTokenPrice}</p>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-600 mb-2">Revenue Breakdown</p>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Rental Income</span>
                          <span>8.5% annually</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Property Appreciation</span>
                          <span>4.0% annually</span>
                        </div>
                        <div className="flex justify-between font-semibold border-t pt-2">
                          <span>Total Expected ROI</span>
                          <span className="text-green-600">{displayRoi}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Legal Documents</h3>
                  <div className="space-y-3">
                    {['Property Deed', 'Survey Report', 'Valuation Certificate', 'Legal Opinion'].map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <span>{doc}</span>
                        <Button variant="outline" size="sm">
                          <Eye size={16} className="mr-2" />
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
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Location Details</h3>
                  <div className="space-y-4">
                    <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Map view would be here</p>
                    </div>
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-gray-600">{property.location}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">Nearby Amenities</p>
                        <ul className="text-sm text-gray-600 mt-1 space-y-1">
                          <li>• Shopping Mall (2km)</li>
                          <li>• International Airport (15km)</li>
                          <li>• Business District (5km)</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium">Transportation</p>
                        <ul className="text-sm text-gray-600 mt-1 space-y-1">
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
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
