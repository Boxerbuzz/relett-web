
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export interface PropertyFavorite {
  id: string;
  property_id: string;
  user_id: string;
  list_name?: string;
  notes?: string;
  created_at: string;
}

export function usePropertyFavorites() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<PropertyFavorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      const { data, error } = await supabase
        .from('property_favorites')
        .select('*')
        .eq('user_id', user?.id || "")
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFavorites(data as PropertyFavorite[] || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast({
        title: 'Error',
        description: 'Failed to load favorite properties',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (propertyId: string, listName?: string, notes?: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('property_favorites')
        .insert({
          user_id: user.id,
          property_id: propertyId,
          list_name: listName,
          notes: notes
        })
        .select()
        .single();

      if (error) throw error;

      setFavorites(prev => [data as PropertyFavorite, ...prev]);
      toast({
        title: 'Added to Favorites',
        description: 'Property has been added to your favorites'
      });

      return data;
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast({
        title: 'Error',
        description: 'Failed to add property to favorites',
        variant: 'destructive'
      });
    }
  };

  const removeFromFavorites = async (propertyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('property_favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.property_id !== propertyId));
      toast({
        title: 'Removed from Favorites',
        description: 'Property has been removed from your favorites'
      });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove property from favorites',
        variant: 'destructive'
      });
    }
  };

  const isFavorite = (propertyId: string) => {
    return favorites.some(fav => fav.property_id === propertyId);
  };

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    refetch: fetchFavorites
  };
}
