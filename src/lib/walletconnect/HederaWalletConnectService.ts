"use client";

import {
  DAppConnector,
  HederaJsonRpcMethod,
  HederaSessionEvent,
  HederaChainId,
} from "@hashgraph/hedera-wallet-connect";
import { LedgerId } from "@hashgraph/sdk";

export interface ConnectedWallet {
  id: string;
  address: string;
  type: "hashpack" | "kabila" | "blade" | "other";
  name: string;
  network: string;
  balance?: string;
  isConnected: boolean;
}

export interface WalletConnectOptions {
  projectId: string;
  metadata: {
    name: string;
    description: string;
    url: string;
    icons: string[];
  };
}

export class HederaWalletConnectService {
  private dAppConnector: DAppConnector | null = null;
  private isInitialized = false;
  private connectionCallbacks: Array<(wallet: ConnectedWallet | null) => void> =
    [];
  private currentWallet: ConnectedWallet | null = null;

  constructor(private options: WalletConnectOptions) {}

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.dAppConnector = new DAppConnector(
        this.options.metadata,
        LedgerId.TESTNET,
        this.options.projectId,
        Object.values(HederaJsonRpcMethod),
        [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged]
      );

      await this.dAppConnector.init();
      this.isInitialized = true;
      console.log("Hedera WalletConnect initialized successfully");
    } catch (error) {
      console.error("Failed to initialize Hedera WalletConnect:", error);
      throw error;
    }
  }

  async connectWallet(): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.dAppConnector) {
      throw new Error("DApp connector not initialized");
    }

    try {
      console.log("Opening WalletConnect modal...");

      // Create mock wallet for development
      const mockWallet: ConnectedWallet = {
        id: "0.0.123456",
        address: "0.0.123456",
        type: "hashpack",
        name: "HashPack Wallet",
        network: "testnet",
        isConnected: true,
      };

      this.currentWallet = mockWallet;
      this.notifyConnectionCallbacks(mockWallet);

      return mockWallet.id;
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    this.currentWallet = null;
    this.notifyConnectionCallbacks(null);
  }

  onConnectionChanged(
    callback: (wallet: ConnectedWallet | null) => void
  ): () => void {
    this.connectionCallbacks.push(callback);
    callback(this.currentWallet);

    return () => {
      const index = this.connectionCallbacks.indexOf(callback);
      if (index > -1) {
        this.connectionCallbacks.splice(index, 1);
      }
    };
  }

  private notifyConnectionCallbacks(wallet: ConnectedWallet | null): void {
    this.connectionCallbacks.forEach((callback) => callback(wallet));
  }

  getCurrentWallet(): ConnectedWallet | null {
    return this.currentWallet;
  }

  isWalletConnected(): boolean {
    return this.currentWallet?.isConnected ?? false;
  }
}
