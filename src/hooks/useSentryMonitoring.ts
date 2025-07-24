
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';

interface SentryConfig {
  dsn?: string;
  environment?: string;
  release?: string;
}

interface SentryUser {
  id: string;
  email?: string;
  username?: string;
}

// Console-based error tracking for development
class ConsoleErrorTracker {
  static init(config: SentryConfig) {
    console.log('Error tracking initialized with config:', config);
  }

  static setUser(user: SentryUser) {
    console.log('User context set:', user);
  }

  static captureException(error: Error, context?: Record<string, any>) {
    console.error('Error captured:', error, context);
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    console[level](`Message captured:`, message);
  }

  static setTag(key: string, value: string) {
    console.log(`Tag set: ${key} = ${value}`);
  }

  static setContext(key: string, context: Record<string, any>) {
    console.log(`Context set: ${key}`, context);
  }

  static addBreadcrumb(breadcrumb: {
    message: string;
    category?: string;
    level?: string;
    data?: Record<string, any>;
  }) {
    console.log('Breadcrumb added:', breadcrumb);
  }
}

export function useSentryMonitoring() {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize error tracking
    ConsoleErrorTracker.init({
      dsn: 'console-tracker',
      environment: process.env.NODE_ENV || 'development',
      release: '1.0.0'
    });

    // Set user context when available
    if (user) {
      ConsoleErrorTracker.setUser({
        id: user.id,
        email: user.email,
        username: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email
      });

      ConsoleErrorTracker.setTag('user_type', user.user_type || user.role || 'unknown');
    }
  }, [user]);

  const captureError = (error: Error, context?: Record<string, any>) => {
    ConsoleErrorTracker.captureException(error, context);
  };

  const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info') => {
    ConsoleErrorTracker.captureMessage(message, level);
  };

  const setTag = (key: string, value: string) => {
    ConsoleErrorTracker.setTag(key, value);
  };

  const setContext = (key: string, context: Record<string, any>) => {
    ConsoleErrorTracker.setContext(key, context);
  };

  const addBreadcrumb = (message: string, category?: string, data?: Record<string, any>) => {
    ConsoleErrorTracker.addBreadcrumb({
      message,
      category,
      data,
      level: 'info'
    });
  };

  const trackPropertyError = (propertyId: string, error: Error, action: string) => {
    setContext('property_context', {
      property_id: propertyId,
      action,
      timestamp: new Date().toISOString()
    });
    captureError(error);
  };

  const trackUserAction = (action: string, details?: Record<string, any>) => {
    addBreadcrumb(
      `User action: ${action}`,
      'user_action',
      { ...details, user_id: user?.id }
    );
  };

  const trackPerformance = (metric: string, value: number, unit: string = 'ms') => {
    addBreadcrumb(
      `Performance: ${metric}`,
      'performance',
      { metric, value, unit }
    );
  };

  return {
    captureError,
    captureMessage,
    setTag,
    setContext,
    addBreadcrumb,
    trackPropertyError,
    trackUserAction,
    trackPerformance
  };
}
