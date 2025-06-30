
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

export function useDeviceTracking() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const registerDevice = async () => {
      try {
        const deviceId = localStorage.getItem('device_id') || crypto.randomUUID();
        localStorage.setItem('device_id', deviceId);

        const deviceInfo = {
          device_id: deviceId,
          device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
          device_name: navigator.platform,
          user_agent: navigator.userAgent,
          is_trusted: false
        };

        await supabase.rpc('register_user_device', deviceInfo);

        // Track user activity
        await supabase
          .from('user_activities')
          .insert({
            user_id: user.id,
            activity_type: 'login',
            activity_data: {
              device_id: deviceId,
              platform: navigator.platform,
              timestamp: new Date().toISOString()
            }
          });

      } catch (error) {
        console.error('Error registering device:', error);
      }
    };

    registerDevice();
  }, [user?.id]);
}
