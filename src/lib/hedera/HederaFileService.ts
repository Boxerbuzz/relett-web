
import {
  FileCreateTransaction,
  FileAppendTransaction,
  FileContentsQuery,
  FileId,
  FileInfoQuery,
  Hbar,
  PrivateKey
} from "@hashgraph/sdk";
import { HederaClientCore } from './HederaClientCore';

export class HederaFileService extends HederaClientCore {
  async createFile(content: Uint8Array | string, keys?: PrivateKey[]) {
    if (this.isMockMode()) {
      console.log('Mock mode: File creation simulated');
      return {
        fileId: `mock_file_${Date.now()}`,
        transactionId: `mock_tx_${Date.now()}`,
        status: 'SUCCESS',
      };
    }

    try {
      const fileKeys = keys || [this.getOperatorKey()!];
      
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

  async appendToFile(fileId: string, content: Uint8Array | string) {
    if (this.isMockMode()) {
      console.log('Mock mode: File append simulated');
      return {
        transactionId: `mock_tx_${Date.now()}`,
        status: 'SUCCESS',
      };
    }

    try {
      const file = FileId.fromString(fileId);
      
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

  async getFileContents(fileId: string) {
    if (this.isMockMode()) {
      console.log('Mock mode: File contents retrieval simulated');
      const mockContent = new TextEncoder().encode('Mock file content');
      return {
        contents: mockContent,
        contentsAsString: 'Mock file content'
      };
    }

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

  async getFileInfo(fileId: string) {
    if (this.isMockMode()) {
      console.log('Mock mode: File info retrieval simulated');
      return {
        fileId: fileId,
        size: '1024',
        expirationTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isDeleted: false,
        keys: [],
      };
    }

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

  async storePropertyDocument(document: {
    name: string;
    content: Uint8Array;
    propertyId: string;
    documentType: string;
    metadata?: any;
  }) {
    try {
      const metadata = {
        name: document.name,
        propertyId: document.propertyId,
        documentType: document.documentType,
        uploadedAt: new Date().toISOString(),
        ...document.metadata
      };

      const metadataJson = JSON.stringify(metadata);
      const metadataResult = await this.createFile(metadataJson);
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
}
