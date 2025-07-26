
import { supabase } from '@/integrations/supabase/client';

export interface PropertyBlockchainData {
  propertyId: string;
  title: string;
  description: string;
  type: string;
  subType: string;
  category: string;
  condition: string;
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    coordinates?: { lat: number; lng: number };
    landmark?: string;
    postal_code?: string;
  };
  specification: {
    bedrooms?: number;
    bathrooms?: number;
    toilets?: number;
    parking?: number;
    garages?: number;
    floors?: number;
    units?: number;
    area?: number;
    area_unit?: string;
    year_built?: number;
    is_furnished?: boolean;
  };
  price: {
    amount: number;
    currency: string;
    term: string;
    deposit?: number;
    service_charge?: number;
    is_negotiable: boolean;
  };
  features: string[];
  amenities: string[];
  tags: string[];
  documentHashes: {
    documentId: string;
    documentType: string;
    documentName: string;
    hash: string;
  }[];
  legalInfo: {
    landTitleId?: string;
    ownershipType?: string;
    encumbrances?: string[];
  };
  registeredBy: string;
}

export class PropertyContracts {
  constructor() {
    // Edge functions handle all Hedera operations now
  }

  // Register a new property in the registry
  async registerProperty(propertyData: PropertyBlockchainData) {
    const { data, error } = await supabase.functions.invoke('register-property-blockchain', {
      body: propertyData
    });
    
    if (error) throw error;
    return data;
  }

  // Verify a property (only authorized verifiers)
  async verifyProperty(propertyId: string) {
    const { data, error } = await supabase.functions.invoke('verify-property-blockchain', {
      body: { propertyId }
    });
    
    if (error) throw error;
    return data;
  }

  // Get property information
  async getProperty(propertyId: string) {
    const { data, error } = await supabase.functions.invoke('get-property-blockchain', {
      body: { propertyId }
    });
    
    if (error) throw error;
    return data;
  }

  // Create a marketplace listing
  async createListing(propertyId: string, price: number, tokenAmount: number) {
    const { data, error } = await supabase.functions.invoke('create-marketplace-listing', {
      body: { propertyId, price, tokenAmount }
    });
    
    if (error) throw error;
    return data;
  }

  // Purchase tokens from marketplace
  async purchaseTokens(listingId: string, amount: number) {
    const { data, error } = await supabase.functions.invoke('purchase-marketplace-tokens', {
      body: { listingId, amount }
    });
    
    if (error) throw error;
    return data;
  }

  // Distribute revenue to token holders
  async distributeRevenue(propertyId: string, amount: number, source: string) {
    const { data, error } = await supabase.functions.invoke('distribute-revenue', {
      body: { propertyId, amount, source }
    });
    
    if (error) throw error;
    return data;
  }

  // Claim revenue distribution
  async claimRevenue(distributionId: string) {
    const { data, error } = await supabase.functions.invoke('claim-revenue', {
      body: { distributionId }
    });
    
    if (error) throw error;
    return data;
  }

  // Check if contracts are properly configured
  isConfigured(): boolean {
    return true; // Edge functions handle configuration
  }

  // Get contract addresses for display
  getContractAddresses() {
    return {
      propertyRegistry: import.meta.env.VITE_PROPERTY_REGISTRY_CONTRACT,
      propertyMarketplace: import.meta.env.VITE_PROPERTY_MARKETPLACE_CONTRACT,
      revenueDistributor: import.meta.env.VITE_REVENUE_DISTRIBUTOR_CONTRACT
    };
  }

  // Close connection (no-op for edge functions)
  close() {
    // No client to close
  }
}

// Utility functions for contract integration
export const contractUtils = {
  // Format token amounts for contract calls
  formatTokenAmount: (amount: number, decimals: number = 8) => {
    return Math.floor(amount * Math.pow(10, decimals));
  },

  // Parse contract responses
  parseContractResult: (result: any) => {
    // Implement based on your contract return formats
    return result;
  },

  // Validate contract addresses
  isValidContractId: (contractId: string) => {
    const pattern = /^\d+\.\d+\.\d+$/;
    return pattern.test(contractId);
  }
};
