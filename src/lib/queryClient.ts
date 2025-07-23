
import { QueryClient } from "@tanstack/react-query";

// Cache configuration
export const cacheConfig = {
  // Standard caching for most data
  standard: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
  },
  // Long-term caching for static data
  longTerm: {
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour (was cacheTime)
  },
  // Short-term caching for dynamic data
  shortTerm: {
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes (was cacheTime)
  },
  // Real-time data (no caching)
  realTime: {
    staleTime: 0,
    gcTime: 0,
  },
};

// Query key factory for consistent key management
export const queryKeys = {
  // User-related queries
  user: {
    profile: (userId?: string) => ["user", "profile", userId],
    inspections: (userId?: string) => ["user", "inspections", userId],
    rentals: (userId?: string) => ["user", "rentals", userId],
    reservations: (userId?: string) => ["user", "reservations", userId],
  },

  // Property-related queries
  properties: {
    all: () => ["properties"],
    list: (filters?: Record<string, any>) => ["properties", "list", filters],
    detail: (propertyId: string) => ["properties", "detail", propertyId],
    search: (query: string, filters?: Record<string, any>) => [
      "properties",
      "search",
      query,
      filters,
    ],
    bookedDates: (propertyId: string) => ["properties", "bookedDates", propertyId],
  },

  // Admin-related queries
  admin: {
    users: () => ["admin", "users"],
    properties: () => ["admin", "properties"],
    kyc: () => ["admin", "kyc"],
  },

  // Investment-related queries
  investments: {
    portfolio: (userId: string) => ["investments", "portfolio", userId],
    opportunities: () => ["investments", "opportunities"],
  },

  // Chat and messaging queries
  chat: {
    conversations: (userId: string) => ["chat", "conversations", userId],
    messages: (conversationId: string) => ["chat", "messages", conversationId],
  },
};

// Create and configure query client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      ...cacheConfig.standard,
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Cache management utilities
export const cacheUtils = {
  // Invalidate all queries for a specific entity
  invalidateEntity: (entity: string) => {
    queryClient.invalidateQueries({ queryKey: [entity] });
  },

  // Clear all cache
  clearAll: () => {
    queryClient.clear();
  },

  // Remove specific query from cache
  removeQuery: (queryKey: any[]) => {
    queryClient.removeQueries({ queryKey });
  },

  // Get cached data
  getQueryData: (queryKey: any[]) => {
    return queryClient.getQueryData(queryKey);
  },

  // Set cached data
  setQueryData: (queryKey: any[], data: any) => {
    queryClient.setQueryData(queryKey, data);
  },
};
