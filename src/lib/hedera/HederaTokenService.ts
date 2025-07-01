import {
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  TokenId,
  TokenAssociateTransaction,
  TokenMintTransaction,
  TransferTransaction,
  TokenInfoQuery,
  AccountBalanceQuery,
  Hbar,
  KeyList,
  PublicKey,
  AccountId,
  PrivateKey,
} from "@hashgraph/sdk";
import { HederaClientCore } from "./HederaClientCore";

export class HederaTokenService extends HederaClientCore {
  async createPropertyToken(
    name: string,
    symbol: string,
    totalSupply: number,
    adminKeys?: string[]
  ): Promise<{ tokenId: string; transactionId: string }> {
    if (this.isMockMode()) {
      console.log("Mock mode: Token creation simulated");
      return {
        tokenId: `0.0.${Math.floor(Math.random() * 1000000)}`,
        transactionId: `mock_tx_${Date.now()}`,
      };
    }

    try {
      let tokenCreateTx = new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(2)
        .setInitialSupply(totalSupply)
        .setTreasuryAccountId(this.getOperatorId())
        .setAdminKey(this.getOperatorKey()!.publicKey)
        .setSupplyKey(this.getOperatorKey()!.publicKey)
        .freezeWith(this.client);

      if (adminKeys && adminKeys.length > 0) {
        const keyList = new KeyList();
        for (const keyString of adminKeys) {
          const publicKey = PublicKey.fromString(keyString);
          keyList.push(publicKey);
        }
        tokenCreateTx = tokenCreateTx.setAdminKey(keyList);
      }

      const tokenCreateSign = await tokenCreateTx.sign(this.getOperatorKey()!);
      const tokenCreateSubmit = await tokenCreateSign.execute(this.client);
      const tokenCreateRx = await tokenCreateSubmit.getReceipt(this.client);

      const tokenId = tokenCreateRx.tokenId;
      if (!tokenId) {
        throw new Error("Token creation failed - no token ID returned");
      }

      return {
        tokenId: tokenId.toString(),
        transactionId: tokenCreateSubmit.transactionId.toString(),
      };
    } catch (error) {
      console.error("Error creating property token:", error);
      throw error;
    }
  }

  async createPropertyNFT(params: {
    name: string;
    symbol: string;
    memo?: string;
    maxSupply?: number;
  }) {
    if (this.isMockMode()) {
      console.log("Mock mode: NFT creation simulated");
      return {
        tokenId: `0.0.${Math.floor(Math.random() * 1000000)}`,
        transactionId: `mock_tx_${Date.now()}`,
        status: "SUCCESS",
      };
    }

    try {
      const transaction = new TokenCreateTransaction()
        .setTokenName(params.name)
        .setTokenSymbol(params.symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(params.maxSupply || 1)
        .setTreasuryAccountId(this.getOperatorId())
        .setAdminKey(this.getOperatorKey()!)
        .setSupplyKey(this.getOperatorKey()!)
        .setFreezeKey(this.getOperatorKey()!)
        .setWipeKey(this.getOperatorKey()!)
        .setMetadataKey(this.getOperatorKey()!)
        .setPauseKey(this.getOperatorKey()!);

      if (params.memo) {
        transaction.setTokenMemo(params.memo);
      }

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        tokenId: receipt.tokenId?.toString(),
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString(),
      };
    } catch (error) {
      console.error("Error creating property NFT:", error);
      throw error;
    }
  }

  async associateToken(
    accountId: string,
    tokenId: string,
    accountPrivateKey: string
  ) {
    if (this.isMockMode()) {
      console.log("Mock mode: Token association simulated");
      return {
        transactionId: `mock_tx_${Date.now()}`,
        status: "SUCCESS",
      };
    }

    try {
      const accountKey = PrivateKey.fromStringECDSA(accountPrivateKey);
      const account = AccountId.fromString(accountId);
      const token = TokenId.fromString(tokenId);

      const transaction = new TokenAssociateTransaction()
        .setAccountId(account)
        .setTokenIds([token])
        .freezeWith(this.client);

      const signedTx = await transaction.sign(accountKey);
      const response = await signedTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString(),
      };
    } catch (error) {
      console.error("Error associating token:", error);
      throw error;
    }
  }

  async mintTokens(
    tokenId: string,
    amount: number,
    receiverAccountId?: string
  ) {
    if (this.isMockMode()) {
      console.log("Mock mode: Token minting simulated");
      return {
        transactionId: `mock_tx_${Date.now()}`,
        status: "SUCCESS",
        serialNumbers: [],
      };
    }

    try {
      const token = TokenId.fromString(tokenId);

      const transaction = new TokenMintTransaction()
        .setTokenId(token)
        .setAmount(amount);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString(),
        serialNumbers: receipt.serials,
      };
    } catch (error) {
      console.error("Error minting tokens:", error);
      throw error;
    }
  }

  async transferTokens(params: {
    tokenId: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    fromPrivateKey: string;
  }) {
    if (this.isMockMode()) {
      console.log("Mock mode: Token transfer simulated");
      return {
        transactionId: `mock_tx_${Date.now()}`,
        status: "SUCCESS",
      };
    }

    try {
      const token = TokenId.fromString(params.tokenId);
      const fromAccount = AccountId.fromString(params.fromAccountId);
      const toAccount = AccountId.fromString(params.toAccountId);
      const fromKey = PrivateKey.fromStringECDSA(params.fromPrivateKey);

      const transaction = new TransferTransaction()
        .addTokenTransfer(token, fromAccount, -params.amount)
        .addTokenTransfer(token, toAccount, params.amount)
        .freezeWith(this.client);

      const signedTx = await transaction.sign(fromKey);
      const response = await signedTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString(),
      };
    } catch (error) {
      console.error("Error transferring tokens:", error);
      throw error;
    }
  }

  async getTokenInfo(tokenId: string) {
    if (this.isMockMode()) {
      console.log("Mock mode: Token info retrieval simulated");
      return {
        tokenId: tokenId,
        name: "Mock Token",
        symbol: "MOCK",
        decimals: 2,
        totalSupply: "1000000",
        treasury: "0.0.2",
        adminKey: undefined,
        supplyKey: undefined,
        isDeleted: false,
        tokenType: "FUNGIBLE_COMMON",
      };
    }

    try {
      const token = TokenId.fromString(tokenId);
      const query = new TokenInfoQuery().setTokenId(token);
      const tokenInfo = await query.execute(this.client);

      return {
        tokenId: tokenInfo.tokenId.toString(),
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        totalSupply: tokenInfo.totalSupply.toString(),
        treasury: tokenInfo.treasuryAccountId?.toString() || "",
        adminKey: tokenInfo.adminKey?.toString(),
        supplyKey: tokenInfo.supplyKey?.toString(),
        isDeleted: tokenInfo.isDeleted,
        tokenType: tokenInfo.tokenType?.toString(),
      };
    } catch (error) {
      console.error("Error getting token info:", error);
      throw error;
    }
  }

  async getAccountBalance(accountId: string) {
    if (this.isMockMode()) {
      console.log("Mock mode: Account balance retrieval simulated");
      return {
        hbarBalance: "100.0",
        tokens: [],
      };
    }

    try {
      const account = AccountId.fromString(accountId);
      const query = new AccountBalanceQuery().setAccountId(account);
      const balance = await query.execute(this.client);

      const tokenBalances: Array<{ tokenId: string; balance: string }> = [];

      if (balance.tokens) {
        Object.entries(balance.tokens).forEach(([tokenId, amount]) => {
          tokenBalances.push({
            tokenId: tokenId.toString(),
            balance: amount.toString(),
          });
        });
      }

      return {
        hbarBalance: balance.hbars.toString(),
        tokens: tokenBalances,
      };
    } catch (error) {
      console.error("Error getting account balance:", error);
      throw error;
    }
  }
}
