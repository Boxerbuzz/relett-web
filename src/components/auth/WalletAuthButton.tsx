
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WalletIcon , SpinnerIcon} from '@phosphor-icons/react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function WalletAuthButton() {
  const [loading, setLoading] = useState(false);

  const handleWalletAuth = async () => {
    try {
      setLoading(true);
      
      // Check if HashPack is available
      if (!window.hashpack) {
        throw new Error('HashPack wallet not detected. Please install the HashPack extension.');
      }
      
      // Connect to HashPack
      const result = await window.hashpack.connectWallet();
      
      if (result.accountId) {
        // Create user session with wallet data
        const { error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        
        toast({
          title: "Wallet connected successfully!",
          description: `Connected account: ${result.accountId}`
        });
      }
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
          <SpinnerIcon className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          <WalletIcon className="mr-2 h-4 w-4" />
          Connect Wallet
        </>
      )}
    </Button>
  );
}
