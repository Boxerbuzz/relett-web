import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, TrendingUp, MapPin, DollarSign, AlertCircle } from 'lucide-react';
import { useAIPropertyValuation } from '@/hooks/useAIPropertyValuation';

interface AIValuationWidgetProps {
  propertyData: {
    title: string;
    description: string;
    type: string;
    location: {
      address: string;
      city: string;
      state: string;
      coordinates?: { lat: number; lng: number };
    };
    specification: {
      bedrooms?: number;
      bathrooms?: number;
      sqft?: number;
      yearBuilt?: number;
      propertyCondition?: string;
    };
  };
  propertyId?: string;
  onValuationComplete?: (valuation: any) => void;
}

export function AIValuationWidget({ 
  propertyData, 
  propertyId, 
  onValuationComplete 
}: AIValuationWidgetProps) {
  const [valuation, setValuation] = useState<any>(null);
  const { loading, getValuation } = useAIPropertyValuation();

  const handleGenerateValuation = async () => {
    try {
      const result = await getValuation({
        id: propertyId,
        propertyType: propertyData.type,
        category: propertyData.type,
        location: {
          state: propertyData.location.state,
          city: propertyData.location.city,
          address: propertyData.location.address
        }
      });
      setValuation(result);
      onValuationComplete?.(result);
    } catch (error) {
      console.error('Valuation generation failed:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Property Valuation
        </CardTitle>
        <CardDescription>
          Get an instant AI-powered property valuation based on market data and property features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!valuation ? (
          <div className="text-center py-6">
            {!loading ? (
              <>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Ready to Generate Valuation</h3>
                <p className="text-gray-600 mb-4">
                  Our AI will analyze your property details, location, and market comparisons
                </p>
                <Button 
                  onClick={handleGenerateValuation}
                  className="w-full"
                  disabled={loading}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Generate AI Valuation
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Generating Valuation...</h3>
                  <p className="text-gray-600 mb-4">
                    Analyzing property data and market comparisons
                  </p>
                  <Progress value={75} className="w-full" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Valuation Result */}
            <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="h-6 w-6 text-green-600" />
                <span className="text-3xl font-bold text-gray-900">
                  {formatCurrency(valuation.estimatedValue)}
                </span>
              </div>
              <p className="text-gray-600">Estimated Property Value</p>
              <Badge 
                className={`mt-2 ${getConfidenceColor(valuation.confidenceScore)}`}
                variant="outline"
              >
                {Math.round(valuation.confidenceScore * 100)}% Confidence
              </Badge>
            </div>

            {/* Valuation Factors */}
            {valuation.valuationFactors && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Key Valuation Factors
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(valuation.valuationFactors).map(([factor, impact]: [string, any]) => (
                    <div key={factor} className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium capitalize">
                        {factor.replace(/([A-Z])/g, ' $1').trim()}
                      </div>
                      <div className={`text-sm ${
                        impact > 0 ? 'text-green-600' : impact < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {impact > 0 ? '+' : ''}{typeof impact === 'number' ? `${(impact * 100).toFixed(1)}%` : impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Comparisons */}
            {valuation.marketComparisons && valuation.marketComparisons.length > 0 && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Market Comparisons
                </h4>
                <div className="space-y-2">
                  {valuation.marketComparisons.slice(0, 3).map((comp: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-sm">{comp.address || 'Similar Property'}</div>
                        <div className="text-xs text-gray-600">
                          {comp.distance && `${comp.distance} away • `}
                          {comp.type || 'Similar type'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(comp.price || comp.value)}
                        </div>
                        <div className="text-xs text-gray-600">
                          {comp.pricePerSqft && `$${comp.pricePerSqft}/sqft`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <div className="font-medium">AI Valuation Disclaimer</div>
                  <div className="mt-1">
                    This valuation is generated by AI and should be used as a starting point. 
                    For official valuations, please consult with a certified property appraiser.
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleGenerateValuation}
                disabled={loading}
                className="flex-1"
              >
                Regenerate Valuation
              </Button>
              <Button 
                onClick={() => window.print()}
                variant="outline"
                className="flex-1"
              >
                Save Report
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
