'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HashConnect, HashConnectConnectionState, SessionData } from 'hashconnect';
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
  hashConnect: HashConnect | null;
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
  const [hashConnect, setHashConnect] = useState<HashConnect | null>(null);
  const [pairingData, setPairingData] = useState<SessionData | null>(null);
  const [connectionState, setConnectionState] = useState<HashConnectConnectionState>(HashConnectConnectionState.Disconnected);

  // Initialize HashConnect
  useEffect(() => {
    const initHashConnect = async () => {
      try {
        // For now, we'll use a demo project ID - you'll need to get your own from WalletConnect Cloud
        const projectId = "demo"; 
        const hashConnect = new HashConnect(LedgerId.TESTNET, projectId, appMetadata, true);
        
        setHashConnect(hashConnect);
        setIsAvailable(true);

        // Set up event listeners
        hashConnect.pairingEvent.on((newPairingData) => {
          console.log('Pairing event:', newPairingData);
          setPairingData(newPairingData);
          
          if (newPairingData.accountIds.length > 0) {
            const accountId = newPairingData.accountIds[0];
            const walletData: HashPackWallet = {
              id: accountId,
              address: accountId,
              name: newPairingData.metadata?.name || 'HashPack Wallet',
              network: 'testnet',
              balance: 'Loading...',
              isConnected: true
            };
            setWallet(walletData);
            
            // Fetch balance
            fetchBalance(accountId);
          }
        });

        hashConnect.disconnectionEvent.on(() => {
          console.log('Wallet disconnected');
          setWallet(null);
          setPairingData(null);
        });

        hashConnect.connectionStatusChangeEvent.on((connectionStatus) => {
          setConnectionState(connectionStatus);
        });

        // Initialize
        await hashConnect.init();

      } catch (error) {
        console.error('Failed to initialize HashConnect:', error);
        setIsAvailable(false);
      }
    };

    initHashConnect();
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
    if (!hashConnect) {
      throw new Error('HashConnect not initialized');
    }

    try {
      setIsConnecting(true);
      
      // If already paired, use existing connection
      if (pairingData && pairingData.accountIds.length > 0) {
        const accountId = pairingData.accountIds[0];
        const walletData: HashPackWallet = {
          id: accountId,
          address: accountId,
          name: 'HashPack Wallet',
          network: 'testnet',
          balance: 'Loading...',
          isConnected: true
        };
        setWallet(walletData);
        fetchBalance(accountId);
        return;
      }

      // Open pairing modal to connect to wallet
      hashConnect.openPairingModal();
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    if (hashConnect) {
      hashConnect.disconnect();
    }
    setWallet(null);
    setPairingData(null);
  };

  return (
    <HashPackContext.Provider value={{
      wallet,
      isConnecting,
      connectWallet,
      disconnectWallet,
      isAvailable,
      hashConnect
    }}>
      {children}
    </HashPackContext.Provider>
  );
}