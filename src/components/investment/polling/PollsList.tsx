
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Vote, Users, Clock, Plus } from 'lucide-react';
import { useInvestmentPolls } from '@/hooks/useInvestmentPolls';
import { CreatePollDialog } from './CreatePollDialog';
import { PollCard } from './PollCard';
import { useAuth } from '@/lib/auth';

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
    createPoll,
    castVote,
    closePoll,
    refetch
  } = useInvestmentPolls(investmentGroupId);

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

  const activePolls = polls.filter(poll => poll.status === 'active');
  const closedPolls = polls.filter(poll => poll.status === 'closed');
  const draftPolls = polls.filter(poll => poll.status === 'draft');

  const getStatsCard = (title: string, count: number, icon: React.ReactNode, color: string) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color}`}>
            {icon}
          </div>
          <div>
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-sm text-gray-600">{title}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investment Group Polls</h2>
          <p className="text-gray-600">Vote on important investment decisions</p>
        </div>
        <CreatePollDialog
          investmentGroupId={investmentGroupId}
          onPollCreated={refetch}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {getStatsCard('Active Polls', activePolls.length, <Vote className="w-5 h-5 text-blue-600" />, 'bg-blue-100')}
        {getStatsCard('Total Polls', polls.length, <Users className="w-5 h-5 text-green-600" />, 'bg-green-100')}
        {getStatsCard('Closed Polls', closedPolls.length, <Clock className="w-5 h-5 text-gray-600" />, 'bg-gray-100')}
      </div>

      {/* Polls Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Vote className="w-4 h-4" />
            Active ({activePolls.length})
          </TabsTrigger>
          <TabsTrigger value="closed" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Closed ({closedPolls.length})
          </TabsTrigger>
          {draftPolls.length > 0 && (
            <TabsTrigger value="draft" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Drafts ({draftPolls.length})
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activePolls.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Vote className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Polls</h3>
                <p className="text-gray-600 mb-4">There are no active polls for this investment group.</p>
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
            activePolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                options={pollOptions[poll.id] || []}
                results={pollResults[poll.id] || []}
                userVote={userVotes[poll.id]}
                onVote={castVote}
                onClosePoll={closePoll}
                userCanManage={poll.created_by === user?.id}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="closed" className="space-y-4">
          {closedPolls.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Closed Polls</h3>
                <p className="text-gray-600">No polls have been closed yet.</p>
              </CardContent>
            </Card>
          ) : (
            closedPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                options={pollOptions[poll.id] || []}
                results={pollResults[poll.id] || []}
                userVote={userVotes[poll.id]}
                onVote={castVote}
                userCanManage={poll.created_by === user?.id}
              />
            ))
          )}
        </TabsContent>

        {draftPolls.length > 0 && (
          <TabsContent value="draft" className="space-y-4">
            {draftPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                options={pollOptions[poll.id] || []}
                results={pollResults[poll.id] || []}
                userVote={userVotes[poll.id]}
                onVote={castVote}
                onClosePoll={closePoll}
                userCanManage={poll.created_by === user?.id}
              />
            ))}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
