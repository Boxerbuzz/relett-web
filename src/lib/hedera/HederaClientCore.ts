import { Client, AccountId, PrivateKey } from "@hashgraph/sdk";

export class HederaClientCore {
  public client!: Client;
  private operatorId!: AccountId;
  private operatorKey: PrivateKey | null = null;
  private mockMode: boolean = false;

  constructor() {
    const hederaNetwork = import.meta.env.VITE_HEDERA_NETWORK;
    const hederaAccountId = import.meta.env.VITE_HEDERA_ACCOUNT_ID;
    const hederaPrivateKey = import.meta.env.VITE_HEDERA_PRIVATE_KEY;

    if (hederaNetwork && hederaAccountId && hederaPrivateKey) {
      // Initialize with real credentials
      this.client = hederaNetwork === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
      this.operatorId = AccountId.fromString(hederaAccountId);
      
      try {
        this.operatorKey = PrivateKey.fromStringECDSA(hederaPrivateKey);
        this.client.setOperator(this.operatorId, this.operatorKey);
        this.mockMode = false;
        console.log(`Hedera client initialized for ${hederaNetwork} with account ${hederaAccountId}`);
      } catch (error) {
        console.error("Failed to initialize Hedera client with provided credentials:", error);
        this.initializeMockClient();
      }
    } else {
      console.warn("Hedera credentials not found in environment variables. Initializing in mock mode.");
      this.initializeMockClient();
    }
  }

  private initializeMockClient() {
    this.client = Client.forTestnet();
    this.operatorId = AccountId.fromString("0.0.2");
    this.operatorKey = null;
    this.mockMode = true;
  }

  public isMockMode(): boolean {
    return this.mockMode;
  }

  public getOperatorId(): AccountId {
    return this.operatorId || AccountId.fromString("0.0.2");
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
