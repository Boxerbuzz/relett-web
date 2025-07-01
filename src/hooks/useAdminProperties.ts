
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, cacheConfig } from '@/lib/queryClient';

interface AdminProperty {
  id: string;
  title: string;
  location: any;
  price: number;
  status: string;
  is_verified: boolean;
  is_tokenized: boolean;
  created_at: string;
  updated_at: string;
  user_id: string;
  views: number;
  user?: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

export function useAdminProperties() {
  const {
    data: properties = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: queryKeys.properties.all.concat(['admin']),
    queryFn: async (): Promise<AdminProperty[]> => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          users!inner(email, first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        ...item,
        user: Array.isArray(item.users) ? item.users[0] : item.users
      })) as AdminProperty[];
    },
    ...cacheConfig.standard, // 5 minutes cache
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const stats = {
    total: properties.length,
    active: properties.filter(p => p.status === 'active').length,
    pending: properties.filter(p => p.status === 'pending').length,
    verified: properties.filter(p => p.is_verified).length,
    tokenized: properties.filter(p => p.is_tokenized).length,
  };

  return {
    properties,
    stats,
    loading,
    error: queryError?.message || null,
    refetch
  };
}
