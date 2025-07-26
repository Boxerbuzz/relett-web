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
    // Check if we're in a browser environment
    if (typeof window === 'undefined') return;

    // Check if the extension is already injected
    const checkHashPack = () => {
      console.log('Checking for HashPack extension...');
      
      // Check for both window.hashpack and window.hedera
      const hashpack = (window as any).hashpack || (window as any).hedera?.hashpack;
      
      if (hashpack) {
        console.log('HashPack detected!', hashpack);
        // Save the reference to the extension
        (window as any).hashpack = hashpack;
        setIsAvailable(true);
        return true;
      }
      
      console.log('HashPack not detected');
      setIsAvailable(false);
      return false;
    };

    // Initial check
    const isAvailable = checkHashPack();
    
    // If not available, set up a mutation observer to detect when the extension injects itself
    if (!isAvailable) {
      const observer = new MutationObserver((mutations, obs) => {
        if (checkHashPack()) {
          obs.disconnect(); // Stop observing once found
        }
      });

      // Start observing the document with the configured parameters
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false,
        characterData: false
      });

      // Also check on window load as a fallback
      const handleLoad = () => {
        checkHashPack();
        window.removeEventListener('load', handleLoad);
      };
      window.addEventListener('load', handleLoad);

      // Cleanup
      return () => {
        observer.disconnect();
        window.removeEventListener('load', handleLoad);
      };
    }
  }, []);

  const connectWallet = async (): Promise<void> => {
    // Get the HashPack API reference
    const hashpack = (window as any).hashpack || (window as any).hedera?.hashpack;
    
    if (!hashpack) {
      const error = 'HashPack wallet is not available. Please install the HashPack extension and refresh the page.';
      console.error(error);
      throw new Error(error);
    }

    setIsConnecting(true);
    try {
      // Use the HashPack API
      console.log('Attempting to connect to HashPack...');
      const connectionResult = await hashpack.connectWallet();
      console.log('Connection result:', connectionResult);
      
      if (!connectionResult?.accountId) {
        throw new Error('Failed to connect: No account ID returned');
      }
      
      const wallet: HashPackWallet = {
        id: connectionResult.accountId,
        address: connectionResult.accountId,
        name: 'HashPack Wallet',
        network: connectionResult.network === 'testnet' ? 'Hedera Testnet' : 'Hedera Mainnet',
        balance: 'Loading...',
        isConnected: true
      };

      setWallet(wallet);
      
      // Try to fetch balance if we have a valid account ID and token
      const token = localStorage.getItem('sb-access-token');
      if (token) {
        try {
          const response = await fetch('https://wossuijahchhtjzphsgh.supabase.co/functions/v1/get-hedera-balance', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
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
      }
    } catch (error) {
      console.error('Failed to connect HashPack wallet:', error);
      throw new Error(
        error instanceof Error 
          ? error.message 
          : 'Failed to connect to HashPack. Please make sure the extension is installed and you are logged in.'
      );
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