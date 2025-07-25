import React, { Suspense, ComponentType, ReactNode } from 'react';
import { TokenPortfolioSkeleton } from '@/components/ui/tokens-skeleton';

interface LazyComponentLoaderProps {
  children: ReactNode;
  fallback?: ReactNode;
  errorBoundary?: boolean;
}

/**
 * Wrapper component for lazy-loaded components with error boundaries
 */
export const LazyComponentLoader = ({ 
  children, 
  fallback = <TokenPortfolioSkeleton />,
  errorBoundary = true 
}: LazyComponentLoaderProps) => {
  if (errorBoundary) {
    return (
      <ErrorBoundary>
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      </ErrorBoundary>
    );
  }

  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

// Simple error boundary component
class ErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyComponentLoader Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center p-8 text-center">
          <div>
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">
              Failed to load component. Please try refreshing the page.
            </p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component for creating lazy-loaded components with optimization
 */
export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  fallback?: ReactNode
) => {
  return (props: P) => (
    <LazyComponentLoader fallback={fallback}>
      <Component {...props} />
    </LazyComponentLoader>
  );
};