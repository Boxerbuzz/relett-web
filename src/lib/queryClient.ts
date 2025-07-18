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

// Enhanced query key factories for consistent cache management
export const queryKeys = {
  // Properties
  properties: {
    all: ["properties"] as const,
    lists: () => [...queryKeys.properties.all, "list"] as const,
    list: (filters: Record<string, any>) =>
      [...queryKeys.properties.lists(), filters] as const,
    details: () => [...queryKeys.properties.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.properties.details(), id] as const,
    search: (query: string) =>
      [...queryKeys.properties.all, "search", query] as const,
    userProperties: (userId: string) =>
      [...queryKeys.properties.all, "user", userId] as const,
    featured: () => [...queryKeys.properties.all, "featured"] as const,
  },

  // User data with user-specific keys
  user: {
    all: ["user"] as const,
    profile: (userId?: string) =>
      userId
        ? ([...queryKeys.user.all, "profile", userId] as const)
        : ([...queryKeys.user.all, "profile"] as const),
    preferences: (userId?: string) =>
      userId
        ? ([...queryKeys.user.all, "preferences", userId] as const)
        : ([...queryKeys.user.all, "preferences"] as const),
    notifications: (userId?: string) =>
      userId
        ? ([...queryKeys.user.all, "notifications", userId] as const)
        : ([...queryKeys.user.all, "notifications"] as const),
    activities: (userId: string) =>
      [...queryKeys.user.all, "activities", userId] as const,
    roles: (userId?: string) =>
      userId
        ? ([...queryKeys.user.all, "roles", userId] as const)
        : ([...queryKeys.user.all, "roles"] as const),
    inspections: (userId?: string) => ['user', 'inspections', userId],
    rentals: (userId?: string) => ['user', 'rentals', userId],
    reservations: (userId?: string) => ['user', 'reservations', userId],
  },

  // Notifications
  notifications: {
    all: ["notifications"] as const,
    lists: () => [...queryKeys.notifications.all, "list"] as const,
    list: (userId: string) =>
      [...queryKeys.notifications.lists(), userId] as const,
    preferences: (userId: string) =>
      [...queryKeys.notifications.all, "preferences", userId] as const,
  },

  // Market data (longer cache time)
  market: {
    all: ["market"] as const,
    analytics: () => [...queryKeys.market.all, "analytics"] as const,
    insights: () => [...queryKeys.market.all, "insights"] as const,
  },

  // Investment data
  investments: {
    all: ["investments"] as const,
    portfolio: (userId?: string) =>
      userId
        ? ([...queryKeys.investments.all, "portfolio", userId] as const)
        : ([...queryKeys.investments.all, "portfolio"] as const),
    tracking: (userId?: string) =>
      userId
        ? ([...queryKeys.investments.all, "tracking", userId] as const)
        : ([...queryKeys.investments.all, "tracking"] as const),
    tokenized: (userId?: string) =>
      userId
        ? ([...queryKeys.investments.all, "tokenized", userId] as const)
        : ([...queryKeys.investments.all, "tokenized"] as const),
  },

  // Conversations and messaging
  messaging: {
    all: ["messaging"] as const,
    conversations: (userId: string) =>
      [...queryKeys.messaging.all, "conversations", userId] as const,
    messages: (conversationId: string) =>
      [...queryKeys.messaging.all, "messages", conversationId] as const,
  },

  // Verification requests
  verification: {
    all: ["verification"] as const,
    requests: () => [...queryKeys.verification.all, "requests"] as const,
    detail: (id: string) =>
      [...queryKeys.verification.all, "detail", id] as const,
    stats: () => [...queryKeys.verification.all, "stats"] as const,
    documents: () => [...queryKeys.verification.all, "documents"] as const,
    tasks: () => [...queryKeys.verification.all, "tasks"] as const,
    document_request: () =>
      [...queryKeys.verification.all, "document_verification_request"] as const,
  },

  // Admin specific keys
  admin: {
    all: ["admin"] as const,
    users: () => [...queryKeys.admin.all, "users"] as const,
    properties: () => [...queryKeys.admin.all, "properties"] as const,
    kyc: () => [...queryKeys.admin.all, "kyc"] as const,
    roleRequests: () => [...queryKeys.admin.all, "role-requests"] as const,
    analytics: () => [...queryKeys.admin.all, "analytics"] as const,
  },
};

// Cache configuration by data type
export const cacheConfig = {
  // Frequently changing data (chat, notifications)
  realtime: {
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000, // 2 minutes
  },

  // Standard data (properties, users)
  standard: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },

  // Admin data (needs fresh data more often)
  admin: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  },

  // Analytics data (less frequent updates)
  analytics: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  },

  // Market data (stable data)
  market: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },

  // Static/semi-static data
  static: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Long-lived data
  persistent: {
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};
