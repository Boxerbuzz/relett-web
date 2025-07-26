
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
      
      // Use HashConnect SDK instead of window.hashpack
      const { HashConnect, HashConnectConnectionState } = await import('hashconnect');
      const { LedgerId } = await import('@hashgraph/sdk');
      
      const appMetadata = {
        name: 'Property Tokenization Platform',
        description: 'Tokenize and trade real estate properties on Hedera',
        icons: [window.location.origin + '/favicon.ico'],
        url: window.location.origin
      };
      
      const hashConnect = new HashConnect(LedgerId.TESTNET, "demo", appMetadata, true);
      
      await hashConnect.init();
      
      // Open pairing modal to connect to wallet
      hashConnect.openPairingModal();
      
      // Wait for pairing event
      const pairingPromise = new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Connection timeout')), 30000);
        
        hashConnect.pairingEvent.once((pairingData) => {
          clearTimeout(timeout);
          resolve(pairingData);
        });
      });
      
      const pairingData: any = await pairingPromise;
      
      if (pairingData.accountIds && pairingData.accountIds.length > 0) {
        // Create user session with wallet data
        const { error } = await supabase.auth.signInAnonymously();
        if (error) throw error;
        
        toast({
          title: "Wallet connected successfully!",
          description: `Connected account: ${pairingData.accountIds[0]}`
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
