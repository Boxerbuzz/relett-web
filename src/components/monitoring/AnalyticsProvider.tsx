
import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useSentryMonitoring } from '@/hooks/useSentryMonitoring';

interface AnalyticsContextType {
  trackEvent: (eventName: string, parameters?: Record<string, any>) => void;
  trackPageView: (path: string, title?: string) => void;
  trackPropertyView: (propertyId: string, propertyType: string) => void;
  trackPropertyInquiry: (propertyId: string, inquiryType: string) => void;
  trackUserRegistration: (userType: string) => void;
  trackPropertyCreation: (propertyType: string, category: string) => void;
  captureError: (error: Error, context?: Record<string, any>) => void;
  captureMessage: (message: string, level?: 'info' | 'warning' | 'error') => void;
  trackUserAction: (action: string, details?: Record<string, any>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const analytics = useAnalytics();
  const sentry = useSentryMonitoring();

  // Track page views automatically
  useEffect(() => {
    analytics.trackPageView(location.pathname, document.title);
  }, [location.pathname, analytics]);

  const contextValue: AnalyticsContextType = {
    ...analytics,
    captureError: sentry.captureError,
    captureMessage: sentry.captureMessage,
    trackUserAction: sentry.trackUserAction
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalyticsContext() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}
