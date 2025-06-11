
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Plus, Users, Target, DollarSign, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

interface InvestmentGroupCreatorProps {
  onGroupCreated: () => void;
  trigger?: React.ReactNode;
}

export function InvestmentGroupCreator({ onGroupCreated, trigger }: InvestmentGroupCreatorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [minimumInvestment, setMinimumInvestment] = useState('');
  const [maxInvestors, setMaxInvestors] = useState('');
  const [closesAt, setClosesAt] = useState('');
  const [investmentTerms, setInvestmentTerms] = useState({
    lockupPeriod: '12',
    expectedROI: '8',
    managementFee: '2',
    distributionFrequency: 'quarterly'
  });
  const [votingStructure, setVotingStructure] = useState({
    requiresConsensus: false,
    consensusThreshold: '66.7',
    votingPowerBasis: 'investment_amount'
  });

  const handleSubmit = async () => {
    if (!user || !name.trim() || !targetAmount || !minimumInvestment) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setCreating(true);
    try {
      // For now, we'll create a mock tokenized property
      // In a real implementation, this would be linked to an actual property
      const { data: tokenizedProperty, error: propertyError } = await supabase
        .from('tokenized_properties')
        .insert({
          token_name: `${name.replace(/\s+/g, '')}Token`,
          token_symbol: name.substring(0, 4).toUpperCase(),
          token_type: 'hts_fungible',
          total_supply: '1000000',
          token_price: parseFloat(targetAmount) / 1000000,
          total_value_usd: parseFloat(targetAmount),
          minimum_investment: parseFloat(minimumInvestment),
          expected_roi: parseFloat(investmentTerms.expectedROI),
          investment_terms: 'fixed',
          revenue_distribution_frequency: investmentTerms.distributionFrequency,
          lock_up_period_months: parseInt(investmentTerms.lockupPeriod),
          blockchain_network: 'hedera',
          land_title_id: '00000000-0000-0000-0000-000000000000', // Mock ID
          status: 'draft'
        })
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Create the investment group
      const { data: group, error: groupError } = await supabase
        .from('investment_groups')
        .insert({
          name,
          description,
          target_amount: parseFloat(targetAmount),
          minimum_investment: parseFloat(minimumInvestment),
          max_investors: maxInvestors ? parseInt(maxInvestors) : null,
          closes_at: closesAt || null,
          lead_investor_id: user.id,
          tokenized_property_id: tokenizedProperty.id,
          status: 'forming',
          investment_terms: {
            lockupPeriod: parseInt(investmentTerms.lockupPeriod),
            expectedROI: parseFloat(investmentTerms.expectedROI),
            managementFee: parseFloat(investmentTerms.managementFee),
            distributionFrequency: investmentTerms.distributionFrequency
          },
          voting_power_distribution: {
            requiresConsensus: votingStructure.requiresConsensus,
            consensusThreshold: parseFloat(votingStructure.consensusThreshold),
            votingPowerBasis: votingStructure.votingPowerBasis
          }
        })
        .select()
        .single();

      if (groupError) throw groupError;

      toast({
        title: 'Investment Group Created',
        description: `${name} has been successfully created`,
      });

      setOpen(false);
      resetForm();
      onGroupCreated();

    } catch (error) {
      console.error('Error creating investment group:', error);
      toast({
        title: 'Creation Failed',
        description: 'Failed to create investment group. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setTargetAmount('');
    setMinimumInvestment('');
    setMaxInvestors('');
    setClosesAt('');
    setInvestmentTerms({
      lockupPeriod: '12',
      expectedROI: '8',
      managementFee: '2',
      distributionFrequency: 'quarterly'
    });
    setVotingStructure({
      requiresConsensus: false,
      consensusThreshold: '66.7',
      votingPowerBasis: 'investment_amount'
    });
  };

  const defaultTrigger = (
    <Button className="flex items-center gap-2">
      <Plus className="w-4 h-4" />
      Create Investment Group
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Investment Group</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Group Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Downtown Lagos Apartments"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the investment opportunity..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="closes-at">Application Deadline</Label>
                <Input
                  id="closes-at"
                  type="datetime-local"
                  value={closesAt}
                  onChange={(e) => setClosesAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Terms */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Financial Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="target-amount">Target Amount (USD) *</Label>
                <Input
                  id="target-amount"
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="1000000"
                />
              </div>

              <div>
                <Label htmlFor="minimum-investment">Minimum Investment (USD) *</Label>
                <Input
                  id="minimum-investment"
                  type="number"
                  value={minimumInvestment}
                  onChange={(e) => setMinimumInvestment(e.target.value)}
                  placeholder="10000"
                />
              </div>

              <div>
                <Label htmlFor="max-investors">Maximum Investors</Label>
                <Input
                  id="max-investors"
                  type="number"
                  value={maxInvestors}
                  onChange={(e) => setMaxInvestors(e.target.value)}
                  placeholder="50"
                />
              </div>

              <div>
                <Label htmlFor="expected-roi">Expected ROI (%)</Label>
                <Input
                  id="expected-roi"
                  type="number"
                  step="0.1"
                  value={investmentTerms.expectedROI}
                  onChange={(e) => setInvestmentTerms(prev => ({ ...prev, expectedROI: e.target.value }))}
                  placeholder="8.0"
                />
              </div>
            </CardContent>
          </Card>

          {/* Investment Structure */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Investment Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="lockup-period">Lockup Period (months)</Label>
                <Select 
                  value={investmentTerms.lockupPeriod} 
                  onValueChange={(value) => setInvestmentTerms(prev => ({ ...prev, lockupPeriod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="6">6 months</SelectItem>
                    <SelectItem value="12">12 months</SelectItem>
                    <SelectItem value="24">24 months</SelectItem>
                    <SelectItem value="36">36 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="management-fee">Management Fee (%)</Label>
                <Input
                  id="management-fee"
                  type="number"
                  step="0.1"
                  value={investmentTerms.managementFee}
                  onChange={(e) => setInvestmentTerms(prev => ({ ...prev, managementFee: e.target.value }))}
                  placeholder="2.0"
                />
              </div>

              <div>
                <Label htmlFor="distribution-frequency">Distribution Frequency</Label>
                <Select 
                  value={investmentTerms.distributionFrequency} 
                  onValueChange={(value) => setInvestmentTerms(prev => ({ ...prev, distributionFrequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="semi-annual">Semi-Annual</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Governance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Governance Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="voting-power-basis">Voting Power Basis</Label>
                <Select 
                  value={votingStructure.votingPowerBasis} 
                  onValueChange={(value) => setVotingStructure(prev => ({ ...prev, votingPowerBasis: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="investment_amount">Investment Amount</SelectItem>
                    <SelectItem value="tokens">Token Holdings</SelectItem>
                    <SelectItem value="equal">Equal Vote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requires-consensus">Requires Consensus</Label>
                  <p className="text-sm text-gray-500">Major decisions need consensus threshold</p>
                </div>
                <Switch
                  id="requires-consensus"
                  checked={votingStructure.requiresConsensus}
                  onCheckedChange={(checked) => setVotingStructure(prev => ({ ...prev, requiresConsensus: checked }))}
                />
              </div>

              {votingStructure.requiresConsensus && (
                <div>
                  <Label htmlFor="consensus-threshold">Consensus Threshold (%)</Label>
                  <Input
                    id="consensus-threshold"
                    type="number"
                    min="50"
                    max="100"
                    step="0.1"
                    value={votingStructure.consensusThreshold}
                    onChange={(e) => setVotingStructure(prev => ({ ...prev, consensusThreshold: e.target.value }))}
                    placeholder="66.7"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={creating}>
            {creating ? 'Creating...' : 'Create Investment Group'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
