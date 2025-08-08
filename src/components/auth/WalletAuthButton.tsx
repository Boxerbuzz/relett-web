
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WalletIcon, SpinnerIcon } from '@phosphor-icons/react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useHederaWallet } from '@/contexts/HederaWalletContext';

export function WalletAuthButton() {
  const [loading, setLoading] = useState(false);
  const { connectWallet, isAvailable, wallet } = useHederaWallet();

  const handleWalletAuth = async () => {
    try {
      setLoading(true);
      
      if (!isAvailable) {
        throw new Error('WalletConnect not available. Please check your configuration.');
      }

      // Connect via WalletConnect
      await connectWallet();
      
      // Create user session with wallet data
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      
      toast({
        title: "Wallet connected successfully!",
        description: "Connected via WalletConnect"
      });
    } catch (error: any) {
      toast({
        title: "Wallet connection failed",
        description: error.message || "Failed to connect wallet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (wallet?.isConnected) {
    return (
      <Button
        type="button"
        variant="outline"
        className="w-full border-green-300 bg-green-50 hover:bg-green-100"
        disabled
      >
        <WalletIcon className="mr-2 h-4 w-4" />
        Wallet Connected
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleWalletAuth}
      className="w-full border-gray-300 hover:bg-gray-50"
      disabled={loading || !isAvailable}
    >
      {loading ? (
        <>
          <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <WalletIcon className="mr-2 h-4 w-4" />
          {isAvailable ? 'Connect Wallet' : 'WalletConnect Unavailable'}
        </>
      )}
    </Button>
  );
}
