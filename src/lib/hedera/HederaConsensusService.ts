import { 
  Client, 
  TopicCreateTransaction, 
  TopicMessageSubmitTransaction, 
  TopicId, 
  PrivateKey,
  AccountId,
  Hbar
} from "@hashgraph/sdk";
import { HederaClientCore } from "./HederaClientCore";

export interface HCSTopicInfo {
  topicId: string;
  transactionId: string;
  consensusTimestamp?: string;
}

export interface HCSMessageInfo {
  topicId: string;
  sequenceNumber: number;
  consensusTimestamp: string;
  transactionId: string;
}

export interface AuditEvent {
  eventType: string;
  eventData: any;
  metadata?: any;
}

export class HederaConsensusService extends HederaClientCore {
  
  /**
   * Creates a new HCS topic for a tokenized property
   */
  async createTopic(params: {
    topicMemo: string;
    adminKey?: PrivateKey;
    submitKey?: PrivateKey;
  }): Promise<HCSTopicInfo> {
    console.log('Creating HCS topic with memo:', params.topicMemo);
    
    try {
      const transaction = new TopicCreateTransaction()
        .setTopicMemo(params.topicMemo)
        .setMaxTransactionFee(new Hbar(5));

      if (params.adminKey) {
        transaction.setAdminKey(params.adminKey);
      }
      
      if (params.submitKey) {
        transaction.setSubmitKey(params.submitKey);
      }

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      
      if (!receipt.topicId) {
        throw new Error('Topic ID not returned from Hedera');
      }

      return {
        topicId: receipt.topicId.toString(),
        transactionId: response.transactionId.toString(),
        consensusTimestamp: receipt.topicRunningHash?.toString()
      };
    } catch (error) {
      console.error('Error creating HCS topic:', error);
      throw error;
    }
  }

  /**
   * Submits a message to an HCS topic
   */
  async submitMessage(params: {
    topicId: string;
    message: string | Uint8Array;
    submitKey?: PrivateKey;
  }): Promise<HCSMessageInfo> {
    console.log('Submitting message to topic:', params.topicId);
    
    try {
      const topicId = TopicId.fromString(params.topicId);
      
      let transaction = new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMaxTransactionFee(new Hbar(2));

      if (typeof params.message === 'string') {
        transaction = transaction.setMessage(params.message);
      } else {
        transaction = transaction.setMessage(params.message);
      }

      if (params.submitKey) {
        transaction = transaction.freezeWith(this.client);
        transaction = await transaction.sign(params.submitKey);
      }

      const response = await transaction.execute(this.client);
      const receipt = await response.getReceipt(this.client);
      
      return {
        topicId: params.topicId,
        sequenceNumber: receipt.topicSequenceNumber?.toNumber() || 0,
        consensusTimestamp: receipt.topicRunningHash?.toString() || '',
        transactionId: response.transactionId.toString()
      };
    } catch (error) {
      console.error('Error submitting message to HCS:', error);
      throw error;
    }
  }

  /**
   * Creates an audit event for blockchain recording
   */
  createAuditEvent(eventType: string, eventData: any, metadata?: any): AuditEvent {
    return {
      eventType,
      eventData: {
        ...eventData,
        timestamp: new Date().toISOString(),
        version: '1.0'
      },
      metadata: {
        ...metadata,
        source: 'hedera-consensus-service',
        network: this.client.network ? 'testnet' : 'mainnet'
      }
    };
  }

  /**
   * Records a property tokenization event
   */
  async recordTokenizationEvent(params: {
    topicId: string;
    propertyId: string;
    tokenId: string;
    totalSupply: number;
    tokenPrice: number;
    legalStructure: any;
    submitKey?: PrivateKey;
  }): Promise<HCSMessageInfo> {
    const auditEvent = this.createAuditEvent('PROPERTY_TOKENIZATION', {
      propertyId: params.propertyId,
      tokenId: params.tokenId,
      totalSupply: params.totalSupply,
      tokenPrice: params.tokenPrice,
      legalStructure: params.legalStructure,
      action: 'TOKEN_CREATED'
    });

    return this.submitMessage({
      topicId: params.topicId,
      message: JSON.stringify(auditEvent),
      submitKey: params.submitKey
    });
  }

  /**
   * Records an investment transaction event
   */
  async recordInvestmentEvent(params: {
    topicId: string;
    investorId: string;
    tokenAmount: number;
    investmentAmount: number;
    transactionType: 'PURCHASE' | 'SALE' | 'TRANSFER';
    submitKey?: PrivateKey;
  }): Promise<HCSMessageInfo> {
    const auditEvent = this.createAuditEvent('INVESTMENT_TRANSACTION', {
      investorId: params.investorId,
      tokenAmount: params.tokenAmount,
      investmentAmount: params.investmentAmount,
      transactionType: params.transactionType,
      action: 'INVESTMENT_RECORDED'
    });

    return this.submitMessage({
      topicId: params.topicId,
      message: JSON.stringify(auditEvent),
      submitKey: params.submitKey
    });
  }

  /**
   * Records a revenue distribution event
   */
  async recordRevenueDistribution(params: {
    topicId: string;
    distributionId: string;
    totalAmount: number;
    currency: string;
    distributionDate: string;
    submitKey?: PrivateKey;
  }): Promise<HCSMessageInfo> {
    const auditEvent = this.createAuditEvent('REVENUE_DISTRIBUTION', {
      distributionId: params.distributionId,
      totalAmount: params.totalAmount,
      currency: params.currency,
      distributionDate: params.distributionDate,
      action: 'REVENUE_DISTRIBUTED'
    });

    return this.submitMessage({
      topicId: params.topicId,
      message: JSON.stringify(auditEvent),
      submitKey: params.submitKey
    });
  }

  /**
   * Records a governance decision event
   */
  async recordGovernanceEvent(params: {
    topicId: string;
    proposalId: string;
    proposalType: string;
    decision: string;
    votingResults: any;
    submitKey?: PrivateKey;
  }): Promise<HCSMessageInfo> {
    const auditEvent = this.createAuditEvent('GOVERNANCE_DECISION', {
      proposalId: params.proposalId,
      proposalType: params.proposalType,
      decision: params.decision,
      votingResults: params.votingResults,
      action: 'GOVERNANCE_RECORDED'
    });

    return this.submitMessage({
      topicId: params.topicId,
      message: JSON.stringify(auditEvent),
      submitKey: params.submitKey
    });
  }
}