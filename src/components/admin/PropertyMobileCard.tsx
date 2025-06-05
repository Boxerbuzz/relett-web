
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, CheckCircle, XCircle } from 'lucide-react';
import { Json } from '@/types/database';

interface Property {
  id: string;
  title: string | null;
  type: string;
  category: string;
  status: string;
  is_verified: boolean | null;
  created_at: string;
  user_id: string;
  users?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  price: Json;
  location: Json;
}

interface PropertyMobileCardProps {
  property: Property;
  onUpdateStatus: (propertyId: string, isVerified: boolean) => void;
}

export function PropertyMobileCard({ property, onUpdateStatus }: PropertyMobileCardProps) {
  const getStatusBadge = (property: Property) => {
    if (property.is_verified) {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
    }
    if (property.status === 'active') {
      return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
    }
    if (property.status === 'pending') {
      return <Badge variant="secondary">Pending</Badge>;
    }
    return <Badge variant="outline">Draft</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const typeColors = {
      residential: 'bg-blue-100 text-blue-800',
      commercial: 'bg-purple-100 text-purple-800',
      industrial: 'bg-gray-100 text-gray-800',
      land: 'bg-green-100 text-green-800'
    };
    
    return (
      <Badge className={typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800'}>
        {type}
      </Badge>
    );
  };

  const formatPrice = (price: Json) => {
    if (!price || typeof price !== 'object') return 'N/A';
    const priceObj = price as any;
    if (!priceObj.amount) return 'N/A';
    return `${priceObj.currency || '₦'}${priceObj.amount.toLocaleString()}`;
  };

  const getLocationCity = (location: Json) => {
    if (!location || typeof location !== 'object') return 'Location not specified';
    const locationObj = location as any;
    return locationObj.city || 'Location not specified';
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium truncate">{property.title || 'Untitled Property'}</h3>
              <p className="text-sm text-gray-500 truncate">{getLocationCity(property.location)}</p>
            </div>
            <div className="flex gap-1 flex-shrink-0">
              {getTypeBadge(property.type)}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500">Owner</div>
              <div className="text-sm font-medium truncate">
                {property.users?.first_name} {property.users?.last_name}
              </div>
              <div className="text-xs text-gray-500 truncate">{property.users?.email}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Price</div>
              <div className="text-sm font-medium truncate">{formatPrice(property.price)}</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Status</div>
              {getStatusBadge(property)}
            </div>
            <div>
              <div className="text-xs text-gray-500">Created</div>
              <div className="text-sm">{new Date(property.created_at).toLocaleDateString()}</div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button size="sm" variant="outline" className="flex-shrink-0">
              <Eye className="h-4 w-4" />
            </Button>
            {!property.is_verified && (
              <>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 flex-1"
                  onClick={() => onUpdateStatus(property.id, true)}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Verify
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onUpdateStatus(property.id, false)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
