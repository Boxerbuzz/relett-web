
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { 
  FileText, 
  User, 
  CheckCircle, 
  XCircle, 
  Eye,
  Download,
  Clock,
  Shield
} from '@phosphor-icons/react';

interface KYCDocument {
  id: string;
  user_id: string;
  document_type: string;
  file_url: string;
  verification_status: string;
  verification_provider?: string;
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
  extracted_data?: any;
  created_at: string;
  user_profiles?: {
    first_name: string;
    last_name: string;
    phone_number?: string;
  };
}

interface IdentityVerification {
  id: string;
  user_id: string;
  identity_type: string;
  identity_number: string;
  full_name: string;
  verification_status: string;
  verified_at?: string;
  created_at: string;
  user_profiles?: {
    first_name: string;
    last_name: string;
  };
}

export function KYCReviewDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);
  const [identityVerifications, setIdentityVerifications] = useState<IdentityVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'documents' | 'identity'>('documents');

  useEffect(() => {
    fetchKYCData();
  }, []);

  const fetchKYCData = async () => {
    try {
      // Fetch KYC documents
      const { data: docsData, error: docsError } = await supabase
        .from('kyc_documents')
        .select(`
          *,
          user_profiles(first_name, last_name, phone_number)
        `)
        .order('created_at', { ascending: false });

      if (docsError) throw docsError;

      // Fetch identity verifications
      const { data: identityData, error: identityError } = await supabase
        .from('identity_verifications')
        .select(`
          *,
          user_profiles(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (identityError) throw identityError;

      setKycDocuments(docsData || []);
      setIdentityVerifications(identityData || []);
    } catch (error) {
      console.error('Error fetching KYC data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load KYC data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentDecision = async (documentId: string, decision: 'verified' | 'rejected') => {
    if (!selectedDocument) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('kyc_documents')
        .update({
          verification_status: decision,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          rejection_reason: decision === 'rejected' ? reviewNotes : null
        })
        .eq('id', documentId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Document ${decision} successfully`,
      });

      setSelectedDocument(null);
      setReviewNotes('');
      fetchKYCData();
    } catch (error) {
      console.error('Error processing document:', error);
      toast({
        title: 'Error',
        description: 'Failed to process document',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleIdentityDecision = async (verificationId: string, decision: 'verified' | 'rejected') => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('identity_verifications')
        .update({
          verification_status: decision,
          verified_at: decision === 'verified' ? new Date().toISOString() : null
        })
        .eq('id', verificationId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Identity verification ${decision} successfully`,
      });

      fetchKYCData();
    } catch (error) {
      console.error('Error processing identity verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to process identity verification',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'bg-yellow-100 text-yellow-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
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
        <h2 className="text-2xl font-bold text-gray-900">KYC Review Dashboard</h2>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'documents' ? 'default' : 'outline'}
            onClick={() => setActiveTab('documents')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Documents ({kycDocuments.filter(d => d.verification_status === 'pending').length})
          </Button>
          <Button
            variant={activeTab === 'identity' ? 'default' : 'outline'}
            onClick={() => setActiveTab('identity')}
          >
            <Shield className="h-4 w-4 mr-2" />
            Identity ({identityVerifications.filter(i => i.verification_status === 'pending').length})
          </Button>
        </div>
      </div>

      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Documents List */}
          <div className="lg:col-span-2 space-y-4">
            {kycDocuments.map((document) => (
              <Card 
                key={document.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedDocument?.id === document.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedDocument(document)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <h3 className="font-semibold">
                          {document.user_profiles?.first_name} {document.user_profiles?.last_name}
                        </h3>
                        <p className="text-sm text-gray-600 capitalize">
                          {document.document_type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(document.verification_status)}
                  </div>

                  <div className="text-xs text-gray-500">
                    Submitted: {new Date(document.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Document Details */}
          <div className="lg:col-span-1">
            {selectedDocument ? (
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Document Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Document Information</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Type:</strong> {selectedDocument.document_type.replace('_', ' ')}</p>
                      <p><strong>Applicant:</strong> {selectedDocument.user_profiles?.first_name} {selectedDocument.user_profiles?.last_name}</p>
                      <p><strong>Status:</strong> {getStatusBadge(selectedDocument.verification_status)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => window.open(selectedDocument.file_url, '_blank')}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = selectedDocument.file_url;
                        link.download = `${selectedDocument.document_type}_${selectedDocument.user_id}`;
                        link.click();
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  {selectedDocument.verification_status === 'pending' && (
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
                          onClick={() => handleDocumentDecision(selectedDocument.id, 'verified')}
                          disabled={processing}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Verify
                        </Button>
                        <Button
                          onClick={() => handleDocumentDecision(selectedDocument.id, 'rejected')}
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
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Document</h3>
                  <p className="text-gray-500">Choose a document from the list to review and verify.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'identity' && (
        <div className="space-y-4">
          {identityVerifications.map((verification) => (
            <Card key={verification.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-purple-500" />
                    <div>
                      <h3 className="font-semibold">
                        {verification.user_profiles?.first_name} {verification.user_profiles?.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {verification.identity_type.toUpperCase()}: {verification.identity_number}
                      </p>
                      <p className="text-sm text-gray-500">
                        Full Name: {verification.full_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(verification.verification_status)}
                    {verification.verification_status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleIdentityDecision(verification.id, 'verified')}
                          disabled={processing}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify
                        </Button>
                        <Button
                          onClick={() => handleIdentityDecision(verification.id, 'rejected')}
                          disabled={processing}
                          variant="destructive"
                          size="sm"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {identityVerifications.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No identity verifications</h3>
                <p className="text-gray-500">No pending identity verifications to review at this time.</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
