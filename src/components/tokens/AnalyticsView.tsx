
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, BarChart3, TrendingUp, DollarSign } from 'lucide-react';

interface AnalyticsViewProps {
  propertyId: string;
  propertyTitle: string;
  onBack: () => void;
}

export function AnalyticsView({ propertyId, propertyTitle, onBack }: AnalyticsViewProps) {
  return (
    <div className="space-y-6">
      <Button 
        variant="outline" 
        onClick={onBack}
        className="flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back to Portfolio
      </Button>

      <div>
        <h2 className="text-2xl font-bold">{propertyTitle} - Analytics</h2>
        <p className="text-gray-600">Performance metrics and insights</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Return</p>
                <p className="text-2xl font-bold text-green-600">+2.3%</p>
              </div>
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-blue-600">$12,450</p>
              </div>
              <DollarSign size={24} className="text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Occupancy Rate</p>
                <p className="text-2xl font-bold text-purple-600">95%</p>
              </div>
              <BarChart3 size={24} className="text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Chart</CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center">
          <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chart Visualization</h3>
          <p className="text-gray-600">Interactive charts and detailed analytics coming soon.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm">Rental payment received</span>
              <span className="text-sm text-green-600">+$1,250</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm">Maintenance expense</span>
              <span className="text-sm text-red-600">-$180</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <span className="text-sm">Property valuation update</span>
              <span className="text-sm text-blue-600">+5.2%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
