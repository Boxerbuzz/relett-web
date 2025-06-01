
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'admin' | 'verifier' | 'agent' | 'landowner' | 'investor';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  is_active: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export function useUserRoles() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchRoles();
    } else {
      setRoles([]);
      setLoading(false);
    }
  }, [user]);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (error) throw error;
      
      setRoles(data || []);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: AppRole): boolean => {
    return roles.some(r => r.role === role && r.is_active && 
      (!r.expires_at || new Date(r.expires_at) > new Date()));
  };

  const getPrimaryRole = (): AppRole | null => {
    const activeRoles = roles.filter(r => r.is_active && 
      (!r.expires_at || new Date(r.expires_at) > new Date()));
    
    // Return highest priority role
    const rolePriority: Record<AppRole, number> = {
      'admin': 1,
      'verifier': 2,
      'agent': 3,
      'landowner': 4,
      'investor': 5
    };

    return activeRoles.reduce((highest, current) => {
      if (!highest) return current.role;
      return rolePriority[current.role] < rolePriority[highest] ? current.role : highest;
    }, null as AppRole | null);
  };

  return {
    roles,
    loading,
    error,
    hasRole,
    getPrimaryRole,
    refetch: fetchRoles
  };
}
