
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Vote, Plus, TrendingUp } from 'lucide-react';
import { useInvestmentPolls } from '@/hooks/useInvestmentPolls';
import { useAuth } from '@/lib/auth';
import { CreatePollDialog } from './CreatePollDialog';
import { EnhancedPollCard } from './EnhancedPollCard';

interface PollsListProps {
  investmentGroupId: string;
}

export function PollsList({ investmentGroupId }: PollsListProps) {
  const { user } = useAuth();
  const { 
    polls, 
    pollOptions, 
    pollResults, 
    userVotes, 
    loading, 
    castVote, 
    closePoll,
    refetch 
  } = useInvestmentPolls(investmentGroupId);

  const [activeTab, setActiveTab] = useState('active');

  const handleVote = async (pollId: string, optionId: string) => {
    const success = await castVote(pollId, optionId);
    if (success) {
      refetch();
    }
    return success;
  };

  const handleClosePoll = async (pollId: string) => {
    const success = await closePoll(pollId);
    if (success) {
      refetch();
    }
    return success;
  };

  const filterPolls = (status: string) => {
    return polls.filter(poll => {
      if (status === 'active') return poll.status === 'active';
      if (status === 'closed') return poll.status === 'closed';
      if (status === 'my-votes') return userVotes[poll.id];
      return true;
    });
  };

  const getTabCount = (status: string) => {
    return filterPolls(status).length;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Polls & Voting</h2>
          <p className="text-gray-600">Participate in investment group decisions</p>
        </div>
        <CreatePollDialog 
          investmentGroupId={investmentGroupId}
          onPollCreated={refetch}
        />
      </div>

      {polls.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Polls Yet</h3>
            <p className="text-gray-600 mb-4">
              Create the first poll for this investment group to start making collective decisions.
            </p>
            <CreatePollDialog 
              investmentGroupId={investmentGroupId}
              onPollCreated={refetch}
              trigger={
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Poll
                </Button>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All Polls
              <Badge variant="secondary">{polls.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="active" className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Active
              <Badge variant="secondary">{getTabCount('active')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="closed" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Closed
              <Badge variant="secondary">{getTabCount('closed')}</Badge>
            </TabsTrigger>
            <TabsTrigger value="my-votes" className="flex items-center gap-2">
              My Votes
              <Badge variant="secondary">{getTabCount('my-votes')}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {polls
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((poll) => (
                <EnhancedPollCard
                  key={poll.id}
                  poll={poll}
                  options={pollOptions[poll.id] || []}
                  results={pollResults[poll.id] || []}
                  userVote={userVotes[poll.id]}
                  onVote={handleVote}
                  onClosePoll={handleClosePoll}
                  canClosePoll={poll.created_by === user?.id}
                />
              ))}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            {filterPolls('active').map((poll) => (
              <EnhancedPollCard
                key={poll.id}
                poll={poll}
                options={pollOptions[poll.id] || []}
                results={pollResults[poll.id] || []}
                userVote={userVotes[poll.id]}
                onVote={handleVote}
                onClosePoll={handleClosePoll}
                canClosePoll={poll.created_by === user?.id}
              />
            ))}
          </TabsContent>

          <TabsContent value="closed" className="space-y-4">
            {filterPolls('closed').map((poll) => (
              <EnhancedPollCard
                key={poll.id}
                poll={poll}
                options={pollOptions[poll.id] || []}
                results={pollResults[poll.id] || []}
                userVote={userVotes[poll.id]}
                onVote={handleVote}
                onClosePoll={handleClosePoll}
                canClosePoll={false}
              />
            ))}
          </TabsContent>

          <TabsContent value="my-votes" className="space-y-4">
            {filterPolls('my-votes').map((poll) => (
              <EnhancedPollCard
                key={poll.id}
                poll={poll}
                options={pollOptions[poll.id] || []}
                results={pollResults[poll.id] || []}
                userVote={userVotes[poll.id]}
                onVote={handleVote}
                onClosePoll={handleClosePoll}
                canClosePoll={poll.created_by === user?.id}
              />
            ))}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
