
import { useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useDefaultsManager } from './useDefaultsManager';

export function useInteractionTracker() {
  const { user } = useAuth();
  const { trackInteraction } = useDefaultsManager();

  const trackPropertyView = useCallback(async (
    propertyId: string,
    metadata?: {
      viewDuration?: number;
      deviceType?: string;
      sessionId?: string;
      location?: any;
    }
  ) => {
    if (!user?.id) return;
    
    return await trackInteraction(propertyId, user.id, 'view', metadata);
  }, [user?.id, trackInteraction]);

  const trackPropertyLike = useCallback(async (propertyId: string) => {
    if (!user?.id) return;
    
    return await trackInteraction(propertyId, user.id, 'like');
  }, [user?.id, trackInteraction]);

  const trackPropertyFavorite = useCallback(async (
    propertyId: string,
    listName?: string,
    notes?: string
  ) => {
    if (!user?.id) return;
    
    return await trackInteraction(propertyId, user.id, 'favorite', {
      list_name: listName,
      notes
    });
  }, [user?.id, trackInteraction]);

  const trackPropertyInquiry = useCallback(async (
    propertyId: string,
    inquiryType?: string,
    message?: string
  ) => {
    if (!user?.id) return;
    
    return await trackInteraction(propertyId, user.id, 'inquiry', {
      inquiry_type: inquiryType,
      message
    });
  }, [user?.id, trackInteraction]);

  const trackPropertyShare = useCallback(async (
    propertyId: string,
    platform?: string
  ) => {
    if (!user?.id) return;
    
    return await trackInteraction(propertyId, user.id, 'share', {
      platform
    });
  }, [user?.id, trackInteraction]);

  const trackPropertyContact = useCallback(async (
    propertyId: string,
    contactMethod?: string
  ) => {
    if (!user?.id) return;
    
    return await trackInteraction(propertyId, user.id, 'contact', {
      contact_method: contactMethod
    });
  }, [user?.id, trackInteraction]);

  return {
    trackPropertyView,
    trackPropertyLike,
    trackPropertyFavorite,
    trackPropertyInquiry,
    trackPropertyShare,
    trackPropertyContact
  };
}
