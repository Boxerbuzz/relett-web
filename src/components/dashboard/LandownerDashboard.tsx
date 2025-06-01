
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from './StatsCard';
import { 
  MapPin, 
  DollarSign, 
  Shield, 
  Coins, 
  Plus,
  FileText,
  TrendingUp,
  Eye
} from 'lucide-react';

export function LandownerDashboard() {
  const stats = [
    {
      title: 'Total Properties',
      value: '3',
      icon: <MapPin className="h-4 w-4" />,
      description: '2 verified, 1 pending',
      trend: { value: 50, isPositive: true }
    },
    {
      title: 'Verified Properties',
      value: '2',
      icon: <Shield className="h-4 w-4" />,
      description: 'Ready for tokenization'
    },
    {
      title: 'Active Tokens',
      value: '1',
      icon: <Coins className="h-4 w-4" />,
      description: '1 listed for sale'
    },
    {
      title: 'Portfolio Value',
      value: '$2.4M',
      icon: <DollarSign className="h-4 w-4" />,
      description: 'Based on market estimates',
      trend: { value: 12, isPositive: true }
    }
  ];

  const properties = [
    {
      id: '1',
      title: 'Commercial Plot - Victoria Island',
      status: 'verified',
      value: '$850,000',
      tokenized: true,
      tokensIssued: 850,
      verification: 'Completed'
    },
    {
      id: '2',
      title: 'Residential Land - Lekki',
      status: 'verified',
      value: '$1,200,000',
      tokenized: false,
      verification: 'Completed'
    },
    {
      id: '3',
      title: 'Mixed-Use Plot - Ikoyi',
      status: 'pending',
      value: '$420,000',
      tokenized: false,
      verification: 'In Progress (60%)'
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
            {properties.map((property) => (
              <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{property.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span>Value: {property.value}</span>
                    <span>Verification: {property.verification}</span>
                    {property.tokenized && (
                      <span>Tokens: {property.tokensIssued}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={property.status === 'verified' ? 'default' : 'secondary'}
                    className={property.status === 'verified' ? 'bg-green-100 text-green-800' : ''}
                  >
                    {property.status}
                  </Badge>
                  {property.tokenized && (
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
            ))}
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
                <span className="text-sm font-medium">Monthly Revenue</span>
                <span className="text-lg font-bold">$4,200</span>
              </div>
              <Progress value={75} className="h-2" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>Target: $5,600</span>
                <span>75% achieved</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Performance</CardTitle>
            <CardDescription>Your portfolio vs market</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Portfolio Growth</span>
                <div className="flex items-center gap-1 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="font-bold">+12.5%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Market Average</span>
                <span className="font-bold text-gray-600">+8.2%</span>
              </div>
              <div className="text-sm text-gray-600">
                Your portfolio is outperforming the market by 4.3%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
