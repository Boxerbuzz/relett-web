
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      // Query tokenized_properties directly since the RPC function doesn't exist yet
      const { data, error } = await supabase
        .from('tokenized_properties')
        .select(`
          id,
          token_name,
          token_symbol,
          total_value_usd,
          total_supply,
          status,
          created_at
        `)
        .in('status', ['pending_approval', 'draft']);
      
      if (error) {
        console.error('Error fetching pending approvals:', error);
        throw error;
      }

      // Transform the data to match the expected interface
      const transformedData: PendingToken[] = (data || []).map(item => ({
        id: item.id,
        token_name: item.token_name || '',
        token_symbol: item.token_symbol || '',
        total_value_usd: item.total_value_usd || 0,
        total_supply: item.total_supply?.toString() || '0',
        status: item.status || '',
        created_at: item.created_at || '',
        property_title: 'N/A',
        property_location: 'N/A',
        owner_name: 'N/A',
        owner_email: 'N/A'
      }));

      return transformedData;
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
      // Update tokenized_properties status - database trigger will handle Hedera creation
      const { data, error } = await supabase
        .from('tokenized_properties')
        .update({ 
          status: newStatus as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', tokenId)
        .select();

      if (error) {
        console.error('Error updating token status:', error);
        throw error;
      }

      // Show appropriate message based on status
      if (newStatus === 'approved') {
        toast({
          title: "Token Approved",
          description: "Token approved successfully. Hedera token creation will be initiated automatically.",
        });
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
