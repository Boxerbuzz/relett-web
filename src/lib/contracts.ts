
import { HederaClient } from './hedera';
import { ContractExecuteTransaction, ContractFunctionParameters, ContractCallQuery } from '@hashgraph/sdk';

// Contract addresses - these would be set after deployment
const CONTRACT_ADDRESSES = {
  PROPERTY_REGISTRY: import.meta.env.VITE_PROPERTY_REGISTRY_CONTRACT || '',
  PROPERTY_MARKETPLACE: import.meta.env.VITE_PROPERTY_MARKETPLACE_CONTRACT || '',
  REVENUE_DISTRIBUTOR: import.meta.env.VITE_REVENUE_DISTRIBUTOR_CONTRACT || ''
};

export class PropertyContractService {
  private hederaClient: HederaClient;

  constructor() {
    this.hederaClient = new HederaClient();
  }

  // PropertyRegistry Contract Functions
  async registerProperty(params: {
    propertyId: string;
    landTitleId: string;
    name: string;
    symbol: string;
    totalSupply: number;
    totalValue: number;
    propertyDetails: any;
  }) {
    try {
      const functionParams = new ContractFunctionParameters()
        .addString(params.propertyId)
        .addString(params.landTitleId)
        .addString(params.name)
        .addString(params.symbol)
        .addUint256(params.totalSupply)
        .addUint256(params.totalValue);

      const transaction = new ContractExecuteTransaction()
        .setContractId(CONTRACT_ADDRESSES.PROPERTY_REGISTRY)
        .setGas(500000)
        .setFunction("registerProperty", functionParams);

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

  async verifyProperty(propertyId: string) {
    try {
      const functionParams = new ContractFunctionParameters()
        .addString(propertyId);

      const transaction = new ContractExecuteTransaction()
        .setContractId(CONTRACT_ADDRESSES.PROPERTY_REGISTRY)
        .setGas(100000)
        .setFunction("verifyProperty", functionParams);

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

  async getProperty(propertyId: string) {
    try {
      const query = new ContractCallQuery()
        .setContractId(CONTRACT_ADDRESSES.PROPERTY_REGISTRY)
        .setGas(50000)
        .setFunction("getProperty", new ContractFunctionParameters().addString(propertyId));

      const result = await query.execute(this.hederaClient.client);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error getting property:', error);
      throw error;
    }
  }

  // PropertyMarketplace Contract Functions
  async listTokensForSale(params: {
    tokenContract: string;
    tokenAmount: number;
    pricePerToken: number;
  }) {
    try {
      const functionParams = new ContractFunctionParameters()
        .addAddress(params.tokenContract)
        .addUint256(params.tokenAmount)
        .addUint256(params.pricePerToken);

      const transaction = new ContractExecuteTransaction()
        .setContractId(CONTRACT_ADDRESSES.PROPERTY_MARKETPLACE)
        .setGas(300000)
        .setFunction("listTokens", functionParams);

      const response = await transaction.execute(this.hederaClient.client);
      const receipt = await response.getReceipt(this.hederaClient.client);

      return {
        success: true,
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString()
      };
    } catch (error) {
      console.error('Error listing tokens:', error);
      throw error;
    }
  }

  async buyTokens(listingId: number, paymentAmount: number) {
    try {
      const functionParams = new ContractFunctionParameters()
        .addUint256(listingId);

      const transaction = new ContractExecuteTransaction()
        .setContractId(CONTRACT_ADDRESSES.PROPERTY_MARKETPLACE)
        .setGas(300000)
        .setFunction("buyTokens", functionParams)
        .setPayableAmount(paymentAmount);

      const response = await transaction.execute(this.hederaClient.client);
      const receipt = await response.getReceipt(this.hederaClient.client);

      return {
        success: true,
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString()
      };
    } catch (error) {
      console.error('Error buying tokens:', error);
      throw error;
    }
  }

  // RevenueDistributor Contract Functions
  async createRevenueDistribution(params: {
    tokenContract: string;
    revenueAmount: number;
    revenueSource: string;
  }) {
    try {
      const functionParams = new ContractFunctionParameters()
        .addAddress(params.tokenContract)
        .addString(params.revenueSource);

      const transaction = new ContractExecuteTransaction()
        .setContractId(CONTRACT_ADDRESSES.REVENUE_DISTRIBUTOR)
        .setGas(200000)
        .setFunction("createDistribution", functionParams)
        .setPayableAmount(params.revenueAmount);

      const response = await transaction.execute(this.hederaClient.client);
      const receipt = await response.getReceipt(this.hederaClient.client);

      return {
        success: true,
        transactionId: response.transactionId.toString(),
        status: receipt.status.toString()
      };
    } catch (error) {
      console.error('Error creating revenue distribution:', error);
      throw error;
    }
  }

  async claimRevenue(distributionId: number) {
    try {
      const functionParams = new ContractFunctionParameters()
        .addUint256(distributionId);

      const transaction = new ContractExecuteTransaction()
        .setContractId(CONTRACT_ADDRESSES.REVENUE_DISTRIBUTOR)
        .setGas(150000)
        .setFunction("claimRevenue", functionParams);

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

  async getUnclaimedDistributions(holderAddress: string) {
    try {
      const query = new ContractCallQuery()
        .setContractId(CONTRACT_ADDRESSES.REVENUE_DISTRIBUTOR)
        .setGas(100000)
        .setFunction("getUnclaimedDistributions", new ContractFunctionParameters().addAddress(holderAddress));

      const result = await query.execute(this.hederaClient.client);
      
      return {
        success: true,
        data: result
      };
    } catch (error) {
      console.error('Error getting unclaimed distributions:', error);
      throw error;
    }
  }

  close() {
    this.hederaClient.close();
  }
}

export { CONTRACT_ADDRESSES };
