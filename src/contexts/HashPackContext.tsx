"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { HashPackWallet, HashPackContextType } from "@/types/hashpack";
import { HashConnect } from "@hashgraph/hashconnect";

const HashPackContext = createContext<HashPackContextType | undefined>(
  undefined
);

export function useHashPack() {
  const context = useContext(HashPackContext);
  if (context === undefined) {
    throw new Error("useHashPack must be used within a HashPackProvider");
  }
  return context;
}

interface HashPackProviderProps {
  children: ReactNode;
}

export function HashPackProvider({ children }: HashPackProviderProps) {
  const [hashconnect] = useState(() => new HashConnect());
  const [wallet, setWallet] = useState<HashPackWallet | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true); // HashConnect should always be available

  const fetchBalance = async (accountId: string) => {
    try {
      const { data: balanceData } = await supabase.functions.invoke(
        "get-hedera-balance",
        {
          body: { accountId },
        }
      );

      if (balanceData?.success && balanceData.data?.hbarBalance !== undefined) {
        setWallet((prev) =>
          prev
            ? {
                ...prev,
                balance: `${balanceData.data.hbarBalance} HBAR`,
              }
            : null
        );
      }
    } catch (error) {
      console.warn("Failed to fetch balance:", error);
      setWallet((prev) =>
        prev ? { ...prev, balance: "Error loading balance" } : null
      );
    }
  };

  // Initialize HashConnect
  useEffect(() => {
    const initHashConnect = async () => {
      try {
        const appMetadata = {
          name: "Real Estate DApp",
          description: "Tokenized Real Estate Platform",
          icon: "/favicon.ico",
        };
        
        await hashconnect.init(appMetadata, "testnet");
        console.log("HashConnect initialized successfully");
        
        // Check for existing connection
        const savedWallet = localStorage.getItem("hashpack-wallet");
        if (savedWallet) {
          try {
            const walletData = JSON.parse(savedWallet);
            setWallet(walletData);
            fetchBalance(walletData.id);
          } catch (error) {
            console.error("Failed to restore wallet from localStorage:", error);
            localStorage.removeItem("hashpack-wallet");
          }
        }
      } catch (error) {
        console.error("Failed to initialize HashConnect:", error);
      }
    };

    initHashConnect();
  }, [hashconnect]);

  const connectWallet = async (): Promise<void> => {
    try {
      setIsConnecting(true);
      console.log("Connecting via HashConnect...");

      // Connect using HashConnect
      hashconnect.connect();
      
      // Listen for pairing event
      hashconnect.pairingEvent.on((pairingData) => {
        console.log("Pairing successful:", pairingData);
        
        const walletData: HashPackWallet = {
          id: pairingData.accountIds[0],
          address: pairingData.accountIds[0],
          name: "HashPack Wallet",
          network: pairingData.network || "testnet",
          balance: "Loading...",
          isConnected: true,
        };

        setWallet(walletData);
        localStorage.setItem("hashpack-wallet", JSON.stringify(walletData));
        fetchBalance(pairingData.accountIds[0]);
        setIsConnecting(false);
      });

    } catch (error) {
      console.error("Failed to connect wallet:", error);
      setIsConnecting(false);
      throw error;
    }
  };

  const disconnectWallet = async () => {
    try {
      hashconnect.disconnect(wallet?.id || "");
    } catch (error) {
      console.error("Error disconnecting from HashConnect:", error);
    }

    setWallet(null);
    localStorage.removeItem("hashpack-wallet");
  };

  return (
    <HashPackContext.Provider
      value={{
        wallet,
        isConnecting,
        connectWallet,
        disconnectWallet,
        isAvailable,
      }}
    >
      {children}
    </HashPackContext.Provider>
  );
}
