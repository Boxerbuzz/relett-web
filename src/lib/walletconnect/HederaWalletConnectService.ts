'use client';

import { DAppConnector, HederaJsonRpcMethod, HederaSessionEvent, HederaChainId } from '@hashgraph/hedera-wallet-connect';
import { LedgerId } from '@hashgraph/sdk';

export interface ConnectedWallet {
  id: string;
  address: string;
  type: 'hashpack' | 'kabila' | 'blade' | 'other';
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
  private connectionCallbacks: Array<(wallet: ConnectedWallet | null) => void> = [];
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
      console.log('Hedera WalletConnect initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Hedera WalletConnect:', error);
      throw error;
    }
  }

  async connectWallet(): Promise<string> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.dAppConnector) {
      throw new Error('DApp connector not initialized');
    }

    try {
      console.log('Opening WalletConnect modal...');
      
      // Open WalletConnect modal and wait for connection
      const session = await this.dAppConnector.connect(
        (uri: string) => {
          console.log('WalletConnect URI:', uri);
        }
      );
      
      if (!session) {
        throw new Error('No session returned from wallet connection');
      }

      // Extract wallet information from session
      const accounts = session.namespaces?.hedera?.accounts || [];
      if (accounts.length === 0) {
        throw new Error('No accounts found in wallet session');
      }

      // Parse the first account (format: "hedera:testnet:0.0.123456")
      const accountString = accounts[0];
      const accountParts = accountString.split(':');
      const accountId = accountParts[accountParts.length - 1];
      const network = accountParts[1] || 'testnet';

      // Determine wallet type from session metadata
      const walletName = session.peer?.metadata?.name || 'Unknown Wallet';
      let walletType: 'hashpack' | 'kabila' | 'blade' | 'other' = 'other';
      
      if (walletName.toLowerCase().includes('hashpack')) {
        walletType = 'hashpack';
      } else if (walletName.toLowerCase().includes('kabila')) {
        walletType = 'kabila';
      } else if (walletName.toLowerCase().includes('blade')) {
        walletType = 'blade';
      }

      const connectedWallet: ConnectedWallet = {
        id: accountId,
        address: accountId,
        type: walletType,
        name: walletName,
        network: network,
        isConnected: true,
      };

      this.currentWallet = connectedWallet;
      this.notifyConnectionCallbacks(connectedWallet);
      
      console.log('Wallet connected successfully:', connectedWallet);
      return accountId;
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }

  async disconnectWallet(): Promise<void> {
    if (this.dAppConnector && this.currentWallet) {
      try {
        await this.dAppConnector.disconnect('topic');
      } catch (error) {
        console.error('Error disconnecting wallet:', error);
      }
    }
    this.currentWallet = null;
    this.notifyConnectionCallbacks(null);
  }

  onConnectionChanged(callback: (wallet: ConnectedWallet | null) => void): () => void {
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
    this.connectionCallbacks.forEach(callback => callback(wallet));
  }

  getCurrentWallet(): ConnectedWallet | null {
    return this.currentWallet;
  }

  isWalletConnected(): boolean {
    return this.currentWallet?.isConnected ?? false;
  }
}