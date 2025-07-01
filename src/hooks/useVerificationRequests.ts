import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { queryKeys, cacheConfig } from '@/lib/queryClient';

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

export function useVerificationRequests() {
  const { toast } = useToast();

  const {
    data: requests,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: queryKeys.verification.requests(),
    queryFn: async (): Promise<VerificationRequest[]> => {
      const { data, error } = await supabase
        .from('document_verification_requests')
        .select(`
          *,
          property_documents!inner(*),
          users!requested_by(first_name, last_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching verification requests:', error);
        toast({
          title: 'Error',
          description: 'Failed to load verification requests.',
          variant: 'destructive'
        });
        throw error;
      }

      const processedData = (data || []).map(item => ({
        ...item,
        requester: Array.isArray(item.users) ? item.users[0] : item.users
      }));

      return processedData as VerificationRequest[] || [];
    },
    ...cacheConfig.standard, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    requests: requests || [],
    loading,
    error: queryError?.message || null,
    refetch
  };
} 