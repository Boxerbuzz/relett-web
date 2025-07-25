
import { useState } from 'react';
import { HederaClient, hederaUtils } from '@/lib/hedera';
import { useToast } from '@/hooks/use-toast';

interface HFSUploadOptions {
  propertyId?: string;
  documentType?: string;
  metadata?: any;
}

export function useHederaFileService() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadToHFS = async (file: File, options: HFSUploadOptions = {}) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Validate file size (max 1MB for HFS - smaller than IPFS)
      if (file.size > 1024 * 1024) {
        throw new Error('File size exceeds 1MB limit for Hedera File Service');
      }

      const hederaClient = new HederaClient();
      
      // Prepare document for HFS
      const document = await hederaUtils.prepareDocumentForHFS(
        file, 
        options.propertyId || 'unknown',
        options.documentType || 'document'
      );

      setUploadProgress(30);

      // Store on Hedera File Service
      const result = await hederaClient.storePropertyDocument(document);
      
      setUploadProgress(80);

      // Generate access URLs
      const network = import.meta.env.VITE_HEDERA_NETWORK || 'testnet';
      const documentUrl = hederaUtils.generateHFSUrl(result.documentFileId!, network);
      const metadataUrl = hederaUtils.generateHFSUrl(result.metadataFileId!, network);

      setUploadProgress(100);

      toast({
        title: 'Upload successful',
        description: `${file.name} stored on Hedera File Service`,
      });

      hederaClient.close();

      return {
        documentFileId: result.documentFileId,
        metadataFileId: result.metadataFileId,
        documentUrl,
        metadataUrl,
        transactionIds: result.transactionIds,
        size: file.size,
        type: file.type,
        name: file.name,
        network
      };

    } catch (error) {
      console.error('HFS upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload to Hedera File Service',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const getFileFromHFS = async (fileId: string) => {
    try {
      const hederaClient = new HederaClient();
      const result = await hederaClient.getFileContents(fileId);
      hederaClient.close();
      
      return result;
    } catch (error) {
      console.error('HFS retrieval error:', error);
      toast({
        title: 'Retrieval failed',
        description: 'Failed to retrieve file from Hedera File Service',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const getFileInfo = async (fileId: string) => {
    try {
      const hederaClient = new HederaClient();
      const result = await hederaClient.getFileInfo(fileId);
      hederaClient.close();
      
      return result;
    } catch (error) {
      console.error('HFS file info error:', error);
      throw error;
    }
  };

  return {
    uploadToHFS,
    getFileFromHFS,
    getFileInfo,
    isUploading,
    uploadProgress
  };
}
