import { Client, AccountId, PrivateKey } from "@hashgraph/sdk";

export class HederaClientCore {
  public client: Client = Client.forTestnet();
  private operatorId: AccountId = AccountId.fromString("0.0.2");
  private operatorKey: PrivateKey | null = null;

  constructor() {
    // In Lovable, we need to use backend integration for Hedera credentials
    // Frontend should not have direct access to private keys
    console.warn(
      "Hedera client initialized in mock mode. Use backend Edge Functions for actual blockchain operations."
    );
    this.initializeMockClient();
  }

  private initializeMockClient() {
    this.client = Client.forTestnet();
    this.operatorId = AccountId.fromString("0.0.2");
  }

  public isMockMode(): boolean {
    return true; // Always true for frontend
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
