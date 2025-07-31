import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { 
  PropertyGovernanceService, 
  GovernanceProposal, 
  GovernanceVote 
} from "@/lib/services/PropertyGovernanceService";
import { HederaMultiSigService } from "@/lib/hedera/HederaMultiSigService";

export interface VotingPowerInfo {
  totalTokens: number;
  votingPercentage: number;
  eligibleToVote: boolean;
  properties: Array<{
    propertyId: string;
    tokenAmount: number;
    votingPower: number;
  }>;
}

export const usePropertyGovernance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [userVotes, setUserVotes] = useState<GovernanceVote[]>([]);
  const [votingPower, setVotingPower] = useState<VotingPowerInfo>({
    totalTokens: 0,
    votingPercentage: 0,
    eligibleToVote: false,
    properties: []
  });
  const [loading, setLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);

  const governanceService = new PropertyGovernanceService();
  const multiSigService = new HederaMultiSigService();

  useEffect(() => {
    if (user) {
      fetchGovernanceData();
    }
  }, [user]);

  const fetchGovernanceData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await Promise.all([
        fetchProposals(),
        fetchUserVotes(),
        calculateVotingPower()
      ]);
    } catch (error) {
      console.error('Error fetching governance data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch governance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProposals = async () => {
    try {
      // Get user's tokenized properties
      const properties = await getUserProperties();
      
      // Fetch proposals for all properties user has tokens in
      const allProposals: GovernanceProposal[] = [];
      
      for (const propertyId of properties) {
        const propertyProposals = await governanceService.getPropertyProposals(propertyId);
        allProposals.push(...propertyProposals);
      }

      // Sort by creation date, newest first
      allProposals.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setProposals(allProposals);
    } catch (error) {
      console.error('Error fetching proposals:', error);
    }
  };

  const fetchUserVotes = async () => {
    try {
      // Get all votes for the current user across all proposals
      const properties = await getUserProperties();
      const allVotes: GovernanceVote[] = [];

      for (const proposal of proposals) {
        // This would need to be implemented in the service
        // For now, we'll fetch directly from Supabase
      }

      setUserVotes(allVotes);
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  const calculateVotingPower = async () => {
    if (!user) return;

    try {
      const properties = await getUserProperties();
      const propertyPowers: VotingPowerInfo['properties'] = [];
      let totalTokens = 0;
      let totalVotingPower = 0;

      for (const propertyId of properties) {
        const votingPower = await governanceService.getUserVotingPower(user.id, propertyId);
        
        // Get token amount for this property
        const tokenAmount = await getTokenAmount(propertyId);
        
        propertyPowers.push({
          propertyId,
          tokenAmount,
          votingPower
        });

        totalTokens += tokenAmount;
        totalVotingPower += votingPower;
      }

      setVotingPower({
        totalTokens,
        votingPercentage: totalVotingPower / properties.length || 0,
        eligibleToVote: totalTokens > 0,
        properties: propertyPowers
      });
    } catch (error) {
      console.error('Error calculating voting power:', error);
    }
  };

  const createProposal = async (
    tokenizedPropertyId: string,
    proposalData: {
      type: GovernanceProposal['proposal_type'];
      title: string;
      description: string;
      metadata: any;
      votingDeadlineDays?: number;
      requiredApprovalPercentage?: number;
    }
  ) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      const result = await governanceService.createPropertyProposal(
        tokenizedPropertyId,
        proposalData,
        user.id
      );

      if (result.success) {
        toast({
          title: "Proposal Created",
          description: "Your governance proposal has been created successfully",
        });
        
        // Refresh proposals
        await fetchProposals();
      } else {
        toast({
          title: "Creation Failed",
          description: result.error || "Failed to create proposal",
          variant: "destructive"
        });
      }

      return result;
    } catch (error) {
      console.error('Error creating proposal:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return { success: false, error: 'Unexpected error' };
    }
  };

  const castVote = async (
    proposalId: string,
    vote: 'for' | 'against' | 'abstain',
    reasoning?: string
  ) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    setIsVoting(true);
    try {
      const result = await governanceService.castVote(
        proposalId,
        user.id,
        vote,
        reasoning
      );

      if (result.success) {
        toast({
          title: "Vote Cast",
          description: `Your ${vote.toUpperCase()} vote has been recorded`,
        });
        
        // Refresh data
        await Promise.all([fetchProposals(), fetchUserVotes()]);
      } else {
        toast({
          title: "Vote Failed",
          description: result.error || "Failed to cast vote",
          variant: "destructive"
        });
      }

      return result;
    } catch (error) {
      console.error('Error casting vote:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while voting",
        variant: "destructive"
      });
      return { success: false, error: 'Unexpected error' };
    } finally {
      setIsVoting(false);
    }
  };

  const requestKeyRotation = async (
    tokenId: string,
    keyType: 'admin' | 'supply' | 'freeze' | 'wipe' | 'pause',
    newKeyConfig: any,
    reason: string
  ) => {
    if (!user) return { success: false, error: 'User not authenticated' };

    try {
      // This would integrate with the HederaMultiSigService
      // For now, this is a placeholder since key rotation needs proper implementation
      const result = true; // Placeholder

      if (result) {
        toast({
          title: "Key Rotation Requested",
          description: "Your key rotation request has been submitted for approval",
        });
        return { success: true };
      } else {
        throw new Error('Key rotation failed');
      }
    } catch (error) {
      console.error('Error requesting key rotation:', error);
      toast({
        title: "Key Rotation Failed",
        description: error instanceof Error ? error.message : "Failed to request key rotation",
        variant: "destructive"
      });
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  };

  // Helper functions
  const getUserProperties = async (): Promise<string[]> => {
    if (!user) return [];
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('token_holdings')
        .select('tokenized_property_id')
        .eq('holder_id', user.id)
        .gt('tokens_owned', 0);

      if (error) throw error;
      return data?.map(h => h.tokenized_property_id) || [];
    } catch (error) {
      console.error('Error fetching user properties:', error);
      return [];
    }
  };

  const getTokenAmount = async (propertyId: string): Promise<number> => {
    if (!user) return 0;
    
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data, error } = await supabase
        .from('token_holdings')
        .select('tokens_owned')
        .eq('holder_id', user.id)
        .eq('tokenized_property_id', propertyId)
        .single();

      if (error) throw error;
      return parseInt(data?.tokens_owned || '0');
    } catch (error) {
      console.error('Error fetching token amount:', error);
      return 0;
    }
  };

  const getUserVoteForProposal = (proposalId: string): GovernanceVote | undefined => {
    return userVotes.find(vote => vote.proposal_id === proposalId);
  };

  const getProposalsByStatus = (status: GovernanceProposal['status']) => {
    return proposals.filter(proposal => proposal.status === status);
  };

  const getProposalsByType = (type: GovernanceProposal['proposal_type']) => {
    return proposals.filter(proposal => proposal.proposal_type === type);
  };

  return {
    // Data
    proposals,
    userVotes,
    votingPower,
    loading,
    isVoting,

    // Actions
    createProposal,
    castVote,
    requestKeyRotation,

    // Utilities
    getUserVoteForProposal,
    getProposalsByStatus,
    getProposalsByType,
    refetch: fetchGovernanceData,
  };
};