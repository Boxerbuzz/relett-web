
export const hederaUtils = {
  generateTokenSymbol: (propertyTitle: string, propertyId: string) => {
    const cleaned = propertyTitle.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const truncated = cleaned.substring(0, 4);
    const idSuffix = propertyId.substring(0, 4).toUpperCase();
    return `${truncated}${idSuffix}`;
  },

  calculateTokenDistribution: (totalRevenue: number, totalSupply: number) => {
    return totalRevenue / totalSupply;
  },

  isValidAccountId: (accountId: string) => {
    const pattern = /^\d+\.\d+\.\d+$/;
    return pattern.test(accountId);
  },

  isValidTokenId: (tokenId: string) => {
    const pattern = /^\d+\.\d+\.\d+$/;
    return pattern.test(tokenId);
  },

  isValidFileId: (fileId: string) => {
    const pattern = /^\d+\.\d+\.\d+$/;
    return pattern.test(fileId);
  },

  hbarToTinybar: (hbar: number) => {
    return Math.floor(hbar * 100000000);
  },

  tinybarToHbar: (tinybar: number) => {
    return tinybar / 100000000;
  },

  generateHFSUrl: (fileId: string, network: string = 'testnet') => {
    const baseUrl = network === 'mainnet' 
      ? 'https://mainnet.mirrornode.hedera.com' 
      : 'https://testnet.mirrornode.hedera.com';
    return `${baseUrl}/api/v1/files/${fileId}`;
  },

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
