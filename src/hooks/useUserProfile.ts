import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfileData {
  // Core user data from users table
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  user_type: string;
  avatar: string | null;
  bio: string | null;
  full_name: string | null;
  is_active: boolean | null;
  is_verified: boolean | null;
  verification_status: 'verified' | 'pending' | 'unverified' | 'rejected' | 'expired' | null;
  created_at: string;
  updated_at: string | null;
  has_setup: boolean | null;
  
  // Other fields that might be in the users table
  date_of_birth?: string | null;
  nationality?: string | null;
  state_of_origin?: string | null;
  lga?: string | null;
  middle_name?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  last_login?: string | null;
  address?: any | null;
}

export function useUserProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Fetch user data directly from the consolidated users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;

      setProfile(userData as UserProfileData);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfileData>) => {
    try {
      // All updates go to the users table now
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user?.id);

      if (error) throw error;

      // Refetch the updated profile
      await fetchProfile();
      return { data: profile, error: null };
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const hasRole = (role: string): boolean => {
    return profile?.user_type === role;
  };

  const getPrimaryRole = (): string | null => {
    return profile?.user_type || null;
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    hasRole,
    getPrimaryRole,
    refetch: fetchProfile
  };
}
