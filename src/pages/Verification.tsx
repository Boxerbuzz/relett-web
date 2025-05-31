
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MagnifyingGlass, CheckCircle, XCircle, Clock, FileText, MapPin, Camera } from 'phosphor-react';

const pendingVerifications = [
  {
    id: 1,
    propertyTitle: 'Downtown Commercial Plot',
    owner: 'John Doe',
    location: 'Lagos, Nigeria',
    size: '2.5 acres',
    submittedDate: '2024-01-15',
    documents: ['Title Deed', 'Survey Plan', 'Tax Certificate'],
    status: 'pending',
    priority: 'high'
  },
  {
    id: 2,
    propertyTitle: 'Residential Land Parcel',
    owner: 'Jane Smith',
    location: 'Abuja, Nigeria',
    size: '1.8 acres',
    submittedDate: '2024-01-14',
    documents: ['Title Deed', 'Survey Plan'],
    status: 'under_review',
    priority: 'medium'
  },
  {
    id: 3,
    propertyTitle: 'Agricultural Investment Land',
    owner: 'Mike Johnson',
    location: 'Kano, Nigeria',
    size: '5.2 acres',
    submittedDate: '2024-01-13',
    documents: ['Title Deed', 'Survey Plan', 'Environmental Clearance'],
    status: 'pending',
    priority: 'low'
  }
];

const Verification = () => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Property Verification</h1>
        <p className="text-gray-600">Review and verify property submissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-orange-600">12</p>
              </div>
              <Clock size={24} className="text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Under Review</p>
                <p className="text-2xl font-bold text-blue-600">5</p>
              </div>
              <FileText size={24} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Approved Today</p>
                <p className="text-2xl font-bold text-green-600">8</p>
              </div>
              <CheckCircle size={24} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">2</p>
              </div>
              <XCircle size={24} className="text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlass size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by property name, owner, or location..."
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              <Select>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Queue */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="under_review">Under Review</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingVerifications.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{property.propertyTitle}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin size={14} className="mr-1" />
                      {property.location}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(property.priority)}>
                      {property.priority} priority
                    </Badge>
                    <Badge className={getStatusColor(property.status)}>
                      {property.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Owner:</span>
                    <p className="font-medium">{property.owner}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Size:</span>
                    <p className="font-medium">{property.size}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Submitted:</span>
                    <p className="font-medium">{property.submittedDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Documents:</span>
                    <p className="font-medium">{property.documents.length} files</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {property.documents.map((doc, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      <FileText size={12} className="mr-1" />
                      {doc}
                    </Badge>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button className="flex-1">
                    <FileText size={16} className="mr-2" />
                    Review Details
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Camera size={16} className="mr-2" />
                    View Documents
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MapPin size={16} className="mr-2" />
                    View on Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="under_review">
          <Card>
            <CardContent className="p-8 text-center">
              <Clock size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties under review</h3>
              <p className="text-gray-600">Properties you're actively reviewing will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardContent className="p-8 text-center">
              <CheckCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No completed verifications</h3>
              <p className="text-gray-600">Recently completed property verifications will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Verification;
