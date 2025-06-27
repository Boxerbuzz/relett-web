
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { 
  Shield, 
  User, 
  CheckCircle, 
  XCircle, 
  Award,
  Calendar,
  FileText,
  TrendUp,
  Users
} from '@phosphor-icons/react';

interface VerifierCredential {
  id: string;
  user_id: string;
  verifier_type: string;
  license_number: string;
  issuing_authority: string;
  license_name: string;
  issue_date: string;
  expiry_date: string;
  verification_status: string;
  verified_by?: string;
  verified_at?: string;
  documents: any[];
  reputation_score: number;
  total_verifications: number;
  successful_verifications: number;
  is_active: boolean;
  suspension_reason?: string;
  suspended_until?: string;
  created_at: string;
  user_profiles?: {
    first_name: string;
    last_name: string;
    phone_number?: string;
  };
}

export function VerifierCredentialReview() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<VerifierCredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCredential, setSelectedCredential] = useState<VerifierCredential | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchVerifierCredentials();
  }, []);

  const fetchVerifierCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from('verifier_credentials')
        .select(`
          *,
          user_profiles(first_name, last_name, phone_number)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCredentials(data || []);
    } catch (error) {
      console.error('Error fetching verifier credentials:', error);
      toast({
        title: 'Error',
        description: 'Failed to load verifier credentials',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCredentialDecision = async (credentialId: string, decision: 'verified' | 'rejected') => {
    if (!selectedCredential) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('verifier_credentials')
        .update({
          verification_status: decision,
          verified_by: user?.id,
          verified_at: new Date().toISOString(),
          is_active: decision === 'verified'
        })
        .eq('id', credentialId);

      if (error) throw error;

      // If verified, also assign verifier role
      if (decision === 'verified') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: selectedCredential.user_id,
            role: 'verifier',
            is_active: true,
            assigned_by: user?.id
          });

        if (roleError && !roleError.message.includes('duplicate')) {
          console.error('Role assignment error:', roleError);
        }
      }

      toast({
        title: 'Success',
        description: `Verifier credentials ${decision} successfully`,
      });

      setSelectedCredential(null);
      setReviewNotes('');
      fetchVerifierCredentials();
    } catch (error) {
      console.error('Error processing credential:', error);
      toast({
        title: 'Error',
        description: 'Failed to process verifier credential',
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
      rejected: 'bg-red-100 text-red-800',
      suspended: 'bg-orange-100 text-orange-800'
    };
    
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getVerifierTypeColor = (type: string) => {
    const colors = {
      surveyor: 'text-blue-600',
      lawyer: 'text-purple-600',
      estate_agent: 'text-green-600',
      government_official: 'text-red-600',
      chartered_surveyor: 'text-orange-600'
    };
    return colors[type as keyof typeof colors] || 'text-gray-600';
  };

  const getSuccessRate = (credential: VerifierCredential) => {
    if (credential.total_verifications === 0) return 0;
    return (credential.successful_verifications / credential.total_verifications) * 100;
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
        <h2 className="text-2xl font-bold text-gray-900">Verifier Credential Review</h2>
        <div className="flex gap-2">
          {['pending', 'verified', 'rejected'].map(status => (
            <Badge key={status} variant="outline">
              {status}: {credentials.filter(c => c.verification_status === status).length}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credentials List */}
        <div className="lg:col-span-2 space-y-4">
          {credentials.map((credential) => (
            <Card 
              key={credential.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCredential?.id === credential.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedCredential(credential)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Shield className="h-8 w-8 text-blue-500" />
                    <div>
                      <h3 className="font-semibold">
                        {credential.user_profiles?.first_name} {credential.user_profiles?.last_name}
                      </h3>
                      <p className={`text-sm font-medium ${getVerifierTypeColor(credential.verifier_type)}`}>
                        {credential.verifier_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(credential.verification_status)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-gray-400" />
                    <span>{credential.license_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span>License: {credential.license_number}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Expires: {new Date(credential.expiry_date).toLocaleDateString()}</span>
                  </div>

                  {credential.total_verifications > 0 && (
                    <div className="flex items-center gap-2">
                      <TrendUp className="h-4 w-4 text-gray-400" />
                      <span>{getSuccessRate(credential).toFixed(1)}% success rate ({credential.successful_verifications}/{credential.total_verifications})</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-gray-500 mt-3">
                  Applied: {new Date(credential.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}

          {credentials.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No verifier applications</h3>
                <p className="text-gray-500">No pending verifier credential applications to review.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Credential Details */}
        <div className="lg:col-span-1">
          {selectedCredential ? (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Credential Review
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Verifier Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Name:</strong> {selectedCredential.user_profiles?.first_name} {selectedCredential.user_profiles?.last_name}</p>
                    <p><strong>Type:</strong> {selectedCredential.verifier_type.replace('_', ' ')}</p>
                    <p><strong>License:</strong> {selectedCredential.license_number}</p>
                    <p><strong>Authority:</strong> {selectedCredential.issuing_authority}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">License Details</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>License Name:</strong> {selectedCredential.license_name}</p>
                    <p><strong>Issue Date:</strong> {new Date(selectedCredential.issue_date).toLocaleDateString()}</p>
                    <p><strong>Expiry Date:</strong> {new Date(selectedCredential.expiry_date).toLocaleDateString()}</p>
                  </div>
                </div>

                {selectedCredential.total_verifications > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Success Rate</span>
                          <span>{getSuccessRate(selectedCredential).toFixed(1)}%</span>
                        </div>
                        <Progress value={getSuccessRate(selectedCredential)} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-semibold text-blue-600">{selectedCredential.total_verifications}</div>
                          <div className="text-xs">Total</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-semibold text-green-600">{selectedCredential.reputation_score}</div>
                          <div className="text-xs">Reputation</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedCredential.verification_status === 'pending' && (
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
                        onClick={() => handleCredentialDecision(selectedCredential.id, 'verified')}
                        disabled={processing}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify
                      </Button>
                      <Button
                        onClick={() => handleCredentialDecision(selectedCredential.id, 'rejected')}
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

                {selectedCredential.verification_status !== 'pending' && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium text-gray-700">
                      Status: {getStatusBadge(selectedCredential.verification_status)}
                    </p>
                    {selectedCredential.verified_at && (
                      <p className="text-xs text-gray-500 mt-1">
                        Processed: {new Date(selectedCredential.verified_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Credential</h3>
                <p className="text-gray-500">Choose a verifier credential from the list to review details.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
