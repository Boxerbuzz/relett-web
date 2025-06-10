
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export interface InvestmentPoll {
  id: string;
  investment_group_id: string;
  title: string;
  description?: string;
  poll_type: 'simple' | 'multiple_choice' | 'ranked' | 'weighted';
  created_by: string;
  status: 'draft' | 'active' | 'closed' | 'cancelled';
  starts_at: string;
  ends_at: string;
  min_participation_percentage: number;
  requires_consensus: boolean;
  consensus_threshold: number;
  allow_vote_changes: boolean;
  is_anonymous: boolean;
  voting_power_basis: 'tokens' | 'equal' | 'investment_amount';
  hedera_topic_id?: string;
  hedera_consensus_timestamp?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  option_order: number;
  metadata: any;
  created_at: string;
}

export interface PollVote {
  id: string;
  poll_id: string;
  voter_id: string;
  poll_option_id?: string;
  voting_power: number;
  vote_weight: number;
  ranked_choices?: string[];
  vote_data: any;
  hedera_transaction_id?: string;
  hedera_consensus_timestamp?: string;
  voted_at: string;
  updated_at: string;
}

export interface PollResult {
  poll_id: string;
  title: string;
  status: string;
  ends_at: string;
  option_id: string;
  option_text: string;
  option_order: number;
  vote_count: number;
  total_voting_power: number;
  total_vote_weight: number;
  vote_percentage: number;
}

export const useInvestmentPolls = (investmentGroupId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [polls, setPolls] = useState<InvestmentPoll[]>([]);
  const [pollOptions, setPollOptions] = useState<Record<string, PollOption[]>>({});
  const [pollResults, setPollResults] = useState<Record<string, PollResult[]>>({});
  const [userVotes, setUserVotes] = useState<Record<string, PollVote>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && investmentGroupId) {
      fetchPolls();
    }
  }, [user, investmentGroupId]);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      
      // Fetch polls
      let pollsQuery = supabase
        .from('investment_polls')
        .select('*')
        .order('created_at', { ascending: false });

      if (investmentGroupId) {
        pollsQuery = pollsQuery.eq('investment_group_id', investmentGroupId);
      }

      const { data: pollsData, error: pollsError } = await pollsQuery;
      if (pollsError) throw pollsError;

      // Type cast the data to ensure proper typing
      const typedPolls = (pollsData || []).map(poll => ({
        ...poll,
        poll_type: poll.poll_type as 'simple' | 'multiple_choice' | 'ranked' | 'weighted',
        status: poll.status as 'draft' | 'active' | 'closed' | 'cancelled',
        voting_power_basis: poll.voting_power_basis as 'tokens' | 'equal' | 'investment_amount'
      }));

      setPolls(typedPolls);

      // Fetch options for all polls
      if (pollsData && pollsData.length > 0) {
        const pollIds = pollsData.map(poll => poll.id);
        
        const { data: optionsData, error: optionsError } = await supabase
          .from('poll_options')
          .select('*')
          .in('poll_id', pollIds)
          .order('option_order');

        if (optionsError) throw optionsError;

        // Group options by poll_id
        const optionsByPoll = (optionsData || []).reduce((acc, option) => {
          if (!acc[option.poll_id]) acc[option.poll_id] = [];
          acc[option.poll_id].push(option);
          return acc;
        }, {} as Record<string, PollOption[]>);

        setPollOptions(optionsByPoll);

        // Fetch results
        const { data: resultsData, error: resultsError } = await supabase
          .from('poll_results')
          .select('*')
          .in('poll_id', pollIds);

        if (resultsError) throw resultsError;

        // Group results by poll_id
        const resultsByPoll = (resultsData || []).reduce((acc, result) => {
          if (!acc[result.poll_id]) acc[result.poll_id] = [];
          acc[result.poll_id].push(result);
          return acc;
        }, {} as Record<string, PollResult[]>);

        setPollResults(resultsByPoll);

        // Fetch user votes
        const { data: votesData, error: votesError } = await supabase
          .from('poll_votes')
          .select('*')
          .in('poll_id', pollIds)
          .eq('voter_id', user?.id);

        if (votesError) throw votesError;

        // Type cast and index votes by poll_id
        const votesByPoll = (votesData || []).reduce((acc, vote) => {
          const typedVote: PollVote = {
            ...vote,
            ranked_choices: Array.isArray(vote.ranked_choices) ? vote.ranked_choices : 
                           (vote.ranked_choices ? [vote.ranked_choices as string] : undefined)
          };
          acc[vote.poll_id] = typedVote;
          return acc;
        }, {} as Record<string, PollVote>);

        setUserVotes(votesByPoll);
      }
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch polls',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createPoll = async (pollData: {
    title: string;
    description?: string;
    poll_type: string;
    ends_at: string;
    options: string[];
    min_participation_percentage?: number;
    requires_consensus?: boolean;
    consensus_threshold?: number;
    voting_power_basis?: string;
  }) => {
    if (!user || !investmentGroupId) return null;

    try {
      // Create poll
      const { data: poll, error: pollError } = await supabase
        .from('investment_polls')
        .insert({
          investment_group_id: investmentGroupId,
          title: pollData.title,
          description: pollData.description,
          poll_type: pollData.poll_type,
          created_by: user.id,
          ends_at: pollData.ends_at,
          min_participation_percentage: pollData.min_participation_percentage || 50,
          requires_consensus: pollData.requires_consensus || false,
          consensus_threshold: pollData.consensus_threshold || 66.7,
          voting_power_basis: pollData.voting_power_basis || 'tokens'
        })
        .select()
        .single();

      if (pollError) throw pollError;

      // Create poll options
      const options = pollData.options.map((option, index) => ({
        poll_id: poll.id,
        option_text: option,
        option_order: index
      }));

      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(options);

      if (optionsError) throw optionsError;

      toast({
        title: 'Success',
        description: 'Poll created successfully'
      });

      fetchPolls();
      return poll;
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: 'Error',
        description: 'Failed to create poll',
        variant: 'destructive'
      });
      return null;
    }
  };

  const castVote = async (pollId: string, optionId: string, rankedChoices?: string[]) => {
    if (!user) return false;

    try {
      // Calculate voting power
      const { data: votingPowerData, error: vpError } = await supabase
        .rpc('calculate_voting_power', {
          p_poll_id: pollId,
          p_voter_id: user.id
        });

      if (vpError) throw vpError;

      const votingPower = votingPowerData || 1.0;

      // Create or update vote
      const voteData = {
        poll_id: pollId,
        voter_id: user.id,
        poll_option_id: optionId,
        voting_power: votingPower,
        vote_weight: 1.0,
        ranked_choices: rankedChoices || null,
        vote_data: {}
      };

      const { error } = await supabase
        .from('poll_votes')
        .upsert(voteData, {
          onConflict: 'poll_id,voter_id'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Vote cast successfully'
      });

      fetchPolls();
      return true;
    } catch (error) {
      console.error('Error casting vote:', error);
      toast({
        title: 'Error',
        description: 'Failed to cast vote',
        variant: 'destructive'
      });
      return false;
    }
  };

  const closePoll = async (pollId: string) => {
    try {
      const { error } = await supabase
        .from('investment_polls')
        .update({ 
          status: 'closed',
          updated_at: new Date().toISOString()
        })
        .eq('id', pollId)
        .eq('created_by', user?.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Poll closed successfully'
      });

      fetchPolls();
      return true;
    } catch (error) {
      console.error('Error closing poll:', error);
      toast({
        title: 'Error',
        description: 'Failed to close poll',
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
    polls,
    pollOptions,
    pollResults,
    userVotes,
    loading,
    createPoll,
    castVote,
    closePoll,
    refetch: fetchPolls
  };
};
