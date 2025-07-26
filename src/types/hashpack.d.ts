import { DAppConnector, HederaSessionEvent, HederaJsonRpcMethod, HederaChainId } from '@hashgraph/hedera-wallet-connect';

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
  connector: DAppConnector | null;
}

export { DAppConnector, HederaSessionEvent, HederaJsonRpcMethod, HederaChainId };