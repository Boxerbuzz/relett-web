
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Search, MapPin, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const PropertyVerification = () => {
  const [verificationStep, setVerificationStep] = useState<'input' | 'searching' | 'results'>('input');
  const [propertyData, setPropertyData] = useState({
    address: '',
    city: '',
    state: '',
    country: '',
    propertyId: '',
    description: ''
  });

  const [verificationResults, setVerificationResults] = useState({
    status: 'verified',
    confidence: 95,
    ownershipHistory: [
      {
        owner: 'John Smith',
        period: '2018 - Present',
        type: 'Current Owner',
        verified: true
      },
      {
        owner: 'Sarah Johnson',
        period: '2015 - 2018',
        type: 'Previous Owner',
        verified: true
      },
      {
        owner: 'Michael Brown',
        period: '2010 - 2015',
        type: 'Previous Owner',
        verified: true
      }
    ],
    propertyDetails: {
      size: '2,500 sq ft',
      bedrooms: 4,
      bathrooms: 3,
      yearBuilt: 2010,
      propertyType: 'Single Family Home',
      lastSalePrice: '$450,000',
      lastSaleDate: '2018-03-15'
    },
    documents: [
      { name: 'Property Deed', status: 'verified', date: '2018-03-15' },
      { name: 'Tax Records', status: 'verified', date: '2024-01-01' },
      { name: 'Survey Report', status: 'verified', date: '2018-03-10' },
      { name: 'Title Insurance', status: 'pending', date: '2018-03-15' }
    ]
  });

  const handleVerification = async () => {
    setVerificationStep('searching');
    
    // Simulate API call delay
    setTimeout(() => {
      setVerificationStep('results');
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Property Verification</h1>
        <p className="text-gray-600">Verify property ownership and access detailed property history</p>
      </div>

      {verificationStep === 'input' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Property Information
            </CardTitle>
            <CardDescription>
              Enter the property details you want to verify
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Street Address"
                value={propertyData.address}
                onChange={(e) => setPropertyData(prev => ({ ...prev, address: e.target.value }))}
              />
              <Input
                placeholder="City"
                value={propertyData.city}
                onChange={(e) => setPropertyData(prev => ({ ...prev, city: e.target.value }))}
              />
              <Input
                placeholder="State"
                value={propertyData.state}
                onChange={(e) => setPropertyData(prev => ({ ...prev, state: e.target.value }))}
              />
              <Input
                placeholder="Country"
                value={propertyData.country}
                onChange={(e) => setPropertyData(prev => ({ ...prev, country: e.target.value }))}
              />
            </div>
            
            <Input
              placeholder="Property ID (Optional)"
              value={propertyData.propertyId}
              onChange={(e) => setPropertyData(prev => ({ ...prev, propertyId: e.target.value }))}
            />
            
            <Textarea
              placeholder="Additional property description or notes..."
              value={propertyData.description}
              onChange={(e) => setPropertyData(prev => ({ ...prev, description: e.target.value }))}
            />
            
            <Button 
              onClick={handleVerification}
              className="w-full"
              disabled={!propertyData.address || !propertyData.city}
            >
              <Search className="h-4 w-4 mr-2" />
              Start Verification
            </Button>
          </CardContent>
        </Card>
      )}

      {verificationStep === 'searching' && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Verifying Property</h3>
            <p className="text-gray-600">Searching public records and databases...</p>
          </CardContent>
        </Card>
      )}

      {verificationStep === 'results' && (
        <div className="space-y-6">
          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Verification Complete
                </span>
                <Badge className={getStatusColor(verificationResults.status)}>
                  {verificationResults.confidence}% Confidence
                </Badge>
              </CardTitle>
              <CardDescription>
                Property verification completed successfully
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Address:</span>
                  <p className="font-medium">{propertyData.address}, {propertyData.city}</p>
                </div>
                <div>
                  <span className="text-gray-600">Property Type:</span>
                  <p className="font-medium">{verificationResults.propertyDetails.propertyType}</p>
                </div>
                <div>
                  <span className="text-gray-600">Current Owner:</span>
                  <p className="font-medium">{verificationResults.ownershipHistory[0].owner}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Size:</span>
                  <p className="font-medium">{verificationResults.propertyDetails.size}</p>
                </div>
                <div>
                  <span className="text-gray-600">Bedrooms:</span>
                  <p className="font-medium">{verificationResults.propertyDetails.bedrooms}</p>
                </div>
                <div>
                  <span className="text-gray-600">Bathrooms:</span>
                  <p className="font-medium">{verificationResults.propertyDetails.bathrooms}</p>
                </div>
                <div>
                  <span className="text-gray-600">Year Built:</span>
                  <p className="font-medium">{verificationResults.propertyDetails.yearBuilt}</p>
                </div>
                <div>
                  <span className="text-gray-600">Last Sale:</span>
                  <p className="font-medium">{verificationResults.propertyDetails.lastSalePrice}</p>
                </div>
                <div>
                  <span className="text-gray-600">Sale Date:</span>
                  <p className="font-medium">{verificationResults.propertyDetails.lastSaleDate}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ownership History */}
          <Card>
            <CardHeader>
              <CardTitle>Ownership History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {verificationResults.ownershipHistory.map((record, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">{record.owner}</p>
                        <p className="text-sm text-gray-600">{record.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{record.period}</p>
                      <Badge className={getStatusColor('verified')}>Verified</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Verified Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {verificationResults.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium">{doc.name}</p>
                        <p className="text-sm text-gray-600">{doc.date}</p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(doc.status)}>
                      {doc.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={() => setVerificationStep('input')} variant="outline">
              Verify Another Property
            </Button>
            <Button>
              Download Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyVerification;
