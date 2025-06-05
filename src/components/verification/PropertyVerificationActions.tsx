
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useUserRoles } from '@/hooks/useUserRoles';
import { 
  UserCheck, 
  Clock, 
  AlertTriangle,
  Send,
  Users
} from 'lucide-react';

interface Property {
  id: string;
  title: string | null;
  type: string;
  status: string;
  is_verified: boolean | null;
  user_id: string;
}

interface PropertyVerificationActionsProps {
  property: Property;
  onVerificationInitiated?: () => void;
}

export function PropertyVerificationActions({ 
  property, 
  onVerificationInitiated 
}: PropertyVerificationActionsProps) {
  const [selectedVerifier, setSelectedVerifier] = useState('');
  const [priority, setPriority] = useState('medium');
  const [notes, setNotes] = useState('');
  const [deadline, setDeadline] = useState('');
  const [verifiers, setVerifiers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingVerifiers, setLoadingVerifiers] = useState(false);
  const { hasRole } = useUserRoles();
  const { toast } = useToast();

  const canInitiateVerification = hasRole('admin') || hasRole('agent');

  const fetchVerifiers = async () => {
    setLoadingVerifiers(true);
    try {
      // Get users with verifier role
      const { data: verifierRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          user_id,
          users!inner(
            id,
            first_name,
            last_name,
            email,
            is_active
          )
        `)
        .eq('role', 'verifier')
        .eq('is_active', true);

      if (rolesError) throw rolesError;

      const activeVerifiers = verifierRoles?.filter(role => 
        role.users?.is_active
      ).map(role => role.users) || [];

      setVerifiers(activeVerifiers);
    } catch (error) {
      console.error('Error fetching verifiers:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch available verifiers',
        variant: 'destructive'
      });
    } finally {
      setLoadingVerifiers(false);
    }
  };

  const handleInitiateVerification = async () => {
    if (!selectedVerifier) {
      toast({
        title: 'Verifier Required',
        description: 'Please select a verifier to assign this task to.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const deadlineDate = deadline ? new Date(deadline).toISOString() : null;

      const { data, error } = await supabase.rpc('assign_verification_task', {
        p_property_id: property.id,
        p_verifier_id: selectedVerifier,
        p_task_type: 'property_verification',
        p_priority: priority,
        p_deadline: deadlineDate
      });

      if (error) throw error;

      // Add notes to the verification task if provided
      if (notes.trim() && data) {
        await supabase
          .from('verification_tasks')
          .update({ verifier_notes: notes })
          .eq('id', data);
      }

      toast({
        title: 'Verification Initiated',
        description: 'Property verification task has been assigned successfully.',
      });

      // Reset form
      setSelectedVerifier('');
      setPriority('medium');
      setNotes('');
      setDeadline('');

      onVerificationInitiated?.();
    } catch (error) {
      console.error('Error initiating verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to initiate property verification',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (property: Property) => {
    if (property.is_verified) {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
    }
    if (property.status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-800">Pending Verification</Badge>;
    }
    return <Badge variant="outline">Unverified</Badge>;
  };

  if (!canInitiateVerification) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-gray-600">
            You don't have permission to initiate property verification.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          Property Verification
        </CardTitle>
        <CardDescription>
          Initiate verification process for this property
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Property Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">{property.title || 'Untitled Property'}</p>
            <p className="text-sm text-gray-600">Current Status</p>
          </div>
          {getStatusBadge(property)}
        </div>

        {/* Verifier Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Assign Verifier</label>
          <div className="flex gap-2">
            <Select value={selectedVerifier} onValueChange={setSelectedVerifier}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a verifier" />
              </SelectTrigger>
              <SelectContent>
                {verifiers.map((verifier) => (
                  <SelectItem key={verifier.id} value={verifier.id}>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {verifier.first_name} {verifier.last_name}
                      <span className="text-sm text-gray-500">({verifier.email})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={fetchVerifiers}
              disabled={loadingVerifiers}
            >
              {loadingVerifiers ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Priority Level</label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Low Priority
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  Medium Priority
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  High Priority
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Deadline */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Deadline (Optional)</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Additional Notes (Optional)</label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any specific instructions or notes for the verifier..."
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleInitiateVerification}
          disabled={loading || !selectedVerifier}
          className="w-full"
        >
          <Send className="w-4 h-4 mr-2" />
          {loading ? 'Initiating...' : 'Initiate Verification'}
        </Button>
      </CardContent>
    </Card>
  );
}
