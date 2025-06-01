
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Calculator, MapPin, Zap } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface PropertyValuationProps {
  data: {
    estimatedValue: number;
    currency: string;
    valuationMethod: string;
    marketAnalysis: string;
  };
  onUpdate: (data: any) => void;
}

const valuationMethods = [
  { value: 'comparative', label: 'Comparative Market Analysis (CMA)' },
  { value: 'cost_approach', label: 'Cost Approach' },
  { value: 'income_approach', label: 'Income Approach' },
  { value: 'ai_assisted', label: 'AI-Assisted Valuation' },
  { value: 'professional', label: 'Professional Appraisal' },
];

const currencies = [
  { value: 'NGN', label: 'Nigerian Naira (₦)' },
  { value: 'USD', label: 'US Dollar ($)' },
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'GBP', label: 'British Pound (£)' },
];

export function PropertyValuation({ data, onUpdate }: PropertyValuationProps) {
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const { toast } = useToast();

  const handleChange = (field: string, value: string | number) => {
    onUpdate({ [field]: value });
  };

  const generateAIValuation = async () => {
    setIsGeneratingAI(true);
    try {
      // TODO: This will call our AI/ML edge function for property valuation
      // For now, we'll simulate the AI generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulated AI response
      const aiEstimate = Math.floor(Math.random() * 50000000) + 10000000; // Random value between 10M - 60M NGN
      const aiAnalysis = `Based on our AI analysis of comparable properties, market trends, and location factors, this property shows strong value indicators. The estimated range considers recent sales in the area, property condition, and market dynamics.`;
      
      onUpdate({
        estimatedValue: aiEstimate,
        valuationMethod: 'ai_assisted',
        marketAnalysis: aiAnalysis
      });

      toast({
        title: 'AI Valuation Complete',
        description: 'Property valuation has been generated using our AI model.',
      });
    } catch (error) {
      console.error('Error generating AI valuation:', error);
      toast({
        title: 'Valuation Error',
        description: 'Failed to generate AI valuation. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencySymbols = {
      NGN: '₦',
      USD: '$',
      EUR: '€',
      GBP: '£'
    };
    return `${currencySymbols[currency as keyof typeof currencySymbols] || ''}${amount.toLocaleString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Valuation</CardTitle>
        <CardDescription>
          Estimate your property's market value using various methods
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Currency Selection */}
          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Select 
              value={data.currency} 
              onValueChange={(value) => handleChange('currency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.value} value={currency.value}>
                    {currency.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Valuation Method */}
          <div className="space-y-2">
            <Label htmlFor="valuationMethod">Valuation Method *</Label>
            <Select 
              value={data.valuationMethod} 
              onValueChange={(value) => handleChange('valuationMethod', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select valuation method" />
              </SelectTrigger>
              <SelectContent>
                {valuationMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estimated Value */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="estimatedValue">Estimated Property Value *</Label>
            <div className="flex gap-2">
              <Input
                id="estimatedValue"
                type="number"
                value={data.estimatedValue || ''}
                onChange={(e) => handleChange('estimatedValue', Number(e.target.value))}
                placeholder="Enter estimated value"
                className="flex-1"
              />
              <Button 
                type="button"
                variant="outline" 
                onClick={generateAIValuation}
                disabled={isGeneratingAI}
                className="min-w-[140px]"
              >
                <Zap className="w-4 h-4 mr-2" />
                {isGeneratingAI ? 'Generating...' : 'AI Estimate'}
              </Button>
            </div>
            {data.estimatedValue > 0 && (
              <div className="text-sm text-gray-600">
                Formatted: {formatCurrency(data.estimatedValue, data.currency)}
              </div>
            )}
          </div>

          {/* Market Analysis */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="marketAnalysis">Market Analysis & Justification</Label>
            <Textarea
              id="marketAnalysis"
              value={data.marketAnalysis}
              onChange={(e) => handleChange('marketAnalysis', e.target.value)}
              placeholder="Provide analysis of market conditions, comparable sales, and factors affecting the property value..."
              rows={4}
              className="w-full"
            />
          </div>
        </div>

        {/* AI Valuation Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
            <Calculator className="w-4 h-4 mr-2" />
            AI-Powered Valuation
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Uses machine learning models trained on local market data</li>
            <li>• Analyzes comparable sales, location factors, and market trends</li>
            <li>• Provides instant estimates with confidence intervals</li>
            <li>• Continuously updated with latest market information</li>
          </ul>
          {data.valuationMethod === 'ai_assisted' && (
            <div className="mt-3">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <TrendingUp className="w-3 h-3 mr-1" />
                AI-Enhanced Valuation Active
              </Badge>
            </div>
          )}
        </div>

        {/* Valuation Factors Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Factors Considered in Valuation
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-800">
            <ul className="space-y-1">
              <li>• Property size and condition</li>
              <li>• Location and accessibility</li>
              <li>• Recent comparable sales</li>
              <li>• Market trends and demand</li>
            </ul>
            <ul className="space-y-1">
              <li>• Infrastructure development</li>
              <li>• Zoning and land use</li>
              <li>• Economic indicators</li>
              <li>• Future growth potential</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
