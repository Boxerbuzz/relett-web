
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface HederaWallet {
  id: string;
  address: string;
  encrypted_private_key: string;
  balance_hbar?: number;
  is_primary: boolean;
  is_verified: boolean;
}

export function useHederaWallet() {
  const [wallet, setWallet] = useState<HederaWallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchWallet();
    }
  }, [user]);

  const fetchWallet = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user?.id)
        .eq('wallet_type', 'hedera')
        .eq('is_primary', true)
        .maybeSingle();

      if (error) throw error;
      setWallet(data);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const connectWallet = async (accountId: string, privateKey: string) => {
    setIsConnecting(true);
    try {
      // Validate the wallet credentials
      const { data, error } = await supabase.functions.invoke('validate-hedera-wallet', {
        body: { accountId, privateKey }
      });

      if (error) throw error;

      // Store the wallet
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .insert({
          user_id: user?.id,
          address: accountId,
          encrypted_private_key: privateKey,
          wallet_type: 'hedera',
          is_primary: true,
          is_verified: true,
          balance_hbar: data.balance || 0
        })
        .select()
        .single();

      if (walletError) throw walletError;

      setWallet(walletData);
      toast({
        title: 'Wallet Connected',
        description: 'Your Hedera wallet has been successfully connected.',
      });

      return true;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    if (!wallet) return;

    try {
      await supabase
        .from('wallets')
        .delete()
        .eq('id', wallet.id);

      setWallet(null);
      toast({
        title: 'Wallet Disconnected',
        description: 'Your wallet has been disconnected.',
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      toast({
        title: 'Disconnection Failed',
        description: 'Failed to disconnect wallet',
        variant: 'destructive'
      });
    }
  };

  const refreshBalance = async () => {
    if (!wallet) return;

    try {
      const { data, error } = await supabase.functions.invoke('get-hedera-balance', {
        body: { accountId: wallet.address }
      });

      if (error) throw error;

      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance_hbar: data.balance })
        .eq('id', wallet.id);

      if (updateError) throw updateError;

      setWallet(prev => prev ? { ...prev, balance_hbar: data.balance } : null);
    } catch (error) {
      console.error('Error refreshing balance:', error);
    }
  };

  return {
    wallet,
    isLoading,
    isConnecting,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    refetch: fetchWallet
  };
}
