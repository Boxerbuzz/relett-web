
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

        // Use correct parameter names for the database function
        await supabase.rpc('register_user_device', {
          p_device_id: deviceId,
          p_device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
          p_device_name: navigator.platform,
          p_user_agent: navigator.userAgent,
          p_is_trusted: false
        });

        console.log('Device registered successfully');
      } catch (error) {
        console.error('Error registering device:', error);
      }
    };

    registerDevice();
  }, [user?.id]);
}
