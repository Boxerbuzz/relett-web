
'use client';

import { Button } from '@/components/ui/button';
import { Wallet } from 'phosphor-react';

export function WalletAuthButton() {
  const handleWalletAuth = () => {
    console.log('Authenticating with wallet');
    // TODO: Implement wallet authentication (MetaMask, WalletConnect, etc.)
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleWalletAuth}
      className="w-full border-gray-300 hover:bg-gray-50"
    >
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
