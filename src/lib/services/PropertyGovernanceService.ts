import { createClient } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

export interface GovernanceProposal {
  id: string;
  tokenized_property_id: string;
  proposal_type: 'property_management' | 'renovation' | 'sale_approval' | 'revenue_distribution';
  title: string;
  description: string;
  proposed_by: string;
  status: 'draft' | 'active' | 'passed' | 'rejected' | 'executed';
  voting_deadline: string;
  required_approval_percentage: number;
  current_approval_percentage: number;
  total_votes_cast: number;
  metadata: {
    estimated_cost?: number;
    contractor_details?: any;
    revenue_amount?: number;
    distribution_method?: string;
    sale_price?: number;
    buyer_details?: any;
    implementation_timeline?: string;
    legal_requirements?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface GovernanceVote {
  id: string;
  proposal_id: string;
  voter_id: string;
  vote: 'for' | 'against' | 'abstain';
  voting_power: number;
  reasoning?: string;
  cast_at: string;
}

export interface PropertyDecisionRights {
  token_holder_id: string;
  tokenized_property_id: string;
  voting_power_percentage: number;
  can_propose: boolean;
  can_veto_major_decisions: boolean;
  governance_tier: 'basic' | 'premium' | 'institutional';
}

export class PropertyGovernanceService {
  private supabase: ReturnType<typeof createClient<Database>>;

  constructor() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration not found');
    }
    
    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  /**
   * Create a new governance proposal for property management
   */
  async createPropertyProposal(
    tokenizedPropertyId: string,
    proposalData: {
      type: GovernanceProposal['proposal_type'];
      title: string;
      description: string;
      metadata: GovernanceProposal['metadata'];
      votingDeadlineDays?: number;
      requiredApprovalPercentage?: number;
    },
    proposedBy: string
  ): Promise<{ success: boolean; proposal?: GovernanceProposal; error?: string }> {
    try {
      // Check if user has proposal rights
      const { data: rights } = await this.supabase
        .from('token_holdings')
        .select('*')
        .eq('holder_id', proposedBy)
        .eq('tokenized_property_id', tokenizedPropertyId)
        .single();

      if (!rights || parseInt(rights.tokens_owned) < 1000) { // Minimum 1000 tokens to propose
        return {
          success: false,
          error: 'Insufficient tokens to create proposals. Minimum 1000 tokens required.',
        };
      }

      const votingDeadline = new Date();
      votingDeadline.setDate(votingDeadline.getDate() + (proposalData.votingDeadlineDays || 7));

      const proposal: Omit<GovernanceProposal, 'id' | 'created_at' | 'updated_at'> = {
        tokenized_property_id: tokenizedPropertyId,
        proposal_type: proposalData.type,
        title: proposalData.title,
        description: proposalData.description,
        proposed_by: proposedBy,
        status: 'active',
        voting_deadline: votingDeadline.toISOString(),
        required_approval_percentage: proposalData.requiredApprovalPercentage || 66.7,
        current_approval_percentage: 0,
        total_votes_cast: 0,
        metadata: proposalData.metadata,
      };

      // For now, use investment_polls table until governance_proposals is available
      const { data, error } = await this.supabase
        .from('investment_polls')
        .insert({
          investment_group_id: proposal.tokenized_property_id,
          title: proposal.title,
          description: proposal.description,
          poll_type: proposal.proposal_type,
          created_by: proposal.proposed_by,
          ends_at: proposal.voting_deadline,
          status: 'active',
          metadata: proposal.metadata
        })
        .select()
        .single();

      if (error) throw error;

      // Notify all token holders
      await this.notifyTokenHolders(tokenizedPropertyId, data.id, 'new_proposal');

      // Transform the investment_poll data to match GovernanceProposal interface
      const transformedProposal: GovernanceProposal = {
        id: data.id,
        tokenized_property_id: data.investment_group_id,
        proposal_type: data.poll_type as GovernanceProposal['proposal_type'],
        title: data.title,
        description: data.description || '',
        proposed_by: data.created_by,
        status: data.status as GovernanceProposal['status'],
        voting_deadline: data.ends_at,
        required_approval_percentage: data.consensus_threshold || 66.7,
        current_approval_percentage: 0,
        total_votes_cast: 0,
        metadata: (data.metadata as any) || {},
        created_at: data.created_at,
        updated_at: data.updated_at
      };

      return {
        success: true,
        proposal: transformedProposal,
      };
    } catch (error) {
      console.error('Error creating governance proposal:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Cast a vote on a governance proposal
   */
  async castVote(
    proposalId: string,
    voterId: string,
    vote: GovernanceVote['vote'],
    reasoning?: string
  ): Promise<{ success: boolean; vote?: GovernanceVote; error?: string }> {
    try {
      // For now, use investment_polls table until governance_proposals is available
      const { data: proposal, error: proposalError } = await this.supabase
        .from('investment_polls')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (proposalError || !proposal) {
        return { success: false, error: 'Proposal not found' };
      }

      if (proposal.status !== 'active') {
        return { success: false, error: 'Proposal is not active' };
      }

      if (new Date(proposal.ends_at).getTime() < new Date().getTime()) {
        return { success: false, error: 'Voting period has ended' };
      }

      // Get user's voting power for this property
      const votingPower = await this.getUserVotingPower(
        voterId, 
        proposal.investment_group_id
      );

      if (votingPower <= 0) {
        return { success: false, error: 'You do not have voting rights for this property' };
      }

      // Check if user has already voted
      const { data: existingVote } = await this.supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', proposalId)
        .eq('voter_id', voterId)
        .single();

      if (existingVote) {
        return { success: false, error: 'You have already voted on this proposal' };
      }

      // Cast the vote using poll_votes table
      const voteData = {
        poll_id: proposalId,
        voter_id: voterId,
        vote_option: vote,
        voting_power: votingPower,
        vote_data: { reasoning }
      };

      const { data: newVote, error: voteError } = await this.supabase
        .from('poll_votes')
        .insert(voteData)
        .select()
        .single();

      if (voteError) {
        throw voteError;
      }

      return {
        success: true,
        vote: {
          id: newVote.id,
          proposal_id: proposalId,
          voter_id: voterId,
          vote,
          voting_power: votingPower,
          reasoning,
          cast_at: newVote.voted_at
        } as GovernanceVote,
      };
    } catch (error) {
      console.error('Error casting vote:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Update proposal vote counts and status
   */
  private async updateProposalVoteCounts(proposalId: string): Promise<void> {
    // For now, this would be a placeholder since we're using investment_polls
    // In a real implementation, this would calculate and update vote counts
    console.log('Updating vote counts for proposal:', proposalId);
  }

  /**
   * Execute a passed governance proposal
   */
  private async executeProposal(proposalId: string): Promise<void> {
    // Placeholder for proposal execution
    console.log('Executing proposal:', proposalId);
  }

  private async executeRevenueDistribution(proposal: GovernanceProposal): Promise<void> {
    // Create revenue distribution record
    const distributionData = {
      tokenized_property_id: proposal.tokenized_property_id,
      total_revenue: proposal.metadata.revenue_amount || 0,
      revenue_per_token: (proposal.metadata.revenue_amount || 0) / 1000, // Placeholder calculation
      source_description: 'Governance approved distribution',
      distribution_date: new Date().toISOString(),
      distribution_type: proposal.metadata.distribution_method || 'proportional',
      metadata: {
        governance_proposal_id: proposal.id,
        approved_by_governance: true,
      },
    };

    await this.supabase
      .from('revenue_distributions')
      .insert(distributionData);
  }

  private async executePropertyManagement(proposal: GovernanceProposal): Promise<void> {
    // Log property management decision
    console.log('Executing property management decision:', proposal);
    // This would integrate with property management systems
  }

  private async executeRenovationProject(proposal: GovernanceProposal): Promise<void> {
    // Create renovation project record
    console.log('Executing renovation project:', proposal);
    // This would create project management records and contractor assignments
  }

  private async executeSaleApproval(proposal: GovernanceProposal): Promise<void> {
    // Update property status to approved for sale
    console.log('Executing sale approval:', proposal);
    // This would trigger property sale processes
  }

  /**
   * Get governance proposals for a property
   */
  async getPropertyProposals(
    tokenizedPropertyId: string,
    status?: string
  ): Promise<GovernanceProposal[]> {
    try {
      // For now, use investment_polls table until governance_proposals is available
      let query = this.supabase
        .from('investment_polls')
        .select('*')
        .eq('investment_group_id', tokenizedPropertyId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform investment_polls to GovernanceProposal format
      return (data || []).map(poll => ({
        id: poll.id,
        tokenized_property_id: poll.investment_group_id,
        proposal_type: poll.poll_type as GovernanceProposal['proposal_type'],
        title: poll.title,
        description: poll.description || '',
        status: poll.status as GovernanceProposal['status'],
        proposed_by: poll.created_by,
        voting_deadline: poll.ends_at,
        required_approval_percentage: poll.consensus_threshold || 66.7,
        current_approval_percentage: 0, // Would need to calculate from votes
        total_votes_cast: 0, // Would need to calculate from votes
        metadata: (poll.metadata as any) || {},
        created_at: poll.created_at,
        updated_at: poll.updated_at
      }));
    } catch (error) {
      console.error('Error fetching property proposals:', error);
      return [];
    }
  }

  /**
   * Get user's voting power for a specific property
   */
  async getUserVotingPower(userId: string, tokenizedPropertyId: string): Promise<number> {
    try {
      const { data: holding } = await this.supabase
        .from('token_holdings')
        .select('tokens_owned')
        .eq('holder_id', userId)
        .eq('tokenized_property_id', tokenizedPropertyId)
        .single();

      const { data: tokenData } = await this.supabase
        .from('tokenized_properties')
        .select('total_supply')
        .eq('id', tokenizedPropertyId)
        .single();

      if (!holding || !tokenData) return 0;

      return (parseInt(holding.tokens_owned) / parseInt(tokenData.total_supply)) * 100;
    } catch (error) {
      console.error('Error calculating voting power:', error);
      return 0;
    }
  }

  /**
   * Notify token holders about governance events
   */
  private async notifyTokenHolders(
    tokenizedPropertyId: string,
    proposalId: string,
    eventType: 'new_proposal' | 'proposal_passed' | 'proposal_rejected'
  ): Promise<void> {
    try {
      // Get all token holders for this property
      const { data: holders } = await this.supabase
        .from('token_holdings')
        .select('holder_id')
        .eq('tokenized_property_id', tokenizedPropertyId)
        .gt('tokens_owned', 0);

      if (!holders) return;

      // Create notifications for each holder
      const notifications = holders.map(holder => ({
        user_id: holder.holder_id,
        type: 'property_updates' as const, // Use valid notification type
        title: this.getNotificationTitle(eventType),
        message: this.getNotificationMessage(eventType, proposalId),
        metadata: {
          proposal_id: proposalId,
          tokenized_property_id: tokenizedPropertyId,
          event_type: eventType,
        },
        action_url: `/governance/proposals/${proposalId}`,
      }));

      await this.supabase
        .from('notifications')
        .insert(notifications);
    } catch (error) {
      console.error('Error notifying token holders:', error);
    }
  }

  private getNotificationTitle(eventType: string): string {
    switch (eventType) {
      case 'new_proposal':
        return 'New Governance Proposal';
      case 'proposal_passed':
        return 'Proposal Passed';
      case 'proposal_rejected':
        return 'Proposal Rejected';
      default:
        return 'Governance Update';
    }
  }

  private getNotificationMessage(eventType: string, proposalId: string): string {
    switch (eventType) {
      case 'new_proposal':
        return 'A new governance proposal requires your vote';
      case 'proposal_passed':
        return 'A governance proposal has passed and will be executed';
      case 'proposal_rejected':
        return 'A governance proposal has been rejected';
      default:
        return 'Governance update available';
    }
  }
}