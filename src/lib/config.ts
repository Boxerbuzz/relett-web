
export const config = {
  paystack: {
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '',
    isConfigured: () => !!import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
  },
  supabase: {
    url: 'https://wossuijahchhtjzphsgh.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indvc3N1aWphaGNoaHRqenBoc2doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5MjA5NjIsImV4cCI6MjA2MTQ5Njk2Mn0.eLKZrNi8hMUCAqyoHaw5TMaX8muaA7q_Q7HCHzBDSyM'
  },
  hedera: {
    network: import.meta.env.VITE_HEDERA_NETWORK || 'testnet',
    accountId: import.meta.env.VITE_HEDERA_ACCOUNT_ID || '',
    privateKey: import.meta.env.VITE_HEDERA_PRIVATE_KEY || '',
    contracts: {
      propertyRegistry: import.meta.env.VITE_PROPERTY_REGISTRY_CONTRACT || '',
      propertyMarketplace: import.meta.env.VITE_PROPERTY_MARKETPLACE_CONTRACT || '',
      revenueDistributor: import.meta.env.VITE_REVENUE_DISTRIBUTOR_CONTRACT || '',
    },
    isConfigured: () => !!(
      import.meta.env.VITE_HEDERA_ACCOUNT_ID && 
      import.meta.env.VITE_HEDERA_PRIVATE_KEY &&
      import.meta.env.VITE_PROPERTY_REGISTRY_CONTRACT &&
      import.meta.env.VITE_PROPERTY_MARKETPLACE_CONTRACT &&
      import.meta.env.VITE_REVENUE_DISTRIBUTOR_CONTRACT
    ),
  },
  currency: {
    default: 'NGN',
    supported: ['NGN', 'USD']
  },
  maps: {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    isConfigured: () => !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  },
  ipfs: {
    gatewayUrl: import.meta.env.VITE_IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs/',
    isConfigured: () => !!import.meta.env.VITE_IPFS_GATEWAY_URL,
  }
};
