
import { useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface PerformanceMetrics {
  routeChangeTime: number;
  cacheHitRate: number;
  totalQueries: number;
  failedQueries: number;
}

export function usePerformanceMonitor() {
  const location = useLocation();

  const trackRouteChange = useCallback((startTime: number) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    // Log performance metrics
    console.log(`Route change to ${location.pathname} took ${duration.toFixed(2)}ms`);
    
    // You can send this to analytics service
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        custom_map: {
          dimension1: duration.toFixed(2),
        },
      });
    }
  }, [location.pathname]);

  const trackCachePerformance = useCallback((metrics: PerformanceMetrics) => {
    // Log cache performance
    console.log('Cache Performance:', metrics);
    
    // Alert if cache hit rate is low
    if (metrics.cacheHitRate < 0.5) {
      console.warn(`Low cache hit rate: ${(metrics.cacheHitRate * 100).toFixed(1)}%`);
    }
  }, []);

  useEffect(() => {
    const startTime = performance.now();
    
    // Track when route change completes
    const timer = setTimeout(() => {
      trackRouteChange(startTime);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, trackRouteChange]);

  const measureAsync = async <T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> => {
    const startTime = performance.now();
    try {
      const result = await operation();
      const endTime = performance.now();
      console.log(`${operationName} completed in ${(endTime - startTime).toFixed(2)}ms`);
      return result;
    } catch (error) {
      const endTime = performance.now();
      console.error(`${operationName} failed after ${(endTime - startTime).toFixed(2)}ms`);
      throw error;
    }
  };

  return {
    trackRouteChange,
    trackCachePerformance,
    measureAsync,
  };
}
