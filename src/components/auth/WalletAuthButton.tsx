
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
      
      // Use Hedera Wallet Connect SDK
      const { DAppConnector, HederaSessionEvent, HederaJsonRpcMethod, HederaChainId } = await import('@hashgraph/hedera-wallet-connect');
      const { LedgerId } = await import('@hashgraph/sdk');
      
      const appMetadata = {
        name: 'Property Tokenization Platform',
        description: 'Tokenize and trade real estate properties on Hedera',
        icons: [window.location.origin + '/favicon.ico'],
        url: window.location.origin
      };
      
      const projectId = "demo"; // Replace with your WalletConnect project ID
      
      const dAppConnector = new DAppConnector(
        appMetadata,
        LedgerId.TESTNET,
        projectId,
        Object.values(HederaJsonRpcMethod),
        [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
        [HederaChainId.Testnet, HederaChainId.Mainnet],
      );
      
      await dAppConnector.init({ logger: 'error' });
      
      // Open modal to connect to wallet
      await dAppConnector.openModal();
      
      // Create user session with wallet data
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
      
      toast({
        title: "Wallet connected successfully!",
        description: "Connected to Hedera wallet"
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
