
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeftIcon, StarIcon, PhoneIcon, EnvelopeIcon } from '@phosphor-icons/react';

interface ServiceProvider {
  id: string;
  business_name: string;
  description: string;
  contact_phone: string;
  contact_email: string;
  rating: number;
  review_count: number;
  years_experience: number;
  is_verified: boolean;
  services_offered: string[];
  location: any;
  user: {
    first_name: string;
    last_name: string;
    avatar: string;
  };
}

const categoryInfo = {
  'movers': {
    name: 'Movers & Packers',
    description: 'Professional moving and packing services for your relocation needs'
  },
  'decorators': {
    name: 'Interior Decorators', 
    description: 'Transform your space with expert interior design and decoration'
  },
  'cleaners': {
    name: 'Cleaning Services',
    description: 'Professional cleaning for homes, offices, and post-construction sites'
  },
  'electricians': {
    name: 'Electricians',
    description: 'Licensed electrical services for installation, repair, and maintenance'
  },
  'surveyors': {
    name: 'Land Surveyors',
    description: 'Professional surveying services for property measurement and mapping'
  },
  'maintenance': {
    name: 'General Maintenance',
    description: 'Comprehensive property maintenance and repair services'
  }
};

export default function ServiceCategory() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoading(true);
      try {
        // For now, use mock data since service_providers may not have real data yet
        // This will be replaced with real data once the table is populated
        const mockProviders = [
          {
            id: '1',
            business_name: 'Swift Movers Lagos',
            description: 'Professional moving services with over 10 years of experience',
            contact_phone: '+234 801 234 5678',
            contact_email: 'info@swiftmovers.ng',
            rating: 4.8,
            review_count: 156,
            years_experience: 10,
            is_verified: true,
            services_offered: ['Residential Moving', 'Commercial Moving'],
            location: { city: 'Lagos', state: 'Lagos' },
            user: { first_name: 'Ahmed', last_name: 'Ibrahim', avatar: '' }
          }
        ];

        const filteredProviders = mockProviders.filter(provider => {
          if (categoryId === 'movers') return provider.business_name.toLowerCase().includes('movers');
          if (categoryId === 'decorators') return provider.business_name.toLowerCase().includes('interior');
          return false;
        });

        setProviders(filteredProviders);
      } catch (error) {
        console.error('Error fetching service providers:', error);
        setProviders([]);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchProviders();
    }
  }, [categoryId]);

  const category = categoryInfo[categoryId as keyof typeof categoryInfo];

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <Link to="/services">
            <Button>Back to Services</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Link to="/services">
              <Button variant="ghost" size="sm" className="mr-4">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Services
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
          <p className="text-lg text-gray-600">{category.description}</p>
        </div>

        {/* Providers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : providers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No providers available</h3>
            <p className="text-gray-600">We're working on adding verified providers in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProviderCard({ provider }: { provider: ServiceProvider }) {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={provider.user?.avatar || undefined} />
              <AvatarFallback>
                {provider.user?.first_name?.[0]}{provider.user?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{provider.business_name}</CardTitle>
              <p className="text-sm text-gray-600">
                {provider.user?.first_name} {provider.user?.last_name}
              </p>
            </div>
          </div>
          {provider.is_verified && (
            <Badge className="bg-green-100 text-green-800">Verified</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 mb-4 line-clamp-3">{provider.description}</p>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center">
            <StarIcon className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm font-medium">{provider.rating}</span>
            <span className="ml-1 text-sm text-gray-500">({provider.review_count})</span>
          </div>
          <div className="text-sm text-gray-600">
            {provider.years_experience} years exp.
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {provider.contact_phone && (
            <div className="flex items-center text-sm text-gray-600">
              <PhoneIcon className="h-4 w-4 mr-2" />
              {provider.contact_phone}
            </div>
          )}
          {provider.contact_email && (
            <div className="flex items-center text-sm text-gray-600">
              <EnvelopeIcon className="h-4 w-4 mr-2" />
              {provider.contact_email}
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {provider.services_offered?.slice(0, 3).map((service, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {service}
            </Badge>
          ))}
          {provider.services_offered?.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{provider.services_offered.length - 3} more
            </Badge>
          )}
        </div>

        <div className="flex space-x-2">
          <Button className="flex-1">Contact</Button>
          <Button variant="outline" className="flex-1">View Profile</Button>
        </div>
      </CardContent>
    </Card>
  );
}
