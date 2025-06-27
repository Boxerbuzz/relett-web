
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

export interface ActivityItem {
  id: string;
  user_id: string;
  resource_type: string;
  resource_id: string;
  action: string;
  created_at: string;
  new_values?: any;
  old_values?: any;
}

export function useRecentActivity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentActivity();
    }
  }, [user]);

  const fetchRecentActivity = async () => {
    try {
      const { data, error } = await supabase
        .from('audit_trails')
        .select('*')
        .eq('user_id', user?.id)
        .in('action', ['view', 'like', 'favorite', 'inquiry', 'booking'])
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackActivity = async (resourceType: string, resourceId: string, action: string, metadata?: any) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('audit_trails')
        .insert({
          user_id: user.id,
          resource_type: resourceType,
          resource_id: resourceId,
          action: action,
          new_values: metadata
        });

      if (error) throw error;
      
      // Refresh activities after tracking
      fetchRecentActivity();
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  return {
    activities,
    loading,
    trackActivity,
    refetch: fetchRecentActivity
  };
}
