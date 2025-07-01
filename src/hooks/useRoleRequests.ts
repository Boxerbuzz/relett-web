
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
        .from('user_role_requests')
        .select('*')
        .eq('user_id', user?.id || "")
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = data?.map(item => ({
        id: item.id,
        user_id: item.user_id,
        requested_role: item.requested_role,
        current_role: 'user', // Default since this field doesn't exist in the actual table
        reason: item.reason,
        status: item.status as 'pending' | 'approved' | 'rejected',
        requested_at: item.created_at,
        reviewed_at: item.reviewed_at,
        reviewed_by: item.reviewed_by,
        admin_notes: '' // No admin notes field exists in the table, so use empty string
      })) || [];
      
      setRequests(transformedData as RoleRequest[]);
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
        .from('user_role_requests')
        .insert({
          user_id: user?.id || "",
          requested_role: requestedRole,
          reason: reason,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Transform and add to requests
      const transformedData: RoleRequest = {
        id: data.id,
        user_id: data.user_id,
        requested_role: data.requested_role,
        current_role: 'user', // Default since this field doesn't exist in the actual table
        reason: data.reason,
        status: data.status as 'pending' | 'approved' | 'rejected',
        requested_at: data.created_at,
        reviewed_at: data.reviewed_at || undefined,
        reviewed_by: data.reviewed_by || undefined,
        admin_notes: '' // No admin notes field exists in the table, so use empty string
      };
      
      setRequests(prev => [transformedData, ...prev]);
      return { data: transformedData, error: null };
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
