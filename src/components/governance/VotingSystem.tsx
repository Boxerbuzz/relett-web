import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Vote, Clock, TrendingUp, Users } from "lucide-react";

interface Poll {
  id: string;
  title: string;
  description: string;
  poll_type: string;
  status: string;
  starts_at: string;
  ends_at: string;
  created_by: string;
  investment_group_id: string;
  voting_power_basis: string;
  min_participation_percentage: number;
  requires_consensus: boolean;
  consensus_threshold: number;
  allow_vote_changes: boolean;
  is_anonymous: boolean;
  current_yes_votes: number;
  current_no_votes: number;
  total_voting_power: number;
  property: {
    title: string;
    location: string;
  };
}

interface UserVote {
  poll_id: string;
  vote_option: string;
  voting_power: number;
}

export default function VotingSystem() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activePolls, setActivePolls] = useState<Poll[]>([]);
  const [userVotes, setUserVotes] = useState<UserVote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newPollTitle, setNewPollTitle] = useState("");
  const [newPollDescription, setNewPollDescription] = useState("");
  const [selectedPropertyGroup, setSelectedPropertyGroup] = useState("");
  const [userInvestmentGroups, setUserInvestmentGroups] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchPolls();
      fetchUserInvestmentGroups();
      fetchUserVotes();
    }
  }, [user]);

  const fetchPolls = async () => {
    try {
      const { data: polls, error } = await supabase
        .from('investment_polls')
        .select(`
          *,
          tokenized_properties!inner(
            properties!inner(
              title,
              location
            )
          )
        `)
        .in('status', ['active', 'pending'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedPolls = polls?.map(poll => ({
        ...poll,
        property: {
          title: poll.tokenized_properties.properties.title,
          location: poll.tokenized_properties.properties.location
        }
      })) || [];

      setActivePolls(formattedPolls);
    } catch (error) {
      console.error('Error fetching polls:', error);
      toast({
        title: "Error",
        description: "Failed to load polls",
        variant: "destructive",
      });
    }
  };

  const fetchUserInvestmentGroups = async () => {
    if (!user) return;

    try {
      const { data: holdings, error } = await supabase
        .from('token_holdings')
        .select(`
          tokenized_property_id,
          tokens_owned,
          tokenized_properties!inner(
            id,
            total_supply,
            properties!inner(
              title,
              location
            )
          )
        `)
        .eq('holder_id', user.id)
        .gt('tokens_owned', 0);

      if (error) throw error;

      setUserInvestmentGroups(holdings || []);
    } catch (error) {
      console.error('Error fetching user investment groups:', error);
    }
  };

  const fetchUserVotes = async () => {
    if (!user) return;

    try {
      const { data: votes, error } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('voter_id', user.id);

      if (error) throw error;

      setUserVotes(votes || []);
    } catch (error) {
      console.error('Error fetching user votes:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPoll = async () => {
    if (!user || !newPollTitle || !newPollDescription || !selectedPropertyGroup) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-investment-poll', {
        body: {
          title: newPollTitle,
          description: newPollDescription,
          investment_group_id: selectedPropertyGroup,
          poll_type: 'simple',
          voting_power_basis: 'tokens',
          duration_hours: 168 // 1 week
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Poll created successfully",
      });

      // Reset form
      setNewPollTitle("");
      setNewPollDescription("");
      setSelectedPropertyGroup("");

      // Refresh polls
      fetchPolls();
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: "Error",
        description: "Failed to create poll",
        variant: "destructive",
      });
    }
  };

  const castVote = async (pollId: string, voteOption: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to vote",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('cast-poll-vote', {
        body: {
          poll_id: pollId,
          vote_option: voteOption
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vote cast successfully",
      });

      // Refresh polls and votes
      fetchPolls();
      fetchUserVotes();
    } catch (error) {
      console.error('Error casting vote:', error);
      toast({
        title: "Error",
        description: "Failed to cast vote",
        variant: "destructive",
      });
    }
  };

  const getUserVoteForPoll = (pollId: string): UserVote | undefined => {
    return userVotes.find(vote => vote.poll_id === pollId);
  };

  const calculateVotePercentage = (votes: number, total: number): number => {
    if (total === 0) return 0;
    return (votes / total) * 100;
  };

  const isPolActive = (poll: Poll): boolean => {
    const now = new Date();
    const endTime = new Date(poll.ends_at);
    return poll.status === 'active' && now < endTime;
  };

  if (loading) {
    return <div className="p-6">Loading voting system...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Vote className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Governance & Voting</h1>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Polls</TabsTrigger>
          <TabsTrigger value="create">Create Poll</TabsTrigger>
          <TabsTrigger value="history">Vote History</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid gap-4">
            {activePolls.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No active polls available</p>
                </CardContent>
              </Card>
            ) : (
              activePolls.map((poll) => {
                const userVote = getUserVoteForPoll(poll.id);
                const totalVotes = poll.current_yes_votes + poll.current_no_votes;
                const yesPercentage = calculateVotePercentage(poll.current_yes_votes, totalVotes);
                const noPercentage = calculateVotePercentage(poll.current_no_votes, totalVotes);
                const isActive = isPolActive(poll);

                return (
                  <Card key={poll.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{poll.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{poll.property.title}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={isActive ? "default" : "secondary"}>
                            {poll.status}
                          </Badge>
                          {userVote && (
                            <Badge variant="outline">
                              Voted: {userVote.vote_option}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{poll.description}</p>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Yes ({poll.current_yes_votes} votes)</span>
                          <span>{yesPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={yesPercentage} className="h-2" />
                        
                        <div className="flex justify-between text-sm">
                          <span>No ({poll.current_no_votes} votes)</span>
                          <span>{noPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={noPercentage} className="h-2 bg-red-100" />
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Ends: {new Date(poll.ends_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {totalVotes} votes
                        </div>
                      </div>

                      {isActive && !userVote && (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => castVote(poll.id, 'yes')}
                            className="flex-1"
                            variant="default"
                          >
                            Vote Yes
                          </Button>
                          <Button 
                            onClick={() => castVote(poll.id, 'no')}
                            className="flex-1"
                            variant="outline"
                          >
                            Vote No
                          </Button>
                        </div>
                      )}

                      {!isActive && (
                        <div className="text-sm text-muted-foreground text-center">
                          Voting has ended
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Poll</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Property</label>
                <select 
                  value={selectedPropertyGroup}
                  onChange={(e) => setSelectedPropertyGroup(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a property...</option>
                  {userInvestmentGroups.map((group) => (
                    <option key={group.tokenized_property_id} value={group.tokenized_property_id}>
                      {group.tokenized_properties.properties.title} 
                      ({group.tokens_owned} tokens owned)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Poll Title</label>
                <Input
                  value={newPollTitle}
                  onChange={(e) => setNewPollTitle(e.target.value)}
                  placeholder="Enter poll title"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newPollDescription}
                  onChange={(e) => setNewPollDescription(e.target.value)}
                  placeholder="Describe what this poll is about..."
                  rows={4}
                />
              </div>

              <Button onClick={createPoll} className="w-full">
                Create Poll
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4">
            {userVotes.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">You haven't voted on any polls yet</p>
                </CardContent>
              </Card>
            ) : (
              userVotes.map((vote) => {
                const poll = activePolls.find(p => p.id === vote.poll_id);
                if (!poll) return null;

                return (
                  <Card key={vote.poll_id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{poll.title}</h3>
                          <p className="text-sm text-muted-foreground">{poll.property.title}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            Voted: {vote.vote_option}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            Power: {vote.voting_power.toFixed(2)}%
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}