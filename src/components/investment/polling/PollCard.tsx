
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Clock, Users, Vote, CheckCircle } from 'lucide-react';
import { InvestmentPoll, PollOption, PollResult, PollVote } from '@/hooks/useInvestmentPolls';

interface PollCardProps {
  poll: InvestmentPoll;
  options: PollOption[];
  results: PollResult[];
  userVote?: PollVote;
  onVote: (pollId: string, optionId: string) => Promise<boolean>;
  onClosePoll?: (pollId: string) => Promise<boolean>;
  userCanManage?: boolean;
}

export function PollCard({ 
  poll, 
  options, 
  results, 
  userVote, 
  onVote, 
  onClosePoll,
  userCanManage = false 
}: PollCardProps) {
  const [selectedOption, setSelectedOption] = useState(userVote?.poll_option_id || '');
  const [voting, setVoting] = useState(false);
  const [closing, setClosing] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const endTime = new Date(poll.ends_at);
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getTotalVotes = () => {
    return results.reduce((sum, result) => sum + result.vote_count, 0);
  };

  const handleVote = async () => {
    if (!selectedOption || voting) return;
    
    setVoting(true);
    try {
      await onVote(poll.id, selectedOption);
    } finally {
      setVoting(false);
    }
  };

  const handleClosePoll = async () => {
    if (!onClosePoll || closing) return;
    
    setClosing(true);
    try {
      await onClosePoll(poll.id);
    } finally {
      setClosing(false);
    }
  };

  const isExpired = new Date(poll.ends_at) < new Date();
  const canVote = poll.status === 'active' && !isExpired && !userVote;
  const canChangeVote = poll.status === 'active' && !isExpired && userVote && poll.allow_vote_changes;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{poll.title}</CardTitle>
            {poll.description && (
              <p className="text-sm text-gray-600 mt-1">{poll.description}</p>
            )}
          </div>
          <Badge className={getStatusColor(poll.status)}>
            {poll.status.charAt(0).toUpperCase() + poll.status.slice(1)}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{getTimeRemaining()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{getTotalVotes()} votes</span>
          </div>
          <div className="flex items-center gap-1">
            <Vote className="w-4 h-4" />
            <span>{poll.voting_power_basis.replace('_', ' ')}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Voting Interface */}
        {(canVote || canChangeVote) && (
          <div className="space-y-4">
            <h4 className="font-semibold">Cast Your Vote</h4>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {options.map((option) => (
                <div key={option.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.id} id={option.id} />
                  <Label htmlFor={option.id} className="flex-1">{option.option_text}</Label>
                </div>
              ))}
            </RadioGroup>
            <Button 
              onClick={handleVote} 
              disabled={!selectedOption || voting}
              className="w-full"
            >
              {voting ? 'Voting...' : (userVote ? 'Change Vote' : 'Cast Vote')}
            </Button>
          </div>
        )}

        {/* User's Vote */}
        {userVote && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">You voted</span>
            </div>
            <p className="text-sm text-blue-600 mt-1">
              {options.find(opt => opt.id === userVote.poll_option_id)?.option_text}
            </p>
            <p className="text-xs text-blue-500 mt-1">
              Voting power: {userVote.voting_power.toFixed(2)}%
            </p>
          </div>
        )}

        {/* Results */}
        <div className="space-y-3">
          <h4 className="font-semibold">Results</h4>
          {options.map((option) => {
            const result = results.find(r => r.option_id === option.id);
            const voteCount = result?.vote_count || 0;
            const percentage = result?.vote_percentage || 0;
            const votingPower = result?.total_voting_power || 0;

            return (
              <div key={option.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{option.option_text}</span>
                  <span>{voteCount} votes ({percentage.toFixed(1)}%)</span>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="text-xs text-gray-500">
                  Voting power: {votingPower.toFixed(2)}%
                </div>
              </div>
            );
          })}
        </div>

        {/* Poll Management */}
        {userCanManage && poll.status === 'active' && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClosePoll}
              disabled={closing}
              className="w-full"
            >
              {closing ? 'Closing...' : 'Close Poll'}
            </Button>
          </div>
        )}

        {/* Poll Metadata */}
        <div className="text-xs text-gray-500 space-y-1 pt-2 border-t">
          <p>Created: {formatDate(poll.created_at)}</p>
          <p>Ends: {formatDate(poll.ends_at)}</p>
          {poll.requires_consensus && (
            <p>Requires {poll.consensus_threshold}% consensus</p>
          )}
          <p>Min participation: {poll.min_participation_percentage}%</p>
        </div>
      </CardContent>
    </Card>
  );
}
