
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

export interface UserProfileData {
  // From users table
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
  verification_status: string | null;
  created_at: string;
  updated_at: string | null;
  
  // From user_profiles table
  date_of_birth?: string | null;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    address_line?: string;
  } | null;
  nationality?: string | null;
  state_of_origin?: string | null;
  lga?: string | null;
  middle_name?: string | null;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say' | null;
  last_login?: string | null;
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
      // Fetch from users table (main user data)
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;

      // Fetch from user_profiles table (additional profile data)
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle(); // Use maybeSingle since profile might not exist yet

      // Combine the data
      const combinedProfile: UserProfileData = {
        ...userData,
        // Add profile data if it exists
        date_of_birth: profileData?.date_of_birth,
        address: typeof profileData?.address === 'string'
          ? JSON.parse(profileData.address)
          : (profileData?.address || null),
        nationality: profileData?.nationality,
        state_of_origin: profileData?.state_of_origin,
        lga: profileData?.lga,
        middle_name: profileData?.middle_name,
        gender: profileData?.gender,
        last_login: profileData?.last_login,
      };

      setProfile(combinedProfile);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfileData>) => {
    try {
      // Separate updates for users table and user_profiles table
      const userUpdates: any = {};
      const profileUpdates: any = {};

      // Fields that go to users table
      if (updates.first_name !== undefined) userUpdates.first_name = updates.first_name;
      if (updates.last_name !== undefined) userUpdates.last_name = updates.last_name;
      if (updates.phone !== undefined) userUpdates.phone = updates.phone;
      if (updates.avatar !== undefined) userUpdates.avatar = updates.avatar;
      if (updates.bio !== undefined) userUpdates.bio = updates.bio;

      // Fields that go to user_profiles table
      if (updates.date_of_birth !== undefined) profileUpdates.date_of_birth = updates.date_of_birth;
      if (updates.address !== undefined) profileUpdates.address = updates.address;
      if (updates.nationality !== undefined) profileUpdates.nationality = updates.nationality;
      if (updates.state_of_origin !== undefined) profileUpdates.state_of_origin = updates.state_of_origin;
      if (updates.lga !== undefined) profileUpdates.lga = updates.lga;
      if (updates.middle_name !== undefined) profileUpdates.middle_name = updates.middle_name;
      if (updates.gender !== undefined) profileUpdates.gender = updates.gender;

      // Update users table if there are user updates
      if (Object.keys(userUpdates).length > 0) {
        const { error: userError } = await supabase
          .from('users')
          .update(userUpdates)
          .eq('id', user?.id);

        if (userError) throw userError;
      }

      // Update user_profiles table if there are profile updates
      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: user?.id,
            ...profileUpdates
          });

        if (profileError) throw profileError;
      }

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
