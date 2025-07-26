// HashPack browser extension types based on official documentation
declare global {
  interface Window {
    hashpack?: {
      connectToExtension: () => Promise<{ 
        success: boolean; 
        message?: string; 
      }>;
      requestAccountId: () => Promise<{
        success: boolean;
        accountId?: string;
        network?: string;
        message?: string;
      }>;
      getAccountBalance: (accountId: string) => Promise<{
        success: boolean;
        balance?: string;
        message?: string;
      }>;
      requestAdditionalAccountId: () => Promise<{
        success: boolean;
        accountId?: string;
        message?: string;
      }>;
      signAndSendTransaction: (data: any) => Promise<{
        success: boolean;
        receipt?: any;
        message?: string;
      }>;
      disconnect: () => Promise<{ success: boolean }>;
      isExtensionRequired: boolean;
    };
  }
}

export interface HashPackWallet {
  id: string;
  address: string;
  name: string;
  network: string;
  balance?: string;
  isConnected: boolean;
}

export interface HashPackContextType {
  wallet: HashPackWallet | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isAvailable: boolean;
}