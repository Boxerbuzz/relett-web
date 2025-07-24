'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  Users, 
  Clock, 
  TrendUp, 
  CheckCircle, 
  XCircle,
  Calendar
} from 'phosphor-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface BuyoutPoll {
  id: string;
  title: string;
  description: string;
  buyout_price: number;
  min_buyout_percentage: number;
  current_buyout_votes: number;
  buyout_deadline: string;
  status: 'active' | 'passed' | 'failed' | 'expired';
  auto_execute_on_success: boolean;
  metadata: {
    justification?: string;
    proposalType?: string;
  };
  voting_power_basis: string;
  created_at: string;
  ends_at: string;
}

interface BuyoutVotingInterfaceProps {
  poll: BuyoutPoll;
  userVotingPower: number;
  hasVoted: boolean;
  userVote?: 'yes' | 'no';
  onVoteUpdate: () => void;
}

export function BuyoutVotingInterface({ 
  poll, 
  userVotingPower, 
  hasVoted, 
  userVote,
  onVoteUpdate 
}: BuyoutVotingInterfaceProps) {
  const [isVoting, setIsVoting] = useState(false);
  const { toast } = useToast();

  const votingProgress = (poll.current_buyout_votes / poll.min_buyout_percentage) * 100;
  const isExpired = new Date() > new Date(poll.buyout_deadline);
  const canVote = poll.status === 'active' && !isExpired && !hasVoted;

  const handleVote = async (voteDecision: 'yes' | 'no') => {
    setIsVoting(true);
    try {
      const response = await fetch('https://wossuijahchhtjzphsgh.supabase.co/functions/v1/cast-poll-vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('sb-access-token')}`
        },
        body: JSON.stringify({
          pollId: poll.id,
          vote: voteDecision,
          votingPower: userVotingPower
        })
      });

      if (response.ok) {
        toast({
          title: 'Vote Cast Successfully',
          description: `You voted ${voteDecision.toUpperCase()} on this buyout proposal.`,
        });
        onVoteUpdate();
      } else {
        throw new Error('Failed to cast vote');
      }
    } catch (error) {
      console.error('Error casting vote:', error);
      toast({
        title: 'Error',
        description: 'Failed to cast your vote. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsVoting(false);
    }
  };

  const getStatusBadge = () => {
    switch (poll.status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'passed':
        return <Badge variant="success">Passed</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'expired':
        return <Badge variant="secondary">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {poll.title}
            </CardTitle>
            <CardDescription>{poll.description}</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Buyout Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <DollarSign className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Buyout Price</p>
              <p className="text-lg font-bold">${poll.buyout_price.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Required Approval</p>
              <p className="text-lg font-bold">{poll.min_buyout_percentage}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Deadline</p>
              <p className="text-sm font-semibold">
                {format(new Date(poll.buyout_deadline), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>
        </div>

        {/* Voting Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold flex items-center gap-2">
              <TrendUp className="h-4 w-4" />
              Voting Progress
            </h4>
            <span className="text-sm text-muted-foreground">
              {poll.current_buyout_votes.toFixed(1)}% / {poll.min_buyout_percentage}%
            </span>
          </div>
          
          <Progress value={Math.min(votingProgress, 100)} className="h-3" />
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {votingProgress >= 100 ? 'Threshold reached!' : 'Needs more votes to pass'}
            </span>
            <span>
              {userVotingPower > 0 && `Your voting power: ${userVotingPower.toFixed(2)}%`}
            </span>
          </div>
        </div>

        {/* Justification */}
        {poll.metadata.justification && (
          <div className="space-y-2">
            <h4 className="font-semibold">Proposal Justification</h4>
            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
              {poll.metadata.justification}
            </p>
          </div>
        )}

        {/* Voting Section */}
        {canVote && (
          <div className="space-y-3">
            <h4 className="font-semibold">Cast Your Vote</h4>
            <div className="flex gap-3">
              <Button
                onClick={() => handleVote('yes')}
                disabled={isVoting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {isVoting ? 'Voting...' : 'Vote YES'}
              </Button>
              <Button
                onClick={() => handleVote('no')}
                disabled={isVoting}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="h-4 w-4 mr-2" />
                {isVoting ? 'Voting...' : 'Vote NO'}
              </Button>
            </div>
          </div>
        )}

        {/* User Vote Status */}
        {hasVoted && userVote && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
            {userVote === 'yes' ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <span className="text-sm font-medium">
              You voted {userVote.toUpperCase()} on this proposal
            </span>
          </div>
        )}

        {/* Execution Notice */}
        {poll.auto_execute_on_success && poll.status === 'passed' && (
          <div className="p-3 rounded-lg bg-green-50 border border-green-200">
            <p className="text-sm text-green-800 font-medium">
              ✓ This proposal has passed and will be automatically executed.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}