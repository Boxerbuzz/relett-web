import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PortfolioMetrics {
  totalValue: number;
  totalInvested: number;
  totalROI: number;
  totalROIPercentage: number;
  dayChange: number;
  dayChangePercentage: number;
  weekChange: number;
  monthChange: number;
  yearChange: number;
  sharpeRatio: number;
  volatility: number;
  maxDrawdown: number;
  diversificationScore: number;
}

interface AssetAllocation {
  property_type: string;
  value: number;
  percentage: number;
  count: number;
}

interface PerformanceData {
  date: string;
  value: number;
  return: number;
}

interface RiskMetrics {
  beta: number;
  alpha: number;
  informationRatio: number;
  sortinoRatio: number;
  var95: number; // Value at Risk 95%
  expectedShortfall: number;
}

interface HoldingAnalysis {
  tokenized_property_id: string;
  property_title: string;
  tokens_owned: number;
  current_value: number;
  investment_amount: number;
  roi_percentage: number;
  weight: number;
  risk_score: number;
  performance_rank: number;
  correlation_to_portfolio: number;
}

export function usePortfolioAnalytics() {
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [metrics, setMetrics] = useState<PortfolioMetrics>({
    totalValue: 0,
    totalInvested: 0,
    totalROI: 0,
    totalROIPercentage: 0,
    dayChange: 0,
    dayChangePercentage: 0,
    weekChange: 0,
    monthChange: 0,
    yearChange: 0,
    sharpeRatio: 0,
    volatility: 0,
    maxDrawdown: 0,
    diversificationScore: 0
  });
  
  const [assetAllocation, setAssetAllocation] = useState<AssetAllocation[]>([]);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceData[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<RiskMetrics>({
    beta: 0,
    alpha: 0,
    informationRatio: 0,
    sortinoRatio: 0,
    var95: 0,
    expectedShortfall: 0
  });
  const [holdingsAnalysis, setHoldingsAnalysis] = useState<HoldingAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const calculateMetrics = useCallback(async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);

      // Fetch current holdings with property details
      const { data: holdings, error: holdingsError } = await supabase
        .from('token_holdings')
        .select(`
          *,
          tokenized_properties (
            *,
            properties (title, price)
          )
        `)
        .eq('holder_id', user.id);

      if (holdingsError) throw holdingsError;

      // Fetch investment tracking data
      const { data: tracking, error: trackingError } = await supabase
        .from('investment_tracking')
        .select('*')
        .eq('user_id', user.id);

      if (trackingError) throw trackingError;

      // Calculate basic portfolio metrics
      const totalInvested = holdings?.reduce((sum, h) => sum + h.total_investment, 0) || 0;
      const currentValue = tracking?.reduce((sum, t) => sum + t.current_value, 0) || 0;
      const totalROI = currentValue - totalInvested;
      const totalROIPercentage = totalInvested > 0 ? (totalROI / totalInvested) * 100 : 0;

      // Calculate asset allocation
      const allocationMap = new Map<string, { value: number; count: number }>();
      holdings?.forEach(holding => {
        const propertyType = 'Real Estate'; // Simplified for now
        const value = tracking?.find(t => t.tokenized_property_id === holding.tokenized_property_id)?.current_value || 0;
        
        const existing = allocationMap.get(propertyType) || { value: 0, count: 0 };
        allocationMap.set(propertyType, {
          value: existing.value + value,
          count: existing.count + 1
        });
      });

      const allocation: AssetAllocation[] = Array.from(allocationMap.entries()).map(([type, data]) => ({
        property_type: type,
        value: data.value,
        percentage: currentValue > 0 ? (data.value / currentValue) * 100 : 0,
        count: data.count
      }));

      // Calculate performance history (simplified - using random data for demo)
      const performanceData: PerformanceData[] = [];
      const today = new Date();
      for (let i = 90; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Simulate portfolio performance with some volatility
        const baseValue = totalInvested * (1 + Math.sin(i / 10) * 0.1 + (Math.random() - 0.5) * 0.05);
        const dailyReturn = i === 90 ? 0 : ((baseValue - performanceData[performanceData.length - 1]?.value) / performanceData[performanceData.length - 1]?.value) * 100;
        
        performanceData.push({
          date: date.toISOString().split('T')[0],
          value: baseValue,
          return: dailyReturn
        });
      }

      // Calculate risk metrics
      const returns = performanceData.slice(1).map(d => d.return);
      const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const volatility = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length) * Math.sqrt(252);
      const sharpeRatio = volatility > 0 ? (avgReturn * 252) / volatility : 0;

      // Calculate max drawdown
      let maxDrawdown = 0;
      let peak = performanceData[0]?.value || 0;
      performanceData.forEach(point => {
        if (point.value > peak) peak = point.value;
        const drawdown = (peak - point.value) / peak * 100;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
      });

      // Calculate diversification score (Herfindahl index)
      const diversificationScore = allocation.length > 1 
        ? (1 - allocation.reduce((sum, a) => sum + Math.pow(a.percentage / 100, 2), 0)) * 100
        : 0;

      // Holdings analysis
      const analysis: HoldingAnalysis[] = holdings?.map(holding => {
        const trackingData = tracking?.find(t => t.tokenized_property_id === holding.tokenized_property_id);
        const weight = currentValue > 0 ? (trackingData?.current_value || 0) / currentValue * 100 : 0;
        
        return {
          tokenized_property_id: holding.tokenized_property_id,
          property_title: holding.tokenized_properties?.properties?.title || 'Unknown Property',
          tokens_owned: parseInt(holding.tokens_owned),
          current_value: trackingData?.current_value || 0,
          investment_amount: holding.total_investment,
          roi_percentage: trackingData?.roi_percentage || 0,
          weight,
          risk_score: Math.random() * 10, // Simplified risk score
          performance_rank: 0, // Will be calculated after sorting
          correlation_to_portfolio: Math.random() * 2 - 1 // Simplified correlation
        };
      }).sort((a, b) => b.roi_percentage - a.roi_percentage)
        .map((item, index) => ({ ...item, performance_rank: index + 1 })) || [];

      setMetrics({
        totalValue: currentValue,
        totalInvested,
        totalROI,
        totalROIPercentage,
        dayChange: 0, // Would need historical data
        dayChangePercentage: 0,
        weekChange: 0,
        monthChange: 0,
        yearChange: 0,
        sharpeRatio,
        volatility,
        maxDrawdown,
        diversificationScore
      });

      setAssetAllocation(allocation);
      setPerformanceHistory(performanceData);
      setHoldingsAnalysis(analysis);

      setRiskMetrics({
        beta: Math.random() * 2, // Simplified
        alpha: (Math.random() - 0.5) * 10,
        informationRatio: Math.random() * 2 - 1,
        sortinoRatio: sharpeRatio * 1.2,
        var95: volatility * 1.645,
        expectedShortfall: volatility * 2
      });

    } catch (error) {
      console.error('Error calculating portfolio analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const getRecommendations = useCallback(() => {
    const recommendations: Array<{ type: 'info' | 'warning' | 'success'; message: string }> = [];

    if (metrics.diversificationScore < 30) {
      recommendations.push({
        type: 'warning',
        message: 'Consider diversifying across more property types to reduce risk'
      });
    }

    if (metrics.volatility > 20) {
      recommendations.push({
        type: 'warning',
        message: 'High portfolio volatility detected - consider rebalancing'
      });
    }

    if (metrics.sharpeRatio > 1) {
      recommendations.push({
        type: 'success',
        message: 'Excellent risk-adjusted returns!'
      });
    }

    if (holdingsAnalysis.some(h => h.weight > 50)) {
      recommendations.push({
        type: 'warning',
        message: 'Position concentration risk - consider reducing largest holdings'
      });
    }

    return recommendations;
  }, [metrics, holdingsAnalysis]);

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        setUser({ id: currentUser.id });
      }
    };
    
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (user?.id) {
      calculateMetrics();
    }
  }, [user?.id, calculateMetrics]);

  return {
    metrics,
    assetAllocation,
    performanceHistory,
    riskMetrics,
    holdingsAnalysis,
    recommendations: getRecommendations(),
    isLoading,
    refetch: calculateMetrics
  };
}