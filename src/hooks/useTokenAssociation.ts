import { useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TokenAssociationResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}

interface TokenAssociationStatus {
  tokenId: string;
  isAssociated: boolean;
  lastChecked: string;
}

export const useTokenAssociation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [associationStatuses, setAssociationStatuses] = useState<Map<string, TokenAssociationStatus>>(new Map());

  const checkTokenAssociation = useCallback(async (tokenId: string, accountId?: string): Promise<boolean> => {
    if (!user && !accountId) return false;

    try {
      const { data, error } = await supabase.functions.invoke('check-token-association', {
        body: {
          tokenId,
          accountId: accountId || user?.id
        }
      });

      if (error) throw error;

      const isAssociated = data?.isAssociated || false;
      
      // Update local cache
      setAssociationStatuses(prev => new Map(prev).set(tokenId, {
        tokenId,
        isAssociated,
        lastChecked: new Date().toISOString()
      }));

      return isAssociated;
    } catch (error) {
      console.error('Error checking token association:', error);
      return false;
    }
  }, [user]);

  const associateToken = useCallback(async (tokenId: string, accountId?: string): Promise<TokenAssociationResult> => {
    if (!user && !accountId) {
      return { success: false, error: 'User not authenticated' };
    }

    setIsLoading(true);
    try {
      // First check if already associated
      const isAlreadyAssociated = await checkTokenAssociation(tokenId, accountId);
      if (isAlreadyAssociated) {
        toast({
          title: "Already Associated",
          description: "Token is already associated with this account",
        });
        return { success: true };
      }

      const { data, error } = await supabase.functions.invoke('associate-hedera-token', {
        body: {
          tokenId,
          investorAccountId: accountId || user?.id
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Token associated successfully",
      });

      // Update association status
      setAssociationStatuses(prev => new Map(prev).set(tokenId, {
        tokenId,
        isAssociated: true,
        lastChecked: new Date().toISOString()
      }));

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
  }, [user, checkTokenAssociation, toast]);

  const batchAssociateTokens = useCallback(async (tokenIds: string[], accountId?: string): Promise<{
    successful: string[];
    failed: Array<{ tokenId: string; error: string }>;
  }> => {
    const successful: string[] = [];
    const failed: Array<{ tokenId: string; error: string }> = [];

    setIsLoading(true);
    try {
      // Process tokens in batches of 3 to avoid overwhelming the network
      const batchSize = 3;
      for (let i = 0; i < tokenIds.length; i += batchSize) {
        const batch = tokenIds.slice(i, i + batchSize);
        
        const batchResults = await Promise.allSettled(
          batch.map(tokenId => associateToken(tokenId, accountId))
        );

        batchResults.forEach((result, index) => {
          const tokenId = batch[index];
          if (result.status === 'fulfilled' && result.value.success) {
            successful.push(tokenId);
          } else {
            const error = result.status === 'rejected' 
              ? result.reason?.message || 'Unknown error'
              : result.value.error || 'Association failed';
            failed.push({ tokenId, error });
          }
        });

        // Add delay between batches to prevent rate limiting
        if (i + batchSize < tokenIds.length) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      if (successful.length > 0) {
        toast({
          title: "Batch Association Complete",
          description: `Successfully associated ${successful.length} tokens`,
        });
      }

      if (failed.length > 0) {
        toast({
          title: "Some Associations Failed",
          description: `${failed.length} tokens failed to associate`,
          variant: "destructive",
        });
      }

      return { successful, failed };
    } catch (error) {
      console.error('Batch association error:', error);
      return { 
        successful, 
        failed: tokenIds.map(tokenId => ({ 
          tokenId, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        }))
      };
    } finally {
      setIsLoading(false);
    }
  }, [associateToken, toast]);

  const autoAssociateForInvestment = useCallback(async (tokenizedPropertyId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Mock token data for now since hedera_tokens table doesn't exist
      const mockTokenId = `token_${tokenizedPropertyId}`;
      if (!mockTokenId) {
        console.error('Token not found for property:', tokenizedPropertyId);
        return false;
      }

      // Get user's Hedera wallet
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('address')
        .eq('user_id', user.id)
        .eq('wallet_type', 'hedera')
        .eq('is_primary', true)
        .single();

      if (walletError || !walletData) {
        toast({
          title: "Wallet Required",
          description: "Please connect your Hedera wallet first",
          variant: "destructive",
        });
        return false;
      }

      // Check and associate if needed
      const isAssociated = await checkTokenAssociation(mockTokenId, walletData.address);
      
      if (!isAssociated) {
        const result = await associateToken(mockTokenId, walletData.address);
        return result.success;
      }

      return true;
    } catch (error) {
      console.error('Auto-association error:', error);
      return false;
    }
  }, [user, checkTokenAssociation, associateToken, toast]);

  const getAssociationStatus = useCallback((tokenId: string): TokenAssociationStatus | null => {
    return associationStatuses.get(tokenId) || null;
  }, [associationStatuses]);

  const refreshAssociationStatus = useCallback(async (tokenId: string, accountId?: string): Promise<void> => {
    await checkTokenAssociation(tokenId, accountId);
  }, [checkTokenAssociation]);

  return {
    isLoading,
    associationStatuses: Array.from(associationStatuses.values()),
    checkTokenAssociation,
    associateToken,
    batchAssociateTokens,
    autoAssociateForInvestment,
    getAssociationStatus,
    refreshAssociationStatus
  };
};