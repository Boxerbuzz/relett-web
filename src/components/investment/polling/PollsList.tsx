
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BuyoutProposalForm } from '@/components/investment/BuyoutProposalForm';
import { BuyoutVotingInterface } from '@/components/investment/BuyoutVotingInterface';
import { useInvestmentPolls } from '@/hooks/useInvestmentPolls';
import { useToast } from '@/hooks/use-toast';
import { 
  Vote, 
  Plus, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle, 
  DollarSign,
  TrendingUp
} from 'lucide-react';

interface PollsListProps {
  investmentGroupId: string;
}

export const PollsList: React.FC<PollsListProps> = ({ investmentGroupId }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPollType, setSelectedPollType] = useState<'general' | 'buyout'>('general');
  const { toast } = useToast();

  const {
    polls,
    userVotes,
    pollResults,
    loading,
    refetch
  } = useInvestmentPolls(investmentGroupId);

  // Separate polls by type - for now, treat all as general polls since poll_type may not match exactly
  const buyoutPolls = polls.filter(poll => poll.poll_type?.includes('buyout') || poll.title?.toLowerCase().includes('buyout'));
  const generalPolls = polls.filter(poll => !buyoutPolls.includes(poll));

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    refetch();
    toast({
      title: 'Success',
      description: 'Poll created successfully',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      case 'executed':
        return <Badge variant="default">Executed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPollIcon = (pollType: string) => {
    switch (pollType) {
      case 'buyout_proposal':
        return <DollarSign className="h-5 w-5 text-primary" />;
      case 'governance':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'financial':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      default:
        return <Vote className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }


  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investment Polls & Voting</h2>
          <p className="text-muted-foreground">Participate in group decisions and proposals</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Proposal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Proposal</DialogTitle>
            </DialogHeader>
            
            <Tabs value={selectedPollType} onValueChange={(value) => setSelectedPollType(value as 'general' | 'buyout')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general">General Poll</TabsTrigger>
                <TabsTrigger value="buyout">Buyout Proposal</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="mt-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">General Polls Coming Soon</h3>
                    <p className="text-muted-foreground">
                      General governance polls will be available in a future update
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="buyout" className="mt-4">
                <BuyoutProposalForm
                  investmentGroupId={investmentGroupId}
                  onSuccess={handleCreateSuccess}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      {/* Polls Content */}
      <Tabs defaultValue="buyout" className="space-y-4">
        <TabsList>
          <TabsTrigger value="buyout" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Buyout Proposals
            {buyoutPolls.length > 0 && (
              <Badge variant="secondary" className="ml-1">{buyoutPolls.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Vote className="h-4 w-4" />
            General Polls
            {generalPolls.length > 0 && (
              <Badge variant="secondary" className="ml-1">{generalPolls.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="buyout" className="space-y-4">
          {buyoutPolls.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Buyout Proposals</h3>
                <p className="text-muted-foreground mb-4">
                  There are currently no buyout proposals for this investment group.
                </p>
                <Button 
                  onClick={() => {
                    setSelectedPollType('buyout');
                    setIsCreateDialogOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create Buyout Proposal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {buyoutPolls.map((poll) => {
                const userVote = userVotes[poll.id];
                
                // Create a buyout poll object with required properties
                const buyoutPoll = {
                  ...poll,
                  description: poll.description || '',
                  buyout_price: 100000,
                  min_buyout_percentage: 75,
                  current_buyout_votes: 0,
                  buyout_deadline: poll.ends_at,
                  auto_execute_on_success: true
                };
                
                return (
                  <BuyoutVotingInterface
                    key={poll.id}
                    poll={buyoutPoll}
                    userVotingPower={10}
                    hasVoted={!!userVote}
                    userVote={userVote ? 'yes' : undefined}
                    onVoteUpdate={refetch}
                  />
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="general" className="space-y-4">
          {generalPolls.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Vote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No General Polls</h3>
                <p className="text-muted-foreground mb-4">
                  There are currently no general polls for this investment group.
                </p>
                <Button 
                  onClick={() => {
                    setSelectedPollType('general');
                    setIsCreateDialogOpen(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create General Poll
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {generalPolls.map((poll) => {
                const userVote = userVotes[poll.id];
                
                return (
                  <Card key={poll.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="flex items-center gap-2">
                            {getPollIcon(poll.poll_type)}
                            {poll.title}
                          </CardTitle>
                          <CardDescription>{poll.description}</CardDescription>
                        </div>
                        {getStatusBadge(poll.status)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Ends: {new Date(poll.ends_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          Participation: {poll.voting_power_basis}
                        </div>
                      </div>
                      
                      {userVote && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium text-muted-foreground">
                            Your vote: <span className="text-foreground">YES</span>
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
