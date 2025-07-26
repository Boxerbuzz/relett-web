import { Client, AccountId, PrivateKey } from "@hashgraph/sdk";

export class HederaClientCore {
  public client!: Client;
  private operatorId!: AccountId;
  private operatorKey: PrivateKey | null = null;

  constructor() {
    const hederaNetwork = import.meta.env.VITE_HEDERA_NETWORK;
    const hederaAccountId = import.meta.env.VITE_HEDERA_ACCOUNT_ID;

    if (!hederaNetwork || !hederaAccountId) {
      throw new Error("Hedera network configuration not found. Please set VITE_HEDERA_NETWORK and VITE_HEDERA_ACCOUNT_ID.");
    }

    try {
      // Initialize client without private key for read-only operations
      this.client = hederaNetwork === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
      this.operatorId = AccountId.fromString(hederaAccountId);
      
      console.log(`Hedera client initialized for ${hederaNetwork} with account ${hederaAccountId} (read-only mode)`);
      console.warn("SECURITY: Private key operations should only be performed server-side via edge functions");
    } catch (error) {
      console.error("Failed to initialize Hedera client:", error);
      throw error;
    }
  }

  public getOperatorId(): AccountId {
    return this.operatorId;
  }

  public getOperatorKey(): PrivateKey | null {
    return this.operatorKey;
  }

  public close() {
    if (this.client) {
      this.client.close();
    }
  }
}
