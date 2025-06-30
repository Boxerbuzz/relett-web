
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAIPropertyValuation } from '@/hooks/useAIPropertyValuation';
import { Brain, TrendingUp, MapPin, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface AIPropertyValuationProps {
  property: {
    id: string;
    type: string;
    category: string;
    location?: any;
  };
}

export function AIPropertyValuation({ property }: AIPropertyValuationProps) {
  const { loading, valuation, getValuation } = useAIPropertyValuation();
  const [hasRequested, setHasRequested] = useState(false);

  const handleGetValuation = async () => {
    setHasRequested(true);
    await getValuation({
      id: property.id,
      propertyType: property.type,
      category: property.category,
      location: {
        state: typeof property.location === 'object' && property.location?.state ? property.location.state : '',
        city: typeof property.location === 'object' && property.location?.city ? property.location.city : '',
        address: typeof property.location === 'object' && property.location?.address ? property.location.address : ''
      }
    });
  };

  if (!hasRequested) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            AI Property Valuation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Get an AI-powered property valuation based on market data, comparable properties, and current trends.
          </p>
          <Button 
            onClick={handleGetValuation}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Analyzing...' : 'Get AI Valuation'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!valuation) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          AI Property Valuation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estimated Value */}
        <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <h3 className="text-2xl font-bold text-purple-700">
            {formatCurrency(valuation.estimatedValue, valuation.currency)}
          </h3>
          <p className="text-sm text-gray-600">Estimated Market Value</p>
          <Badge className="mt-2" variant={valuation.confidenceScore > 80 ? 'default' : 'secondary'}>
            {valuation.confidenceScore}% Confidence
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>{valuation.comparableCount} Comparables</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-blue-500" />
            <span>{valuation.valuationMethod}</span>
          </div>
        </div>

        {/* Key Factors */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Key Valuation Factors</h4>
          <div className="flex flex-wrap gap-1">
            {valuation.keyFactors.map((factor, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {factor}
              </Badge>
            ))}
          </div>
        </div>

        {/* Market Analysis */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Market Analysis</h4>
          <p className="text-sm text-gray-600">{valuation.marketAnalysis}</p>
        </div>

        {/* Market Trends */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Market Trends</h4>
          <p className="text-sm text-gray-600">{valuation.marketTrends}</p>
        </div>

        {/* Metadata */}
        <div className="pt-2 border-t text-xs text-gray-500 flex items-center gap-2">
          <Clock className="h-3 w-3" />
          <span>
            Analyzed by {valuation.metadata.aiModel} • 
            {new Date(valuation.metadata.analysisTimestamp).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
