
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { 
  FileText, 
  Upload, 
  Check, 
  Clock, 
  AlertCircle,
  Eye,
  Download
} from 'lucide-react';

interface Document {
  id: string;
  document_name: string;
  document_type: string;
  file_url: string;
  status: 'pending' | 'verified' | 'rejected';
  verification_notes?: string;
  created_at: string;
}

interface VerificationRequest {
  id: string;
  document_id: string;
  status: 'pending' | 'in_review' | 'completed';
  assigned_verifier?: string;
  notes?: string;
  created_at: string;
  document: Document;
}

export function VerificationWorkflow() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchVerificationRequests();
    }
  }, [user]);

  const fetchVerificationRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('document_verification_requests')
        .select(`
          *,
          document:property_documents(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure proper typing
      const typedData = (data || []).map(item => ({
        ...item,
        status: item.status as 'pending' | 'in_review' | 'completed'
      })) as VerificationRequest[];
      
      setRequests(typedData);
    } catch (error) {
      console.error('Error fetching verification requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load verification requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const updateVerificationStatus = async (
    requestId: string, 
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    setSubmitting(requestId);
    try {
      const { error: requestError } = await supabase
        .from('document_verification_requests')
        .update({
          status: 'completed',
          notes,
          completed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (requestError) throw requestError;

      // Update the document status
      const request = requests.find(r => r.id === requestId);
      if (request) {
        const { error: docError } = await supabase
          .from('property_documents')
          .update({
            status: status === 'approved' ? 'verified' : 'rejected',
            verification_notes: notes,
            verified_at: status === 'approved' ? new Date().toISOString() : null,
            verified_by: user?.id
          })
          .eq('id', request.document_id);

        if (docError) throw docError;
      }

      toast({
        title: 'Success',
        description: `Document ${status} successfully`,
      });

      fetchVerificationRequests();
    } catch (error) {
      console.error('Error updating verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to update verification status',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_review': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'verified': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_review': return <Eye className="w-4 h-4" />;
      case 'completed': 
      case 'verified': return <Check className="w-4 h-4" />;
      case 'rejected': return <AlertCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;
  const completionRate = requests.length > 0 ? (completedCount / requests.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold">{requests.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completion Rate</p>
                <p className="text-2xl font-bold text-green-600">{completionRate.toFixed(0)}%</p>
              </div>
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <Progress value={completionRate} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Verification Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Document Verification Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No verification requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{request.document.document_name}</h3>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusIcon(request.status)}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {request.document.document_type}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        Submitted: {new Date(request.created_at).toLocaleDateString()}
                      </p>
                      
                      {request.notes && (
                        <p className="text-sm bg-gray-100 p-2 rounded">
                          <strong>Notes:</strong> {request.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(request.document.file_url, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = request.document.file_url;
                          link.download = request.document.document_name;
                          link.click();
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                      
                      {request.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateVerificationStatus(request.id, 'approved')}
                            disabled={submitting === request.id}
                          >
                            {submitting === request.id ? 'Processing...' : 'Approve'}
                          </Button>
                          
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => updateVerificationStatus(
                              request.id, 
                              'rejected', 
                              'Document requires additional review'
                            )}
                            disabled={submitting === request.id}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
