import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserIcon,
  BriefcaseIcon
} from '@phosphor-icons/react';

interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: string;
  reason: string;
  credentials: string;
  experience_years: number;
  license_number: string;
  issuing_authority: string;
  contact_phone: string;
  verification_status: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  reviewer_notes?: string;
  user_profiles?: {
    first_name: string;
    last_name: string;
    phone_number?: string;
  } | null;
}

export function RoleRequestManagement() {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchRoleRequests();
  }, []);

  const fetchRoleRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('user_role_requests')
        .select(`
          *,
          user_profiles!user_role_requests_user_id_fkey (
            first_name,
            last_name,
            phone_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []).map(item => ({
        ...item,
        verification_status: item.verification_status || item.status || 'pending',
        user_profiles: item.user_profiles && !('error' in item.user_profiles) ? item.user_profiles : null
      })) as RoleRequest[]);
    } catch (error) {
      console.error('Error fetching role requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load role requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId: string, decision: 'approved' | 'rejected') => {
    try {
      setReviewingId(requestId);
      const request = requests.find(r => r.id === requestId);
      if (!request) return;

      // Update role request status
      const { error: updateError } = await supabase
        .from('user_role_requests')
        .update({
          verification_status: decision,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewer_notes: reviewNotes
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If approved, grant the role
      if (decision === 'approved') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: request.user_id,
            role: request.requested_role as any,
            assigned_by: (await supabase.auth.getUser()).data.user?.id,
            assigned_at: new Date().toISOString(),
            is_active: true
          });

        if (roleError) throw roleError;
      }

      await fetchRoleRequests();
      setReviewNotes('');
      setReviewingId(null);

      toast({
        title: 'Success',
        description: `Role request ${decision} successfully`
      });
    } catch (error) {
      console.error('Error reviewing role request:', error);
      toast({
        title: 'Error',
        description: 'Failed to review role request',
        variant: 'destructive'
      });
    } finally {
      setReviewingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return CheckCircleIcon;
      case 'rejected': return XCircleIcon;
      default: return ClockIcon;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Request Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading role requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BriefcaseIcon className="h-5 w-5" />
          Role Request Management
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No role requests to review
            </div>
          ) : (
            requests.map((request) => {
              const StatusIcon = getStatusIcon(request.verification_status);
              return (
                <div key={request.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {request.user_profiles?.first_name || 'Unknown'} {request.user_profiles?.last_name || 'User'}
                        </span>
                        <Badge variant="outline" className="capitalize">
                          {request.requested_role}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <EnvelopeIcon className="h-3 w-3" />
                          <span>{request.contact_phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <BriefcaseIcon className="h-3 w-3" />
                          <span>{request.experience_years} years experience</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(request.verification_status)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {request.verification_status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="font-medium text-gray-700">Reason</label>
                      <p className="text-gray-600">{request.reason}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Credentials</label>
                      <p className="text-gray-600">{request.credentials}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">License Number</label>
                      <p className="text-gray-600">{request.license_number}</p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-700">Issuing Authority</label>
                      <p className="text-gray-600">{request.issuing_authority}</p>
                    </div>
                  </div>

                  {request.verification_status === 'pending' && (
                    <div className="border-t pt-4 space-y-3">
                      <Textarea
                        placeholder="Add review notes..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleReview(request.id, 'approved')}
                          disabled={reviewingId === request.id}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleReview(request.id, 'rejected')}
                          disabled={reviewingId === request.id}
                          variant="destructive"
                        >
                          <XCircleIcon className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}

                  {request.reviewer_notes && (
                    <div className="border-t pt-4">
                      <label className="font-medium text-gray-700">Review Notes</label>
                      <p className="text-gray-600 text-sm">{request.reviewer_notes}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Reviewed on {new Date(request.reviewed_at!).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
