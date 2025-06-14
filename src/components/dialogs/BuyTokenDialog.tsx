
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HederaWalletManager } from '@/components/hedera/HederaWalletManager';
import { TokenPurchaseManager } from '@/components/hedera/TokenPurchaseManager';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface BuyTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenizedProperty?: {
    id: string;
    token_name: string;
    token_symbol: string;
    token_price: number;
    hedera_token_id: string;
    minimum_investment: number;
    available_tokens?: number;
  };
}

export function BuyTokenDialog({ open, onOpenChange, tokenizedProperty }: BuyTokenDialogProps) {
  const [userWallet, setUserWallet] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('wallet');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (open && user) {
      fetchUserWallet();
    }
  }, [open, user]);

  const fetchUserWallet = async () => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user?.id)
        .eq('wallet_type', 'hedera')
        .eq('is_primary', true)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setUserWallet(data);
      
      // If wallet is configured, go to purchase tab
      if (data) {
        setActiveTab('purchase');
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch wallet information',
        variant: 'destructive'
      });
    }
  };

  const handleWalletConfigured = (accountId: string) => {
    setUserWallet({ address: accountId, encrypted_private_key: 'configured' });
    setActiveTab('purchase');
  };

  const handlePurchaseComplete = () => {
    toast({
      title: 'Purchase Successful',
      description: 'Your token purchase has been completed successfully',
    });
    onOpenChange(false);
  };

  if (!tokenizedProperty) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
        {/* Fixed Header */}
        <div className="flex-shrink-0">
          <DialogHeader>
            <DialogTitle>
              Invest in {tokenizedProperty.token_name}
            </DialogTitle>
            <DialogDescription>
              Purchase {tokenizedProperty.token_symbol} tokens to own a fraction of this property
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="sticky top-0 bg-white z-10 pb-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="wallet">1. Setup Wallet</TabsTrigger>
                <TabsTrigger value="purchase" disabled={!userWallet}>
                  2. Purchase Tokens
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="wallet" className="space-y-4">
              <HederaWalletManager 
                userId={user?.id || ''}
                onWalletConfigured={handleWalletConfigured}
              />
            </TabsContent>

            <TabsContent value="purchase" className="space-y-4">
              {userWallet && (
                <TokenPurchaseManager
                  tokenizedProperty={tokenizedProperty}
                  userWallet={userWallet}
                  onPurchaseComplete={handlePurchaseComplete}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
