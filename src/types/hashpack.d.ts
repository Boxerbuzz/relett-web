import { HashConnect, HashConnectTypes, MessageTypes } from 'hashconnect';

export interface HashPackWallet {
  id: string;
  address: string;
  name: string;
  network: string;
  balance?: number;
  isConnected: boolean;
}

export interface HashPackContextType {
  wallet: HashPackWallet | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isAvailable: boolean;
  hashConnect: HashConnect | null;
}

export { HashConnect, HashConnectTypes, MessageTypes };