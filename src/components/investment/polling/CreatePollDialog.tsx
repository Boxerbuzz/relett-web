
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X, Vote } from 'lucide-react';
import { useInvestmentPolls } from '@/hooks/useInvestmentPolls';

interface CreatePollDialogProps {
  investmentGroupId: string;
  onPollCreated: () => void;
  trigger?: React.ReactNode;
}

export function CreatePollDialog({ investmentGroupId, onPollCreated, trigger }: CreatePollDialogProps) {
  const { createPoll } = useInvestmentPolls(investmentGroupId);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [pollType, setPollType] = useState<'simple' | 'multiple_choice'>('simple');
  const [options, setOptions] = useState(['', '']);
  const [endsAt, setEndsAt] = useState('');
  const [minParticipation, setMinParticipation] = useState(50);
  const [requiresConsensus, setRequiresConsensus] = useState(false);
  const [consensusThreshold, setConsensusThreshold] = useState(66.7);
  const [votingPowerBasis, setVotingPowerBasis] = useState<'tokens' | 'equal' | 'investment_amount'>('tokens');
  const [creating, setCreating] = useState(false);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !endsAt || options.some(opt => !opt.trim())) {
      return;
    }

    setCreating(true);
    try {
      const result = await createPoll({
        title,
        description,
        poll_type: pollType,
        ends_at: endsAt,
        options: options.filter(opt => opt.trim()),
        min_participation_percentage: minParticipation,
        requires_consensus: requiresConsensus,
        consensus_threshold: consensusThreshold,
        voting_power_basis: votingPowerBasis
      });

      if (result) {
        setOpen(false);
        resetForm();
        onPollCreated();
      }
    } catch (error) {
      console.error('Error creating poll:', error);
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPollType('simple');
    setOptions(['', '']);
    setEndsAt('');
    setMinParticipation(50);
    setRequiresConsensus(false);
    setConsensusThreshold(66.7);
    setVotingPowerBasis('tokens');
  };

  const defaultTrigger = (
    <Button className="flex items-center gap-2">
      <Vote className="w-4 h-4" />
      Create Poll
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Poll</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label htmlFor="title">Poll Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter poll title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide additional context for the poll"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="poll-type">Poll Type</Label>
                <Select value={pollType} onValueChange={(value: any) => setPollType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple (Yes/No)</SelectItem>
                    <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ends-at">End Date & Time</Label>
                <Input
                  id="ends-at"
                  type="datetime-local"
                  value={endsAt}
                  onChange={(e) => setEndsAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Poll Options */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label>Poll Options</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </Button>
              </div>

              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeOption(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Voting Settings */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold">Voting Settings</h3>

              <div>
                <Label htmlFor="voting-power">Voting Power Basis</Label>
                <Select value={votingPowerBasis} onValueChange={(value: any) => setVotingPowerBasis(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tokens">Token Holdings</SelectItem>
                    <SelectItem value="investment_amount">Investment Amount</SelectItem>
                    <SelectItem value="equal">Equal Vote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="min-participation">Minimum Participation (%)</Label>
                <Input
                  id="min-participation"
                  type="number"
                  min="0"
                  max="100"
                  value={minParticipation}
                  onChange={(e) => setMinParticipation(Number(e.target.value))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="requires-consensus">Requires Consensus</Label>
                  <p className="text-sm text-gray-500">Poll must reach consensus threshold to pass</p>
                </div>
                <Switch
                  id="requires-consensus"
                  checked={requiresConsensus}
                  onCheckedChange={setRequiresConsensus}
                />
              </div>

              {requiresConsensus && (
                <div>
                  <Label htmlFor="consensus-threshold">Consensus Threshold (%)</Label>
                  <Input
                    id="consensus-threshold"
                    type="number"
                    min="50"
                    max="100"
                    step="0.1"
                    value={consensusThreshold}
                    onChange={(e) => setConsensusThreshold(Number(e.target.value))}
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
            {creating ? 'Creating...' : 'Create Poll'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
