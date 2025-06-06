
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';

declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
}

export function useAnalytics() {
  const { user } = useAuth();

  useEffect(() => {
    // Initialize Google Analytics
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID';
    document.head.appendChild(script);

    const configScript = document.createElement('script');
    configScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'GA_MEASUREMENT_ID', {
        anonymize_ip: true,
        custom_map: {
          'custom_dimension_1': 'user_type'
        }
      });
    `;
    document.head.appendChild(configScript);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(configScript);
    };
  }, []);

  const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        ...parameters,
        user_id: user?.id,
        user_type: user?.user_type
      });
    }
  };

  const trackPageView = (path: string, title?: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: path,
        page_title: title,
        user_id: user?.id
      });
    }
  };

  const trackPropertyView = (propertyId: string, propertyType: string) => {
    trackEvent('property_view', {
      property_id: propertyId,
      property_type: propertyType,
      event_category: 'engagement'
    });
  };

  const trackPropertyInquiry = (propertyId: string, inquiryType: string) => {
    trackEvent('property_inquiry', {
      property_id: propertyId,
      inquiry_type: inquiryType,
      event_category: 'conversion'
    });
  };

  const trackUserRegistration = (userType: string) => {
    trackEvent('sign_up', {
      method: 'email',
      user_type: userType,
      event_category: 'engagement'
    });
  };

  const trackPropertyCreation = (propertyType: string, category: string) => {
    trackEvent('property_creation', {
      property_type: propertyType,
      category: category,
      event_category: 'engagement'
    });
  };

  return {
    trackEvent,
    trackPageView,
    trackPropertyView,
    trackPropertyInquiry,
    trackUserRegistration,
    trackPropertyCreation
  };
}
