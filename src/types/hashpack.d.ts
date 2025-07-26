declare global {
  interface Window {
    // HashPack can be in either of these locations
    hashpack?: HashPackAPI;
    hedera?: {
      hashpack: HashPackAPI;
    };
  }
}

interface HashPackAPI {
  // Connect to the wallet
  connectWallet: () => Promise<{
    accountId: string;
    accountPubKey: string;
    network: 'mainnet' | 'testnet' | 'previewnet' | string;
    error?: string;
  }>;
  
  // Disconnect the wallet
  disconnect: () => void;
  
  // Check if connected
  isConnected: () => boolean;
  
  // Get account info if already connected
  getAccountInfo?: () => Promise<{
    accountId: string;
    network: string;
  }>;
  
  // Event listeners
  on?: (event: string, callback: (data: any) => void) => void;
  off?: (event: string, callback: (data: any) => void) => void;
}

export {};