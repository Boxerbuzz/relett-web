import { useCallback, useMemo, useRef } from 'react';
import { debounce } from 'lodash';

/**
 * Custom hook for performance optimization utilities
 * Provides debouncing, memoization, and caching helpers
 */
export const usePerformanceOptimization = () => {
  const cacheRef = useRef<Map<string, any>>(new Map());

  // Debounced function creator
  const createDebouncedFunction = useCallback(
    (fn: (...args: any[]) => void, delay: number = 300) => {
      return debounce(fn, delay);
    },
    []
  );

  // Memoized cache getter
  const getCachedValue = useCallback(
    <T>(key: string, computeFn: () => T, ttl: number = 5 * 60 * 1000): T => {
      const cache = cacheRef.current;
      const cached = cache.get(key);
      
      if (cached && Date.now() - cached.timestamp < ttl) {
        return cached.value;
      }
      
      const value = computeFn();
      cache.set(key, { value, timestamp: Date.now() });
      return value;
    },
    []
  );

  // Clear cache
  const clearCache = useCallback((key?: string) => {
    if (key) {
      cacheRef.current.delete(key);
    } else {
      cacheRef.current.clear();
    }
  }, []);

  // Memoized computation helper
  const memoizeComputation = useCallback(
    <T, Args extends readonly unknown[]>(
      computeFn: (...args: Args) => T,
      dependencies: Args
    ): T => {
      const key = JSON.stringify(dependencies);
      return getCachedValue(key, () => computeFn(...dependencies));
    },
    [getCachedValue]
  );

  // Throttled function creator
  const createThrottledFunction = useCallback(
    (fn: (...args: any[]) => void, delay: number = 100) => {
      let lastCall = 0;
      return (...args: any[]) => {
        const now = Date.now();
        if (now - lastCall >= delay) {
          lastCall = now;
          fn(...args);
        }
      };
    },
    []
  );

  return {
    createDebouncedFunction,
    createThrottledFunction,
    getCachedValue,
    clearCache,
    memoizeComputation,
  };
};

// Hook for optimizing real-time data updates
export const useRealTimeOptimization = () => {
  const bufferRef = useRef<any[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const batchUpdates = useCallback(
    (update: any, processBatch: (updates: any[]) => void, batchSize: number = 10, delay: number = 100) => {
      bufferRef.current.push(update);
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      if (bufferRef.current.length >= batchSize) {
        processBatch([...bufferRef.current]);
        bufferRef.current = [];
      } else {
        timeoutRef.current = setTimeout(() => {
          if (bufferRef.current.length > 0) {
            processBatch([...bufferRef.current]);
            bufferRef.current = [];
          }
        }, delay);
      }
    },
    []
  );

  return { batchUpdates };
};