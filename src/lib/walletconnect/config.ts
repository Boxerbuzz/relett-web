'use client';

import { WalletConnectOptions } from './HederaWalletConnectService';

// WalletConnect Project ID - Get this from https://cloud.walletconnect.com
const PROJECT_ID = 'b0ec34a6fe4eafec65a7dfbf17cc147a';

export const walletConnectConfig: WalletConnectOptions = {
  projectId: PROJECT_ID,
  metadata: {
    name: 'Real Estate Tokenization Platform',
    description: 'Invest in tokenized real estate properties on Hedera',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:5173',
    icons: [`${typeof window !== 'undefined' ? window.location.origin : 'https://localhost:5173'}/favicon.ico`],
  },
};

export const isWalletConnectConfigured = (): boolean => {
  return PROJECT_ID.length > 0 && !PROJECT_ID.includes('your-walletconnect-project-id-here');
};