
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  MapPin, 
  Shield, 
  Car, 
  Wifi, 
  GraduationCap, 
  Heart, 
  TrendingUp,
  Leaf,
  Zap,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LocationAnalysisProps {
  propertyId: string;
}

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

export function LocationAnalysis({ propertyId }: LocationAnalysisProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<LocationAnalysisData | null>(null);
  const { toast } = useToast();

  const generateLocationAnalysis = async () => {
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
    } catch (error) {
      console.error('Error generating location analysis:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Failed to generate location analysis. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location Intelligence Analysis
        </CardTitle>
        <CardDescription>
          Get comprehensive insights about the property's location and surroundings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!analysis ? (
          <div className="text-center py-8">
            <Button 
              onClick={generateLocationAnalysis}
              disabled={isLoading}
              size="lg"
              className="min-w-0 w-full sm:min-w-[200px]"
            >
              <Zap className="w-4 h-4 mr-2" />
              {isLoading ? 'Analyzing Location...' : 'Generate Location Analysis'}
            </Button>
            <p className="text-sm text-gray-600 mt-2">
              AI-powered analysis of security, infrastructure, amenities, and investment potential
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Score */}
            {analysis.overallScore && (
              <div className="text-center">
                <div className="inline-flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {analysis.overallScore}/100
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Overall Location Score</div>
                    <div className="text-sm text-gray-600">Based on comprehensive analysis</div>
                  </div>
                </div>
              </div>
            )}

            {/* Summary */}
            {analysis.summary && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{analysis.summary}</p>
                </CardContent>
              </Card>
            )}

            {/* Area Classification */}
            {analysis.areaClassification && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Area Classification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge variant="secondary" className="text-sm">
                      {analysis.areaClassification.type}
                    </Badge>
                    <p className="text-gray-700">{analysis.areaClassification.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {analysis.areaClassification.characteristics?.map((char, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {char}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Assessment */}
            {analysis.securityAssessment && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Security Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysis.securityAssessment.score}/100
                      </div>
                      <Progress 
                        value={analysis.securityAssessment.score} 
                        className="flex-1"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Security Factors</h4>
                        <ul className="text-sm space-y-1">
                          {analysis.securityAssessment.factors?.map((factor, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                              {factor}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Recommendations</h4>
                        <ul className="text-sm space-y-1">
                          {analysis.securityAssessment.recommendations?.map((rec, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <AlertCircle className="w-3 h-3 text-orange-500" />
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transportation */}
            {analysis.transportation && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Car className="w-4 h-4" />
                    Transportation & Traffic
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysis.transportation.score}/100
                      </div>
                      <Progress 
                        value={analysis.transportation.score} 
                        className="flex-1"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Public Transport</div>
                        <div className="text-gray-600">{analysis.transportation.publicTransport}</div>
                      </div>
                      <div>
                        <div className="font-medium">Traffic Condition</div>
                        <div className="text-gray-600">{analysis.transportation.trafficCondition}</div>
                      </div>
                      <div>
                        <div className="font-medium">Infrastructure</div>
                        <div className="text-gray-600">{analysis.transportation.infrastructure}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Infrastructure */}
            {analysis.infrastructure && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Wifi className="w-4 h-4" />
                    Infrastructure & Utilities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Power Supply</div>
                      <div className="text-gray-600">{analysis.infrastructure.powerSupply}</div>
                    </div>
                    <div>
                      <div className="font-medium">Water</div>
                      <div className="text-gray-600">{analysis.infrastructure.water}</div>
                    </div>
                    <div>
                      <div className="font-medium">Internet</div>
                      <div className="text-gray-600">{analysis.infrastructure.internet}</div>
                    </div>
                    <div>
                      <div className="font-medium">Waste Management</div>
                      <div className="text-gray-600">{analysis.infrastructure.waste}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Investment Outlook */}
            {analysis.investmentOutlook && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Investment Outlook
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="font-medium">Appreciation Potential</div>
                      <div className="text-gray-600">{analysis.investmentOutlook.appreciationPotential}</div>
                    </div>
                    <div>
                      <div className="font-medium">Rental Demand</div>
                      <div className="text-gray-600">{analysis.investmentOutlook.rentalDemand}</div>
                    </div>
                    <div>
                      <div className="font-medium">Risk Level</div>
                      <div className="text-gray-600">{analysis.investmentOutlook.riskLevel}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
