import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Calendar } from "@/components/ui/calendar"
import { DatePicker } from "@/components/ui/date-picker"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { useToast } from '@/hooks/use-toast';
import { useProperties } from '@/hooks/useProperties';
import { useAuth } from '@/lib/auth';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  MapPinIcon,
  HeartIcon,
  ShareNetworkIcon,
  CheckCircleIcon,
  ClockCounterClockwiseIcon,
  UserCircleIcon,
  BuildingIcon,
  PhoneIcon,
  GlobeIcon,
  PlusIcon,
  MinusIcon,
  CalendarIcon,
  ArrowLeftIcon,
  ImagePlusIcon,
  LucideIcon
} from '@phosphor-icons/react';

import { InvestNowDialog } from '@/components/dialogs/InvestNowDialog';

const PropertyDetails = () => {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const { properties, loading, error } = useProperties();
  const { user } = useAuth();
  const { toast } = useToast();
  const [property, setProperty] = useState<any>(null);
  const [showInvestDialog, setShowInvestDialog] = useState(false);

  useEffect(() => {
    if (propertyId && properties) {
      const foundProperty = properties.find((p) => p.id === propertyId);
      setProperty(foundProperty);
    }
  }, [propertyId, properties]);

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card className="animate-pulse">
          <div className="h-64 bg-gray-200 rounded-t-lg"></div>
          <CardContent className="p-4">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error loading property
            </h3>
            <p className="text-gray-500 mb-4">
              {error}
            </p>
            <Button onClick={() => navigate('/marketplace')}>
              Browse Properties
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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

      {/* Property Image */}
      <div className="relative h-96 w-full">
        {property?.backdrop ? (
          <img
            src={property.backdrop}
            alt={property.title || 'Property'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <ImagePlusIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>

      {/* Property Details */}
      <div className="container mx-auto mt-8 px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{property?.title || 'Property Title'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="h-4 w-4 mr-2" />
                <span>{property?.location?.address || 'Address not specified'}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xl font-bold text-green-600">
                  ₦{property?.price?.amount?.toLocaleString() || 'Price on request'}
                </p>
                <Badge variant="secondary">
                  {property?.category}
                </Badge>
              </div>
              <Separator />
              <p>{property?.description || 'Property description goes here.'}</p>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside text-gray-600">
                {property?.amenities?.map((amenity: string, index: number) => (
                  <li key={index}>{amenity}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Investment Opportunity */}
          {property?.tokenized_property_id && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BuildingIcon className="h-5 w-5 text-blue-500" />
                  Invest in this Property
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-500">
                  Become a fractional owner of this property and earn passive income.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Token Price:</span>
                    <span className="font-medium">$100</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Expected ROI:</span>
                    <span className="font-medium">8%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Minimum Investment:</span>
                    <span className="font-medium">$1,000</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Supply:</span>
                    <span className="font-medium">1,000,000</span>
                  </div>
                </div>
                <Button className="w-full" onClick={() => setShowInvestDialog(true)}>
                  Invest Now
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-gray-600">
                <UserCircleIcon className="h-4 w-4 mr-2" />
                <span>{property?.contact?.name || 'Contact Name'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <PhoneIcon className="h-4 w-4 mr-2" />
                <span>{property?.contact?.phone || 'Phone Number'}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <GlobeIcon className="h-4 w-4 mr-2" />
                <a href={property?.contact?.website} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                  Website
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Investment Dialog */}
      {property?.tokenized_property_id && (
        <InvestNowDialog
          open={showInvestDialog}
          onOpenChange={setShowInvestDialog}
          tokenizedProperty={{
            id: property.tokenized_property_id,
            token_name: property.title || 'Property Token',
            token_symbol: 'PROP',
            token_price: 100,
            minimum_investment: 1000,
            expected_roi: 8,
            total_supply: '1000000',
            property_title: property.title,
            hedera_token_id: undefined
          }}
        />
      )}
    </div>
  );
};

export default PropertyDetails;
