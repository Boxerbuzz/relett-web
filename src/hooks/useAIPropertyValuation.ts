
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PropertyData {
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
}

interface AIValuationResult {
  id: string;
  estimatedValue: number;
  confidenceScore: number;
  valuationFactors: Record<string, any>;
  marketComparisons: any[];
}

export function useAIPropertyValuation() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateValuation = async (propertyData: PropertyData, propertyId?: string): Promise<AIValuationResult> => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Call AI valuation edge function
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke(
        'ai-property-valuation',
        {
          body: {
            propertyData,
            propertyId
          }
        }
      );

      if (aiError) throw aiError;

      // Store valuation in database if property ID provided
      if (propertyId) {
        const { data: valuation, error: dbError } = await supabase
          .from('ai_property_valuations')
          .insert({
            property_id: propertyId,
            user_id: user.id,
            ai_estimated_value: aiResponse.estimatedValue,
            confidence_score: aiResponse.confidenceScore,
            valuation_factors: aiResponse.valuationFactors,
            market_comparisons: aiResponse.marketComparisons
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database error:', dbError);
          // Continue without storing in DB for now
        }

        toast({
          title: 'AI Valuation Generated',
          description: `Property valued at $${aiResponse.estimatedValue.toLocaleString()} with ${Math.round(aiResponse.confidenceScore * 100)}% confidence`,
        });

        return {
          id: valuation?.id || crypto.randomUUID(),
          estimatedValue: aiResponse.estimatedValue,
          confidenceScore: aiResponse.confidenceScore,
          valuationFactors: aiResponse.valuationFactors,
          marketComparisons: aiResponse.marketComparisons
        };
      }

      return {
        id: crypto.randomUUID(),
        estimatedValue: aiResponse.estimatedValue,
        confidenceScore: aiResponse.confidenceScore,
        valuationFactors: aiResponse.valuationFactors,
        marketComparisons: aiResponse.marketComparisons
      };

    } catch (error) {
      console.error('AI valuation error:', error);
      toast({
        title: 'Valuation Failed',
        description: error instanceof Error ? error.message : 'Failed to generate AI valuation',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getPropertyValuation = async (propertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_property_valuations')
        .select('*')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get valuation error:', error);
      throw error;
    }
  };

  return {
    generateValuation,
    getPropertyValuation,
    isLoading
  };
}
