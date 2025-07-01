
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { queryKeys } from "@/lib/queryClient";

export function useCacheManager() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const invalidateQueries = {
    // Properties
    allProperties: () => queryClient.invalidateQueries({ queryKey: queryKeys.properties.all }),
    userProperties: (userId?: string) => {
      const targetUserId = userId || user?.id;
      if (targetUserId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.properties.userProperties(targetUserId) });
      }
    },
    propertyList: (filters?: Record<string, any>) => {
      if (filters) {
        queryClient.invalidateQueries({ queryKey: queryKeys.properties.list(filters) });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.properties.lists() });
      }
    },
    propertyDetails: (id: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.detail(id) });
    },
    
    // User data
    userProfile: (userId?: string) => {
      const targetUserId = userId || user?.id;
      if (targetUserId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.user.profile(targetUserId) });
      } else {
        queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() });
      }
    },
    userNotifications: (userId?: string) => {
      const targetUserId = userId || user?.id;
      if (targetUserId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.user.notifications(targetUserId) });
      }
    },
    userActivities: (userId?: string) => {
      const targetUserId = userId || user?.id;
      if (targetUserId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.user.activities(targetUserId) });
      }
    },
    
    // Investments
    userInvestments: (userId?: string) => {
      const targetUserId = userId || user?.id;
      if (targetUserId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.investments.portfolio(targetUserId) });
      }
    },

    // Messaging
    userConversations: (userId?: string) => {
      const targetUserId = userId || user?.id;
      if (targetUserId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.messaging.conversations(targetUserId) });
      }
    },
    conversationMessages: (conversationId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messaging.messages(conversationId) });
    },
  };

  const prefetchQueries = {
    // Prefetch property details when hovering over property cards
    propertyDetails: async (id: string) => {
      await queryClient.prefetchQuery({
        queryKey: queryKeys.properties.detail(id),
        queryFn: () => fetch(`/api/properties/${id}`).then(res => res.json()),
        staleTime: 5 * 60 * 1000, // 5 minutes
      });
    },

    // Prefetch user profile data
    userProfile: async (userId: string) => {
      await queryClient.prefetchQuery({
        queryKey: queryKeys.user.profile(userId),
        queryFn: async () => {
          // This would be replaced with actual API call in implementation
          return null;
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
      });
    },
  };

  const optimisticUpdates = {
    // Optimistically update property like status
    togglePropertyLike: (propertyId: string, liked: boolean) => {
      queryClient.setQueryData(
        queryKeys.properties.detail(propertyId),
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            is_liked: liked,
            likes: oldData.likes + (liked ? 1 : -1),
          };
        }
      );
    },
    
    // Optimistically update property views
    incrementPropertyViews: (propertyId: string) => {
      queryClient.setQueryData(
        queryKeys.properties.detail(propertyId),
        (oldData: any) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            views: (oldData.views || 0) + 1,
          };
        }
      );
    },

    // Optimistically update user profile
    updateUserProfile: (updates: Record<string, any>) => {
      if (!user?.id) return;
      
      queryClient.setQueryData(
        queryKeys.user.profile(user.id),
        (oldData: any) => {
          if (!oldData) return oldData;
          return { ...oldData, ...updates };
        }
      );
    },
  };

  const removeFromCache = {
    property: (id: string) => {
      queryClient.removeQueries({ queryKey: queryKeys.properties.detail(id) });
    },
    
    allProperties: () => {
      queryClient.removeQueries({ queryKey: queryKeys.properties.all });
    },

    userData: (userId?: string) => {
      const targetUserId = userId || user?.id;
      if (targetUserId) {
        queryClient.removeQueries({ queryKey: queryKeys.user.profile(targetUserId) });
        queryClient.removeQueries({ queryKey: queryKeys.user.activities(targetUserId) });
      }
    },
  };

  return {
    invalidateQueries,
    prefetchQueries,
    optimisticUpdates,
    removeFromCache,
    queryClient,
  };
}
