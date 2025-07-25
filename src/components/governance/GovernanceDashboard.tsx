"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Vote, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Plus,
  Calendar,
  DollarSign
} from "lucide-react";
import { format } from "date-fns";

interface Poll {
  id: string;
  title: string;
  description: string;
  poll_type: string;
  status: string;
  starts_at: string;
  ends_at: string;
  investment_group_id: string;
  created_by: string;
  voting_power_basis: string;
  min_participation_percentage: number;
  consensus_threshold: number;
  allow_vote_changes: boolean;
  is_anonymous: boolean;
  hedera_topic_id?: string;
  hedera_consensus_timestamp?: string;
  metadata: any;
  buyout_price?: number;
  min_buyout_percentage?: number;
  current_buyout_votes?: number;
}

interface VotingPower {
  totalTokens: number;
  votingPercentage: number;
  eligibleToVote: boolean;
}

interface PollVote {
  poll_id: string;
  vote_option: string;
  voting_power_used: number;
  vote_weight: number;
}

export function GovernanceDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<PollVote[]>([]);
  const [votingPower, setVotingPower] = useState<VotingPower>({ 
    totalTokens: 0, 
    votingPercentage: 0, 
    eligibleToVote: false 
  });
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [newPoll, setNewPoll] = useState({
    title: "",
    description: "",
    poll_type: "simple",
    ends_at: "",
    min_participation_percentage: 50,
    consensus_threshold: 66.7,
    allow_vote_changes: true,
    is_anonymous: false,
    buyout_price: "",
    metadata: {}
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (user) {
      fetchGovernanceData();
    }
  }, [user]);

  const fetchGovernanceData = async () => {
    if (!user) return;

    try {
      await Promise.all([
        fetchActivePolls(),
        fetchUserVotes(),
        calculateVotingPower()
      ]);
    } catch (error) {
      console.error('Error fetching governance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchActivePolls = async () => {
    try {
      // Get user's tokenized properties to show relevant polls
      const { data: holdings, error: holdingsError } = await supabase
        .from('token_holdings')
        .select('tokenized_property_id')
        .eq('holder_id', user!.id);

      if (holdingsError) throw holdingsError;

      const propertyIds = holdings?.map(h => h.tokenized_property_id) || [];

      if (propertyIds.length === 0) {
        setPolls([]);
        return;
      }

      const { data, error } = await supabase
        .from('investment_polls')
        .select('*')
        .in('investment_group_id', propertyIds)
        .in('status', ['active', 'pending', 'passed', 'failed'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPolls((data || []).map(poll => ({
        ...poll,
        title: poll.title || '',
        description: poll.description || '',
        poll_type: poll.poll_type || 'simple',
        status: poll.status || 'pending',
        starts_at: poll.starts_at || '',
        ends_at: poll.ends_at || '',
        investment_group_id: poll.investment_group_id || '',
        created_by: poll.created_by || '',
        voting_power_basis: poll.voting_power_basis || 'tokens',
        min_participation_percentage: poll.min_participation_percentage || 50,
        consensus_threshold: poll.consensus_threshold || 66.7,
        allow_vote_changes: poll.allow_vote_changes ?? true,
        is_anonymous: poll.is_anonymous ?? false,
        metadata: poll.metadata || {}
      })));
    } catch (error) {
      console.error('Error fetching polls:', error);
    }
  };

  const fetchUserVotes = async () => {
    try {
      const { data, error } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('voter_id', user!.id);

      if (error) throw error;
      // Mock user votes for now since poll_votes table structure is different
      setUserVotes([]);
    } catch (error) {
      console.error('Error fetching user votes:', error);
    }
  };

  const calculateVotingPower = async () => {
    try {
      const { data: holdings, error } = await supabase
        .from('token_holdings')
        .select(`
          tokens_owned,
          tokenized_property:tokenized_properties!token_holdings_tokenized_property_id_fkey(
            total_supply
          )
        `)
        .eq('holder_id', user!.id);

      if (error) throw error;

      const totalTokens = holdings?.reduce((sum, holding) => 
        sum + parseInt(holding.tokens_owned), 0) || 0;

      // Calculate overall voting percentage across all properties
      const totalVotingPower = holdings?.reduce((sum, holding) => {
        const tokens = parseInt(holding.tokens_owned);
        const totalSupply = parseInt(holding.tokenized_property.total_supply);
        return sum + (tokens / totalSupply) * 100;
      }, 0) || 0;

      setVotingPower({
        totalTokens,
        votingPercentage: totalVotingPower / (holdings?.length || 1),
        eligibleToVote: totalTokens > 0
      });
    } catch (error) {
      console.error('Error calculating voting power:', error);
    }
  };

  const handleVote = async (pollId: string, voteOption: string) => {
    if (!user || !votingPower.eligibleToVote) {
      toast({
        title: "Error",
        description: "You need to own tokens to vote",
        variant: "destructive"
      });
      return;
    }

    setIsVoting(true);
    try {
      const { data, error } = await supabase.functions.invoke('record-poll-vote', {
        body: {
          pollId,
          voteOption,
          votingPower: votingPower.votingPercentage
        }
      });

      if (error) throw error;

      toast({
        title: "Vote Recorded",
        description: `Your ${voteOption.toUpperCase()} vote has been recorded on the blockchain`,
      });

      // Refresh data
      fetchGovernanceData();
    } catch (error) {
      console.error('Error voting:', error);
      toast({
        title: "Vote Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsVoting(false);
    }
  };

  const handleCreatePoll = async () => {
    if (!user || !selectedProperty) {
      toast({
        title: "Error",
        description: "Please select a property and fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const pollData = {
        ...newPoll,
        investment_group_id: selectedProperty,
        created_by: user.id,
        buyout_price: newPoll.buyout_price ? parseFloat(newPoll.buyout_price) : null,
        metadata: {
          ...newPoll.metadata,
          createdVia: 'governance_dashboard'
        }
      };

      const { data, error } = await supabase.functions.invoke('create-investment-poll', {
        body: pollData
      });

      if (error) throw error;

      toast({
        title: "Poll Created",
        description: "Your governance proposal has been created and recorded on the blockchain",
      });

      // Reset form and refresh data
      setNewPoll({
        title: "",
        description: "",
        poll_type: "simple",
        ends_at: "",
        min_participation_percentage: 50,
        consensus_threshold: 66.7,
        allow_vote_changes: true,
        is_anonymous: false,
        buyout_price: "",
        metadata: {}
      });
      setShowCreateForm(false);
      fetchGovernanceData();
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getPollStatusBadge = (poll: Poll) => {
    const now = new Date();
    const startDate = new Date(poll.starts_at);
    const endDate = new Date(poll.ends_at);

    if (poll.status === 'passed') {
      return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
    }
    if (poll.status === 'failed') {
      return <Badge variant="destructive">Failed</Badge>;
    }
    if (now < startDate) {
      return <Badge variant="secondary">Pending</Badge>;
    }
    if (now > endDate) {
      return <Badge variant="outline">Expired</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  const getUserVoteForPoll = (pollId: string) => {
    return userVotes.find(vote => vote.poll_id === pollId);
  };

  const calculatePollProgress = (poll: Poll) => {
    if (poll.poll_type === 'buyout') {
      return (poll.current_buyout_votes || 0) / (poll.min_buyout_percentage || 75) * 100;
    }
    // For other poll types, we'd need vote counts which aren't in the current schema
    return 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Governance Dashboard</h1>
          <p className="text-muted-foreground">
            Participate in property governance and decision-making
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Vote className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Your Voting Power</p>
                <p className="text-lg font-bold">{votingPower.votingPercentage.toFixed(2)}%</p>
              </div>
            </div>
          </Card>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Proposal
          </Button>
        </div>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active Polls</TabsTrigger>
          <TabsTrigger value="history">Poll History</TabsTrigger>
          <TabsTrigger value="my-votes">My Votes</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {polls.filter(poll => poll.status === 'active').map((poll) => {
              const userVote = getUserVoteForPoll(poll.id);
              const progress = calculatePollProgress(poll);
              
              return (
                <Card key={poll.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{poll.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {poll.description}
                        </p>
                      </div>
                      {getPollStatusBadge(poll)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {poll.poll_type === 'buyout' && poll.buyout_price && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Buyout Price</p>
                          <p className="text-lg font-bold text-blue-600">
                            ${poll.buyout_price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Progress</span>
                        <span>{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Ends</p>
                          <p className="font-medium">
                            {format(new Date(poll.ends_at), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-muted-foreground">Min. Participation</p>
                          <p className="font-medium">{poll.min_participation_percentage}%</p>
                        </div>
                      </div>
                    </div>

                    {userVote ? (
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          You voted {userVote.vote_option.toUpperCase()}
                        </span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleVote(poll.id, 'yes')}
                          disabled={isVoting || !votingPower.eligibleToVote}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Vote YES
                        </Button>
                        <Button
                          onClick={() => handleVote(poll.id, 'no')}
                          disabled={isVoting || !votingPower.eligibleToVote}
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Vote NO
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {polls.filter(poll => poll.status === 'active').length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <Vote className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No active governance proposals</p>
                <p className="text-sm text-muted-foreground">Create a proposal to get started</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="space-y-4">
            {polls.filter(poll => ['passed', 'failed', 'expired'].includes(poll.status)).map((poll) => (
              <Card key={poll.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{poll.title}</h3>
                      <p className="text-sm text-muted-foreground">{poll.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(poll.starts_at), 'MMM dd, yyyy')} - {format(new Date(poll.ends_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    {getPollStatusBadge(poll)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-votes" className="space-y-4">
          <div className="space-y-4">
            {userVotes.map((vote) => {
              const poll = polls.find(p => p.id === vote.poll_id);
              if (!poll) return null;
              
              return (
                <Card key={vote.poll_id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{poll.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Your vote: <span className="font-medium">{vote.vote_option.toUpperCase()}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Voting power used: {vote.voting_power_used.toFixed(2)}%
                        </p>
                      </div>
                      {getPollStatusBadge(poll)}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Total Proposals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{polls.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Votes Cast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{userVotes.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Participation Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {polls.length > 0 ? ((userVotes.length / polls.length) * 100).toFixed(1) : 0}%
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create Governance Proposal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Property</Label>
                <select 
                  value={selectedProperty} 
                  onChange={(e) => setSelectedProperty(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="">Select property</option>
                  {/* This would be populated with user's tokenized properties */}
                </select>
              </div>

              <div>
                <Label>Title</Label>
                <Input
                  value={newPoll.title}
                  onChange={(e) => setNewPoll(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Proposal title"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={newPoll.description}
                  onChange={(e) => setNewPoll(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the proposal"
                  rows={3}
                />
              </div>

              <div>
                <Label>Poll Type</Label>
                <select 
                  value={newPoll.poll_type} 
                  onChange={(e) => setNewPoll(prev => ({ ...prev, poll_type: e.target.value }))}
                  className="w-full mt-1 p-2 border rounded-md"
                >
                  <option value="simple">Simple Yes/No</option>
                  <option value="buyout">Buyout Proposal</option>
                  <option value="maintenance">Maintenance Decision</option>
                  <option value="improvement">Property Improvement</option>
                </select>
              </div>

              {newPoll.poll_type === 'buyout' && (
                <div>
                  <Label>Buyout Price ($)</Label>
                  <Input
                    type="number"
                    value={newPoll.buyout_price}
                    onChange={(e) => setNewPoll(prev => ({ ...prev, buyout_price: e.target.value }))}
                    placeholder="0.00"
                    step="0.01"
                  />
                </div>
              )}

              <div>
                <Label>Voting Deadline</Label>
                <Input
                  type="datetime-local"
                  value={newPoll.ends_at}
                  onChange={(e) => setNewPoll(prev => ({ ...prev, ends_at: e.target.value }))}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  onClick={() => setShowCreateForm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePoll}
                  disabled={isCreating || !newPoll.title || !newPoll.description || !selectedProperty}
                  className="flex-1"
                >
                  {isCreating ? "Creating..." : "Create Proposal"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}