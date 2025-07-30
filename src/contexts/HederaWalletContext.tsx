"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";

export interface HederaWallet {
  id: string;
  address: string;
  type: 'hashpack' | 'kabila' | 'blade';
  name: string;
  network: string;
  balance?: string;
  isConnected: boolean;
}

export interface HederaWalletContextType {
  wallet: HederaWallet | null;
  isConnecting: boolean;
  connectWallet: (walletType?: string) => Promise<void>;
  disconnectWallet: () => void;
  isAvailable: boolean;
  accountBalances: Map<string, string>;
  tokenBalances: Map<string, Map<string, string>>;
  refreshBalances: () => Promise<void>;
}

const HederaWalletContext = createContext<HederaWalletContextType | undefined>(
  undefined
);

export function useHederaWallet() {
  const context = useContext(HederaWalletContext);
  if (context === undefined) {
    throw new Error("useHederaWallet must be used within a HederaWalletProvider");
  }
  return context;
}

interface HederaWalletProviderProps {
  children: ReactNode;
}

export function HederaWalletProvider({ children }: HederaWalletProviderProps) {
  const [wallet, setWallet] = useState<HederaWallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [accountBalances, setAccountBalances] = useState<Map<string, string>>(new Map());
  const [tokenBalances, setTokenBalances] = useState<Map<string, Map<string, string>>>(new Map());

  // Initialize wallet availability check
  useEffect(() => {
    const checkWalletAvailability = () => {
      // For now, assume wallet connection is available
      // In a real implementation, this would check for installed wallet extensions
      setIsAvailable(true);
      
      // Check for existing wallet connection
      const savedWallet = localStorage.getItem("hedera-wallet");
      if (savedWallet) {
        try {
          const walletData = JSON.parse(savedWallet);
          setWallet(walletData);
          refreshBalances();
        } catch (error) {
          console.error("Failed to restore wallet from localStorage:", error);
          localStorage.removeItem("hedera-wallet");
        }
      }
    };

    checkWalletAvailability();
  }, []);

  const connectWallet = async (walletType?: string): Promise<void> => {
    try {
      setIsConnecting(true);
      console.log("Connecting to Hedera wallet...");

      // For development, create a mock wallet connection
      // In production, this would integrate with actual wallet connectors
      const mockWallet: HederaWallet = {
        id: "0.0.123456", // Mock Hedera account ID
        address: "0.0.123456",
        type: (walletType as any) || 'hashpack',
        name: `${walletType || 'HashPack'} Wallet`,
        network: "testnet",
        balance: "100.0 HBAR",
        isConnected: true,
      };

      setWallet(mockWallet);
      localStorage.setItem("hedera-wallet", JSON.stringify(mockWallet));
      
      // Fetch account balance
      await refreshBalances();
      
      console.log("Wallet connected successfully:", mockWallet);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      // In production, would disconnect from actual wallet
      console.log("Disconnecting wallet...");
    } catch (error) {
      console.error("Error disconnecting from wallet:", error);
    }

    setWallet(null);
    setAccountBalances(new Map());
    setTokenBalances(new Map());
    localStorage.removeItem("hedera-wallet");
  };

  const refreshBalances = async () => {
    if (!wallet?.id) return;

    try {
      // Fetch HBAR balance
      const { data: balanceData } = await supabase.functions.invoke(
        "get-hedera-balance",
        {
          body: { accountId: wallet.id },
        }
      );

      if (balanceData?.success && balanceData.data?.hbarBalance !== undefined) {
        const hbarBalance = `${balanceData.data.hbarBalance} HBAR`;
        setAccountBalances(prev => new Map(prev.set(wallet.id, hbarBalance)));
        
        setWallet(prev => prev ? {
          ...prev,
          balance: hbarBalance,
        } : null);
      }

      // Fetch token balances for all tokenized properties user has invested in
      const { data: holdings } = await supabase
        .from('token_holdings')
        .select(`
          tokenized_property_id,
          tokens_owned,
          tokenized_properties!inner(
            hedera_tokens!inner(hedera_token_id, token_symbol)
          )
        `)
        .eq('holder_id', wallet.id);

      if (holdings) {
        const newTokenBalances = new Map<string, Map<string, string>>();
        const accountTokens = new Map<string, string>();

        for (const holding of holdings) {
          const tokenId = holding.tokenized_properties?.hedera_tokens?.[0]?.hedera_token_id;
          const tokenSymbol = holding.tokenized_properties?.hedera_tokens?.[0]?.token_symbol;
          
          if (tokenId && tokenSymbol) {
            accountTokens.set(tokenId, `${holding.tokens_owned} ${tokenSymbol}`);
          }
        }

        if (accountTokens.size > 0) {
          newTokenBalances.set(wallet.id, accountTokens);
          setTokenBalances(newTokenBalances);
        }
      }
    } catch (error) {
      console.warn("Failed to fetch balances:", error);
    }
  };

  return (
    <HederaWalletContext.Provider
      value={{
        wallet,
        isConnecting,
        connectWallet,
        disconnectWallet,
        isAvailable,
        accountBalances,
        tokenBalances,
        refreshBalances,
      }}
    >
      {children}
    </HederaWalletContext.Provider>
  );
}