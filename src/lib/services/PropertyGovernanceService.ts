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
  vote: 'approve' | 'reject' | 'abstain';
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

      if (!rights || rights.tokens_owned < 1000) { // Minimum 1000 tokens to propose
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

      const { data, error } = await this.supabase
        .from('governance_proposals')
        .insert(proposal)
        .select()
        .single();

      if (error) throw error;

      // Notify all token holders
      await this.notifyTokenHolders(tokenizedPropertyId, data.id, 'new_proposal');

      return {
        success: true,
        proposal: data as GovernanceProposal,
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
      // Get proposal details
      const { data: proposal, error: proposalError } = await this.supabase
        .from('governance_proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (proposalError || !proposal) {
        return { success: false, error: 'Proposal not found' };
      }

      if (proposal.status !== 'active') {
        return { success: false, error: 'Voting is not active for this proposal' };
      }

      if (new Date() > new Date(proposal.voting_deadline)) {
        return { success: false, error: 'Voting deadline has passed' };
      }

      // Calculate voter's voting power
      const { data: holding, error: holdingError } = await this.supabase
        .from('token_holdings')
        .select('*')
        .eq('holder_id', voterId)
        .eq('tokenized_property_id', proposal.tokenized_property_id)
        .single();

      if (holdingError || !holding) {
        return { success: false, error: 'No token holdings found for this property' };
      }

      // Get total supply to calculate voting power percentage
      const { data: tokenData, error: tokenError } = await this.supabase
        .from('tokenized_properties')
        .select('total_supply')
        .eq('id', proposal.tokenized_property_id)
        .single();

      if (tokenError || !tokenData) {
        return { success: false, error: 'Unable to calculate voting power' };
      }

      const votingPower = (holding.tokens_owned / parseInt(tokenData.total_supply)) * 100;

      // Check if already voted
      const { data: existingVote } = await this.supabase
        .from('governance_votes')
        .select('*')
        .eq('proposal_id', proposalId)
        .eq('voter_id', voterId)
        .single();

      if (existingVote) {
        return { success: false, error: 'You have already voted on this proposal' };
      }

      // Cast vote
      const voteData: Omit<GovernanceVote, 'id' | 'cast_at'> = {
        proposal_id: proposalId,
        voter_id: voterId,
        vote,
        voting_power: votingPower,
        reasoning,
      };

      const { data: newVote, error: voteError } = await this.supabase
        .from('governance_votes')
        .insert(voteData)
        .select()
        .single();

      if (voteError) throw voteError;

      // Update proposal vote counts
      await this.updateProposalVoteCounts(proposalId);

      return {
        success: true,
        vote: newVote as GovernanceVote,
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
    try {
      // Get all votes for this proposal
      const { data: votes, error } = await this.supabase
        .from('governance_votes')
        .select('*')
        .eq('proposal_id', proposalId);

      if (error || !votes) return;

      const totalVotingPower = votes.reduce((sum, vote) => sum + vote.voting_power, 0);
      const approvalPower = votes
        .filter(vote => vote.vote === 'approve')
        .reduce((sum, vote) => sum + vote.voting_power, 0);

      const currentApprovalPercentage = totalVotingPower > 0 ? (approvalPower / totalVotingPower) * 100 : 0;

      // Get proposal to check required approval percentage
      const { data: proposal } = await this.supabase
        .from('governance_proposals')
        .select('required_approval_percentage, status')
        .eq('id', proposalId)
        .single();

      if (!proposal) return;

      // Determine new status
      let newStatus = proposal.status;
      if (totalVotingPower >= 50 && currentApprovalPercentage >= proposal.required_approval_percentage) {
        newStatus = 'passed';
      } else if (totalVotingPower >= 50 && currentApprovalPercentage < (100 - proposal.required_approval_percentage)) {
        newStatus = 'rejected';
      }

      // Update proposal
      await this.supabase
        .from('governance_proposals')
        .update({
          current_approval_percentage: currentApprovalPercentage,
          total_votes_cast: votes.length,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', proposalId);

      // If proposal passed, trigger execution
      if (newStatus === 'passed') {
        await this.executeProposal(proposalId);
      }
    } catch (error) {
      console.error('Error updating proposal vote counts:', error);
    }
  }

  /**
   * Execute a passed governance proposal
   */
  private async executeProposal(proposalId: string): Promise<void> {
    try {
      const { data: proposal, error } = await this.supabase
        .from('governance_proposals')
        .select('*')
        .eq('id', proposalId)
        .single();

      if (error || !proposal) return;

      switch (proposal.proposal_type) {
        case 'revenue_distribution':
          await this.executeRevenueDistribution(proposal);
          break;
        case 'property_management':
          await this.executePropertyManagement(proposal);
          break;
        case 'renovation':
          await this.executeRenovationProject(proposal);
          break;
        case 'sale_approval':
          await this.executeSaleApproval(proposal);
          break;
      }

      // Mark as executed
      await this.supabase
        .from('governance_proposals')
        .update({
          status: 'executed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', proposalId);

    } catch (error) {
      console.error('Error executing proposal:', error);
    }
  }

  private async executeRevenueDistribution(proposal: GovernanceProposal): Promise<void> {
    // Create revenue distribution record
    const distributionData = {
      tokenized_property_id: proposal.tokenized_property_id,
      total_amount: proposal.metadata.revenue_amount || 0,
      distribution_date: new Date().toISOString(),
      distribution_type: proposal.metadata.distribution_method || 'proportional',
      status: 'pending',
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
    status?: GovernanceProposal['status']
  ): Promise<GovernanceProposal[]> {
    try {
      let query = this.supabase
        .from('governance_proposals')
        .select('*')
        .eq('tokenized_property_id', tokenizedPropertyId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data as GovernanceProposal[];
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

      return (holding.tokens_owned / parseInt(tokenData.total_supply)) * 100;
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
        type: 'governance_updates' as const,
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