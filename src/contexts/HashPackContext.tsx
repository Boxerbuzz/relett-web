'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

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

  useEffect(() => {
    // Check if HashPack is available
    const checkHashPack = () => {
      if (typeof window !== 'undefined' && window.hashpack) {
        setIsAvailable(true);
      } else {
        // Retry checking after a short delay (HashPack might still be loading)
        setTimeout(checkHashPack, 1000);
      }
    };

    checkHashPack();
  }, []);

  const connectWallet = async () => {
    if (!isAvailable) {
      throw new Error('HashPack wallet is not available. Please install the HashPack extension.');
    }

    setIsConnecting(true);
    try {
      // This is a mock implementation - actual HashPack integration would use their SDK
      // For now, simulate connection
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockWallet: HashPackWallet = {
        id: '1',
        address: '0.0.123456',
        name: 'HashPack Wallet',
        network: 'Hedera Testnet',
        balance: '250.45 HBAR',
        isConnected: true
      };

      setWallet(mockWallet);
    } catch (error) {
      console.error('Failed to connect HashPack wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
  };

  return (
    <HashPackContext.Provider value={{
      wallet,
      isConnecting,
      connectWallet,
      disconnectWallet,
      isAvailable
    }}>
      {children}
    </HashPackContext.Provider>
  );
}