
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export function usePropertyLikes(propertyId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (propertyId) {
      fetchLikeStatus();
    }
  }, [propertyId, user]);

  const fetchLikeStatus = async () => {
    try {
      // Get total like count
      const { count: totalLikes } = await supabase
        .from('property_likes')
        .select('*', { count: 'exact', head: true })
        .eq('property_id', propertyId);

      setLikeCount(totalLikes || 0);

      // Check if current user has liked
      if (user) {
        const { data: userLike } = await supabase
          .from('property_likes')
          .select('id')
          .eq('property_id', propertyId)
          .eq('user_id', user.id)
          .maybeSingle();

        setIsLiked(!!userLike);
      }
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to like properties',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('property_likes')
          .delete()
          .eq('property_id', propertyId)
          .eq('user_id', user.id);

        if (error) throw error;

        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
        
        toast({
          title: 'Like Removed',
          description: 'Property removed from your liked properties'
        });
      } else {
        // Add like
        const { error } = await supabase
          .from('property_likes')
          .insert({
            property_id: propertyId,
            user_id: user.id
          });

        if (error) throw error;

        setIsLiked(true);
        setLikeCount(prev => prev + 1);
        
        toast({
          title: 'Property Liked',
          description: 'Property added to your liked properties'
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Error',
        description: 'Failed to update like status',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    isLiked,
    likeCount,
    loading,
    toggleLike
  };
}
