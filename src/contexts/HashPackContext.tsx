import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HashPackWallet, HashPackContextType } from '@/types/hashpack';
import { supabase } from '@/integrations/supabase/client';

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
  const [pairingString] = useState(''); // Keep for compatibility but unused

  // Check if HashPack extension is available
  useEffect(() => {
    const checkHashPack = () => {
      const available = !!(window as any).hashpack;
      setIsAvailable(available);
      console.log('HashPack extension available:', available);
    };

    // Check immediately
    checkHashPack();

    // Check again after a short delay in case extension loads later
    const timer = setTimeout(checkHashPack, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Restore wallet from localStorage
  useEffect(() => {
    const savedWallet = localStorage.getItem('hashpack_wallet');
    if (savedWallet) {
      try {
        const walletData = JSON.parse(savedWallet);
        setWallet(walletData);
      } catch (error) {
        console.error('Error restoring wallet:', error);
        localStorage.removeItem('hashpack_wallet');
      }
    }
  }, []);

  const fetchBalance = async (accountId: string): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('get-hedera-balance', {
        body: { accountId },
      });

      if (error) throw error;
      
      return data?.hbarBalance || '0';
    } catch (error) {
      console.error('Error fetching balance:', error);
      return '0';
    }
  };

  const connectWallet = async (): Promise<string> => {
    if (!isAvailable) {
      throw new Error('HashPack extension not available. Please install HashPack from the Chrome Web Store.');
    }

    setIsConnecting(true);
    try {
      // Connect to HashPack extension directly
      const connectResult = await (window as any).hashpack.connectToExtension();
      
      if (!connectResult.success) {
        throw new Error(connectResult.message || 'Failed to connect to HashPack');
      }

      // Request account ID
      const accountResult = await (window as any).hashpack.requestAccountId();
      
      if (!accountResult.success || !accountResult.accountId) {
        throw new Error(accountResult.message || 'Failed to get account ID');
      }

      const accountId = accountResult.accountId;
      const network = accountResult.network || 'testnet';

      // Fetch balance
      const balance = await fetchBalance(accountId);

      // Create wallet object
      const walletData: HashPackWallet = {
        id: accountId,
        address: accountId,
        name: 'HashPack Wallet',
        network,
        balance,
        isConnected: true
      };
      
      setWallet(walletData);
      
      // Store in localStorage
      localStorage.setItem('hashpack_wallet', JSON.stringify(walletData));
      
      return 'connected'; // Return success instead of pairing string
    } catch (error) {
      console.error('HashPack connection error:', error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (isAvailable) {
        await (window as any).hashpack?.disconnect();
      }
    } catch (error) {
      console.error('Error disconnecting from HashPack:', error);
    }
    
    setWallet(null);
    localStorage.removeItem('hashpack_wallet');
  };

  return (
    <HashPackContext.Provider
      value={{
        wallet,
        isConnecting,
        connectWallet,
        disconnectWallet,
        isAvailable,
        pairingString,
      }}
    >
      {children}
    </HashPackContext.Provider>
  );
}