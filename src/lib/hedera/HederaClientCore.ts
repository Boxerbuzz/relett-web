import { Client, AccountId, PrivateKey } from "@hashgraph/sdk";

export class HederaClientCore {
  public client!: Client;
  private operatorId!: AccountId;
  private operatorKey: PrivateKey | null = null;

  constructor() {
    const hederaNetwork = import.meta.env.VITE_HEDERA_NETWORK;
    const hederaAccountId = import.meta.env.VITE_HEDERA_ACCOUNT_ID;
    const hederaPrivateKey = import.meta.env.VITE_HEDERA_PRIVATE_KEY;

    if (!hederaNetwork || !hederaAccountId || !hederaPrivateKey) {
      throw new Error("Hedera credentials not found in environment variables. Please set VITE_HEDERA_NETWORK, VITE_HEDERA_ACCOUNT_ID, and VITE_HEDERA_PRIVATE_KEY.");
    }

    try {
      // Initialize with real credentials
      this.client = hederaNetwork === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
      this.operatorId = AccountId.fromString(hederaAccountId);
      this.operatorKey = PrivateKey.fromStringECDSA(hederaPrivateKey);
      this.client.setOperator(this.operatorId, this.operatorKey);
      console.log(`Hedera client initialized for ${hederaNetwork} with account ${hederaAccountId}`);
    } catch (error) {
      console.error("Failed to initialize Hedera client with provided credentials:", error);
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
