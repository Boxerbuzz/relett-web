
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Check, X, Clock, Download, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { DocumentVerificationRequest } from '@/types/preferences';

export function DocumentVerification() {
  const [requests, setRequests] = useState<DocumentVerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DocumentVerificationRequest | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'rejected'>('verified');
  const { toast } = useToast();

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  const fetchVerificationRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user is a verifier
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('is_active', true);

      const isVerifier = roles?.some(r => r.role === 'verifier' || r.role === 'admin');
      if (!isVerifier) {
        toast({
          title: 'Access Denied',
          description: 'You need verifier privileges to access this feature.',
          variant: 'destructive'
        });
        return;
      }

      // Simplified query without complex joins that might fail
      const { data, error } = await supabase
        .from('document_verification_requests')
        .select(`
          *,
          property_documents!inner(
            id,
            document_name,
            document_type,
            file_url
          )
        `)
        .in('status', ['pending', 'in_progress'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data to match expected interface
      const transformedData: DocumentVerificationRequest[] = (data || []).map(item => ({
        ...item,
        property_documents: {
          ...item.property_documents,
          properties: {
            id: 'unknown',
            title: 'Property',
            user_profiles: {
              first_name: 'Unknown',
              last_name: 'User'
            }
          }
        }
      }));

      setRequests(transformedData);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load verification requests.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const assignToSelf = async (requestId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('document_verification_requests')
        .update({
          assigned_verifier: user.id,
          status: 'in_progress'
        })
        .eq('id', requestId);

      if (error) throw error;

      fetchVerificationRequests();
      toast({
        title: 'Request Assigned',
        description: 'Verification request has been assigned to you.',
      });
    } catch (error) {
      console.error('Error assigning request:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign request.',
        variant: 'destructive'
      });
    }
  };

  const completeVerification = async () => {
    if (!selectedRequest) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update the verification request
      const { error: requestError } = await supabase
        .from('document_verification_requests')
        .update({
          status: 'completed',
          notes: verificationNotes,
          completed_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);

      if (requestError) throw requestError;

      // Update the document status
      const { error: documentError } = await supabase
        .from('property_documents')
        .update({
          status: verificationStatus,
          verification_notes: verificationNotes,
          verified_by: user.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.document_id);

      if (documentError) throw documentError;

      // Create notification for property owner using valid notification type
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: selectedRequest.requested_by,
          type: 'general', // Using valid notification type from database
          title: `Document ${verificationStatus === 'verified' ? 'Verified' : 'Rejected'}`,
          message: `Your ${selectedRequest.property_documents.document_name} has been ${verificationStatus}.`,
          metadata: {
            document_id: selectedRequest.document_id,
            property_id: selectedRequest.property_documents.properties?.id || 'unknown'
          }
        });

      if (notificationError) throw notificationError;

      setSelectedRequest(null);
      setVerificationNotes('');
      fetchVerificationRequests();

      toast({
        title: 'Verification Complete',
        description: `Document has been ${verificationStatus}.`,
      });
    } catch (error) {
      console.error('Error completing verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to complete verification.',
        variant: 'destructive'
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Eye className="h-4 w-4" />;
      case 'completed': return <Check className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </CardContent>
        </Card>
      ))}
    </div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Document Verification</h2>
        <p className="text-muted-foreground">Review and verify property documents</p>
      </div>

      {/* Verification Requests */}
      <div className="grid gap-4">
        {requests.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <FileText className="mx-auto h-12 w-12 mb-4" />
                <p>No pending verification requests.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          requests.map((request) => (
            <Card key={request.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {request.property_documents.document_name}
                    </CardTitle>
                    <CardDescription>
                      Property: {request.property_documents.properties?.title || 'Unknown'} • 
                      Owner: {request.property_documents.properties?.user_profiles?.first_name || 'Unknown'} {request.property_documents.properties?.user_profiles?.last_name || 'User'}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(request.priority)}>
                      {request.priority}
                    </Badge>
                    <Badge variant="outline">
                      {getStatusIcon(request.status)}
                      {request.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    <p>Document Type: {request.property_documents.document_type}</p>
                    <p>Submitted: {new Date(request.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(request.property_documents.file_url, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      View Document
                    </Button>
                    {request.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => assignToSelf(request.id)}
                      >
                        Assign to Me
                      </Button>
                    )}
                    {request.status === 'in_progress' && (
                      <Button
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                      >
                        Complete Review
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Verification Modal */}
      {selectedRequest && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>Complete Verification</CardTitle>
            <CardDescription>
              Review and provide feedback for {selectedRequest.property_documents.document_name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Verification Decision</label>
              <Select value={verificationStatus} onValueChange={(value: any) => setVerificationStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">Approve Document</SelectItem>
                  <SelectItem value="rejected">Reject Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Verification Notes</label>
              <Textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Provide detailed notes about your verification decision..."
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedRequest(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={completeVerification}
                disabled={!verificationNotes.trim()}
              >
                {verificationStatus === 'verified' ? 'Approve' : 'Reject'} Document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
