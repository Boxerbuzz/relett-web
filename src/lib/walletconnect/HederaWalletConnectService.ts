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
  private connectionTimeout = 30000; // 30 seconds
  private maxRetries = 3;
  private retryDelay = 1000; // Start with 1 second

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

      // Sanity check: ensure WalletConnect client actually initialized inside DAppConnector
      // The underlying library swallows init errors, so verify explicitly.
      if (!(this.dAppConnector as any).walletConnectClient) {
        throw new Error('Failed to initialize WalletConnect client');
      }

      this.isInitialized = true;
      console.log('Hedera WalletConnect initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Hedera WalletConnect:', error);
      throw error;
    }
  }

  async connectWallet(): Promise<string> {
    if (!this.isInitialized || !this.dAppConnector) {
      await this.initialize();
    }

    if (!this.dAppConnector) {
      throw new Error('DApp connector not initialized');
    }

    // Ensure the internal WalletConnect client is ready; if not, try to re-init
    if (!((this.dAppConnector as any).walletConnectClient)) {
      console.warn('WalletConnect client not ready. Re-initializing...');
      await this.dAppConnector.init();
      if (!((this.dAppConnector as any).walletConnectClient)) {
        throw new Error('WalletConnect client is not initialized');
      }
    }

    // Implement retry logic with exponential backoff
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        console.log(`Connecting wallet attempt ${attempt + 1}/${this.maxRetries}...`);
        
        // Create a promise that will timeout
        const connectionPromise = this.attemptConnection();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), this.connectionTimeout)
        );

        // Race between connection and timeout
        const result = await Promise.race([connectionPromise, timeoutPromise]);
        return result as string;
      } catch (error) {
        console.error(`Connection attempt ${attempt + 1} failed:`, error);
        
        // If this is the last attempt, throw the error
        if (attempt === this.maxRetries - 1) {
          throw this.createUserFriendlyError(error);
        }

        // Wait before retrying with exponential backoff
        const delay = this.retryDelay * Math.pow(2, attempt);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw new Error('Failed to connect after maximum retries');
  }

  private async attemptConnection(): Promise<string> {
    try {
      console.log('Opening WalletConnect modal...');
      
      // Use the DAppConnector's built-in modal flow
      const session = await this.dAppConnector!.openModal(undefined, true);
      
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
      console.error('Connection attempt failed:', error);
      throw error;
    }
  }

  private createUserFriendlyError(error: any): Error {
    const errorMessage = error?.message || 'Unknown error';
    
    if (errorMessage.includes('Subscribing to') && errorMessage.includes('failed')) {
      return new Error('WalletConnect service is temporarily unavailable. Please check your internet connection and try again.');
    }
    
    if (errorMessage.includes('WebSocket')) {
      return new Error('Connection to wallet service failed. Please check your internet connection and try again.');
    }
    
    if (errorMessage.includes('Connection timeout')) {
      return new Error('Connection timed out. Please ensure your wallet app is installed and try again.');
    }
    
    if (errorMessage.includes('User rejected')) {
      return new Error('Connection was cancelled. Please try again and approve the connection in your wallet.');
    }
    
    if (errorMessage.includes('WalletConnect is not initialized')) {
      return new Error('Wallet service failed to initialize. Please refresh the page and try again.');
    }

    return new Error(`Wallet connection failed: ${errorMessage}`);
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