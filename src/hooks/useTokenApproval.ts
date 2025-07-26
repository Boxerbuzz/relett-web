
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PropertyTokenizationService } from '@/lib/tokenization';

interface PendingToken {
  id: string;
  token_name: string;
  token_symbol: string;
  total_value_usd: number;
  total_supply: string;
  status: string;
  created_at: string;
  property_title: string;
  property_location: any;
  owner_name: string;
  owner_email: string;
}

export const useTokenApproval = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const fetchPendingApprovals = async (): Promise<PendingToken[]> => {
    try {
      const { data, error } = await supabase.rpc('get_pending_token_approvals');
      
      if (error) {
        console.error('Error fetching pending approvals:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pending token approvals",
        variant: "destructive",
      });
      return [];
    }
  };

  const updateTokenStatus = async (
    tokenId: string,
    newStatus: string,
    adminNotes?: string
  ): Promise<boolean> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to perform this action",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('update_tokenized_property_status', {
        p_tokenized_property_id: tokenId,
        p_new_status: newStatus,
        p_admin_notes: adminNotes,
        p_admin_id: user.id
      });

      if (error) {
        console.error('Error updating token status:', error);
        throw error;
      }

      // If approved, trigger Hedera token creation
      if (newStatus === 'approved') {
        toast({
          title: "Token Approved",
          description: "Token approved successfully. Hedera token creation will be initiated.",
        });

        // Create Hedera token in background
        const tokenService = new PropertyTokenizationService();
        const hederaResult = await tokenService.createHederaTokenAfterApproval(tokenId);
        
        if (hederaResult.success) {
          toast({
            title: "Hedera Token Created",
            description: "Token has been successfully minted on Hedera network",
          });
        } else {
          console.error('Hedera token creation failed:', hederaResult.error);
          toast({
            title: "Warning",
            description: "Token approved but Hedera creation failed. Please retry manually.",
            variant: "destructive",
          });
        }

        tokenService.close();
      } else {
        toast({
          title: "Status Updated",
          description: `Token status updated to ${newStatus}`,
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to update token status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      toast({
        title: "Error",
        description: `Failed to update token status: ${errorMessage}`,
        variant: "destructive",
      });

      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const approveToken = (tokenId: string, adminNotes?: string) => 
    updateTokenStatus(tokenId, 'approved', adminNotes);

  const rejectToken = (tokenId: string, adminNotes?: string) => 
    updateTokenStatus(tokenId, 'draft', adminNotes);

  const requestChanges = (tokenId: string, adminNotes?: string) => 
    updateTokenStatus(tokenId, 'pending_approval', adminNotes);

  return {
    fetchPendingApprovals,
    updateTokenStatus,
    approveToken,
    rejectToken,
    requestChanges,
    isLoading
  };
};
