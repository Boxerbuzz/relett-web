"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { DAppConnector, HederaSessionEvent, HederaJsonRpcMethod } from "@hashgraph/hedera-wallet-connect";
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
  dAppConnector: DAppConnector | null;
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
  const [dAppConnector, setDAppConnector] = useState<DAppConnector | null>(null);
  const [accountBalances, setAccountBalances] = useState<Map<string, string>>(new Map());
  const [tokenBalances, setTokenBalances] = useState<Map<string, Map<string, string>>>(new Map());

  // Initialize DAppConnector
  useEffect(() => {
    const initConnector = async () => {
      try {
        const connector = new DAppConnector(
          {
            name: "Tokenized Real Estate Platform",
            description: "Invest in fractional real estate ownership through blockchain tokens",
            url: window.location.origin,
            icons: [`${window.location.origin}/favicon.ico`],
          },
          "testnet", // Use testnet for development
          {
            methods: [
              HederaJsonRpcMethod.GetNodeAddresses,
              HederaJsonRpcMethod.ExecuteTransaction,
              HederaJsonRpcMethod.SignMessage,
              HederaJsonRpcMethod.SignAndExecuteQuery,
              HederaJsonRpcMethod.SignAndExecuteTransaction,
            ],
            chains: ["hedera:testnet"],
            events: [
              HederaSessionEvent.ChainChanged,
              HederaSessionEvent.AccountsChanged,
            ],
          }
        );

        await connector.init();
        setDAppConnector(connector);
        setIsAvailable(true);
        
        // Check for existing sessions
        const sessions = connector.walletConnectClient?.session.getAll();
        if (sessions && sessions.length > 0) {
          // Restore last session
          const lastSession = sessions[sessions.length - 1];
          const accountId = lastSession.namespaces?.hedera?.accounts?.[0]?.split(':')?.[2];
          
          if (accountId) {
            const walletData: HederaWallet = {
              id: accountId,
              address: accountId,
              type: 'hashpack', // Default to HashPack, can be enhanced to detect actual wallet
              name: "Connected Wallet",
              network: "testnet",
              isConnected: true,
            };
            
            setWallet(walletData);
            localStorage.setItem("hedera-wallet", JSON.stringify(walletData));
            await refreshBalances();
          }
        }
      } catch (error) {
        console.error("Failed to initialize DAppConnector:", error);
      }
    };

    initConnector();
  }, []);

  const connectWallet = async (walletType?: string): Promise<void> => {
    if (!dAppConnector) {
      throw new Error("DAppConnector not initialized");
    }

    try {
      setIsConnecting(true);
      console.log("Connecting to Hedera wallet...");

      // Open wallet selection modal or connect to specific wallet
      const session = await dAppConnector.openModal();
      
      if (!session) {
        throw new Error("Failed to establish wallet connection");
      }

      // Extract account information from session
      const accountId = session.namespaces?.hedera?.accounts?.[0]?.split(':')?.[2];
      
      if (!accountId) {
        throw new Error("Failed to get account ID from wallet");
      }

      // Determine wallet type from session metadata
      const walletName = session.peer?.metadata?.name || "Unknown Wallet";
      let detectedType: 'hashpack' | 'kabila' | 'blade' = 'hashpack';
      
      if (walletName.toLowerCase().includes('kabila')) {
        detectedType = 'kabila';
      } else if (walletName.toLowerCase().includes('blade')) {
        detectedType = 'blade';
      }

      const walletData: HederaWallet = {
        id: accountId,
        address: accountId,
        type: detectedType,
        name: walletName,
        network: "testnet",
        balance: "Loading...",
        isConnected: true,
      };

      setWallet(walletData);
      localStorage.setItem("hedera-wallet", JSON.stringify(walletData));
      
      // Fetch account balance
      await refreshBalances();
      
      console.log("Wallet connected successfully:", walletData);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      if (dAppConnector) {
        await dAppConnector.disconnect();
      }
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
        dAppConnector,
        accountBalances,
        tokenBalances,
        refreshBalances,
      }}
    >
      {children}
    </HederaWalletContext.Provider>
  );
}