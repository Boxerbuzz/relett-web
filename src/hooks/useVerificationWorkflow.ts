import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, cacheConfig } from '@/lib/queryClient';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

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

export function useVerificationWorkflow() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch verification requests with React Query
  const {
    data: requests,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['verification-workflow', 'requests'],
    queryFn: async (): Promise<VerificationRequest[]> => {
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
      
      return typedData;
    },
    enabled: !!user,
    ...cacheConfig.standard,
    refetchOnWindowFocus: false,
  });

  // Mutation for updating verification status
  const updateVerificationMutation = useMutation({
    mutationFn: async ({ 
      requestId, 
      status, 
      notes 
    }: { 
      requestId: string; 
      status: 'approved' | 'rejected'; 
      notes?: string 
    }) => {
      // Update the verification request
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
      const request = requests?.find(r => r.id === requestId);
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

      return { requestId, status, notes };
    },
    onSuccess: (data) => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['verification-workflow'] });
      
      toast({
        title: 'Success',
        description: `Document ${data.status} successfully`,
      });
    },
    onError: (error) => {
      console.error('Error updating verification:', error);
      toast({
        title: 'Error',
        description: 'Failed to update verification status',
        variant: 'destructive'
      });
    },
  });

  // Calculate statistics using useMemo for performance
  const stats = {
    totalRequests: requests?.length || 0,
    pendingCount: requests?.filter(r => r.status === 'pending').length || 0,
    completedCount: requests?.filter(r => r.status === 'completed').length || 0,
    get completionRate() {
      return this.totalRequests > 0 ? (this.completedCount / this.totalRequests) * 100 : 0;
    }
  };

  return {
    requests: requests || [],
    stats,
    isLoading,
    error: error?.message || null,
    refetch,
    updateVerificationStatus: updateVerificationMutation.mutate,
    isUpdating: updateVerificationMutation.isPending,
    updateError: updateVerificationMutation.error?.message || null
  };
} 