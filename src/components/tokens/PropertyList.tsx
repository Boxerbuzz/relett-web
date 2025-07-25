
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  MessageSquare, 
  BarChart3, 
  History,
  MapPin,
  Coins,
  ArrowUpDown
} from 'lucide-react';
import { EnhancedTradeDialog } from './EnhancedTradeDialog';
import { TokenProperty } from '@/types/tokens';

interface PropertyListProps {
  properties: TokenProperty[];
  onJoinDiscussion: (propertyId: string) => void;
  onViewAnalytics: (propertyId: string) => void;
  onViewPaymentHistory: (propertyId: string) => void;
  onRefreshData?: () => void;
}

export function PropertyList({ 
  properties, 
  onJoinDiscussion, 
  onViewAnalytics, 
  onViewPaymentHistory,
  onRefreshData 
}: PropertyListProps) {
  const [selectedProperty, setSelectedProperty] = useState<TokenProperty | null>(null);
  const [showTradeDialog, setShowTradeDialog] = useState(false);

  const handleTrade = (property: TokenProperty) => {
    setSelectedProperty(property);
    setShowTradeDialog(true);
  };

  const handleTradeComplete = () => {
    // Refresh the data when trade is completed
    onRefreshData?.();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Your Properties</h2>
        <Badge variant="outline" className="text-sm">
          {properties.length} Properties
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {properties.map((property) => {
          const ownershipPercentage = (property.ownedTokens / property.totalTokens) * 100;
          
          return (
            <Card key={property.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1 min-w-0">
                    <CardTitle className="text-lg leading-tight">{property.title}</CardTitle>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{property.location}</span>
                    </div>
                  </div>
                  <Badge 
                    variant={property.roi >= 0 ? 'default' : 'destructive'}
                    className="ml-2 flex-shrink-0"
                  >
                    {property.roi >= 0 ? '+' : ''}{property.roi.toFixed(1)}%
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Your Tokens</p>
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold">{property.ownedTokens}</span>
                      <span className="text-sm text-gray-500">/ {property.totalTokens}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">Current Value</p>
                    <p className="font-semibold text-lg">${property.totalValue.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ownership</span>
                    <span className="font-medium">{ownershipPercentage.toFixed(1)}%</span>
                  </div>
                  <Progress value={ownershipPercentage} className="h-2" />
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleTrade(property)}
                      className="flex items-center gap-2"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                      Trade
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onViewPaymentHistory(property.id)}
                      className="flex items-center gap-2"
                    >
                      <History className="w-4 h-4" />
                      Payments
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onViewAnalytics(property.id)}
                      className="flex items-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      Analytics
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onJoinDiscussion(property.id)}
                      disabled={!property.hasGroupChat}
                      className="flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Discussion
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedProperty && (
        <EnhancedTradeDialog
          isOpen={showTradeDialog}
          onClose={() => {
            setShowTradeDialog(false);
            setSelectedProperty(null);
          }}
          property={selectedProperty}
          onTradeComplete={handleTradeComplete}
        />
      )}
    </div>
  );
}
