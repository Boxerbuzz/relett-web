import {
  Client,
  AccountId,
  PrivateKey,
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
  HbarUnit
} from '@hashgraph/sdk';

// Hedera Client Configuration
export class HederaClient {
  private client: Client;
  private operatorId: AccountId;
  private operatorKey: PrivateKey;

  constructor() {
    // Use environment variables for configuration
    const accountId = process.env.HEDERA_ACCOUNT_ID || process.env.HEDERA_TESTNET_ACCOUNT_ID;
    const privateKey = process.env.HEDERA_PRIVATE_KEY || process.env.HEDERA_TESTNET_PRIVATE_KEY;
    const network = process.env.HEDERA_NETWORK || 'testnet';

    if (!accountId || !privateKey) {
      throw new Error('Hedera account credentials not configured');
    }

    this.operatorId = AccountId.fromString(accountId);
    this.operatorKey = PrivateKey.fromString(privateKey);

    // Configure client for testnet or mainnet
    if (network === 'mainnet') {
      this.client = Client.forMainnet();
    } else {
      this.client = Client.forTestnet();
    }

    this.client.setOperator(this.operatorId, this.operatorKey);
  }

  // Create a fungible token for fractional property ownership
  async createPropertyToken(params: {
    name: string;
    symbol: string;
    totalSupply: number;
    decimals: number;
    memo?: string;
  }) {
    try {
      const transaction = new TokenCreateTransaction()
        .setTokenName(params.name)
        .setTokenSymbol(params.symbol)
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(params.decimals)
        .setInitialSupply(params.totalSupply)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(params.totalSupply)
        .setTreasuryAccountId(this.operatorId)
        .setAdminKey(this.operatorKey)
        .setSupplyKey(this.operatorKey)
        .setFreezeKey(this.operatorKey)
        .setWipeKey(this.operatorKey)
        .setFeeScheduleKey(this.operatorKey)
        .setPauseKey(this.operatorKey);

      if (params.memo) {
        transaction.setTokenMemo(params.memo);
      }

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      
      return {
        tokenId: receipt.tokenId?.toString(),
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString()
      };
    } catch (error) {
      console.error('Error creating property token:', error);
      throw error;
    }
  }

  // Create an NFT for unique property ownership
  async createPropertyNFT(params: {
    name: string;
    symbol: string;
    memo?: string;
    maxSupply?: number;
  }) {
    try {
      const transaction = new TokenCreateTransaction()
        .setTokenName(params.name)
        .setTokenSymbol(params.symbol)
        .setTokenType(TokenType.NonFungibleUnique)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(params.maxSupply || 1)
        .setTreasuryAccountId(this.operatorId)
        .setAdminKey(this.operatorKey)
        .setSupplyKey(this.operatorKey)
        .setFreezeKey(this.operatorKey)
        .setWipeKey(this.operatorKey)
        .setMetadataKey(this.operatorKey)
        .setPauseKey(this.operatorKey);

      if (params.memo) {
        transaction.setTokenMemo(params.memo);
      }

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      
      return {
        tokenId: receipt.tokenId?.toString(),
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString()
      };
    } catch (error) {
      console.error('Error creating property NFT:', error);
      throw error;
    }
  }

  // Associate account with token (required before receiving tokens)
  async associateToken(accountId: string, tokenId: string, accountPrivateKey: string) {
    try {
      const accountKey = PrivateKey.fromString(accountPrivateKey);
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
        status: receipt.status.toString()
      };
    } catch (error) {
      console.error('Error associating token:', error);
      throw error;
    }
  }

  // Mint tokens for property investment
  async mintTokens(tokenId: string, amount: number, receiverAccountId?: string) {
    try {
      const token = TokenId.fromString(tokenId);
      const receiver = receiverAccountId ? AccountId.fromString(receiverAccountId) : this.operatorId;

      const transaction = new TokenMintTransaction()
        .setTokenId(token)
        .setAmount(amount);

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString(),
        serialNumbers: receipt.serials
      };
    } catch (error) {
      console.error('Error minting tokens:', error);
      throw error;
    }
  }

  // Transfer tokens between accounts
  async transferTokens(params: {
    tokenId: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    fromPrivateKey: string;
  }) {
    try {
      const token = TokenId.fromString(params.tokenId);
      const fromAccount = AccountId.fromString(params.fromAccountId);
      const toAccount = AccountId.fromString(params.toAccountId);
      const fromKey = PrivateKey.fromString(params.fromPrivateKey);

      const transaction = new TransferTransaction()
        .addTokenTransfer(token, fromAccount, -params.amount)
        .addTokenTransfer(token, toAccount, params.amount)
        .freezeWith(this.client);

      const signedTx = await transaction.sign(fromKey);
      const response = await signedTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString()
      };
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw error;
    }
  }

  // Get token information
  async getTokenInfo(tokenId: string) {
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
        treasury: tokenInfo.treasuryAccountId.toString(),
        adminKey: tokenInfo.adminKey?.toString(),
        supplyKey: tokenInfo.supplyKey?.toString(),
        isDeleted: tokenInfo.isDeleted,
        tokenType: tokenInfo.tokenType.toString()
      };
    } catch (error) {
      console.error('Error getting token info:', error);
      throw error;
    }
  }

  // Transfer HBAR (for transaction fees)
  async transferHbar(params: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    fromPrivateKey: string;
  }) {
    try {
      const fromAccount = AccountId.fromString(params.fromAccountId);
      const toAccount = AccountId.fromString(params.toAccountId);
      const fromKey = PrivateKey.fromString(params.fromPrivateKey);

      const transaction = new TransferTransaction()
        .addHbarTransfer(fromAccount, Hbar.from(-params.amount, HbarUnit.Hbar))
        .addHbarTransfer(toAccount, Hbar.from(params.amount, HbarUnit.Hbar))
        .freezeWith(this.client);

      const signedTx = await transaction.sign(fromKey);
      const response = await signedTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString()
      };
    } catch (error) {
      console.error('Error transferring HBAR:', error);
      throw error;
    }
  }

  // Get account balance - Fixed method
  async getAccountBalance(accountId: string) {
    try {
      const account = AccountId.fromString(accountId);
      const query = new AccountBalanceQuery().setAccountId(account);
      const balance = await query.execute(this.client);

      return {
        hbarBalance: balance.hbars.toString(),
        tokens: balance.tokens ? Array.from(balance.tokens.entries()).map(([tokenId, amount]) => ({
          tokenId: tokenId.toString(),
          balance: amount.toString()
        })) : []
      };
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw error;
    }
  }

  // Close client connection
  close() {
    this.client.close();
  }
}

// Utility functions for token operations
export const hederaUtils = {
  // Generate a unique token symbol for a property
  generateTokenSymbol: (propertyTitle: string, propertyId: string) => {
    const cleaned = propertyTitle.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const truncated = cleaned.substring(0, 4);
    const idSuffix = propertyId.substring(0, 4).toUpperCase();
    return `${truncated}${idSuffix}`;
  },

  // Calculate token distribution for revenue sharing
  calculateTokenDistribution: (totalRevenue: number, totalSupply: number) => {
    return totalRevenue / totalSupply;
  },

  // Validate Hedera account ID format
  isValidAccountId: (accountId: string) => {
    const pattern = /^\d+\.\d+\.\d+$/;
    return pattern.test(accountId);
  },

  // Validate Hedera token ID format
  isValidTokenId: (tokenId: string) => {
    const pattern = /^\d+\.\d+\.\d+$/;
    return pattern.test(tokenId);
  },

  // Convert HBAR to tinybar (smallest unit)
  hbarToTinybar: (hbar: number) => {
    return Math.floor(hbar * 100000000); // 1 HBAR = 100,000,000 tinybars
  },

  // Convert tinybar to HBAR
  tinybarToHbar: (tinybar: number) => {
    return tinybar / 100000000;
  }
};
