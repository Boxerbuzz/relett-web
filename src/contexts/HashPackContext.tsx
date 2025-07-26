'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { HashPackWallet, HashPackContextType } from '@/types/hashpack';


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
  console.log('HashPackProvider rendered');
  const [wallet, setWallet] = useState<HashPackWallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);

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

  // Check HashPack extension availability
  useEffect(() => {
    const checkHashPackAvailability = () => {
      console.log('Checking HashPack availability...');
      const available = typeof window !== 'undefined' && !!window.hashpack;
      console.log('HashPack available:', available);
      setIsAvailable(available);
      
      // Check for existing connection
      if (available) {
        const savedWallet = localStorage.getItem('hashpack-wallet');
        if (savedWallet) {
          try {
            const walletData = JSON.parse(savedWallet);
            setWallet(walletData);
            fetchBalance(walletData.id);
          } catch (error) {
            console.error('Failed to restore wallet from localStorage:', error);
            localStorage.removeItem('hashpack-wallet');
          }
        }
      }
    };

    // Check immediately and after a short delay to handle extension loading
    checkHashPackAvailability();
    const timer = setTimeout(checkHashPackAvailability, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const connectWallet = async (): Promise<void> => {
    if (!window.hashpack) {
      throw new Error('HashPack extension not found. Please install HashPack from the Chrome Web Store.');
    }

    try {
      setIsConnecting(true);
      console.log('Connecting to HashPack extension...');
      
      // Connect to extension
      const connectionResult = await window.hashpack.connectToExtension();
      console.log('Connection result:', connectionResult);
      
      if (!connectionResult.success) {
        throw new Error(connectionResult.message || 'Failed to connect to HashPack extension');
      }

      // Request account ID
      const accountResult = await window.hashpack.requestAccountId();
      console.log('Account result:', accountResult);
      
      if (!accountResult.success || !accountResult.accountId) {
        throw new Error(accountResult.message || 'Failed to get account ID from HashPack');
      }

      const walletData: HashPackWallet = {
        id: accountResult.accountId,
        address: accountResult.accountId,
        name: 'HashPack Wallet',
        network: accountResult.network || 'testnet',
        balance: 'Loading...',
        isConnected: true
      };

      setWallet(walletData);
      localStorage.setItem('hashpack-wallet', JSON.stringify(walletData));
      fetchBalance(accountResult.accountId);
      
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (window.hashpack) {
        await window.hashpack.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting from HashPack:', error);
    }
    
    setWallet(null);
    localStorage.removeItem('hashpack-wallet');
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