import { useAuth } from "@/lib/auth";

/**
 * Custom hook that provides user cache management functionality
 * This hook extends the useAuth hook with cache-specific operations
 */
export const useUserCache = () => {
  const auth = useAuth();
  
  return {
    ...auth,
    /**
     * Refresh user data by invalidating cache and fetching fresh data
     * Useful when user data has been updated elsewhere
     */
    refreshUserData: auth.refreshUserData,
    
    /**
     * Check if user data is currently being loaded
     */
    isLoading: auth.loading,
    
    /**
     * Get current user data (may be cached)
     */
    user: auth.user,
  };
}; 