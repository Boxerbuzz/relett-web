'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DAppConnector, HederaSessionEvent, HederaJsonRpcMethod, HederaChainId } from '@hashgraph/hedera-wallet-connect';
import { LedgerId } from '@hashgraph/sdk';

export interface HashPackWallet {
  id: string;
  address: string;
  name: string;
  network: string;
  balance?: string;
  isConnected: boolean;
}

interface HashPackContextType {
  wallet: HashPackWallet | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isAvailable: boolean;
  connector: DAppConnector | null;
}

const appMetadata = {
  name: 'Property Tokenization Platform',
  description: 'Tokenize and trade real estate properties on Hedera',
  icons: [window.location.origin + '/favicon.ico'],
  url: window.location.origin
};

const HashPackContext = createContext<HashPackContextType | undefined>(undefined);

export function useHashPack() {
  const context = useContext(HashPackContext);
  if (context === undefined) {
    throw new Error('useHashPack must be used within a HashPackProvider');
  }
  return context;
}

interface HashPackProviderProps {
  children: ReactNode;
}

export function HashPackProvider({ children }: HashPackProviderProps) {
  const [wallet, setWallet] = useState<HashPackWallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [connector, setConnector] = useState<DAppConnector | null>(null);

  // Initialize DAppConnector
  useEffect(() => {
    const initConnector = async () => {
      try {
        const projectId = "demo"; // Replace with your WalletConnect project ID
        
        const dAppConnector = new DAppConnector(
          appMetadata,
          LedgerId.TESTNET,
          projectId,
          Object.values(HederaJsonRpcMethod),
          [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
          [HederaChainId.Testnet, HederaChainId.Mainnet],
        );
        
        await dAppConnector.init({ logger: 'error' });
        
        setConnector(dAppConnector);
        setIsAvailable(true);

        // Set up event listeners
        dAppConnector.walletConnectModal?.subscribeModal((state) => {
          if (state.open) {
            setIsConnecting(true);
          } else {
            setIsConnecting(false);
          }
        });

        // Check for existing sessions
        if (dAppConnector.signers && dAppConnector.signers.length > 0) {
          const accountId = dAppConnector.signers[0].getAccountId().toString();
          const walletData: HashPackWallet = {
            id: accountId,
            address: accountId,
            name: 'Hedera Wallet',
            network: 'testnet',
            balance: 'Loading...',
            isConnected: true
          };
          setWallet(walletData);
          fetchBalance(accountId);
        }

      } catch (error) {
        console.error('Failed to initialize DAppConnector:', error);
        setIsAvailable(false);
      }
    };

    initConnector();
  }, []);

  const fetchBalance = async (accountId: string) => {
    try {
      const { data: balanceData } = await supabase.functions.invoke('get-hedera-balance', {
        body: { accountId }
      });
      
      if (balanceData?.success && balanceData.data?.hbarBalance !== undefined) {
        setWallet(prev => prev ? { 
          ...prev, 
          balance: `${balanceData.data.hbarBalance} HBAR` 
        } : null);
      }
    } catch (error) {
      console.warn('Failed to fetch balance:', error);
      setWallet(prev => prev ? { ...prev, balance: 'Error loading balance' } : null);
    }
  };

  const connectWallet = async (): Promise<void> => {
    if (!connector) {
      throw new Error('DAppConnector not initialized');
    }

    try {
      setIsConnecting(true);
      await connector.openModal();
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (connector) {
      await connector.disconnect('User requested disconnect');
    }
    setWallet(null);
  };

  return (
    <HashPackContext.Provider value={{
      wallet,
      isConnecting,
      connectWallet,
      disconnectWallet,
      isAvailable,
      connector
    }}>
      {children}
    </HashPackContext.Provider>
  );
}