
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";

export function useCacheManager() {
  const queryClient = useQueryClient();

  const invalidateQueries = {
    // Properties
    allProperties: () => queryClient.invalidateQueries({ queryKey: queryKeys.properties.all }),
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
    userProfile: () => queryClient.invalidateQueries({ queryKey: queryKeys.user.profile() }),
    userNotifications: () => queryClient.invalidateQueries({ queryKey: queryKeys.user.notifications() }),
    
    // Investments
    userInvestments: () => queryClient.invalidateQueries({ queryKey: queryKeys.investments.all }),
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
  };

  const removeFromCache = {
    property: (id: string) => {
      queryClient.removeQueries({ queryKey: queryKeys.properties.detail(id) });
    },
    
    allProperties: () => {
      queryClient.removeQueries({ queryKey: queryKeys.properties.all });
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
