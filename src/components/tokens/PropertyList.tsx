
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Calendar, MessageSquare, ArrowUpRight } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  location: string;
  totalTokens: number;
  ownedTokens: number;
  tokenPrice: number;
  currentValue: number;
  totalValue: number;
  roi: number;
  investorCount: number;
  hasGroupChat: boolean;
}

interface PropertyListProps {
  properties: Property[];
  onJoinDiscussion: (propertyId: string) => void;
  onViewAnalytics: (propertyId: string) => void;
  onViewPaymentHistory: (propertyId: string) => void;
}

export function PropertyList({ 
  properties, 
  onJoinDiscussion, 
  onViewAnalytics, 
  onViewPaymentHistory 
}: PropertyListProps) {
  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <Card key={property.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{property.title}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  {property.location}
                </CardDescription>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Badge className={property.roi >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                  {property.roi >= 0 ? '+' : ''}{property.roi}% ROI
                </Badge>
                {property.hasGroupChat && (
                  <Badge variant="outline" className="bg-purple-50 text-purple-700">
                    <MessageSquare size={12} className="mr-1" />
                    Chat
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Owned Tokens:</span>
                <p className="font-medium">{property.ownedTokens}/{property.totalTokens}</p>
              </div>
              <div>
                <span className="text-gray-600">Token Price:</span>
                <p className="font-medium">${property.tokenPrice}</p>
              </div>
              <div>
                <span className="text-gray-600">Current Value:</span>
                <p className="font-medium">${property.currentValue}</p>
              </div>
              <div>
                <span className="text-gray-600">Total Value:</span>
                <p className="font-medium text-green-600">${property.totalValue.toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-600">Investors:</span>
                <p className="font-medium">{property.investorCount}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => onViewAnalytics(property.id)}
              >
                <BarChart3 size={16} className="mr-2" />
                Analytics
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => onViewPaymentHistory(property.id)}
              >
                <Calendar size={16} className="mr-2" />
                Payments
              </Button>
              {property.hasGroupChat && (
                <Button 
                  className="flex-1"
                  onClick={() => onJoinDiscussion(property.id)}
                >
                  <MessageSquare size={16} className="mr-2" />
                  Discussion
                </Button>
              )}
              <Button variant="outline" className="flex-1">
                <ArrowUpRight size={16} className="mr-2" />
                Trade
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
