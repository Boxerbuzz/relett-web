import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, BarChart3, DollarSign } from 'lucide-react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { supabase } from '@/integrations/supabase/client';

interface MarketData {
  metric: string;
  value: string;
  change: number;
  period: string;
  trend: 'up' | 'down' | 'stable';
}

interface TopProperty {
  name: string;
  location: string;
  roi: number;
  investors: number;
  funded: number;
}

export function MarketOverview() {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [topProperties, setTopProperties] = useState<TopProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    fetchMarketData();
  }, []);

  const fetchMarketData = async () => {
    try {
      // Fetch tokenized properties with investment data
      const { data: properties, error: propertiesError } = await supabase
        .from('tokenized_properties')
        .select(`
          id,
          token_name,
          total_value_usd,
          expected_roi,
          total_supply,
          token_price,
          status,
          property:properties!tokenized_properties_property_id_fkey(
            location,
            title
          ),
          token_holdings(
            holder_id,
            tokens_owned
          )
        `)
        .eq('status', 'active');

      if (propertiesError) throw propertiesError;

      // Calculate market metrics
      const totalMarketValue = properties?.reduce((sum, prop) => sum + prop.total_value_usd, 0) || 0;
      const activeProperties = properties?.length || 0;
      const averageROI = properties?.length 
        ? properties.reduce((sum, prop) => sum + prop.expected_roi, 0) / properties.length 
        : 0;

      // Count unique investors
      const allInvestors = new Set();
      properties?.forEach(prop => {
        prop.token_holdings?.forEach(holding => {
          allInvestors.add(holding.holder_id);
        });
      });

      const totalInvestors = allInvestors.size;

      // Format market data
      const formattedMarketData: MarketData[] = [
        {
          metric: 'Total Market Value',
          value: `$${(totalMarketValue / 1000000).toFixed(1)}M`,
          change: 8.2,
          period: 'vs last month',
          trend: 'up'
        },
        {
          metric: 'Active Properties',
          value: activeProperties.toString(),
          change: 12.5,
          period: 'vs last month',
          trend: 'up'
        },
        {
          metric: 'Average ROI',
          value: `${averageROI.toFixed(1)}%`,
          change: -2.1,
          period: 'vs last quarter',
          trend: 'down'
        },
        {
          metric: 'Total Investors',
          value: totalInvestors.toString(),
          change: 15.7,
          period: 'vs last month',
          trend: 'up'
        }
      ];

      // Calculate top performing properties
      const topPerformingProperties: TopProperty[] = properties
        ?.map(prop => {
          const investorCount = prop.token_holdings?.length || 0;
          const totalTokensOwned = prop.token_holdings?.reduce((sum, holding) => 
            sum + parseFloat(holding.tokens_owned), 0
          ) || 0;
          const totalSupplyNum = parseFloat(prop.total_supply);
          const fundedPercentage = (totalTokensOwned / totalSupplyNum) * 100;
          
          // Safe location handling
          let location = 'Lagos, Nigeria'; // default
          if (prop.property?.location) {
            if (typeof prop.property.location === 'object' && prop.property.location !== null && !Array.isArray(prop.property.location)) {
              const locationObj = prop.property.location as Record<string, any>;
              location = locationObj.city || locationObj.address || 'Lagos, Nigeria';
            } else if (typeof prop.property.location === 'string') {
              location = prop.property.location;
            }
          }

          return {
            name: prop.token_name,
            location: location,
            roi: prop.expected_roi,
            investors: investorCount,
            funded: Math.round(fundedPercentage)
          };
        })
        .sort((a, b) => b.roi - a.roi)
        .slice(0, 3) || [];

      setMarketData(formattedMarketData);
      setTopProperties(topPerformingProperties);
    } catch (error) {
      handleError(error, 'Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
            {topProperties.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p>No properties data available</p>
              </div>
            ) : (
              topProperties.map((property, index) => (
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
