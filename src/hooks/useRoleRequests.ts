
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

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
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserRoleRequests();
    } else {
      setRequests([]);
      setLoading(false);
    }
  }, [user]);

  const fetchUserRoleRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('role_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching role requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch role requests');
    } finally {
      setLoading(false);
    }
  };

  const submitRoleRequest = async (requestedRole: string, reason: string) => {
    try {
      const { data, error } = await supabase
        .from('role_requests')
        .insert({
          user_id: user?.id,
          requested_role: requestedRole,
          current_role: user?.user_type || 'user',
          reason: reason,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      setRequests(prev => [data, ...prev]);
      return { data, error: null };
    } catch (err) {
      console.error('Error submitting role request:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit role request';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

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
    submitRoleRequest,
    getPendingRequest,
    hasActivePendingRequest,
    getLatestRequest,
    refetch: fetchUserRoleRequests
  };
}
