
import { TokenProperty } from '@/types/tokens';

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

export function transformTokenizedProperties(tokenizedProperties: TokenizedPropertyData[]): TokenProperty[] {
  return tokenizedProperties.map(prop => ({
    id: prop.id,
    title: prop.property_title || prop.token_name,
    location: prop.property_location?.address || 'Unknown Location',
    totalTokens: parseInt(prop.total_supply),
    ownedTokens: parseInt(prop.tokens_owned),
    tokenPrice: prop.token_price,
    currentValue: prop.current_value,
    totalValue: prop.current_value,
    roi: prop.roi_percentage,
    investorCount: prop.investor_count,
    hasGroupChat: prop.has_group_chat
  }));
}
