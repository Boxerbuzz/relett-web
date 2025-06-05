
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { 
  Users, 
  Plus, 
  Target, 
  Calendar,
  DollarSign,
  TrendingUp,
  MessageSquare,
  Settings,
  Crown
} from 'lucide-react';

interface InvestmentGroup {
  id: string;
  name: string;
  description: string;
  target_amount: number;
  current_amount: number;
  minimum_investment: number;
  investor_count: number;
  max_investors: number;
  status: string;
  closes_at: string;
  lead_investor_id: string;
  investment_terms: any;
  voting_power_distribution: any;
  tokenized_property: {
    token_name: string;
    token_symbol: string;
    expected_roi: number;
  };
}

export function InvestmentGroupManager() {
  const [groups, setGroups] = useState<InvestmentGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    target_amount: '',
    minimum_investment: '',
    max_investors: '',
    tokenized_property_id: ''
  });
  const [tokenizedProperties, setTokenizedProperties] = useState([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchInvestmentGroups();
    fetchTokenizedProperties();
  }, []);

  const fetchInvestmentGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('investment_groups')
        .select(`
          *,
          tokenized_property:tokenized_properties(
            token_name,
            token_symbol,
            expected_roi
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching investment groups:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch investment groups',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTokenizedProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('tokenized_properties')
        .select('id, token_name, token_symbol')
        .eq('status', 'minted');

      if (error) throw error;
      setTokenizedProperties(data || []);
    } catch (error) {
      console.error('Error fetching tokenized properties:', error);
    }
  };

  const createInvestmentGroup = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('investment_groups')
        .insert({
          name: newGroup.name,
          description: newGroup.description,
          target_amount: parseFloat(newGroup.target_amount),
          minimum_investment: parseFloat(newGroup.minimum_investment),
          max_investors: parseInt(newGroup.max_investors) || null,
          tokenized_property_id: newGroup.tokenized_property_id,
          lead_investor_id: user.id,
          status: 'forming',
          closes_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
          investment_terms: {
            profit_sharing: 'proportional',
            decision_making: 'majority_vote',
            exit_strategy: 'majority_approval'
          },
          voting_power_distribution: {
            method: 'proportional_to_investment'
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Investment group created successfully',
      });

      setShowCreateDialog(false);
      setNewGroup({
        name: '',
        description: '',
        target_amount: '',
        minimum_investment: '',
        max_investors: '',
        tokenized_property_id: ''
      });
      fetchInvestmentGroups();
    } catch (error) {
      console.error('Error creating investment group:', error);
      toast({
        title: 'Error',
        description: 'Failed to create investment group',
        variant: 'destructive'
      });
    }
  };

  const joinInvestmentGroup = async (groupId: string) => {
    if (!user) return;

    try {
      // This would involve creating a record in an investment_group_members table
      // and updating the group's current_amount and investor_count
      toast({
        title: 'Feature Coming Soon',
        description: 'Investment group joining functionality will be available soon',
      });
    } catch (error) {
      console.error('Error joining investment group:', error);
      toast({
        title: 'Error',
        description: 'Failed to join investment group',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string, progress: number) => {
    switch (status) {
      case 'forming':
        return <Badge className="bg-yellow-100 text-yellow-800">Forming</Badge>;
      case 'active':
        return progress >= 100 
          ? <Badge className="bg-green-100 text-green-800">Fully Funded</Badge>
          : <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case 'closed':
        return <Badge className="bg-gray-100 text-gray-800">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Investment Groups</h2>
          <p className="text-gray-600">Pool resources with other investors</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Investment Group</DialogTitle>
              <DialogDescription>
                Start a new investment group to pool resources with other investors
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input
                  id="group-name"
                  placeholder="Enter group name"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group-description">Description</Label>
                <Textarea
                  id="group-description"
                  placeholder="Describe the investment opportunity"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="property-select">Tokenized Property</Label>
                <Select value={newGroup.tokenized_property_id} onValueChange={(value) => setNewGroup(prev => ({ ...prev, tokenized_property_id: value }))}>
                  <SelectTrigger id="property-select">
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {tokenizedProperties.map((property: any) => (
                      <SelectItem key={property.id} value={property.id}>
                        {property.token_name} ({property.token_symbol})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target-amount">Target Amount ($)</Label>
                  <Input
                    id="target-amount"
                    type="number"
                    placeholder="100000"
                    value={newGroup.target_amount}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, target_amount: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-investment">Min Investment ($)</Label>
                  <Input
                    id="min-investment"
                    type="number"
                    placeholder="1000"
                    value={newGroup.minimum_investment}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, minimum_investment: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-investors">Max Investors (Optional)</Label>
                <Input
                  id="max-investors"
                  type="number"
                  placeholder="50"
                  value={newGroup.max_investors}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, max_investors: e.target.value }))}
                />
              </div>

              <Button onClick={createInvestmentGroup} className="w-full">
                Create Investment Group
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Groups</TabsTrigger>
          <TabsTrigger value="my-groups">My Groups</TabsTrigger>
          <TabsTrigger value="joined">Joined</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {groups.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>No investment groups available</p>
                  <p className="text-sm">Create the first group to get started</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => {
                const progress = (group.current_amount / group.target_amount) * 100;
                const isLeader = user?.id === group.lead_investor_id;
                
                return (
                  <Card key={group.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {group.name}
                            {isLeader && <Crown className="w-4 h-4 text-yellow-500" />}
                          </CardTitle>
                          <CardDescription>
                            {group.tokenized_property?.token_name}
                          </CardDescription>
                        </div>
                        {getStatusBadge(group.status, progress)}
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">{group.description}</p>

                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Funding Progress</span>
                          <span>{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>${group.current_amount.toLocaleString()} raised</span>
                          <span>${group.target_amount.toLocaleString()} target</span>
                        </div>
                      </div>

                      {/* Key Info */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{group.investor_count} investors</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-gray-400" />
                          <span>${group.minimum_investment} min</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <span>{group.tokenized_property?.expected_roi}% ROI</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{new Date(group.closes_at).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {isLeader ? (
                          <>
                            <Button variant="outline" size="sm">
                              <Settings className="w-4 h-4 mr-1" />
                              Manage
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Discuss
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => joinInvestmentGroup(group.id)}
                              disabled={group.status === 'closed' || progress >= 100}
                            >
                              Join Group
                            </Button>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-groups">
          <div className="text-center py-8 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No groups created yet</p>
            <p className="text-sm">Groups you create will appear here</p>
          </div>
        </TabsContent>

        <TabsContent value="joined">
          <div className="text-center py-8 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No groups joined yet</p>
            <p className="text-sm">Groups you join will appear here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
