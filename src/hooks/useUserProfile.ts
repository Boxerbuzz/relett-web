
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile, UserRole, AppRole } from '@/types/database';

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchRoles();
    } else {
      setProfile(null);
      setRoles([]);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      // Transform the data to match our TypeScript types
      const transformedProfile: UserProfile = {
        ...data,
        address: typeof data.address === 'string'
          ? JSON.parse(data.address)
          : (data.address || {}),
        gender: data.gender as UserProfile['gender']
      };
      
      setProfile(transformedProfile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    }
  };

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (error) throw error;
      
      // Transform the data to match our TypeScript types
      const transformedRoles: UserRole[] = (data || []).map(role => ({
        ...role,
        metadata: typeof role.metadata === 'string'
          ? JSON.parse(role.metadata)
          : (role.metadata || {})
      }));
      
      setRoles(transformedRoles);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;
      
      // Transform the data to match our TypeScript types
      const transformedProfile: UserProfile = {
        ...data,
        address: typeof data.address === 'string'
          ? JSON.parse(data.address)
          : (data.address || {}),
        gender: data.gender as UserProfile['gender']
      };
      
      setProfile(transformedProfile);
      return { data: transformedProfile, error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      return { data: null, error: errorMessage };
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
    profile,
    roles,
    loading,
    error,
    updateProfile,
    hasRole,
    getPrimaryRole,
    refetch: () => {
      fetchProfile();
      fetchRoles();
    }
  };
}
