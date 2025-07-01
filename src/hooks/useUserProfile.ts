
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, cacheConfig } from "@/lib/queryClient";

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
  verification_status:
    | "verified"
    | "pending"
    | "unverified"
    | "rejected"
    | "expired"
    | null;
  created_at: string;
  updated_at: string | null;
  has_setup: boolean | null;

  // Other fields that might be in the users table
  date_of_birth?: string | null;
  nationality?: string | null;
  state_of_origin?: string | null;
  lga?: string | null;
  middle_name?: string | null;
  gender?: "male" | "female" | "other" | null;
  last_login?: string | null;
  address?: any | null;
}

export function useUserProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: async () => {
      if (!user?.id) return null;

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (userError) throw userError;
      return userData as UserProfileData;
    },
    enabled: !!user?.id,
    ...cacheConfig.standard, // Cache for 5 minutes
    staleTime: 10 * 60 * 1000, // Keep profile fresh for 10 minutes
  });

  const updateProfile = async (updates: Partial<UserProfileData>) => {
    if (!user?.id) throw new Error("User not authenticated");

    try {
      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;

      // Optimistically update the cache
      queryClient.setQueryData(
        queryKeys.user.profile(),
        (oldData: UserProfileData | null | undefined) => {
          if (!oldData) return oldData;
          return { ...oldData, ...updates };
        }
      );

      // Invalidate and refetch to ensure consistency
      await queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
      
      return { data: profile, error: null };
    } catch (err) {
      console.error("Error updating profile:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      return { data: null, error: errorMessage };
    }
  };

  const hasRole = (role: string): boolean => {
    return profile?.user_type === role;
  };

  const getPrimaryRole = (): string | null => {
    return profile?.user_type || null;
  };

  const error = queryError?.message || null;

  return {
    profile,
    loading,
    error,
    updateProfile,
    hasRole,
    getPrimaryRole,
    refetch,
  };
}
