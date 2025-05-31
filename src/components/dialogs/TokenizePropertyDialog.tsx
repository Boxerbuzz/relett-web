
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Coins, FileText, Calculator, Eye } from 'lucide-react';

interface TokenizePropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: {
    id: string;
    title: string;
    value: string;
    location: string;
    image: string;
  };
}

export function TokenizePropertyDialog({ open, onOpenChange, property }: TokenizePropertyDialogProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    totalTokens: '100000',
    pricePerToken: '25',
    minimumInvestment: '100',
    expectedROI: '12.5',
    distributionFrequency: 'quarterly',
    lockupPeriod: '12',
    description: '',
    riskLevel: 'medium'
  });

  const steps = [
    { title: 'Token Configuration', icon: Coins },
    { title: 'Financial Terms', icon: Calculator },
    { title: 'Legal & Documentation', icon: FileText },
    { title: 'Review & Submit', icon: Eye }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(Math.min(step + 1, 4));
  const prevStep = () => setStep(Math.max(step - 1, 1));

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalTokens">Total Tokens</Label>
                <Input
                  id="totalTokens"
                  type="number"
                  value={formData.totalTokens}
                  onChange={(e) => handleInputChange('totalTokens', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="pricePerToken">Price per Token (USD)</Label>
                <Input
                  id="pricePerToken"
                  type="number"
                  step="0.01"
                  value={formData.pricePerToken}
                  onChange={(e) => handleInputChange('pricePerToken', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="minimumInvestment">Minimum Investment (USD)</Label>
              <Input
                id="minimumInvestment"
                type="number"
                value={formData.minimumInvestment}
                onChange={(e) => handleInputChange('minimumInvestment', e.target.value)}
              />
            </div>

            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Value:</p>
                    <p className="font-semibold">
                      ${(parseInt(formData.totalTokens) * parseFloat(formData.pricePerToken)).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Min. Tokens:</p>
                    <p className="font-semibold">
                      {Math.ceil(parseFloat(formData.minimumInvestment) / parseFloat(formData.pricePerToken))} tokens
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expectedROI">Expected ROI (%)</Label>
                <Input
                  id="expectedROI"
                  type="number"
                  step="0.1"
                  value={formData.expectedROI}
                  onChange={(e) => handleInputChange('expectedROI', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="lockupPeriod">Lock-up Period (months)</Label>
                <Input
                  id="lockupPeriod"
                  type="number"
                  value={formData.lockupPeriod}
                  onChange={(e) => handleInputChange('lockupPeriod', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="distributionFrequency">Distribution Frequency</Label>
              <Select 
                value={formData.distributionFrequency} 
                onValueChange={(value) => handleInputChange('distributionFrequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="semi-annually">Semi-Annually</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="riskLevel">Risk Level</Label>
              <Select 
                value={formData.riskLevel} 
                onValueChange={(value) => handleInputChange('riskLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Investment Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the investment opportunity, property details, and expected returns..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Required Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  'Property Valuation Report',
                  'Legal Title Documents',
                  'Property Survey',
                  'Insurance Documents',
                  'Financial Projections',
                  'Legal Opinion Letter'
                ].map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm">{doc}</span>
                    <Badge variant="outline">Required</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tokenization Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Tokens:</p>
                    <p className="font-semibold">{formData.totalTokens}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Price per Token:</p>
                    <p className="font-semibold">${formData.pricePerToken}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expected ROI:</p>
                    <p className="font-semibold">{formData.expectedROI}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Lock-up Period:</p>
                    <p className="font-semibold">{formData.lockupPeriod} months</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Once submitted, your property will go through a verification process 
                that typically takes 5-7 business days. You'll be notified of any additional requirements.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins size={20} />
            Tokenize Property
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Info */}
          {property && (
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">{property.title}</h3>
                    <p className="text-sm text-gray-600">{property.location}</p>
                    <p className="text-sm font-medium">{property.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              {steps.map((stepInfo, index) => {
                const IconComponent = stepInfo.icon;
                return (
                  <div key={index} className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index + 1 <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      <IconComponent size={16} />
                    </div>
                    <span className="text-xs text-center">{stepInfo.title}</span>
                  </div>
                );
              })}
            </div>
            <Progress value={(step / 4) * 100} className="w-full" />
          </div>

          {/* Step Content */}
          <div className="min-h-[300px]">
            {renderStep()}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={step === 1 ? () => onOpenChange(false) : prevStep}
            >
              {step === 1 ? 'Cancel' : 'Previous'}
            </Button>
            
            {step === 4 ? (
              <Button>
                Submit for Review
              </Button>
            ) : (
              <Button onClick={nextStep}>
                Next
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
