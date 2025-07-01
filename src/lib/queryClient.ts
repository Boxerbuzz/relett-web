import { QueryClient } from "@tanstack/react-query";

// Create optimized query client with smart caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes before considering it stale
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Keep unused data in cache for 10 minutes (renamed from cacheTime)
      gcTime: 10 * 60 * 1000, // 10 minutes
      
      // Only retry once to avoid excessive network requests
      retry: 1,
      
      // Don't refetch on window focus for better UX
      refetchOnWindowFocus: false,
      
      // Don't refetch on mount if data is still fresh
      refetchOnMount: false,
      
      // Refetch on reconnect for data consistency
      refetchOnReconnect: true,
      
      // Enable background refetching
      refetchInterval: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query key factories for consistent cache management
export const queryKeys = {
  // Properties
  properties: {
    all: ['properties'] as const,
    lists: () => [...queryKeys.properties.all, 'list'] as const,
    list: (filters: Record<string, any>) => [...queryKeys.properties.lists(), filters] as const,
    details: () => [...queryKeys.properties.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.properties.details(), id] as const,
    search: (query: string) => [...queryKeys.properties.all, 'search', query] as const,
  },
  
  // User data
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    preferences: () => [...queryKeys.user.all, 'preferences'] as const,
    notifications: () => [...queryKeys.user.all, 'notifications'] as const,
  },
  
  // Market data (longer cache time)
  market: {
    all: ['market'] as const,
    analytics: () => [...queryKeys.market.all, 'analytics'] as const,
    insights: () => [...queryKeys.market.all, 'insights'] as const,
  },
  
  // Investment data
  investments: {
    all: ['investments'] as const,
    portfolio: () => [...queryKeys.investments.all, 'portfolio'] as const,
    tracking: () => [...queryKeys.investments.all, 'tracking'] as const,
  },
};

// Cache configuration by data type
export const cacheConfig = {
  // Frequently changing data
  realtime: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes (renamed from cacheTime)
  },
  
  // Standard data
  standard: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
  },
  
  // Static/semi-static data
  static: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours (renamed from cacheTime)
  },
  
  // Long-lived data
  persistent: {
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days (renamed from cacheTime)
  },
};
