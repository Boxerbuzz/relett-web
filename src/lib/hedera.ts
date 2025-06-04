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
  HbarUnit,
  FileCreateTransaction,
  FileAppendTransaction,
  FileContentsQuery,
  FileId,
  FileInfoQuery,
  KeyList,
  PublicKey
} from "@hashgraph/sdk";

// Hedera Client Configuration with File Service Support
export class HederaClient {
  public client: Client; // Made public to fix TypeScript errors
  private operatorId: AccountId;
  private operatorKey: PrivateKey;

  constructor() {
    // Use import.meta.env for Vite environment variables
    const accountId =
      import.meta.env.VITE_HEDERA_ACCOUNT_ID || import.meta.env.VITE_HEDERA_TESTNET_ACCOUNT_ID;
    const privateKey =
      import.meta.env.VITE_HEDERA_PRIVATE_KEY || import.meta.env.VITE_HEDERA_TESTNET_PRIVATE_KEY;
    const network = import.meta.env.VITE_HEDERA_NETWORK || "testnet";

    if (!accountId || !privateKey) {
      throw new Error("Hedera account credentials not configured");
    }

    this.operatorId = AccountId.fromString(accountId);
    this.operatorKey = PrivateKey.fromStringECDSA(privateKey);

    // Configure client for testnet or mainnet
    if (network === "mainnet") {
      this.client = Client.forMainnet();
    } else {
      this.client = Client.forTestnet();
    }

    this.client.setOperator(this.operatorId, this.operatorKey);
  }

  // Hedera File Service - Store documents/metadata
  async createFile(content: Uint8Array | string, keys?: PrivateKey[]) {
    try {
      const fileKeys = keys || [this.operatorKey];
      
      // Convert string to Uint8Array if needed
      const fileContent = typeof content === 'string' 
        ? new TextEncoder().encode(content) 
        : content;

      const transaction = new FileCreateTransaction()
        .setContents(fileContent)
        .setKeys(fileKeys)
        .setMaxTransactionFee(new Hbar(2));

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        fileId: receipt.fileId?.toString(),
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString(),
      };
    } catch (error) {
      console.error("Error creating file:", error);
      throw error;
    }
  }

  // Append content to existing file
  async appendToFile(fileId: string, content: Uint8Array | string) {
    try {
      const file = FileId.fromString(fileId);
      
      // Convert string to Uint8Array if needed
      const fileContent = typeof content === 'string' 
        ? new TextEncoder().encode(content) 
        : content;

      const transaction = new FileAppendTransaction()
        .setFileId(file)
        .setContents(fileContent)
        .setMaxTransactionFee(new Hbar(2));

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString(),
      };
    } catch (error) {
      console.error("Error appending to file:", error);
      throw error;
    }
  }

  // Retrieve file contents
  async getFileContents(fileId: string) {
    try {
      const file = FileId.fromString(fileId);
      const query = new FileContentsQuery().setFileId(file);
      const contents = await query.execute(this.client);

      return {
        contents: contents,
        contentsAsString: new TextDecoder().decode(contents)
      };
    } catch (error) {
      console.error("Error getting file contents:", error);
      throw error;
    }
  }

  // Get file information
  async getFileInfo(fileId: string) {
    try {
      const file = FileId.fromString(fileId);
      const query = new FileInfoQuery().setFileId(file);
      const fileInfo = await query.execute(this.client);

      return {
        fileId: fileInfo.fileId.toString(),
        size: fileInfo.size.toString(),
        expirationTime: fileInfo.expirationTime?.toDate(),
        isDeleted: fileInfo.isDeleted,
        keys: fileInfo.keys ? Array.from(fileInfo.keys).map(key => key.toString()) : [],
      };
    } catch (error) {
      console.error("Error getting file info:", error);
      throw error;
    }
  }

  // Store property document on Hedera File Service
  async storePropertyDocument(document: {
    name: string;
    content: Uint8Array;
    propertyId: string;
    documentType: string;
    metadata?: any;
  }) {
    try {
      // Create metadata object
      const metadata = {
        name: document.name,
        propertyId: document.propertyId,
        documentType: document.documentType,
        uploadedAt: new Date().toISOString(),
        ...document.metadata
      };

      // Store metadata as JSON
      const metadataJson = JSON.stringify(metadata);
      const metadataResult = await this.createFile(metadataJson);

      // Store actual document content
      const documentResult = await this.createFile(document.content);

      return {
        documentFileId: documentResult.fileId,
        metadataFileId: metadataResult.fileId,
        transactionIds: [documentResult.transactionId, metadataResult.transactionId]
      };
    } catch (error) {
      console.error("Error storing property document:", error);
      throw error;
    }
  }

  // Create a fungible token for fractional property ownership
  async createPropertyToken(
    name: string,
    symbol: string,
    totalSupply: number,
    adminKeys?: string[]
  ): Promise<{ tokenId: string; transactionId: string }> {
    try {
      // Create the token creation transaction
      let tokenCreateTx = new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.FungibleCommon)
        .setDecimals(2)
        .setInitialSupply(totalSupply)
        .setTreasuryAccountId(this.operatorId)
        .setAdminKey(this.operatorKey.publicKey)
        .setSupplyKey(this.operatorKey.publicKey)
        .freezeWith(this.client);

      // Handle admin keys if provided
      if (adminKeys && adminKeys.length > 0) {
        const keyList = new KeyList();
        for (const keyString of adminKeys) {
          const publicKey = PublicKey.fromString(keyString);
          keyList.push(publicKey);
        }
        tokenCreateTx = tokenCreateTx.setAdminKey(keyList);
      }

      // Sign and execute
      const tokenCreateSign = await tokenCreateTx.sign(this.operatorKey);
      const tokenCreateSubmit = await tokenCreateSign.execute(this.client);
      const tokenCreateRx = await tokenCreateSubmit.getReceipt(this.client);
      
      const tokenId = tokenCreateRx.tokenId;
      if (!tokenId) {
        throw new Error('Token creation failed - no token ID returned');
      }

      return {
        tokenId: tokenId.toString(),
        transactionId: tokenCreateSubmit.transactionId.toString()
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
        status: receipt.status.toString(),
      };
    } catch (error) {
      console.error("Error creating property NFT:", error);
      throw error;
    }
  }

  // Associate account with token (required before receiving tokens)
  async associateToken(
    accountId: string,
    tokenId: string,
    accountPrivateKey: string
  ) {
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

  // Mint tokens for property investment
  async mintTokens(
    tokenId: string,
    amount: number,
    receiverAccountId?: string
  ) {
    try {
      const token = TokenId.fromString(tokenId);
      const receiver = receiverAccountId
        ? AccountId.fromString(receiverAccountId)
        : this.operatorId;

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
        tokenType: tokenInfo.tokenType.toString(),
      };
    } catch (error) {
      console.error("Error getting token info:", error);
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
      const fromKey = PrivateKey.fromStringECDSA(params.fromPrivateKey);

      const transaction = new TransferTransaction()
        .addHbarTransfer(fromAccount, Hbar.from(-params.amount, HbarUnit.Hbar))
        .addHbarTransfer(toAccount, Hbar.from(params.amount, HbarUnit.Hbar))
        .freezeWith(this.client);

      const signedTx = await transaction.sign(fromKey);
      const response = await signedTx.execute(this.client);
      const receipt = await response.getReceipt(this.client);

      return {
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString(),
      };
    } catch (error) {
      console.error("Error transferring HBAR:", error);
      throw error;
    }
  }

  // Get account balance - Fixed method
  async getAccountBalance(accountId: string) {
    try {
      const account = AccountId.fromString(accountId);
      const query = new AccountBalanceQuery().setAccountId(account);
      const balance = await query.execute(this.client);

      // Fix: Convert TokenBalanceMap to array properly using Map.entries()
      const tokenBalances: Array<{ tokenId: string; balance: string }> = [];

      if (balance.tokens) {
        // Use Map.entries() to iterate over the TokenBalanceMap
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

  // Close client connection
  close() {
    this.client.close();
  }
}

// Utility functions for token operations
export const hederaUtils = {
  // Generate a unique token symbol for a property
  generateTokenSymbol: (propertyTitle: string, propertyId: string) => {
    const cleaned = propertyTitle.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
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

  // Validate Hedera file ID format
  isValidFileId: (fileId: string) => {
    const pattern = /^\d+\.\d+\.\d+$/;
    return pattern.test(fileId);
  },

  // Convert HBAR to tinybar (smallest unit)
  hbarToTinybar: (hbar: number) => {
    return Math.floor(hbar * 100000000); // 1 HBAR = 100,000,000 tinybars
  },

  // Convert tinybar to HBAR
  tinybarToHbar: (tinybar: number) => {
    return tinybar / 100000000;
  },

  // Generate file URL for Hedera File Service
  generateHFSUrl: (fileId: string, network: string = 'testnet') => {
    const baseUrl = network === 'mainnet' 
      ? 'https://mainnet.mirrornode.hedera.com' 
      : 'https://testnet.mirrornode.hedera.com';
    return `${baseUrl}/api/v1/files/${fileId}`;
  },

  // Prepare document for HFS storage
  prepareDocumentForHFS: async (file: File, propertyId: string, documentType: string) => {
    const arrayBuffer = await file.arrayBuffer();
    const content = new Uint8Array(arrayBuffer);
    
    return {
      name: file.name,
      content,
      propertyId,
      documentType,
      metadata: {
        originalSize: file.size,
        mimeType: file.type,
        lastModified: new Date(file.lastModified).toISOString()
      }
    };
  }
};
