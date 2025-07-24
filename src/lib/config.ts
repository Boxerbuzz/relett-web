
export const config = {
  paystack: {
    publicKey: '',
    isConfigured: () => false,
  },
  supabase: {
    url: 'https://wossuijahchhtjzphsgh.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indvc3N1aWphaGNoaHRqenBoc2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjA5NjIsImV4cCI6MjA2MTQ5Njk2Mn0.eLKZrNi8hMUCAqyoHaw5TMaX8muaA7q_Q7HCHzBDSyM'
  },
  hedera: {
    network: 'testnet',
    accountId: '', // This will be configured via backend
    privateKey: '', // This will be configured via backend  
    contracts: {
      propertyRegistry: '', // These will be set after contract deployment
      propertyMarketplace: '',
      revenueDistributor: '',
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
    apiKey: '', // This should be set in environment but not using VITE_
    isConfigured: () => false,
  },
  ipfs: {
    gatewayUrl: 'https://gateway.pinata.cloud/ipfs/',
    isConfigured: () => true,
  }
};
