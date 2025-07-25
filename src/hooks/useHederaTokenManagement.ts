import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TokenAssociationResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

interface TokenTransferResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

export const useHederaTokenManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const associateToken = async (tokenId: string, accountId: string): Promise<TokenAssociationResult> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('associate-hedera-token', {
        body: {
          tokenId,
          investorAccountId: accountId
        }
      });

      if (error) {
        console.error('Token association error:', error);
        return { success: false, error: error.message };
      }

      toast({
        title: "Success",
        description: "Token associated successfully",
      });

      return { 
        success: true, 
        transactionId: data.transactionId 
      };
    } catch (error) {
      console.error('Token association failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      toast({
        title: "Error",
        description: `Failed to associate token: ${errorMessage}`,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const checkTokenAssociation = async (tokenId: string, accountId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('check-token-association', {
        body: {
          tokenId,
          accountId
        }
      });

      if (error) {
        console.error('Error checking token association:', error);
        return false;
      }

      return data?.isAssociated || false;
    } catch (error) {
      console.error('Failed to check token association:', error);
      return false;
    }
  };

  const transferTokens = async (params: {
    tokenId: string;
    fromAccountId: string;
    toAccountId: string;
    amount: number;
    tokenizedPropertyId: string;
    pricePerToken: number;
  }): Promise<TokenTransferResult> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);
    try {
      // First ensure the recipient account is associated with the token
      const isAssociated = await checkTokenAssociation(params.tokenId, params.toAccountId);
      
      if (!isAssociated) {
        const associationResult = await associateToken(params.tokenId, params.toAccountId);
        if (!associationResult.success) {
          return { success: false, error: 'Failed to associate token with recipient account' };
        }
      }

      // Execute the token transfer
      const { data, error } = await supabase.functions.invoke('transfer-hedera-tokens', {
        body: {
          ...params,
          fromPrivateKey: 'user_private_key' // This should be retrieved securely
        }
      });

      if (error) {
        console.error('Token transfer error:', error);
        return { success: false, error: error.message };
      }

      toast({
        title: "Success",
        description: "Tokens transferred successfully",
      });

      return { 
        success: true, 
        transactionId: data.transaction_id 
      };
    } catch (error) {
      console.error('Token transfer failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      toast({
        title: "Error",
        description: `Failed to transfer tokens: ${errorMessage}`,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const createTokenListing = async (params: {
    tokenizedPropertyId: string;
    tokenAmount: number;
    pricePerToken: number;
  }) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to create a listing",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .insert({
          tokenized_property_id: params.tokenizedPropertyId,
          seller_id: user.id,
          token_amount: params.tokenAmount,
          price_per_token: params.pricePerToken,
          total_price: params.tokenAmount * params.pricePerToken,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Token listing created successfully",
      });

      return { success: true };
    } catch (error) {
      console.error('Error creating token listing:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      toast({
        title: "Error",
        description: `Failed to create listing: ${errorMessage}`,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const buyMarketplaceTokens = async (listingId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to buy tokens",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('buy-marketplace-tokens', {
        body: {
          listing_id: listingId,
          buyer_id: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Tokens purchased successfully",
      });

      return { success: true, data };
    } catch (error) {
      console.error('Error buying tokens:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      toast({
        title: "Error",
        description: `Failed to purchase tokens: ${errorMessage}`,
        variant: "destructive",
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    associateToken,
    checkTokenAssociation,
    transferTokens,
    createTokenListing,
    buyMarketplaceTokens,
    isLoading
  };
};