
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { InvestNowDialog } from '@/components/dialogs/InvestNowDialog';
import { 
  ArrowLeftIcon,
  MapPinIcon,
  EyeIcon,
  HeartIcon,
  StarIcon,
  CalendarIcon,
  TrendUpIcon,
  ShieldIcon,
  UserIcon
} from '@phosphor-icons/react';

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [property, setProperty] = useState<any>(null);
  const [tokenizedProperty, setTokenizedProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [investDialogOpen, setInvestDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch property details
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select(`
          *,
          property_images (url, is_primary),
          property_reviews (rating, comment, user_name),
          users!properties_user_id_fkey (first_name, last_name, user_type)
        `)
        .eq('id', id)
        .single();

      if (propertyError) throw propertyError;

      setProperty(propertyData);

      // Check if property is tokenized
      if (propertyData.is_tokenized && propertyData.tokenized_property_id) {
        const { data: tokenData, error: tokenError } = await supabase
          .from('tokenized_properties')
          .select('*')
          .eq('id', propertyData.tokenized_property_id)
          .single();

        if (!tokenError && tokenData) {
          setTokenizedProperty(tokenData);
        }
      }

      // Increment view count
      await supabase
        .from('properties')
        .update({ views: (propertyData.views || 0) + 1 })
        .eq('id', id);

    } catch (error) {
      console.error('Error fetching property:', error);
      toast({
        title: 'Error',
        description: 'Failed to load property details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
        <Button onClick={() => navigate('/marketplace')}>
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Back to Properties
        </Button>
      </div>
    );
  }

  const primaryImage = property.property_images?.find((img: any) => img.is_primary)?.url || 
                     property.property_images?.[0]?.url || 
                     property.backdrop;

  const formatPrice = () => {
    if (!property.price?.amount) return 'Price on request';
    const currency = property.price.currency === 'USD' ? '$' : '₦';
    return `${currency}${property.price.amount.toLocaleString()}`;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeftIcon className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Images */}
          <Card>
            {primaryImage ? (
              <div 
                className="h-96 bg-cover bg-center rounded-t-lg"
                style={{ backgroundImage: `url(${primaryImage})` }}
              />
            ) : (
              <div className="h-96 bg-gray-200 rounded-t-lg flex items-center justify-center">
                <MapPinIcon className="h-16 w-16 text-gray-400" />
              </div>
            )}
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">{property.category}</Badge>
                    {property.is_featured && (
                      <Badge className="bg-yellow-500">
                        <StarIcon className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {property.is_tokenized && (
                      <Badge className="bg-purple-500">
                        <TrendUpIcon className="h-3 w-3 mr-1" />
                        Tokenized
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <MapPinIcon className="h-4 w-4" />
                    <span>{property.location?.address || 'Location not specified'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatPrice()}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <EyeIcon className="h-4 w-4" />
                      {property.views || 0}
                    </div>
                    <div className="flex items-center gap-1">
                      <HeartIcon className="h-4 w-4" />
                      {property.likes || 0}
                    </div>
                    {property.ratings && (
                      <div className="flex items-center gap-1">
                        <StarIcon className="h-4 w-4 fill-current text-yellow-500" />
                        {property.ratings.toFixed(1)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Property Description */}
              {property.description && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Property Features */}
              {property.features && property.features.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Features</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature: string, index: number) => (
                      <Badge key={index} variant="outline">{feature}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Property Specifications */}
              {property.specification && (
                <div>
                  <h3 className="font-semibold mb-2">Specifications</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(property.specification).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="text-gray-600 capitalize">{key.replace('_', ' ')}:</span>
                        <span className="ml-2 font-medium">{value as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property Reviews */}
          {property.property_reviews && property.property_reviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {property.property_reviews.map((review: any, index: number) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? 'fill-current text-yellow-500' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{review.user_name}</span>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Info */}
          {property.users && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Property Owner
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                    <UserIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="font-semibold">
                    {property.users.first_name} {property.users.last_name}
                  </h3>
                  <Badge variant="outline" className="mt-1">
                    {property.users.user_type}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Investment Info */}
          {tokenizedProperty && (
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <TrendUpIcon className="h-5 w-5" />
                  Investment Opportunity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Token Symbol</span>
                    <span className="font-medium">{tokenizedProperty.token_symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Token Price</span>
                    <span className="font-medium">${tokenizedProperty.token_price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Expected ROI</span>
                    <Badge className="bg-green-100 text-green-800">
                      {tokenizedProperty.expected_roi}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Min. Investment</span>
                    <span className="font-medium">${tokenizedProperty.minimum_investment.toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  onClick={() => setInvestDialogOpen(true)}
                  className="w-full bg-green-600 hover:bg-green-700"
                  disabled={tokenizedProperty.status !== 'active'}
                >
                  <TrendUpIcon className="mr-2 h-4 w-4" />
                  Invest Now
                </Button>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <ShieldIcon className="h-3 w-3" />
                  <span>Secured by blockchain technology</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Property Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Property Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Listed</span>
                  <span className="text-sm font-medium">
                    {new Date(property.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                    {property.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Property ID</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {property.id.slice(0, 8)}...
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Investment Dialog */}
      {tokenizedProperty && (
        <InvestNowDialog
          open={investDialogOpen}
          onOpenChange={setInvestDialogOpen}
          property={tokenizedProperty}
        />
      )}
    </div>
  );
};

export default PropertyDetails;
