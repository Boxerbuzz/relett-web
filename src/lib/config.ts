
export const config = {
  paystack: {
    publicKey: '',
    isConfigured: () => false,
  },
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  hedera: {
    network: 'testnet',
    accountId: import.meta.env.VITE_HEDERA_ACCOUNT_ID,
    // SECURITY: Private key removed from frontend - operations moved to secure edge functions
    contracts: {
      propertyRegistry: import.meta.env.VITE_PROPERTY_REGISTRY_CONTRACT,
      propertyMarketplace: import.meta.env.VITE_PROPERTY_MARKETPLACE_CONTRACT,
      revenueDistributor: import.meta.env.VITE_REVENUE_DISTRIBUTOR_CONTRACT,
    },
    isConfigured: () => {
      return Boolean(
        config.hedera.contracts.propertyRegistry && 
        config.hedera.contracts.propertyMarketplace
      );
    },
    async deployContracts() {
      try {
        const response = await fetch('/api/deploy-property-contracts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('sb-access-token')}`
          },
          body: JSON.stringify({ network: this.network })
        });

        if (!response.ok) {
          throw new Error('Failed to deploy contracts');
        }

        const result = await response.json();
        
        // Update contract addresses
        this.contracts.propertyRegistry = result.propertyRegistryAddress;
        this.contracts.propertyMarketplace = result.propertyTokenAddress;
        
        return result;
      } catch (error) {
        console.error('Contract deployment failed:', error);
        throw error;
      }
    }
  },
  currency: {
    default: 'NGN',
    supported: ['NGN', 'USD']
  },
  maps: {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // This should be set in environment but not using VITE_
    isConfigured: () => false,
  },
  ipfs: {
    gatewayUrl: 'https://gateway.pinata.cloud/ipfs/',
    isConfigured: () => true,
  }
};
