
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentChat } from '@/components/agents/AgentChat';
import { ArrowLeft, Brain } from 'lucide-react';

interface AIAssistantViewProps {
  userId: string;
  selectedPropertyId: string | null;
  totalPortfolioValue: number;
  totalROI: number;
  propertyCount: number;
  onBack: () => void;
}

export function AIAssistantView({
  userId,
  selectedPropertyId,
  totalPortfolioValue,
  totalROI,
  propertyCount,
  onBack
}: AIAssistantViewProps) {
  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Portfolio
        </Button>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">AI Investment Assistant</h1>
        <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
          <Brain className="w-3 h-3 mr-1" />
          Learning AI
        </Badge>
      </div>
      
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Brain className="w-5 h-5" />
            Adaptive AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 mb-4">
            This AI assistant learns from your interactions to provide personalized investment advice, 
            property recommendations, and portfolio insights tailored to your preferences and behavior.
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">Personalized Recommendations</Badge>
            <Badge variant="outline">Learning from Feedback</Badge>
            <Badge variant="outline">Adaptive Communication</Badge>
            <Badge variant="outline">Portfolio Optimization</Badge>
          </div>
        </CardContent>
      </Card>
      
      <div className="max-w-4xl">
        <AgentChat
          agentId="adaptive-property-agent"
          context={{
            userId,
            propertyId: selectedPropertyId || undefined,
            metadata: {
              portfolio_value: totalPortfolioValue,
              portfolio_roi: totalROI,
              property_count: propertyCount,
              context: 'token_portfolio'
            }
          }}
        />
      </div>
    </div>
  );
}
