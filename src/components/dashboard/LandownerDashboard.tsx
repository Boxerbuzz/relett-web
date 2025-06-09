
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from './StatsCard';
import { useProperties } from '@/hooks/useProperties';
import { useTokenizedProperties } from '@/hooks/useTokenizedProperties';
import { 
  MapPin, 
  DollarSign, 
  Shield, 
  Coins, 
  Plus,
  FileText,
  TrendingUp,
  Eye,
  Loader2
} from 'lucide-react';

export function LandownerDashboard() {
  const { properties, loading: propertiesLoading } = useProperties();
  const { tokenizedProperties, totalPortfolioValue, totalROI, loading: tokensLoading } = useTokenizedProperties();

  if (propertiesLoading || tokensLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  const verifiedProperties = properties.filter(p => p.is_verified);
  const tokenizedPropertiesCount = properties.filter(p => p.is_tokenized);

  const stats = [
    {
      title: 'Total Properties',
      value: properties.length.toString(),
      icon: <MapPin className="h-4 w-4" />,
      description: `${verifiedProperties.length} verified, ${properties.length - verifiedProperties.length} pending`,
      trend: properties.length > 0 ? { value: 50, isPositive: true } : undefined
    },
    {
      title: 'Verified Properties',
      value: verifiedProperties.length.toString(),
      icon: <Shield className="h-4 w-4" />,
      description: 'Ready for tokenization'
    },
    {
      title: 'Active Tokens',
      value: tokenizedPropertiesCount.length.toString(),
      icon: <Coins className="h-4 w-4" />,
      description: `${tokenizedPropertiesCount.length} tokenized properties`
    },
    {
      title: 'Portfolio Value',
      value: `$${(totalPortfolioValue / 1000).toFixed(1)}K`,
      icon: <DollarSign className="h-4 w-4" />,
      description: 'Based on current market value',
      trend: totalROI > 0 ? { value: totalROI, isPositive: true } : undefined
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your properties and tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Property
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Tokenize Property
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Upload Documents
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Properties Overview */}
      <Card>
        <CardHeader>
          <CardTitle>My Properties</CardTitle>
          <CardDescription>Overview of your property portfolio</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {properties.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="mx-auto h-12 w-12 mb-4" />
                <p>No properties found. Add your first property to get started!</p>
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Property
                </Button>
              </div>
            ) : (
              properties.slice(0, 3).map((property) => (
                <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium">{property.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>Value: {typeof property.price === 'object' ? `$${property.price.amount?.toLocaleString() || 'N/A'}` : property.price}</span>
                      <span>Status: {property.is_verified ? 'Verified' : 'Pending'}</span>
                      {property.is_tokenized && property.tokenized_property && (
                        <span>Tokens: {property.tokenized_property.total_supply}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={property.is_verified ? 'default' : 'secondary'}
                      className={property.is_verified ? 'bg-green-100 text-green-800' : ''}
                    >
                      {property.status}
                    </Badge>
                    {property.is_tokenized && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Tokenized
                      </Badge>
                    )}
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
            <CardDescription>Track your property income</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Dividends Received</span>
                <span className="text-lg font-bold">
                  ${tokenizedProperties.reduce((sum, prop) => sum + prop.total_dividends_received, 0).toLocaleString()}
                </span>
              </div>
              <Progress value={75} className="h-2" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>From {tokenizedProperties.length} investments</span>
                <span>Last month: +15%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Portfolio Performance</CardTitle>
            <CardDescription>Your investment performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall ROI</span>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-bold">+{totalROI.toFixed(1)}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Portfolio Value</span>
                <span className="font-bold text-gray-600">${totalPortfolioValue.toLocaleString()}</span>
              </div>
              <div className="text-sm text-gray-600">
                Strong performance across {tokenizedProperties.length} tokenized investments
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
