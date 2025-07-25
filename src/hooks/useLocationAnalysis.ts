
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LocationAnalysisData {
  areaClassification?: {
    type: string;
    description: string;
    characteristics: string[];
  };
  securityAssessment?: {
    score: number;
    factors: string[];
    recommendations: string[];
  };
  transportation?: {
    score: number;
    publicTransport: string;
    trafficCondition: string;
    infrastructure: string;
  };
  infrastructure?: {
    powerSupply: string;
    water: string;
    internet: string;
    waste: string;
  };
  amenities?: {
    education: string;
    healthcare: string;
    shopping: string;
    entertainment: string;
  };
  economicFactors?: {
    employmentScore: number;
    incomeLevel: string;
    commercialActivity: string;
  };
  futureDevelopment?: {
    growthPotential: string;
    plannedProjects: string[];
    outlook: string;
  };
  environmental?: {
    airQuality: string;
    noiseLevel: string;
    greenSpaces: string;
    floodRisk: string;
  };
  investmentOutlook?: {
    appreciationPotential: string;
    rentalDemand: string;
    riskLevel: string;
  };
  overallScore?: number;
  summary?: string;
}

export function useLocationAnalysis() {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<LocationAnalysisData | null>(null);
  const { toast } = useToast();

  const generateLocationAnalysis = async (propertyId: string) => {
    setIsLoading(true);
    try {
      const { data: functionResponse, error } = await supabase.functions.invoke('ai-location-analysis', {
        body: { propertyId }
      });

      if (error) {
        console.error('Location analysis error:', error);
        throw new Error('Failed to generate location analysis');
      }

      setAnalysis(functionResponse.analysis);
      
      toast({
        title: 'Location Analysis Complete',
        description: 'Comprehensive location intelligence generated successfully.',
      });

      return functionResponse.analysis;
    } catch (error) {
      console.error('Error generating location analysis:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to generate location analysis. Please try again.',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearAnalysis = () => {
    setAnalysis(null);
  };

  return {
    generateLocationAnalysis,
    clearAnalysis,
    analysis,
    isLoading
  };
}
