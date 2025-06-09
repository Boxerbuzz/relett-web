
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, TrendingUp, Eye, Heart } from 'lucide-react';

interface PropertyCardProps {
  id: string;
  title: string;
  location: any;
  price: any;
  tokenPrice?: number;
  totalTokens?: number;
  availableTokens?: number;
  expectedROI?: number;
  investorCount?: number;
  imageUrl?: string;
  isVerified: boolean;
  views: number;
  isTokenized: boolean;
  onViewDetails: (id: string) => void;
  onInvest?: (id: string) => void;
}

export function PropertyCard({
  id,
  title,
  location,
  price,
  tokenPrice,
  totalTokens,
  availableTokens,
  expectedROI,
  investorCount = 0,
  imageUrl,
  isVerified,
  views,
  isTokenized,
  onViewDetails,
  onInvest
}: PropertyCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getLocationString = () => {
    if (typeof location === 'object' && location !== null) {
      return location.address || location.city || 'Location not specified';
    }
    return location || 'Location not specified';
  };

  const getPriceAmount = () => {
    if (typeof price === 'object' && price !== null) {
      return price.amount || 0;
    }
    return price || 0;
  };

  const progressPercentage = totalTokens && availableTokens 
    ? ((totalTokens - availableTokens) / totalTokens) * 100 
    : 0;

  const fallbackImage = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop';

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 group">
      <div className="relative">
        <img 
          src={imageUrl || fallbackImage} 
          alt={title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {isVerified && (
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              Verified
            </Badge>
          )}
          {isTokenized && totalTokens && (
            <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
              {Math.round(progressPercentage)}% Funded
            </Badge>
          )}
        </div>
        <div className="absolute top-3 right-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
            <Heart className="h-4 w-4 text-gray-600 hover:text-red-500 cursor-pointer transition-colors" />
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-lg mb-1 line-clamp-1">{title}</h3>
          <div className="flex items-center text-sm text-gray-600 mb-2">
            <MapPin className="h-4 w-4 mr-1" />
            {getLocationString()}
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(getPriceAmount())}</p>
        </div>

        {isTokenized && tokenPrice && expectedROI && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Token Price</p>
              <p className="font-semibold">${tokenPrice}</p>
            </div>
            <div>
              <p className="text-gray-600">Expected ROI</p>
              <div className="flex items-center">
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                <span className="font-semibold text-green-600">{expectedROI}%</span>
              </div>
            </div>
          </div>
        )}

        {isTokenized && totalTokens && availableTokens && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">{totalTokens - availableTokens} / {totalTokens} tokens</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4 text-xs text-gray-500">
            {investorCount > 0 && (
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                {investorCount} investors
              </div>
            )}
            <div className="flex items-center">
              <Eye className="h-3 w-3 mr-1" />
              {views || 0} views
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onViewDetails(id)}
          >
            View Details
          </Button>
          {isTokenized && onInvest && (
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onInvest(id)}
              disabled={availableTokens === 0}
            >
              {availableTokens === 0 ? 'Sold Out' : 'Invest Now'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
