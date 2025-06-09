
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, DollarSign } from 'lucide-react';

interface MarketData {
  metric: string;
  value: string;
  change: number;
  period: string;
  trend: 'up' | 'down' | 'stable';
}

const marketData: MarketData[] = [
  {
    metric: 'Total Market Value',
    value: '$2.4B',
    change: 8.2,
    period: 'vs last month',
    trend: 'up'
  },
  {
    metric: 'Active Properties',
    value: '1,247',
    change: 12.5,
    period: 'vs last month',
    trend: 'up'
  },
  {
    metric: 'Average ROI',
    value: '14.8%',
    change: -2.1,
    period: 'vs last quarter',
    trend: 'down'
  },
  {
    metric: 'Total Investors',
    value: '8,943',
    change: 15.7,
    period: 'vs last month',
    trend: 'up'
  }
];

const topPerformingProperties = [
  {
    name: 'Victoria Island Luxury Towers',
    location: 'Lagos, Nigeria',
    roi: 22.4,
    investors: 156,
    funded: 85
  },
  {
    name: 'Ikoyi Business Complex',
    location: 'Lagos, Nigeria',
    roi: 19.8,
    investors: 98,
    funded: 92
  },
  {
    name: 'Abuja Central Mall',
    location: 'Abuja, Nigeria',
    roi: 18.5,
    investors: 134,
    funded: 78
  }
];

export function MarketOverview() {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Market Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketData.map((data, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">{data.metric}</p>
                  <p className="text-2xl font-bold">{data.value}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {getTrendIcon(data.trend)}
                </div>
              </div>
              <div className="flex items-center mt-2">
                <span className={`text-sm font-medium ${getTrendColor(data.trend)}`}>
                  {data.change > 0 ? '+' : ''}{data.change}%
                </span>
                <span className="text-sm text-gray-500 ml-1">{data.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Performing Properties */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Top Performing Properties
          </CardTitle>
          <CardDescription>
            Properties with the highest returns this month
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topPerformingProperties.map((property, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{property.name}</h4>
                  <p className="text-sm text-gray-600 flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    {property.location}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">ROI</p>
                    <p className="font-semibold text-green-600">+{property.roi}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Investors</p>
                    <p className="font-semibold">{property.investors}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Funded</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {property.funded}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
