
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  XCircle, 
  FileText, 
  User, 
  Home,
  Calendar,
  Clock,
  ArrowLeft,
  Save
} from 'lucide-react';

interface VerificationTask {
  id: string;
  property_id: string;
  verifier_id: string | null;
  task_type: string;
  status: string;
  priority: string;
  assigned_at: string | null;
  completed_at: string | null;
  deadline: string | null;
  verification_checklist: any;
  verifier_notes: string | null;
  decision: string | null;
  decision_reason: string | null;
  created_at: string;
  updated_at: string;
  properties: {
    id: string;
    title: string | null;
    type: string;
    location: any;
    user_id: string;
    price: any;
    users?: {
      first_name: string;
      last_name: string;
      email: string;
    };
  };
}

interface VerificationTaskDetailProps {
  task: VerificationTask;
  onBack: () => void;
  onTaskUpdated: () => void;
}

const DEFAULT_CHECKLIST = {
  documents_complete: false,
  ownership_verified: false,
  property_exists: false,
  legal_compliance: false,
  valuation_reasonable: false,
  photos_authentic: false,
  location_verified: false,
  zoning_compliant: false
};

export function VerificationTaskDetail({ task, onBack, onTaskUpdated }: VerificationTaskDetailProps) {
  const [verifierNotes, setVerifierNotes] = useState(task.verifier_notes || '');
  const [decision, setDecision] = useState<'approved' | 'rejected' | ''>('');
  const [decisionReason, setDecisionReason] = useState(task.decision_reason || '');
  const [checklist, setChecklist] = useState(task.verification_checklist || DEFAULT_CHECKLIST);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const handleChecklistChange = (key: string, checked: boolean) => {
    setChecklist(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const saveProgress = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('verification_tasks')
        .update({
          verification_checklist: checklist,
          verifier_notes: verifierNotes,
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', task.id);

      if (error) throw error;

      toast({
        title: 'Progress Saved',
        description: 'Your verification progress has been saved.',
      });

      onTaskUpdated();
    } catch (error) {
      console.error('Error saving progress:', error);
      toast({
        title: 'Error',
        description: 'Failed to save progress',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const completeVerification = async () => {
    if (!decision) {
      toast({
        title: 'Decision Required',
        description: 'Please select approve or reject before completing.',
        variant: 'destructive'
      });
      return;
    }

    if (!verifierNotes.trim()) {
      toast({
        title: 'Notes Required',
        description: 'Please provide verification notes.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('complete_verification_task', {
        p_task_id: task.id,
        p_decision: decision,
        p_decision_reason: decisionReason || null,
        p_verifier_notes: verifierNotes,
        p_checklist: checklist
      });

      if (error) throw error;

      toast({
        title: 'Verification Complete',
        description: `Property has been ${decision}.`,
      });

      onTaskUpdated();
      onBack();
    } catch (error) {
      console.error('Error completing verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete verification',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: any) => {
    if (!price || typeof price !== 'object') return 'N/A';
    return `${price.currency || '₦'}${price.amount?.toLocaleString() || 'N/A'}`;
  };

  const formatLocation = (location: any) => {
    if (!location || typeof location !== 'object') return 'Location not specified';
    return location.city || 'Location not specified';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const checklistItems = [
    { key: 'documents_complete', label: 'All required documents are complete and legible' },
    { key: 'ownership_verified', label: 'Property ownership has been verified' },
    { key: 'property_exists', label: 'Property physically exists at stated location' },
    { key: 'legal_compliance', label: 'Property complies with local regulations' },
    { key: 'valuation_reasonable', label: 'Listed valuation is reasonable' },
    { key: 'photos_authentic', label: 'Property photos are authentic and recent' },
    { key: 'location_verified', label: 'Property location has been verified' },
    { key: 'zoning_compliant', label: 'Property is compliant with zoning requirements' }
  ];

  const allChecksPassed = Object.values(checklist).every(Boolean);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tasks
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Verification Task Details</h1>
          <p className="text-muted-foreground">Review and verify property information</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getPriorityColor(task.priority)}>
            {task.priority} Priority
          </Badge>
          <Badge className={getStatusColor(task.status)}>
            {task.status}
          </Badge>
        </div>
      </div>

      {/* Property Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Home className="w-5 h-5" />
            Property Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">Property Title</label>
              <p className="font-medium">{task.properties.title || 'Untitled Property'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Property Type</label>
              <p className="font-medium capitalize">{task.properties.type}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Location</label>
              <p className="font-medium">{formatLocation(task.properties.location)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Listed Price</label>
              <p className="font-medium">{formatPrice(task.properties.price)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Property Owner</label>
              <p className="font-medium">
                {task.properties.users?.first_name} {task.properties.users?.last_name}
              </p>
              <p className="text-sm text-gray-500">{task.properties.users?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Task Created</label>
              <p className="font-medium">{new Date(task.created_at).toLocaleDateString()}</p>
              {task.deadline && (
                <p className="text-sm text-red-600">
                  Due: {new Date(task.deadline).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Verification Checklist
          </CardTitle>
          <CardDescription>
            Complete all verification checks before making a decision
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {checklistItems.map((item) => (
            <div key={item.key} className="flex items-center space-x-2">
              <Checkbox
                id={item.key}
                checked={checklist[item.key] || false}
                onCheckedChange={(checked) => handleChecklistChange(item.key, !!checked)}
              />
              <label htmlFor={item.key} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {item.label}
              </label>
            </div>
          ))}
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm">
              Progress: {Object.values(checklist).filter(Boolean).length} of {checklistItems.length} checks completed
              {allChecksPassed && (
                <span className="text-green-600 font-medium ml-2">✓ All checks completed</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Verification Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Notes</CardTitle>
          <CardDescription>
            Provide detailed notes about your verification findings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={verifierNotes}
            onChange={(e) => setVerifierNotes(e.target.value)}
            placeholder="Enter your verification notes here..."
            rows={6}
            className="resize-none"
          />
        </CardContent>
      </Card>

      {/* Decision Section */}
      {task.status !== 'completed' && (
        <Card>
          <CardHeader>
            <CardTitle>Verification Decision</CardTitle>
            <CardDescription>
              Make your final decision on this property verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Decision</label>
              <Select value={decision} onValueChange={(value: any) => setDecision(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your decision" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">
                    <div className="flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Approve Property
                    </div>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <div className="flex items-center">
                      <XCircle className="h-4 w-4 mr-2 text-red-600" />
                      Reject Property
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {decision === 'rejected' && (
              <div>
                <label className="block text-sm font-medium mb-2">Rejection Reason</label>
                <Textarea
                  value={decisionReason}
                  onChange={(e) => setDecisionReason(e.target.value)}
                  placeholder="Explain why this property is being rejected..."
                  rows={3}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={saveProgress}
                disabled={isUpdating}
              >
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? 'Saving...' : 'Save Progress'}
              </Button>
              <Button
                onClick={completeVerification}
                disabled={isSubmitting || !allChecksPassed || !verifierNotes.trim()}
                className={decision === 'approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {isSubmitting ? 'Processing...' : `Complete Verification`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
