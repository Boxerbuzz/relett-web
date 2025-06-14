
import {
  Client,
  AccountId,
  PrivateKey,
} from "@hashgraph/sdk";

export class HederaClientCore {
  public client: Client;
  private operatorId: AccountId;
  private operatorKey: PrivateKey | null = null;

  constructor() {
    const accountId =
      import.meta.env.VITE_HEDERA_ACCOUNT_ID || import.meta.env.VITE_HEDERA_TESTNET_ACCOUNT_ID;
    const privateKey =
      import.meta.env.VITE_HEDERA_PRIVATE_KEY || import.meta.env.VITE_HEDERA_TESTNET_PRIVATE_KEY;
    const network = import.meta.env.VITE_HEDERA_NETWORK || "testnet";

    if (!accountId || !privateKey || 
        typeof accountId !== 'string' || typeof privateKey !== 'string' ||
        accountId.includes('dummy') || privateKey.includes('dummy')) {
      console.warn('Hedera credentials not properly configured or using dummy values. Using mock mode.');
      this.initializeMockClient();
      return;
    }

    try {
      this.operatorId = AccountId.fromString(accountId);
      this.operatorKey = PrivateKey.fromStringECDSA(privateKey);

      if (network === "mainnet") {
        this.client = Client.forMainnet();
      } else {
        this.client = Client.forTestnet();
      }

      this.client.setOperator(this.operatorId, this.operatorKey);
    } catch (error) {
      console.error('Failed to initialize Hedera client with provided credentials:', error);
      console.warn('Falling back to mock mode.');
      this.initializeMockClient();
    }
  }

  private initializeMockClient() {
    this.client = Client.forTestnet();
    this.operatorId = AccountId.fromString("0.0.2");
  }

  public isMockMode(): boolean {
    return !this.operatorKey || this.operatorId.toString() === "0.0.2";
  }

  public getOperatorId(): AccountId {
    return this.operatorId;
  }

  public getOperatorKey(): PrivateKey | null {
    return this.operatorKey;
  }

  public close() {
    if (this.client && !this.isMockMode()) {
      this.client.close();
    }
  }
}
