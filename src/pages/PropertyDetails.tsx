
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { MapPin, Bed, Shower, Square, Calendar, Phone, Envelope, User } from 'phosphor-react';
import { RentalRequestModal } from '@/components/property/modals/RentalRequestModal';
import { ReservationModal } from '@/components/property/modals/ReservationModal';
import { InspectionModal } from '@/components/property/modals/InspectionModal';
import { OfferModal } from '@/components/property/modals/OfferModal';
import { useToast } from '@/hooks/use-toast';
import { getAmenityById } from '@/types/amenities';

interface PropertyImage {
  url: string;
  is_primary: boolean;
}

interface PropertyData {
  id: string;
  title: string;
  description: string;
  category: string;
  price: any;
  location: any;
  specification: any;
  amenities: string[];
  features: string[];
  status: string;
  property_images: PropertyImage[];
  user_id: string;
}

interface AgentData {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  avatar: string;
}

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [property, setProperty] = useState<PropertyData | null>(null);
  const [agent, setAgent] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch property details with proper error handling for relations
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select(`
          *,
          property_images!inner (url, is_primary)
        `)
        .eq('id', id)
        .single();

      if (propertyError) throw propertyError;

      // Ensure property_images is always an array
      const processedPropertyData: PropertyData = {
        ...propertyData,
        property_images: Array.isArray(propertyData.property_images) 
          ? propertyData.property_images 
          : []
      };

      setProperty(processedPropertyData);

      // Fetch agent details
      const { data: agentData, error: agentError } = await supabase
        .from('users')
        .select('id, first_name, last_name, phone, email, avatar')
        .eq('id', propertyData.user_id)
        .single();

      if (agentError) throw agentError;
      setAgent(agentData);

    } catch (error) {
      console.error('Error fetching property:', error);
      toast({
        title: 'Error',
        description: 'Failed to load property details',
        variant: 'destructive'
      });
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (category: string) => {
    switch (category) {
      case 'rent': return 'bg-blue-100 text-blue-800';
      case 'shortlet': return 'bg-green-100 text-green-800';
      case 'buy': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionsByCategory = (category: string) => {
    const actions = {
      rent: [
        { label: 'Request Inspection', action: () => setActiveModal('inspection') },
        { label: 'Rent Now', action: () => setActiveModal('rental'), primary: true }
      ],
      shortlet: [
        { label: 'Request Inspection', action: () => setActiveModal('inspection') },
        { label: 'Reserve Now', action: () => setActiveModal('reservation'), primary: true }
      ],
      buy: [
        { label: 'Request Inspection', action: () => setActiveModal('inspection') },
        { label: 'Make an Offer', action: () => setActiveModal('offer'), primary: true }
      ]
    };
    
    return actions[category as keyof typeof actions] || [];
  };

  const formatPrice = (price: any) => {
    if (typeof price === 'object' && price.amount) {
      return `₦${price.amount.toLocaleString()}${price.period ? `/${price.period}` : ''}`;
    }
    return 'Price on request';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property not found</h1>
          <Button onClick={() => navigate('/marketplace')}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const primaryImage = property.property_images?.find(img => img.is_primary)?.url 
    || property.property_images?.[0]?.url 
    || '/placeholder.svg';

  const actions = getActionsByCategory(property.category);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/marketplace')}
                className="mb-4"
              >
                ← Back to Marketplace
              </Button>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {property.title}
                </h1>
                <Badge className={getStatusColor(property.category)}>
                  {property.category}
                </Badge>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{property.location?.address || 'Location not specified'}</span>
              </div>
            </div>
            
            {/* Action CTAs */}
            <div className="hidden sm:flex items-center gap-3">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.primary ? 'default' : 'outline'}
                  onClick={action.action}
                  size="lg"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <Carousel className="w-full">
                  <CarouselContent>
                    {property.property_images?.map((image, index) => (
                      <CarouselItem key={index}>
                        <div className="aspect-[16/9] relative">
                          <img
                            src={image.url}
                            alt={`Property view ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-4" />
                  <CarouselNext className="right-4" />
                </Carousel>
              </CardContent>
            </Card>

            {/* Property Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Property Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{formatPrice(property.price)}</div>
                    <div className="text-sm text-gray-600">Price</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Bed className="w-5 h-5 mr-1" />
                      <span className="text-lg font-semibold">{property.specification?.bedrooms || 0}</span>
                    </div>
                    <div className="text-sm text-gray-600">Bedrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Shower className="w-5 h-5 mr-1" />
                      <span className="text-lg font-semibold">{property.specification?.bathrooms || 0}</span>
                    </div>
                    <div className="text-sm text-gray-600">Bathrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Square className="w-5 h-5 mr-1" />
                      <span className="text-lg font-semibold">{property.specification?.area || 'N/A'}</span>
                    </div>
                    <div className="text-sm text-gray-600">Sq ft</div>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {property.description || 'No description available.'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Features & Amenities */}
            <Card>
              <CardHeader>
                <CardTitle>Features & Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {property.features && property.features.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Features</h4>
                      <ul className="space-y-2">
                        {property.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {property.amenities && property.amenities.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Amenities</h4>
                      <ul className="space-y-2">
                        {property.amenities.map((amenity, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-2 h-2 bg-primary rounded-full mr-3"></div>
                            {getAmenityById(amenity)?.name || amenity}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
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
                        <img src={agent.avatar} alt="Agent" className="w-12 h-12 rounded-full" />
                      ) : (
                        <User className="w-6 h-6 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{agent.first_name} {agent.last_name}</h4>
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

            {/* Mobile Action CTAs */}
            <div className="sm:hidden space-y-3">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.primary ? 'default' : 'outline'}
                  onClick={action.action}
                  className="w-full"
                  size="lg"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RentalRequestModal
        open={activeModal === 'rental'}
        onOpenChange={() => setActiveModal(null)}
        property={property}
      />
      
      <ReservationModal
        open={activeModal === 'reservation'}
        onOpenChange={() => setActiveModal(null)}
        property={property}
      />
      
      <InspectionModal
        open={activeModal === 'inspection'}
        onOpenChange={() => setActiveModal(null)}
        property={property}
      />
      
      <OfferModal
        open={activeModal === 'offer'}
        onOpenChange={() => setActiveModal(null)}
        property={property}
      />
    </div>
  );
}
