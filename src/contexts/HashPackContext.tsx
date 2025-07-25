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
    let retryCount = 0;
    const maxRetries = 10;
    const baseDelay = 500;
    let timeoutId: NodeJS.Timeout;

    // Check if HashPack is available with exponential backoff
    const checkHashPack = () => {
      console.log(`Checking for HashPack... attempt ${retryCount + 1}`);
      
      if (typeof window !== 'undefined' && window.hashpack) {
        console.log('HashPack detected!', window.hashpack);
        setIsAvailable(true);
        return;
      }

      if (retryCount < maxRetries) {
        retryCount++;
        const delay = baseDelay * Math.pow(1.5, retryCount - 1);
        console.log(`HashPack not found, retrying in ${delay}ms...`);
        
        timeoutId = setTimeout(checkHashPack, delay);
      } else {
        console.warn('HashPack not detected after maximum retries. Please ensure HashPack extension is installed and enabled.');
        setIsAvailable(false);
      }
    };

    // Start checking immediately
    checkHashPack();

    // Also listen for potential HashPack events
    const handleHashPackReady = () => {
      console.log('HashPack ready event received');
      if (window.hashpack) {
        setIsAvailable(true);
      }
    };

    // Some extensions dispatch custom events when ready
    window.addEventListener('hashpack-ready', handleHashPackReady);
    window.addEventListener('load', checkHashPack);

    // Cleanup function
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('hashpack-ready', handleHashPackReady);
      window.removeEventListener('load', checkHashPack);
    };
  }, []);

  const connectWallet = async () => {
    if (!isAvailable) {
      throw new Error('HashPack wallet is not available. Please install the HashPack extension.');
    }

    setIsConnecting(true);
    try {
      // Use the actual HashPack extension API
      const hashPackAPI = window.hashpack!;
      const connectionResult = await hashPackAPI.connectWallet();
      
      const wallet: HashPackWallet = {
        id: connectionResult.accountId,
        address: connectionResult.accountId,
        name: 'HashPack Wallet',
        network: connectionResult.network === 'testnet' ? 'Hedera Testnet' : 'Hedera Mainnet',
        balance: 'Loading...', // Balance will be fetched separately
        isConnected: true
      };

      setWallet(wallet);
      
      // Fetch balance using existing Hedera service
      try {
        const response = await fetch('https://wossuijahchhtjzphsgh.supabase.co/functions/v1/get-hedera-balance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('sb-access-token')}`
          },
          body: JSON.stringify({ accountId: connectionResult.accountId })
        });
        
        if (response.ok) {
          const balanceData = await response.json();
          setWallet(prev => prev ? {
            ...prev,
            balance: `${balanceData.balance} HBAR`
          } : null);
        }
      } catch (balanceError) {
        console.warn('Failed to fetch balance:', balanceError);
      }
    } catch (error) {
      console.error('Failed to connect HashPack wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    if (window.hashpack) {
      window.hashpack.disconnect();
    }
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