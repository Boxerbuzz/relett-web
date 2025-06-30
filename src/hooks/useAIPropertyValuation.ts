
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PropertyValuationRequest {
  propertyData: {
    id?: string;
    propertyType: string;
    category: string;
    location?: {
      state?: string;
      city?: string;
      address?: string;
    };
  };
}

interface PropertyValuationResponse {
  estimatedValue: number;
  currency: string;
  valuationMethod: string;
  marketAnalysis: string;
  confidenceScore: number;
  comparableCount: number;
  keyFactors: string[];
  marketTrends: string;
  metadata: {
    aiModel: string;
    analysisTimestamp: string;
    dataPoints: {
      comparables: number;
      marketMetrics: number;
    };
  };
}

export function useAIPropertyValuation() {
  const [loading, setLoading] = useState(false);
  const [valuation, setValuation] = useState<PropertyValuationResponse | null>(null);
  const { toast } = useToast();

  const getValuation = async (propertyData: PropertyValuationRequest['propertyData']) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-property-valuation', {
        body: { propertyData }
      });

      if (error) throw error;

      setValuation(data);

      // Store valuation in database
      if (propertyData.id) {
        await supabase
          .from('ai_property_valuations')
          .insert({
            property_id: propertyData.id,
            user_id: (await supabase.auth.getUser()).data.user?.id,
            ai_estimated_value: data.estimatedValue,
            confidence_score: data.confidenceScore,
            valuation_factors: data.keyFactors,
            market_comparisons: data.metadata
          });
      }

      return data;
    } catch (error) {
      console.error('Error getting AI valuation:', error);
      toast({
        title: 'Valuation Error',
        description: 'Failed to get AI property valuation',
        variant: 'destructive'
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    valuation,
    getValuation
  };
}
