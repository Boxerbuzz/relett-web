
// Main Hedera client that combines all services
import { HederaTokenService } from './HederaTokenService';
import { HederaFileService } from './HederaFileService';
import { HederaTransferService } from './HederaTransferService';
import { HederaConsensusService } from './HederaConsensusService';

export class HederaClient extends HederaTokenService {
  private fileService: HederaFileService;
  private transferService: HederaTransferService;
  private consensusService: HederaConsensusService;

  constructor() {
    super();
    this.fileService = new HederaFileService();
    this.transferService = new HederaTransferService();
    this.consensusService = new HederaConsensusService();
  }

  // File service methods
  async createFile(content: Uint8Array | string, keys?: any[]) {
    return this.fileService.createFile(content, keys);
  }

  async appendToFile(fileId: string, content: Uint8Array | string) {
    return this.fileService.appendToFile(fileId, content);
  }

  async getFileContents(fileId: string) {
    return this.fileService.getFileContents(fileId);
  }

  async getFileInfo(fileId: string) {
    return this.fileService.getFileInfo(fileId);
  }

  async storePropertyDocument(document: {
    name: string;
    content: Uint8Array;
    propertyId: string;
    documentType: string;
    metadata?: any;
  }) {
    return this.fileService.storePropertyDocument(document);
  }

  // Transfer service methods
  async transferHbar(params: {
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    fromPrivateKey: string;
  }) {
    return this.transferService.transferHbar(params);
  }

  // Consensus service methods
  async createHCSTopic(params: { topicMemo: string; adminKey?: any; submitKey?: any }) {
    return this.consensusService.createTopic(params);
  }

  async submitHCSMessage(params: { topicId: string; message: string | Uint8Array; submitKey?: any }) {
    return this.consensusService.submitMessage(params);
  }

  async recordTokenizationEvent(params: {
    topicId: string;
    propertyId: string;
    tokenId: string;
    totalSupply: number;
    tokenPrice: number;
    legalStructure: any;
    submitKey?: any;
  }) {
    return this.consensusService.recordTokenizationEvent(params);
  }

  async recordInvestmentEvent(params: {
    topicId: string;
    investorId: string;
    tokenAmount: number;
    investmentAmount: number;
    transactionType: 'PURCHASE' | 'SALE' | 'TRANSFER';
    submitKey?: any;
  }) {
    return this.consensusService.recordInvestmentEvent(params);
  }

  close() {
    super.close();
    this.fileService.close();
    this.transferService.close();
    this.consensusService.close();
  }
}

// Re-export utilities
export { hederaUtils } from './utils';

// Re-export individual services for direct use
export { HederaTokenService } from './HederaTokenService';
export { HederaFileService } from './HederaFileService';
export { HederaTransferService } from './HederaTransferService';
export { HederaConsensusService } from './HederaConsensusService';
export { HederaClientCore } from './HederaClientCore';
