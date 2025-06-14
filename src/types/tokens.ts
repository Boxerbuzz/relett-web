
export interface TokenProperty {
  id: string;
  title: string;
  location: string;
  totalTokens: number;
  ownedTokens: number;
  tokenPrice: number;
  currentValue: number;
  totalValue: number;
  roi: number;
  investorCount: number;
  hasGroupChat: boolean;
}

export type ViewMode = 'portfolio' | 'discussion' | 'analytics' | 'payments' | 'agent';
