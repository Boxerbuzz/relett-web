declare global {
  interface Window {
    hashpack?: {
      connectWallet: () => Promise<{
        accountId: string;
        accountPubKey: string;
        network: string;
      }>;
      disconnect: () => void;
      isConnected: () => boolean;
    };
  }
}

export {};