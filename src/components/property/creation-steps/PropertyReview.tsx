
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, FileText, MapPin, Upload, DollarSign, Send } from 'lucide-react';

interface PropertyData {
  basicInfo: {
    title: string;
    description: string;
    propertyType: string;
    category: string;
    status: string;
  };
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates: { lat: number; lng: number } | null;
  };
  documents: {
    titleDeed: File | null;
    surveyPlan: File | null;
    taxClearance: File | null;
    other: File[];
  };
  valuation: {
    estimatedValue: number;
    currency: string;
    valuationMethod: string;
    marketAnalysis: string;
  };
}

interface PropertyReviewProps {
  data: PropertyData;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function PropertyReview({ data, onSubmit, isSubmitting }: PropertyReviewProps) {
  const formatCurrency = (amount: number, currency: string) => {
    const currencySymbols = {
      NGN: '₦',
      USD: '$',
      EUR: '€',
      GBP: '£'
    };
    return `${currencySymbols[currency as keyof typeof currencySymbols] || ''}${amount.toLocaleString()}`;
  };

  const getCompletionStatus = () => {
    const checks = [
      { name: 'Basic Information', completed: !!(data.basicInfo.title && data.basicInfo.propertyType && data.basicInfo.category) },
      { name: 'Location Details', completed: !!(data.location.address && data.location.city && data.location.state) },
      { name: 'Required Documents', completed: !!(data.documents.titleDeed && data.documents.surveyPlan) },
      { name: 'Property Valuation', completed: data.valuation.estimatedValue > 0 },
    ];
    
    const completedCount = checks.filter(check => check.completed).length;
    const isComplete = completedCount === checks.length;
    
    return { checks, completedCount, total: checks.length, isComplete };
  };

  const status = getCompletionStatus();

  return (
    <div className="space-y-6">
      {/* Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status.isComplete ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-orange-500" />
            )}
            Property Listing Review
          </CardTitle>
          <CardDescription>
            Review all information before submitting your property for verification
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Completion Status</span>
              <span className="font-medium">
                {status.completedCount}/{status.total} sections completed
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {status.checks.map((check, index) => (
                <div key={index} className="flex items-center gap-2">
                  {check.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                  )}
                  <span className={`text-sm ${check.completed ? 'text-green-700' : 'text-orange-700'}`}>
                    {check.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div><strong>Title:</strong> {data.basicInfo.title || 'Not provided'}</div>
          <div><strong>Property Type:</strong> <Badge variant="outline">{data.basicInfo.propertyType || 'Not selected'}</Badge></div>
          <div><strong>Category:</strong> <Badge variant="secondary">{data.basicInfo.category || 'Not selected'}</Badge></div>
          <div><strong>Status:</strong> <Badge>{data.basicInfo.status}</Badge></div>
          {data.basicInfo.description && (
            <div><strong>Description:</strong> <p className="text-sm text-gray-600 mt-1">{data.basicInfo.description}</p></div>
          )}
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div><strong>Address:</strong> {data.location.address || 'Not provided'}</div>
          <div><strong>City:</strong> {data.location.city || 'Not provided'}</div>
          <div><strong>State:</strong> {data.location.state || 'Not provided'}</div>
          <div><strong>Country:</strong> {data.location.country}</div>
          {data.location.coordinates && (
            <div className="text-sm text-gray-600">
              <strong>GPS Coordinates:</strong> {data.location.coordinates.lat.toFixed(6)}, {data.location.coordinates.lng.toFixed(6)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Title Deed:</strong>
              <div className="text-sm text-gray-600">
                {data.documents.titleDeed ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {data.documents.titleDeed.name}
                  </span>
                ) : (
                  <span className="text-red-600">Not uploaded</span>
                )}
              </div>
            </div>
            <div>
              <strong>Survey Plan:</strong>
              <div className="text-sm text-gray-600">
                {data.documents.surveyPlan ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {data.documents.surveyPlan.name}
                  </span>
                ) : (
                  <span className="text-red-600">Not uploaded</span>
                )}
              </div>
            </div>
            <div>
              <strong>Tax Clearance:</strong>
              <div className="text-sm text-gray-600">
                {data.documents.taxClearance ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    {data.documents.taxClearance.name}
                  </span>
                ) : (
                  <span className="text-orange-600">Optional - Not uploaded</span>
                )}
              </div>
            </div>
            <div>
              <strong>Other Documents:</strong>
              <div className="text-sm text-gray-600">
                {data.documents.other.length > 0 ? (
                  <span className="text-green-600">{data.documents.other.length} additional files</span>
                ) : (
                  <span className="text-gray-500">None</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Valuation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Property Valuation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div><strong>Estimated Value:</strong> {data.valuation.estimatedValue > 0 ? formatCurrency(data.valuation.estimatedValue, data.valuation.currency) : 'Not provided'}</div>
          <div><strong>Currency:</strong> {data.valuation.currency}</div>
          <div><strong>Valuation Method:</strong> <Badge variant="outline">{data.valuation.valuationMethod || 'Not selected'}</Badge></div>
          {data.valuation.marketAnalysis && (
            <div>
              <strong>Market Analysis:</strong>
              <p className="text-sm text-gray-600 mt-1">{data.valuation.marketAnalysis}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submission Actions */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {!status.isComplete && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-orange-900 font-medium">Incomplete Information</h4>
                    <p className="text-orange-800 text-sm mt-1">
                      Please complete all required sections before submitting your property listing.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your property will be submitted for verification</li>
                <li>• Our team will review all documents and information</li>
                <li>• You'll receive updates on the verification progress</li>
                <li>• Once verified, your property will be listed on the marketplace</li>
              </ul>
            </div>

            <Separator />

            <div className="flex justify-center">
              <Button 
                onClick={onSubmit}
                disabled={!status.isComplete || isSubmitting}
                size="lg"
                className="min-w-[200px]"
              >
                <Send className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit Property'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
