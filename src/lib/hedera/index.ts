
// Main Hedera client that combines all services
import { HederaTokenService } from './HederaTokenService';
import { HederaFileService } from './HederaFileService';
import { HederaTransferService } from './HederaTransferService';

export class HederaClient extends HederaTokenService {
  private fileService: HederaFileService;
  private transferService: HederaTransferService;

  constructor() {
    super();
    this.fileService = new HederaFileService();
    this.transferService = new HederaTransferService();
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

  close() {
    super.close();
    this.fileService.close();
    this.transferService.close();
  }
}

// Re-export utilities
export { hederaUtils } from './utils';

// Re-export individual services for direct use
export { HederaTokenService } from './HederaTokenService';
export { HederaFileService } from './HederaFileService';
export { HederaTransferService } from './HederaTransferService';
export { HederaClientCore } from './HederaClientCore';
