
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface RoleRequest {
  id: string;
  user_id: string;
  requested_role: string;
  status: string;
  experience_years?: number;
  credentials?: string;
  reason: string;
  license_number?: string;
  issuing_authority?: string;
  contact_phone?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export function useRoleRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRoleRequests();
    }
  }, [user]);

  const fetchRoleRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_role_requests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (err) {
      console.error('Error fetching role requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch role requests');
    } finally {
      setLoading(false);
    }
  };

  const submitRoleRequest = async (requestData: Omit<RoleRequest, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('user_role_requests')
        .insert({
          user_id: user?.id,
          status: 'pending',
          ...requestData
        })
        .select()
        .single();

      if (error) throw error;
      
      await fetchRoleRequests(); // Refresh the list
      return data;
    } catch (err) {
      console.error('Error submitting role request:', err);
      throw err;
    }
  };

  return {
    requests,
    loading,
    error,
    submitRoleRequest,
    refetch: fetchRoleRequests
  };
}
