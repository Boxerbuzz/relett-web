
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { 
  User, 
  CheckCircle, 
  XCircle, 
  Clock,
  Phone,
  Mail,
  FileText,
  Calendar
} from '@phosphor-icons/react';

interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: string;
  status: string;
  experience_years?: number;
  credentials?: string;
  reason: string;
  license_number?: string;
  issuing_authority?: string;
  contact_phone?: string;
  created_at: string;
  user_profiles?: {
    first_name: string;
    last_name: string;
    phone_number?: string;
  };
}

export function RoleRequestManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<RoleRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchRoleRequests();
  }, []);

  const fetchRoleRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('user_role_requests')
        .select(`
          *,
          user_profiles(first_name, last_name, phone_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
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

  const handleRequestDecision = async (requestId: string, decision: 'approved' | 'rejected') => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      // Update role request status
      const { error: updateError } = await supabase
        .from('user_role_requests')
        .update({
          status: decision,
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        })
        .eq('id', requestId);

      if (updateError) throw updateError;

      // If approved, assign the role
      if (decision === 'approved') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: selectedRequest.user_id,
            role: selectedRequest.requested_role,
            is_active: true,
            assigned_by: user?.id
          });

        if (roleError) throw roleError;
      }

      toast({
        title: 'Success',
        description: `Role request ${decision} successfully`,
      });

      setSelectedRequest(null);
      setReviewNotes('');
      fetchRoleRequests();
    } catch (error) {
      console.error('Error processing request:', error);
      toast({
        title: 'Error',
        description: 'Failed to process role request',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRoleColor = (role: string) => {
    const colors = {
      agent: 'text-blue-600',
      verifier: 'text-purple-600',
      landowner: 'text-green-600',
      surveyor: 'text-orange-600'
    };
    return colors[role as keyof typeof colors] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Role Request Management</h2>
        <div className="flex gap-2">
          {['pending', 'approved', 'rejected'].map(status => (
            <Badge key={status} variant="outline">
              {status}: {requests.filter(r => r.status === status).length}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests List */}
        <div className="lg:col-span-2 space-y-4">
          {requests.map((request) => (
            <Card 
              key={request.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedRequest?.id === request.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedRequest(request)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-gray-400" />
                    <div>
                      <h3 className="font-semibold">
                        {request.user_profiles?.first_name} {request.user_profiles?.last_name}
                      </h3>
                      <p className={`text-sm font-medium ${getRoleColor(request.requested_role)}`}>
                        {request.requested_role.charAt(0).toUpperCase() + request.requested_role.slice(1)}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  {request.experience_years && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>{request.experience_years} years experience</span>
                    </div>
                  )}
                  
                  {request.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{request.contact_phone}</span>
                    </div>
                  )}

                  {request.license_number && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>License: {request.license_number}</span>
                    </div>
                  )}
                </div>

                <p className="text-sm text-gray-700 mt-3 line-clamp-2">
                  {request.reason}
                </p>

                <div className="text-xs text-gray-500 mt-3">
                  Submitted: {new Date(request.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}

          {requests.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <User className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No role requests</h3>
                <p className="text-gray-500">No pending role requests to review at this time.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Request Details */}
        <div className="lg:col-span-1">
          {selectedRequest ? (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Applicant Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedRequest.user_profiles?.first_name} {selectedRequest.user_profiles?.last_name}</p>
                    <p><strong>Role:</strong> {selectedRequest.requested_role}</p>
                    {selectedRequest.experience_years && (
                      <p><strong>Experience:</strong> {selectedRequest.experience_years} years</p>
                    )}
                    {selectedRequest.contact_phone && (
                      <p><strong>Phone:</strong> {selectedRequest.contact_phone}</p>
                    )}
                  </div>
                </div>

                {selectedRequest.credentials && (
                  <div>
                    <h4 className="font-medium mb-2">Credentials</h4>
                    <p className="text-sm text-gray-700">{selectedRequest.credentials}</p>
                  </div>
                )}

                {(selectedRequest.license_number || selectedRequest.issuing_authority) && (
                  <div>
                    <h4 className="font-medium mb-2">Professional License</h4>
                    <div className="space-y-1 text-sm">
                      {selectedRequest.license_number && (
                        <p><strong>License Number:</strong> {selectedRequest.license_number}</p>
                      )}
                      {selectedRequest.issuing_authority && (
                        <p><strong>Issuing Authority:</strong> {selectedRequest.issuing_authority}</p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-medium mb-2">Reason for Request</h4>
                  <p className="text-sm text-gray-700">{selectedRequest.reason}</p>
                </div>

                {selectedRequest.status === 'pending' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2">Review Notes</label>
                      <Textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder="Add notes about your decision..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleRequestDecision(selectedRequest.id, 'approved')}
                        disabled={processing}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRequestDecision(selectedRequest.id, 'rejected')}
                        disabled={processing}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </>
                )}

                {selectedRequest.status !== 'pending' && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">
                      Status: {getStatusBadge(selectedRequest.status)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Request</h3>
                <p className="text-gray-500">Choose a role request from the list to review details and take action.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
