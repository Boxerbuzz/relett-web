import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useCacheManager } from "@/hooks/useCacheManager";

// Routes that are likely to be visited next from each route
const ROUTE_PREFETCH_MAP: Record<string, string[]> = {
  "/": ["/marketplace", "/dashboard", "/properties"],
  "/dashboard": ["/marketplace", "/my-properties", "/notifications"],
  "/marketplace": ["/properties", "/map", "/services"],
  "/properties": ["/marketplace", "/bookings"],
  "/my-properties": ["/add-property", "/verification"],
  "/tokens": ["/marketplace", "/investments"],
};

// Cache prefetched routes to avoid redundant prefetching
const PREFETCH_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function RoutePrefetcher() {
  const location = useLocation();
  const { prefetchQueries } = useCacheManager();
  const [prefetchedRoutes, setPrefetchedRoutes] = useState<
    Record<string, number>
  >({});
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentPath = location.pathname;
    const routesToPrefetch = ROUTE_PREFETCH_MAP[currentPath] || [];

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only prefetch if there are routes to prefetch
    if (routesToPrefetch.length === 0) {
      return;
    }

    // Check if we've already prefetched for this route recently
    const now = Date.now();
    const lastPrefetched = prefetchedRoutes[currentPath];

    if (lastPrefetched && now - lastPrefetched < PREFETCH_CACHE_DURATION) {
      console.log(
        `Skipping prefetch for ${currentPath} - already prefetched recently`
      );
      return;
    }

    // Prefetch data for likely next routes after a delay
    timeoutRef.current = setTimeout(() => {
      console.log(
        `Prefetching data for routes from ${currentPath}:`,
        routesToPrefetch
      );

      routesToPrefetch.forEach((route) => {
        // Prefetch route-specific data based on the route
        if (route.includes("/properties")) {
          // Only prefetch if we have the prefetch function available
          if (prefetchQueries?.propertyDetails) {
            prefetchQueries.propertyDetails(route);
            // This would prefetch popular properties in a real implementation
            console.log(`Would prefetch properties data for ${route}`);
          }
        }

        if (route.includes("/marketplace")) {
          console.log(`Would prefetch marketplace data for ${route}`);
        }

        if (route.includes("/dashboard")) {
          console.log(`Would prefetch dashboard data for ${route}`);
        }
      });

      // Mark this route as prefetched
      setPrefetchedRoutes((prev) => ({
        ...prev,
        [currentPath]: now,
      }));
    }, 1000); // Wait 1 second before prefetching

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location.pathname, prefetchQueries, prefetchedRoutes]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return null; // This component doesn't render anything
}
