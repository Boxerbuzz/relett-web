import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, cacheConfig } from '@/lib/queryClient';

interface UserDashboardStats {
  totalInvestments: number;
  totalInvestmentValue: number;
  propertiesViewed: number;
  bookingsMade: number;
  portfolioROI: number;
  ownedProperties: number;
}

export function useUserDashboardStats() {
  const {
    data: stats,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [...queryKeys.user.profile(), 'dashboard-stats'],
    queryFn: async (): Promise<UserDashboardStats> => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        return {
          totalInvestments: 0,
          totalInvestmentValue: 0,
          propertiesViewed: 0,
          bookingsMade: 0,
          portfolioROI: 0,
          ownedProperties: 0,
        };
      }

      // Parallel fetch all user statistics
      const [
        investmentTrackingData,
        tokenHoldingsData,
        ownedPropertiesCount,
        inspectionsCount
      ] = await Promise.all([
        // Investment tracking data
        supabase
          .from("investment_tracking")
          .select("investment_amount, current_value, tokens_owned")
          .eq("user_id", user.id),
        
        // Token holdings data
        supabase
          .from("token_holdings")
          .select("total_investment, tokens_owned")
          .eq("holder_id", user.id),
        
        // Properties owned by user
        supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id),
        
        // Inspections/bookings made by user
        supabase
          .from("inspections")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
      ]);

      // Calculate investment metrics
      const investments = investmentTrackingData.data || [];
      const tokenHoldings = tokenHoldingsData.data || [];
      
      const totalInvestmentValue = investments.reduce(
        (sum, inv) => sum + (Number(inv.investment_amount) || 0), 0
      ) + tokenHoldings.reduce(
        (sum, holding) => sum + (Number(holding.total_investment) || 0), 0
      );
      
      const currentValue = investments.reduce(
        (sum, inv) => sum + (Number(inv.current_value) || 0), 0
      );
      
      const portfolioROI = totalInvestmentValue > 0 
        ? ((currentValue - totalInvestmentValue) / totalInvestmentValue) * 100 
        : 0;

      const totalTokens = investments.reduce(
        (sum, inv) => sum + (Number(inv.tokens_owned) || 0), 0
      ) + tokenHoldings.reduce(
        (sum, holding) => sum + (Number(holding.tokens_owned) || 0), 0
      );

      return {
        totalInvestments: Math.round(totalTokens),
        totalInvestmentValue: totalInvestmentValue,
        propertiesViewed: 0, // We don't track this yet, but keeping for UI
        bookingsMade: inspectionsCount.count || 0,
        portfolioROI: portfolioROI,
        ownedProperties: ownedPropertiesCount.count || 0,
      };
    },
    ...cacheConfig.standard,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    stats: stats || {
      totalInvestments: 0,
      totalInvestmentValue: 0,
      propertiesViewed: 0,
      bookingsMade: 0,
      portfolioROI: 0,
      ownedProperties: 0,
    },
    isLoading,
    error: error?.message || null,
    refetch
  };
}