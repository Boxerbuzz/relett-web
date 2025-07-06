
import { HederaClient } from './hedera';
import { config } from './config';
import { 
  ContractCallQuery, 
  ContractExecuteTransaction, 
  ContractFunctionParameters,
  ContractId,
  Hbar
} from '@hashgraph/sdk';

export interface PropertyTokenData {
  propertyId: string;
  landTitleId: string;
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  totalValue: number;
  minimumInvestment: number;
  expectedROI: number;
  lockupPeriod: number;
}

export class PropertyContracts {
  private hederaClient: HederaClient;

  constructor() {
    this.hederaClient = new HederaClient();
    
    if (!config.hedera.isConfigured()) {
      console.warn('Hedera contracts not fully configured. Some functionality may not work.');
    }
  }

  // Register a new property in the registry
  async registerProperty(propertyData: PropertyTokenData) {
    try {
      // Use backend Edge Function for blockchain operations
      const response = await fetch(`${config.supabase.url}/functions/v1/register-property-blockchain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.supabase.anonKey}`,
        },
        body: JSON.stringify(propertyData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      return {
        success: result.success,
        transactionId: result.transactionId,
        status: result.status
      };
    } catch (error) {
      console.error('Error registering property:', error);
      throw error;
    }
  }

  // Verify a property (only authorized verifiers)
  async verifyProperty(propertyId: string) {
    try {
      const contractId = ContractId.fromString(config.hedera.contracts.propertyRegistry);
      
      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(300000)
        .setFunction("verifyProperty", 
          new ContractFunctionParameters().addString(propertyId)
        );

      const response = await transaction.execute(this.hederaClient.client);
      const receipt = await response.getReceipt(this.hederaClient.client);

      return {
        success: true,
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString()
      };
    } catch (error) {
      console.error('Error verifying property:', error);
      throw error;
    }
  }

  // Get property information
  async getProperty(propertyId: string) {
    try {
      const contractId = ContractId.fromString(config.hedera.contracts.propertyRegistry);
      
      const query = new ContractCallQuery()
        .setContractId(contractId)
        .setGas(100000)
        .setFunction("getProperty", 
          new ContractFunctionParameters().addString(propertyId)
        );

      const result = await query.execute(this.hederaClient.client);
      
      // Parse the result based on your contract's return structure
      return result;
    } catch (error) {
      console.error('Error getting property:', error);
      throw error;
    }
  }

  // Create a marketplace listing
  async createListing(propertyId: string, price: number, tokenAmount: number) {
    try {
      const contractId = ContractId.fromString(config.hedera.contracts.propertyMarketplace);
      
      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(500000)
        .setFunction("createListing", 
          new ContractFunctionParameters()
            .addString(propertyId)
            .addUint256(price)
            .addUint256(tokenAmount)
        );

      const response = await transaction.execute(this.hederaClient.client);
      const receipt = await response.getReceipt(this.hederaClient.client);

      return {
        success: true,
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString()
      };
    } catch (error) {
      console.error('Error creating listing:', error);
      throw error;
    }
  }

  // Purchase tokens from marketplace
  async purchaseTokens(listingId: string, amount: number) {
    try {
      const contractId = ContractId.fromString(config.hedera.contracts.propertyMarketplace);
      
      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(800000)
        .setPayableAmount(Hbar.fromTinybars(amount))
        .setFunction("purchaseTokens", 
          new ContractFunctionParameters().addString(listingId)
        );

      const response = await transaction.execute(this.hederaClient.client);
      const receipt = await response.getReceipt(this.hederaClient.client);

      return {
        success: true,
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString()
      };
    } catch (error) {
      console.error('Error purchasing tokens:', error);
      throw error;
    }
  }

  // Distribute revenue to token holders
  async distributeRevenue(propertyId: string, amount: number, source: string) {
    try {
      const contractId = ContractId.fromString(config.hedera.contracts.revenueDistributor);
      
      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(1000000)
        .setPayableAmount(Hbar.fromTinybars(amount))
        .setFunction("createDistribution", 
          new ContractFunctionParameters()
            .addString(propertyId)
            .addString(source)
        );

      const response = await transaction.execute(this.hederaClient.client);
      const receipt = await response.getReceipt(this.hederaClient.client);

      return {
        success: true,
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString()
      };
    } catch (error) {
      console.error('Error distributing revenue:', error);
      throw error;
    }
  }

  // Claim revenue distribution
  async claimRevenue(distributionId: string) {
    try {
      const contractId = ContractId.fromString(config.hedera.contracts.revenueDistributor);
      
      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(500000)
        .setFunction("claimRevenue", 
          new ContractFunctionParameters().addUint256(parseInt(distributionId))
        );

      const response = await transaction.execute(this.hederaClient.client);
      const receipt = await response.getReceipt(this.hederaClient.client);

      return {
        success: true,
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString()
      };
    } catch (error) {
      console.error('Error claiming revenue:', error);
      throw error;
    }
  }

  // Check if contracts are properly configured
  isConfigured(): boolean {
    return config.hedera.isConfigured();
  }

  // Get contract addresses for display
  getContractAddresses() {
    return config.hedera.contracts;
  }

  // Close the Hedera client connection
  close() {
    this.hederaClient.close();
  }
}

// Utility functions for contract integration
export const contractUtils = {
  // Format token amounts for contract calls
  formatTokenAmount: (amount: number, decimals: number = 8) => {
    return Math.floor(amount * Math.pow(10, decimals));
  },

  // Parse contract responses
  parseContractResult: (result: any) => {
    // Implement based on your contract return formats
    return result;
  },

  // Validate contract addresses
  isValidContractId: (contractId: string) => {
    const pattern = /^\d+\.\d+\.\d+$/;
    return pattern.test(contractId);
  }
};
