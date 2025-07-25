
export const monitoringConfig = {
  googleAnalytics: {
    measurementId: 'GA_MEASUREMENT_ID', // Replace with actual GA4 Measurement ID
    isConfigured: () => !!process.env.VITE_GA_MEASUREMENT_ID,
  },
  sentry: {
    dsn: 'https://your-dsn@sentry.io/project-id', // Replace with actual Sentry DSN
    isConfigured: () => !!process.env.VITE_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: '1.0.0',
  },
};

export const trackingEvents = {
  // Property events
  PROPERTY_VIEW: 'property_view',
  PROPERTY_INQUIRY: 'property_inquiry',
  PROPERTY_FAVORITE: 'property_favorite',
  PROPERTY_SHARE: 'property_share',
  PROPERTY_CREATION: 'property_creation',
  
  // User events
  USER_REGISTRATION: 'sign_up',
  USER_LOGIN: 'login',
  USER_VERIFICATION: 'user_verification',
  
  // Transaction events
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed',
  TOKEN_PURCHASE: 'token_purchase',
  
  // Error events
  VALIDATION_ERROR: 'validation_error',
  UPLOAD_ERROR: 'upload_error',
  API_ERROR: 'api_error',
} as const;

export type TrackingEvent = typeof trackingEvents[keyof typeof trackingEvents];
