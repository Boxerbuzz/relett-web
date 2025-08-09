"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { HederaWalletConnectService, ConnectedWallet } from "@/lib/walletconnect/HederaWalletConnectService";
import { walletConnectConfig, isWalletConnectConfigured } from "@/lib/walletconnect/config";

export interface HederaWallet extends ConnectedWallet {}

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
  const [walletConnectService, setWalletConnectService] = useState<HederaWalletConnectService | null>(null);

  // Initialize WalletConnect service
  useEffect(() => {
    const initializeWalletConnect = async () => {
      try {
        if (!isWalletConnectConfigured()) {
          console.warn('WalletConnect not configured. Please set up PROJECT_ID in config.ts');
          setIsAvailable(false);
          return;
        }

        const service = new HederaWalletConnectService(walletConnectConfig);
        await service.initialize();
        setWalletConnectService(service);
        setIsAvailable(true);

        // Set up connection listener
        const unsubscribe = service.onConnectionChanged((connectedWallet) => {
          setWallet(connectedWallet);
          if (connectedWallet) {
            refreshBalances();
          } else {
            setAccountBalances(new Map());
            setTokenBalances(new Map());
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Failed to initialize WalletConnect:', error);
        setIsAvailable(false);
      }
    };

    initializeWalletConnect();
  }, []);

  const connectWallet = async (walletType?: string): Promise<void> => {
    if (!walletConnectService) {
      throw new Error('WalletConnect service not initialized');
    }

    try {
      setIsConnecting(true);
      console.log("Connecting to Hedera wallet via WalletConnect...");
      
      const accountId = await walletConnectService.connectWallet();
      console.log("Wallet connected successfully with account:", accountId);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (!walletConnectService) return;

    try {
      console.log("Disconnecting wallet...");
      await walletConnectService.disconnectWallet();
    } catch (error) {
      console.error("Error disconnecting from wallet:", error);
    }
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