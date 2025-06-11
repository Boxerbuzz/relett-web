
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Vote, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  ChevronDown,
  ExternalLink,
  Shield
} from 'lucide-react';
import { InvestmentPoll, PollOption, PollResult, PollVote } from '@/hooks/useInvestmentPolls';
import { PollResultsChart } from './PollResultsChart';

interface EnhancedPollCardProps {
  poll: InvestmentPoll;
  options: PollOption[];
  results: PollResult[];
  userVote?: PollVote;
  onVote: (pollId: string, optionId: string) => Promise<boolean>;
  onClosePoll?: (pollId: string) => Promise<boolean>;
  canClosePoll?: boolean;
}

export function EnhancedPollCard({
  poll,
  options,
  results,
  userVote,
  onVote,
  onClosePoll,
  canClosePoll
}: EnhancedPollCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>(userVote?.poll_option_id || '');
  const [isVoting, setIsVoting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [showResults, setShowResults] = useState(poll.status === 'closed');

  const handleVote = async () => {
    if (!selectedOption || isVoting) return;
    
    setIsVoting(true);
    try {
      const success = await onVote(poll.id, selectedOption);
      if (success) {
        setShowResults(true);
      }
    } finally {
      setIsVoting(false);
    }
  };

  const handleClosePoll = async () => {
    if (!onClosePoll || isClosing) return;
    
    setIsClosing(true);
    try {
      await onClosePoll(poll.id);
    } finally {
      setIsClosing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'draft': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const endTime = new Date(poll.ends_at);
    const diffMs = endTime.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Ended';
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  const totalVotes = results?.reduce((sum, result) => sum + result.vote_count, 0) || 0;
  const participationRate = totalVotes > 0 ? (totalVotes / 100) * 100 : 0; // This would need actual member count

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{poll.title}</CardTitle>
              <Badge className={getStatusColor(poll.status)}>
                {poll.status.charAt(0).toUpperCase() + poll.status.slice(1)}
              </Badge>
            </div>
            {poll.description && (
              <p className="text-sm text-gray-600">{poll.description}</p>
            )}
          </div>
          {poll.hedera_topic_id && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <Shield className="w-3 h-3" />
              Blockchain Verified
            </div>
          )}
        </div>
        
        {/* Poll Metadata */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {getTimeRemaining()}
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            {totalVotes} votes
          </div>
          <div className="flex items-center gap-1">
            <Vote className="w-4 h-4" />
            {poll.voting_power_basis} based
          </div>
        </div>

        {/* Participation Progress */}
        {poll.min_participation_percentage && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Participation Rate</span>
              <span>{participationRate.toFixed(1)}% / {poll.min_participation_percentage}%</span>
            </div>
            <Progress 
              value={Math.min(participationRate, 100)} 
              className="h-2"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Voting Section */}
        {poll.status === 'active' && !showResults && (
          <div className="space-y-4">
            <h4 className="font-semibold">Cast Your Vote</h4>
            
            {userVote ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">You have already voted</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Your vote was recorded on {new Date(userVote.voted_at).toLocaleDateString()}
                  {userVote.hedera_transaction_id && (
                    <span className="ml-2 inline-flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      Blockchain ID: {userVote.hedera_transaction_id.slice(0, 16)}...
                    </span>
                  )}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setShowResults(!showResults)}
                >
                  {showResults ? 'Hide Results' : 'View Results'}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                  {options.map((option) => (
                    <div key={option.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.id} id={option.id} />
                      <Label htmlFor={option.id} className="cursor-pointer">
                        {option.option_text}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
                
                <Button 
                  onClick={handleVote}
                  disabled={!selectedOption || isVoting}
                  className="w-full"
                >
                  {isVoting ? 'Submitting Vote...' : 'Submit Vote'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Results Section */}
        {(showResults || poll.status === 'closed') && results && results.length > 0 && (
          <Collapsible open={showResults} onOpenChange={setShowResults}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full">
                <span>Poll Results</span>
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 mt-4">
              <PollResultsChart 
                results={results}
                pollType={poll.poll_type}
                pollStatus={poll.status}
              />
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Poll Actions */}
        <div className="flex gap-2">
          {canClosePoll && poll.status === 'active' && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleClosePoll}
              disabled={isClosing}
            >
              {isClosing ? 'Closing...' : 'Close Poll'}
            </Button>
          )}
          
          {poll.hedera_topic_id && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(`https://hashscan.io/testnet/topic/${poll.hedera_topic_id}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              View on Blockchain
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
