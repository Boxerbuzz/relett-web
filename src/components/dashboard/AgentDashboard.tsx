
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatsCard } from './StatsCard';
import { 
  Users, 
  Home, 
  DollarSign, 
  TrendingUp,
  Plus,
  Phone,
  Mail,
  Eye,
  MessageSquare
} from 'lucide-react';

export function AgentDashboard() {
  const stats = [
    {
      title: 'Active Clients',
      value: '12',
      icon: <Users className="h-4 w-4" />,
      description: '3 new this week',
      trend: { value: 25, isPositive: true }
    },
    {
      title: 'Listed Properties',
      value: '8',
      icon: <Home className="h-4 w-4" />,
      description: '2 pending approval'
    },
    {
      title: 'Total Commission',
      value: '$15,750',
      icon: <DollarSign className="h-4 w-4" />,
      description: 'This month',
      trend: { value: 12, isPositive: true }
    },
    {
      title: 'Conversion Rate',
      value: '18.5%',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Above average',
      trend: { value: 5, isPositive: true }
    }
  ];

  const recentClients = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+234 801 234 5678',
      interest: 'Commercial Property',
      budget: '$500K - $1M',
      status: 'hot',
      lastContact: '2 hours ago'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+234 802 345 6789',
      interest: 'Residential Land',
      budget: '$200K - $500K',
      status: 'warm',
      lastContact: '1 day ago'
    },
    {
      id: '3',
      name: 'Amanda Williams',
      email: 'amanda.w@email.com',
      phone: '+234 803 456 7890',
      interest: 'Investment Property',
      budget: '$1M+',
      status: 'cold',
      lastContact: '1 week ago'
    }
  ];

  const activeListings = [
    {
      id: '1',
      title: 'Luxury Villa - Banana Island',
      price: '$2,500,000',
      status: 'active',
      views: 245,
      inquiries: 12,
      daysListed: 15
    },
    {
      id: '2',
      title: 'Commercial Plot - VI',
      price: '$850,000',
      status: 'pending',
      views: 89,
      inquiries: 5,
      daysListed: 3
    },
    {
      id: '3',
      title: 'Residential Land - Lekki',
      price: '$420,000',
      status: 'active',
      views: 156,
      inquiries: 8,
      daysListed: 22
    }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your listings and clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Listing
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Add Client
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Messages
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analytics
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Clients</CardTitle>
            <CardDescription>Your latest client interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentClients.map((client) => (
                <div key={client.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium">{client.name}</h3>
                    <Badge 
                      variant={client.status === 'hot' ? 'destructive' : client.status === 'warm' ? 'default' : 'secondary'}
                    >
                      {client.status}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Interest: {client.interest}</p>
                    <p>Budget: {client.budget}</p>
                    <p>Last contact: {client.lastContact}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                    <Button size="sm" variant="outline">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Listings */}
        <Card>
          <CardHeader>
            <CardTitle>Active Listings</CardTitle>
            <CardDescription>Your property listings performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeListings.map((listing) => (
                <div key={listing.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm">{listing.title}</h3>
                    <Badge 
                      variant={listing.status === 'active' ? 'default' : 'secondary'}
                      className={listing.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                    >
                      {listing.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-green-600">{listing.price}</span>
                    <span className="text-sm text-gray-600">{listing.daysListed} days</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {listing.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {listing.inquiries}
                    </span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full">
                    Manage Listing
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Target</CardTitle>
            <CardDescription>Commission goal progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Target: $20,000</span>
                <span className="text-lg font-bold">$15,750</span>
              </div>
              <Progress value={78.75} className="h-2" />
              <div className="flex justify-between text-sm text-gray-600">
                <span>78.75% achieved</span>
                <span>$4,250 remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Client Pipeline</CardTitle>
            <CardDescription>Lead conversion status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Hot Leads</span>
                <Badge variant="destructive">4</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Warm Leads</span>
                <Badge variant="default">8</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Cold Leads</span>
                <Badge variant="secondary">15</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>This Week</CardTitle>
            <CardDescription>Weekly activity summary</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">New Listings</span>
                <span className="font-medium">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Client Meetings</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Property Views</span>
                <span className="font-medium">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Inquiries</span>
                <span className="font-medium">23</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
