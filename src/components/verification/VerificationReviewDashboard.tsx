
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText, Check, X, Clock, Eye, Download, AlertTriangle, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DocumentViewer } from './DocumentViewer';

interface VerificationRequest {
  id: string;
  document_id: string;
  requested_by: string;
  assigned_verifier: string | null;
  status: string;
  priority: string;
  created_at: string;
  property_documents: {
    id: string;
    document_name: string;
    document_type: string;
    file_url: string;
    mime_type: string;
    file_size: number;
    property_id: string | null;
    land_title_id: string | null;
  };
  requester?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export function VerificationReviewDashboard() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationNotes, setVerificationNotes] = useState('');
  const [verificationDecision, setVerificationDecision] = useState<'verified' | 'rejected'>('verified');
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  const fetchVerificationRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('document_verification_requests')
        .select(`
          *,
          property_documents!inner(*),
          users!requested_by(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedData = (data || []).map(item => ({
        ...item,
        requester: Array.isArray(item.users) ? item.users[0] : item.users
      }));

      setRequests(processedData);
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

      await fetchVerificationRequests();
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
    if (!selectedRequest || !verificationNotes.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update verification request
      const { error: requestError } = await supabase
        .from('document_verification_requests')
        .update({
          status: 'completed',
          notes: verificationNotes,
          completed_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.id);

      if (requestError) throw requestError;

      // Update document status
      const { error: documentError } = await supabase
        .from('property_documents')
        .update({
          status: verificationDecision,
          verification_notes: verificationNotes,
          verified_by: user.id,
          verified_at: new Date().toISOString()
        })
        .eq('id', selectedRequest.document_id);

      if (documentError) throw documentError;

      // Create notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: selectedRequest.requested_by,
          type: 'general',
          title: `Document ${verificationDecision === 'verified' ? 'Verified' : 'Rejected'}`,
          message: `Your ${selectedRequest.property_documents.document_name} has been ${verificationDecision}.`,
          metadata: {
            document_id: selectedRequest.document_id,
            verification_decision: verificationDecision
          }
        });

      if (notificationError) throw notificationError;

      setSelectedRequest(null);
      setVerificationNotes('');
      await fetchVerificationRequests();

      toast({
        title: 'Verification Complete',
        description: `Document has been ${verificationDecision}.`,
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

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || request.priority === filterPriority;
    const matchesSearch = searchTerm === '' || 
      request.property_documents.document_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester?.last_name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesPriority && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showDocumentViewer && selectedRequest) {
    return (
      <DocumentViewer
        documentUrl={selectedRequest.property_documents.file_url}
        documentName={selectedRequest.property_documents.document_name}
        mimeType={selectedRequest.property_documents.mime_type}
        onClose={() => setShowDocumentViewer(false)}
        onAnnotate={(annotations) => console.log('Annotations:', annotations)}
        isVerificationMode={true}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Verification Dashboard</h1>
          <p className="text-muted-foreground">Review and verify property documents</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{filteredRequests.length} requests</Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by document name or requester..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Verification Requests */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {filteredRequests.filter(r => r.status === 'pending').map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {request.property_documents.document_name}
                    </CardTitle>
                    <CardDescription>
                      Requested by: {request.requester?.first_name} {request.requester?.last_name}
                    </CardDescription>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Type: {request.property_documents.document_type}</span>
                      <span>•</span>
                      <span>Size: {formatFileSize(request.property_documents.file_size)}</span>
                      <span>•</span>
                      <span>Submitted: {new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(request.priority)}>
                      {request.priority}
                    </Badge>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowDocumentViewer(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Document
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => assignToSelf(request.id)}
                  >
                    Assign to Me
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="in_progress" className="space-y-4">
          {filteredRequests.filter(r => r.status === 'in_progress').map((request) => (
            <Card key={request.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {request.property_documents.document_name}
                    </CardTitle>
                    <CardDescription>
                      Requested by: {request.requester?.first_name} {request.requester?.last_name}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(request.priority)}>
                      {request.priority}
                    </Badge>
                    <Badge className={getStatusColor(request.status)}>
                      {request.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRequest(request);
                      setShowDocumentViewer(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Document
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setSelectedRequest(request)}
                  >
                    Complete Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {filteredRequests.filter(r => r.status === 'completed').map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {request.property_documents.document_name}
                    </CardTitle>
                    <CardDescription>
                      Completed verification
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    Completed
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Verification Modal */}
      {selectedRequest && !showDocumentViewer && (
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
              <Select value={verificationDecision} onValueChange={(value: any) => setVerificationDecision(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 mr-2 text-green-600" />
                      Approve Document
                    </div>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <div className="flex items-center">
                      <X className="h-4 w-4 mr-2 text-red-600" />
                      Reject Document
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Verification Notes *
              </label>
              <Textarea
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Provide detailed notes about your verification decision..."
                rows={4}
                required
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
                onClick={() => {
                  setSelectedRequest(selectedRequest);
                  setShowDocumentViewer(true);
                }}
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                Review Document
              </Button>
              <Button
                onClick={completeVerification}
                disabled={!verificationNotes.trim()}
                className={verificationDecision === 'verified' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {verificationDecision === 'verified' ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Approve
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
