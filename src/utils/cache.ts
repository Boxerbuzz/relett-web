import { User as AppUser } from "@/types";

// Cache interface for user data
export interface UserCache {
  data: AppUser;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Global cache for user data
const userCache = new Map<string, UserCache>();

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Cache utility functions
export const isCacheValid = (cache: UserCache): boolean => {
  return Date.now() - cache.timestamp < cache.ttl;
};

export const getUserFromCache = (userId: string): AppUser | null => {
  const cached = userCache.get(userId);
  if (cached && isCacheValid(cached)) {
    console.log("User data retrieved from cache for:", userId);
    return cached.data;
  }
  return null;
};

export const setUserInCache = (userId: string, userData: AppUser): void => {
  userCache.set(userId, {
    data: userData,
    timestamp: Date.now(),
    ttl: CACHE_TTL,
  });
  console.log("User data cached for:", userId);
};

export const invalidateUserCache = (userId: string): void => {
  userCache.delete(userId);
  console.log("User cache invalidated for:", userId);
};

export const clearAllUserCache = (): void => {
  userCache.clear();
  console.log("All user cache cleared");
};
