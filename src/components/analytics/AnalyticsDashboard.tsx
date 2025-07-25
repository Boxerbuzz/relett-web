import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PortfolioAnalyticsDashboard } from './PortfolioAnalyticsDashboard';
import { PropertyAnalyticsDashboard } from './PropertyAnalyticsDashboard';
import { 
  PieChart, 
  BarChart3, 
  TrendingUp,
  Building,
  Wallet
} from 'lucide-react';

type AnalyticsScope = 'portfolio' | 'property';

interface AnalyticsDashboardProps {
  defaultScope?: AnalyticsScope;
  showScopeSelector?: boolean;
}

export function AnalyticsDashboard({ 
  defaultScope = 'portfolio', 
  showScopeSelector = true 
}: AnalyticsDashboardProps) {
  const [activeScope, setActiveScope] = useState<AnalyticsScope>(defaultScope);

  return (
    <div className="space-y-6">
      {showScopeSelector && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Analytics Dashboard
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Comprehensive insights into your investments and properties
                </p>
              </div>
              <Select value={activeScope} onValueChange={(value) => setActiveScope(value as AnalyticsScope)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portfolio">
                    <div className="flex items-center gap-2">
                      <Wallet className="w-4 h-4" />
                      Portfolio Analytics
                    </div>
                  </SelectItem>
                  <SelectItem value="property">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      Property Analytics
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
        </Card>
      )}

      <Tabs value={activeScope} onValueChange={(value) => setActiveScope(value as AnalyticsScope)}>
        {showScopeSelector && (
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="portfolio" className="flex items-center gap-2">
              <PieChart className="w-4 h-4" />
              Portfolio Overview
            </TabsTrigger>
            <TabsTrigger value="property" className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Property Analysis
            </TabsTrigger>
          </TabsList>
        )}

        <TabsContent value="portfolio" className="space-y-6">
          <PortfolioAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="property" className="space-y-6">
          <PropertyAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Export individual components for backward compatibility
export { PortfolioAnalyticsDashboard } from './PortfolioAnalyticsDashboard';
export { PropertyAnalyticsDashboard } from './PropertyAnalyticsDashboard';