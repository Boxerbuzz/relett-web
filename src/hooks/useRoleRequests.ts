
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, cacheConfig } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: string;
  current_role: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  admin_notes?: string;
}

export function useRoleRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: requests = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: [...queryKeys.admin.roleRequests(), user?.id || ''],
    queryFn: async (): Promise<RoleRequest[]> => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('user_role_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        user_id: item.user_id,
        requested_role: item.requested_role,
        current_role: 'user', // Default since this field doesn't exist in the actual table
        reason: item.reason,
        status: item.status as 'pending' | 'approved' | 'rejected',
        requested_at: item.created_at,
        reviewed_at: item.reviewed_at || undefined,
        reviewed_by: item.reviewed_by || undefined,
        admin_notes: '' // No admin notes field exists in the table
      }));
    },
    enabled: !!user?.id,
    ...cacheConfig.standard,
    refetchOnWindowFocus: false,
  });

  const submitRoleRequestMutation = useMutation({
    mutationFn: async ({ requestedRole, reason }: { requestedRole: string; reason: string }) => {
      if (!user?.id) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_role_requests')
        .insert({
          user_id: user.id,
          requested_role: requestedRole,
          reason: reason,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...queryKeys.admin.roleRequests()] });
      toast({
        title: 'Success',
        description: 'Role request submitted successfully',
      });
    },
    onError: (error) => {
      console.error('Error submitting role request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit role request',
        variant: 'destructive'
      });
    },
  });

  const error = queryError?.message || null;

  const getPendingRequest = (role?: string) => {
    if (!role) {
      return requests.find(req => req.status === 'pending');
    }
    return requests.find(req => req.requested_role === role && req.status === 'pending');
  };

  const hasActivePendingRequest = () => {
    return requests.some(req => req.status === 'pending');
  };

  const getLatestRequest = () => {
    return requests[0] || null;
  };

  return {
    requests,
    loading,
    error,
    submitRoleRequest: submitRoleRequestMutation.mutate,
    isSubmitting: submitRoleRequestMutation.isPending,
    getPendingRequest,
    hasActivePendingRequest,
    getLatestRequest,
    refetch
  };
}
