
import { useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePropertyInteractions() {
  const { user } = useAuth();
  const { toast } = useToast();

  const trackView = useCallback(async (
    propertyId: string,
    metadata?: {
      viewDuration?: number;
      deviceType?: string;
      sessionId?: string;
      referrer?: string;
    }
  ) => {
    if (!user?.id) return;
    
    try {
      // Insert view record
      const { error } = await supabase
        .from('property_views')
        .insert({
          property_id: propertyId,
          user_id: user.id,
          session_id: metadata?.sessionId || crypto.randomUUID(),
          device_type: metadata?.deviceType || navigator.userAgent,
          referrer: metadata?.referrer || document.referrer,
          view_duration: metadata?.viewDuration || 0,
          pages_viewed: 1
        });

      if (error) throw error;

      // Update property view count
      await supabase.rpc('track_property_interaction', {
        p_property_id: propertyId,
        p_user_id: user.id,
        p_interaction_type: 'view',
        p_metadata: metadata || {}
      });

    } catch (error) {
      console.error('Error tracking property view:', error);
    }
  }, [user?.id]);

  const trackLike = useCallback(async (propertyId: string) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('property_likes')
        .insert({
          property_id: propertyId,
          user_id: user.id
        });

      if (error) throw error;

      await supabase.rpc('track_property_interaction', {
        p_property_id: propertyId,
        p_user_id: user.id,
        p_interaction_type: 'like'
      });

      toast({
        title: 'Property Liked',
        description: 'Property added to your liked properties'
      });

    } catch (error) {
      console.error('Error liking property:', error);
      toast({
        title: 'Error',
        description: 'Failed to like property',
        variant: 'destructive'
      });
    }
  }, [user?.id, toast]);

  const trackFavorite = useCallback(async (
    propertyId: string,
    listName?: string,
    notes?: string
  ) => {
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('property_favorites')
        .insert({
          property_id: propertyId,
          user_id: user.id,
          list_name: listName,
          notes: notes
        });

      if (error) throw error;

      await supabase.rpc('track_property_interaction', {
        p_property_id: propertyId,
        p_user_id: user.id,
        p_interaction_type: 'favorite',
        p_metadata: { list_name: listName, notes }
      });

      toast({
        title: 'Property Saved',
        description: 'Property added to your favorites'
      });

    } catch (error) {
      console.error('Error favoriting property:', error);
      toast({
        title: 'Error',
        description: 'Failed to save property',
        variant: 'destructive'
      });
    }
  }, [user?.id, toast]);

  return {
    trackView,
    trackLike,
    trackFavorite
  };
}
