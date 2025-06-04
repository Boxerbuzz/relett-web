
import { HederaClient } from './hedera';
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

export interface ContractAddresses {
  propertyRegistry: string;
  propertyMarketplace: string;
  revenueDistributor: string;
}

export class PropertyContracts {
  private hederaClient: HederaClient;
  private contractAddresses: ContractAddresses;

  constructor(contractAddresses: ContractAddresses) {
    this.hederaClient = new HederaClient();
    this.contractAddresses = contractAddresses;
  }

  // Register a new property in the registry
  async registerProperty(propertyData: PropertyTokenData) {
    try {
      const contractId = ContractId.fromString(this.contractAddresses.propertyRegistry);
      
      const transaction = new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(1000000)
        .setFunction("registerProperty", 
          new ContractFunctionParameters()
            .addString(propertyData.propertyId)
            .addString(propertyData.landTitleId)
            .addString(propertyData.tokenName)
            .addString(propertyData.tokenSymbol)
            .addUint256(propertyData.totalSupply)
            .addUint256(propertyData.totalValue)
        );

      const response = await transaction.execute(this.hederaClient.client);
      const receipt = await response.getReceipt(this.hederaClient.client);

      return {
        success: true,
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString()
      };
    } catch (error) {
      console.error('Error registering property:', error);
      throw error;
    }
  }

  // Verify a property (only authorized verifiers)
  async verifyProperty(propertyId: string) {
    try {
      const contractId = ContractId.fromString(this.contractAddresses.propertyRegistry);
      
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
      const contractId = ContractId.fromString(this.contractAddresses.propertyRegistry);
      
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
      const contractId = ContractId.fromString(this.contractAddresses.propertyMarketplace);
      
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
      const contractId = ContractId.fromString(this.contractAddresses.propertyMarketplace);
      
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
      const contractId = ContractId.fromString(this.contractAddresses.revenueDistributor);
      
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
      const contractId = ContractId.fromString(this.contractAddresses.revenueDistributor);
      
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
