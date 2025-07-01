
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, cacheConfig } from '@/lib/queryClient';

interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  is_active: boolean;
  is_verified: boolean;
  verification_status: string;
  created_at: string;
  last_login?: string;
  phone?: string;
}

export function useAdminUsers() {
  const {
    data: users = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: queryKeys.user.all.concat(['admin']),
    queryFn: async (): Promise<AdminUser[]> => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminUser[];
    },
    ...cacheConfig.standard, // 5 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    verified: users.filter(u => u.is_verified).length,
    byRole: users.reduce((acc, user) => {
      acc[user.user_type] = (acc[user.user_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return {
    users,
    stats,
    loading,
    error: queryError?.message || null,
    refetch
  };
}
