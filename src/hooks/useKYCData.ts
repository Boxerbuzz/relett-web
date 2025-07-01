
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, cacheConfig } from '@/lib/queryClient';

interface KYCVerification {
  id: string;
  user_id: string;
  full_name: string;
  identity_type: string;
  identity_number: string;
  verification_status: 'pending' | 'verified' | 'rejected' | 'expired';
  created_at: string;
  verified_at?: string;
  expires_at?: string;
  verification_response?: any;
  user?: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

export function useKYCData() {
  const {
    data: verifications = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: [...queryKeys.admin.kyc()],
    queryFn: async (): Promise<KYCVerification[]> => {
      const { data, error } = await supabase
        .from('identity_verifications')
        .select(`
          *,
          users!inner(email, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        user: Array.isArray(item.users) ? item.users[0] : item.users
      })) as KYCVerification[];
    },
    ...cacheConfig.standard, // 5 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const stats = {
    total: verifications.length,
    pending: verifications.filter(v => v.verification_status === 'pending').length,
    verified: verifications.filter(v => v.verification_status === 'verified').length,
    rejected: verifications.filter(v => v.verification_status === 'rejected').length,
  };

  return {
    verifications,
    stats,
    loading,
    error: queryError?.message || null,
    refetch
  };
}
