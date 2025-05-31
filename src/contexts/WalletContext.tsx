
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Wallet {
  id: string;
  address: string;
  type: 'metamask' | 'walletconnect' | 'coinbase' | 'phantom' | 'other';
  name: string;
  balance?: string;
  network?: string;
  isConnected: boolean;
}

interface WalletContextType {
  wallets: Wallet[];
  connectedWallet: Wallet | null;
  connectWallet: (wallet: Wallet) => void;
  disconnectWallet: () => void;
  addWallet: (wallet: Wallet) => void;
  removeWallet: (walletId: string) => void;
  isConnecting: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallets, setWallets] = useState<Wallet[]>([
    // Mock wallets for demo
    {
      id: '1',
      address: '0x742d35Cc6637C0532F72740C9c63A8f2De5c5e5A',
      type: 'metamask',
      name: 'MetaMask Wallet',
      balance: '1.25 ETH',
      network: 'Ethereum',
      isConnected: false
    },
    {
      id: '2',
      address: '0x8ba1f109551bd432803012645hac136c5dc9c',
      type: 'coinbase',
      name: 'Coinbase Wallet',
      balance: '0.85 ETH',
      network: 'Ethereum',
      isConnected: false
    }
  ]);
  
  const [connectedWallet, setConnectedWallet] = useState<Wallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async (wallet: Wallet) => {
    setIsConnecting(true);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const updatedWallet = { ...wallet, isConnected: true };
    setWallets(prev => prev.map(w => 
      w.id === wallet.id 
        ? updatedWallet 
        : { ...w, isConnected: false }
    ));
    setConnectedWallet(updatedWallet);
    setIsConnecting(false);
  };

  const disconnectWallet = () => {
    if (connectedWallet) {
      setWallets(prev => prev.map(w => 
        w.id === connectedWallet.id 
          ? { ...w, isConnected: false }
          : w
      ));
      setConnectedWallet(null);
    }
  };

  const addWallet = (wallet: Wallet) => {
    setWallets(prev => [...prev, { ...wallet, id: Date.now().toString() }]);
  };

  const removeWallet = (walletId: string) => {
    setWallets(prev => prev.filter(w => w.id !== walletId));
    if (connectedWallet?.id === walletId) {
      setConnectedWallet(null);
    }
  };

  return (
    <WalletContext.Provider value={{
      wallets,
      connectedWallet,
      connectWallet,
      disconnectWallet,
      addWallet,
      removeWallet,
      isConnecting
    }}>
      {children}
    </WalletContext.Provider>
  );
}
