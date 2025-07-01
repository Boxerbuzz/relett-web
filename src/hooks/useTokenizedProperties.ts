
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, cacheConfig } from '@/lib/queryClient';

interface TokenizedPropertyData {
  id: string;
  token_symbol: string;
  token_name: string;
  token_type: string;
  total_supply: string;
  token_price: number;
  status: string;
  blockchain_network: string;
  expected_roi: number;
  revenue_distribution_frequency: string;
  lock_up_period_months: number;
  property_title?: string;
  property_location?: any;
  property_backdrop?: string;
  tokens_owned: string;
  purchase_price_per_token: number;
  total_investment: number;
  acquisition_date: string;
  current_value: number;
  roi_percentage: number;
  total_dividends_received: number;
  last_dividend_date?: string;
  last_dividend_amount: number;
  investor_count: number;
  has_group_chat: boolean;
  property_images: Array<{
    url: string;
    is_primary: boolean;
  }>;
  recent_dividends: Array<{
    id: string;
    distribution_date: string;
    total_revenue: number;
    revenue_per_token: number;
    distribution_type: string;
    source_description: string;
    dividend_amount?: number;
    net_amount?: number;
    paid_at?: string;
    payment_status?: string;
  }>;
}

export function useTokenizedProperties() {
  const { user } = useAuth();
  const { toast } = useToast();

  const {
    data,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: queryKeys.investments.tokenized(user?.id),
    queryFn: async () => {
      if (!user?.id) {
        console.log('No user ID available for tokenized properties query');
        return {
          tokenizedProperties: [],
          totalPortfolioValue: 0,
          totalROI: 0
        };
      }

      console.log('Fetching tokenized properties for:', user.email);

      try {
        // Fetch tokenized properties with holdings and investment tracking
        const { data: holdingsData, error: holdingsError } = await supabase
          .from('token_holdings')
          .select(`
            *,
            tokenized_properties!token_holdings_tokenized_property_id_fkey (
              *,
              properties!properties_tokenized_property_id_fkey (
                id,
                title,
                location,
                backdrop
              )
            )
          `)
          .eq('holder_id', user.id);

        if (holdingsError) throw holdingsError;

        // Get investment tracking data separately
        const tokenizedPropertyIds = holdingsData?.map(h => h.tokenized_property_id) || [];
        const { data: investmentTrackingData } = await supabase
          .from('investment_tracking')
          .select('*')
          .eq('user_id', user.id)
          .in('tokenized_property_id', tokenizedPropertyIds);

        // Get property images - properly extract property IDs
        const propertyIds: string[] = holdingsData
          ?.map(h => {
            const property = h.tokenized_properties?.properties;
            if (Array.isArray(property) && property.length > 0) {
              return property[0]?.id;
            } else if (property && typeof property === 'object' && 'id' in property) {
              return (property as any).id;
            }
            return null;
          })
          .filter((id): id is string => Boolean(id)) || [];

        const { data: imagesData } = await supabase
          .from('property_images')
          .select('property_id, url, is_primary, sort_order')
          .in('property_id', propertyIds)
          .order('is_primary', { ascending: false })
          .order('sort_order', { ascending: true });

        // Get investor counts
        const { data: investorCounts } = await supabase
          .from('token_holdings')
          .select('tokenized_property_id, holder_id')
          .in('tokenized_property_id', tokenizedPropertyIds);

        // Get investment groups for chat functionality
        const { data: investmentGroups } = await supabase
          .from('investment_groups')
          .select('tokenized_property_id')
          .in('tokenized_property_id', tokenizedPropertyIds)
          .eq('status', 'active');

        // Get recent revenue distributions
        const { data: revenueDistributions } = await supabase
          .from('revenue_distributions')
          .select(`
            *,
            dividend_payments!dividend_payments_revenue_distribution_id_fkey (
              amount,
              net_amount,
              paid_at,
              status
            )
          `)
          .in('tokenized_property_id', tokenizedPropertyIds)
          .eq('dividend_payments.recipient_id', user.id)
          .order('distribution_date', { ascending: false })
          .limit(50);

        // Group data by property
        const imagesByProperty = imagesData?.reduce((acc, img) => {
          if (!acc[img.property_id]) acc[img.property_id] = [];
          acc[img.property_id].push(img);
          return acc;
        }, {} as Record<string, any[]>) || {};

        const investorCountsByProperty = investorCounts?.reduce((acc, ic) => {
          acc[ic.tokenized_property_id] = (acc[ic.tokenized_property_id] || new Set()).add(ic.holder_id);
          return acc;
        }, {} as Record<string, Set<string>>) || {};

        const groupChatsByProperty = new Set(investmentGroups?.map(ig => ig.tokenized_property_id) || []);

        const revenueByProperty = revenueDistributions?.reduce((acc, rd) => {
          if (!acc[rd.tokenized_property_id]) acc[rd.tokenized_property_id] = [];
          acc[rd.tokenized_property_id].push({
            ...rd,
            dividend_amount: rd.dividend_payments?.[0]?.amount,
            net_amount: rd.dividend_payments?.[0]?.net_amount,
            paid_at: rd.dividend_payments?.[0]?.paid_at,
            payment_status: rd.dividend_payments?.[0]?.status
          });
          return acc;
        }, {} as Record<string, any[]>) || {};

        const investmentTrackingByProperty = investmentTrackingData?.reduce((acc, it) => {
          acc[it.tokenized_property_id] = it;
          return acc;
        }, {} as Record<string, any>) || {};

        // Transform and enrich data
        const enrichedProperties: TokenizedPropertyData[] = holdingsData?.map(holding => {
          const tokenizedProperty = holding.tokenized_properties;
          const property = Array.isArray(tokenizedProperty?.properties) 
            ? tokenizedProperty.properties[0] 
            : tokenizedProperty?.properties;
          const investmentTracking = investmentTrackingByProperty[holding.tokenized_property_id];
          const propertyId = property?.id;

          return {
            ...tokenizedProperty,
            property_title: property?.title || "",
            property_location: property?.location,
            property_backdrop: property?.backdrop || "",
            tokens_owned: holding.tokens_owned,
            purchase_price_per_token: holding.purchase_price_per_token,
            total_investment: holding.total_investment,
            acquisition_date: holding.acquisition_date,
            current_value: investmentTracking?.current_value || holding.total_investment,
            roi_percentage: investmentTracking?.roi_percentage || 0,
            total_dividends_received: investmentTracking?.total_dividends_received || 0,
            last_dividend_date: investmentTracking?.last_dividend_date,
            last_dividend_amount: investmentTracking?.last_dividend_amount || 0,
            investor_count: investorCountsByProperty[holding.tokenized_property_id]?.size || 0,
            has_group_chat: groupChatsByProperty.has(holding.tokenized_property_id),
            property_images: propertyId ? (imagesByProperty[propertyId] || []) : [],
            recent_dividends: revenueByProperty[holding.tokenized_property_id] || [],
            status: tokenizedProperty?.status || ""
          };
        }) || [];

        // Calculate portfolio metrics
        const totalValue = enrichedProperties.reduce((sum, prop) => sum + prop.current_value, 0);
        const totalInvested = enrichedProperties.reduce((sum, prop) => sum + prop.total_investment, 0);
        const overallROI = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

        console.log('Successfully fetched tokenized properties:', enrichedProperties.length);
        return {
          tokenizedProperties: enrichedProperties,
          totalPortfolioValue: totalValue,
          totalROI: overallROI
        };
      } catch (err) {
        console.error('Error fetching tokenized properties:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tokenized properties';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
        throw err;
      }
    },
    enabled: !!user?.id,
    ...cacheConfig.static, // Cache for 1 hour since tokenized properties don't change frequently
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const tokenizedProperties = data?.tokenizedProperties || [];
  const totalPortfolioValue = data?.totalPortfolioValue || 0;
  const totalROI = data?.totalROI || 0;
  const error = queryError?.message || null;

  return {
    tokenizedProperties,
    totalPortfolioValue,
    totalROI,
    loading,
    error,
    refetch
  };
}
