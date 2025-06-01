
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wallet } from 'phosphor-react';
import { Loader } from 'lucide-react';

export function WalletAuthButton() {
  const [loading, setLoading] = useState(false);

  const handleWalletAuth = async () => {
    try {
      setLoading(true);
      console.log('Authenticating with wallet');
      // TODO: Implement wallet authentication (MetaMask, WalletConnect, etc.)
      
      // Simulate loading for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Wallet auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleWalletAuth}
      className="w-full border-gray-300 hover:bg-gray-50"
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  );
}
