import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, cacheConfig } from "@/lib/queryClient";

export type AppRole =
  | "admin"
  | "landowner"
  | "verifier"
  | "agent"
  | "investor"
  | "user";

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  is_active: boolean;
  expires_at?: string;
  assigned_at: string;
  assigned_by?: string;
  metadata?: any;
}

export function useUserRoles() {
  const { user } = useAuth();

  const {
    data: roles = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: queryKeys.user.roles(user?.id || ''),
    queryFn: async (): Promise<UserRole[]> => {
      if (!user?.id) {
        console.log("No user ID available for roles query");
        return [];
      }

      console.log("Fetching user roles for:", user.email);

      try {
        // Get user's primary role from users table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("user_type")
          .eq("id", user.id)
          .single();

        if (userError) throw userError;

        // Also fetch any additional roles from user_roles table
        const { data: additionalRoles, error: rolesError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_active", true);

        if (rolesError) throw rolesError;

        // Combine primary role with additional roles
        const allRoles: UserRole[] = [];

        // Add primary role from users table
        if (userData.user_type) {
          allRoles.push({
            id: `primary-${user.id}`,
            user_id: user.id,
            role: userData.user_type as AppRole,
            is_active: true,
            assigned_at: new Date().toISOString(),
            metadata: { primary: true },
          });
        }

        // Add additional roles from user_roles table
        if (additionalRoles) {
          const transformedRoles: UserRole[] = additionalRoles.map((role) => ({
            id: role.id,
            user_id: role.user_id,
            role: role.role as AppRole,
            is_active: role.is_active ?? false,
            expires_at: role.expires_at ?? undefined,
            assigned_at: role.assigned_at,
            assigned_by: role.assigned_by ?? undefined,
            metadata:
              typeof role.metadata === "string"
                ? JSON.parse(role.metadata)
                : role.metadata || {},
          }));
          allRoles.push(...transformedRoles);
        }

        console.log("Successfully fetched user roles:", allRoles);
        return allRoles;
      } catch (err) {
        console.error("Error fetching roles:", err);
        throw err;
      }
    },
    enabled: !!user?.id,
    ...cacheConfig.standard, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const error = queryError?.message || null;

  const hasRole = (role: AppRole): boolean => {
    return roles.some(
      (r) =>
        r.role === role &&
        r.is_active &&
        (!r.expires_at || new Date(r.expires_at) > new Date())
    );
  };

  const getPrimaryRole = (): AppRole | null => {
    const primaryRole = roles.find((r) => r.metadata?.primary === true);
    if (primaryRole) return primaryRole.role;

    const activeRoles = roles.filter(
      (r) =>
        r.is_active && (!r.expires_at || new Date(r.expires_at) > new Date())
    );

    // Return highest priority role
    const rolePriority: Record<AppRole, number> = {
      admin: 1,
      verifier: 2,
      agent: 3,
      landowner: 4,
      investor: 5,
      user: 6,
    };

    return activeRoles.reduce((highest, current) => {
      if (!highest) return current.role;
      return rolePriority[current.role] < rolePriority[highest]
        ? current.role
        : highest;
    }, null as AppRole | null);
  };

  return {
    roles,
    loading,
    error,
    hasRole,
    getPrimaryRole,
    refetch,
  };
}
