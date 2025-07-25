import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, cacheConfig } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  action_url?: string;
  action_label?: string;
  metadata: any;
}

export function useNotifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: notifications = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery({
    queryKey: queryKeys.notifications.list(user?.id || ''),
    queryFn: async (): Promise<Notification[]> => {
      if (!user?.id) {
        console.log('No user ID available for notifications query');
        return [];
      }

      console.log('Fetching notifications for:', user.email);

      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        console.log('Successfully fetched notifications:', data?.length || 0);
        return data as Notification[] || [];
      } catch (err) {
        console.error('Error fetching notifications:', err);
        throw err;
      }
    },
    enabled: !!user?.id,
    ...cacheConfig.realtime, // Cache for 30 seconds since notifications change frequently
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      // Optimistically update the cache
      queryClient.setQueryData(
        queryKeys.notifications.list(user?.id || ''),
        (oldData: Notification[] | undefined) => {
          if (!oldData) return oldData;
          return oldData.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          );
        }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read',
        variant: 'destructive'
      });
    }
  };

  const error = queryError?.message || null;

  return {
    notifications,
    loading,
    error,
    refetch,
    markAsRead
  };
} 