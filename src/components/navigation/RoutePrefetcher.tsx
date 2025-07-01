
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCacheManager } from '@/hooks/useCacheManager';

// Routes that are likely to be visited next from each route
const ROUTE_PREFETCH_MAP: Record<string, string[]> = {
  '/': ['/marketplace', '/dashboard', '/properties'],
  '/dashboard': ['/marketplace', '/my-properties', '/notifications'],
  '/marketplace': ['/properties', '/map', '/services'],
  '/properties': ['/marketplace', '/bookings'],
  '/my-properties': ['/add-property', '/verification'],
  '/tokens': ['/marketplace', '/investments'],
};

export function RoutePrefetcher() {
  const location = useLocation();
  const { prefetchQueries } = useCacheManager();

  useEffect(() => {
    const currentPath = location.pathname;
    const routesToPrefetch = ROUTE_PREFETCH_MAP[currentPath] || [];

    // Prefetch data for likely next routes
    const prefetchTimer = setTimeout(() => {
      routesToPrefetch.forEach(route => {
        // Prefetch route-specific data based on the route
        if (route.includes('/properties')) {
          // Prefetch popular properties
          // This would be implemented based on your API structure
        }
      });
    }, 1000); // Wait 1 second before prefetching

    return () => clearTimeout(prefetchTimer);
  }, [location.pathname, prefetchQueries]);

  return null; // This component doesn't render anything
}
