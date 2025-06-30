
import { supabase } from '@/integrations/supabase/client';
import { generateDeviceFingerprint } from './deviceFingerprinting';

export class DeviceRegistrationService {
  private static instance: DeviceRegistrationService;
  private initialized = false;

  static getInstance(): DeviceRegistrationService {
    if (!DeviceRegistrationService.instance) {
      DeviceRegistrationService.instance = new DeviceRegistrationService();
    }
    return DeviceRegistrationService.instance;
  }

  async initialize() {
    if (this.initialized) return;
    
    try {
      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await this.registerCurrentDevice();
        }
      });
      
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing device registration service:', error);
    }
  }

  async registerCurrentDevice() {
    try {
      const fingerprint = generateDeviceFingerprint();
      
      const { data, error } = await supabase.rpc('register_user_device', {
        p_device_id: fingerprint.deviceId,
        p_device_type: fingerprint.deviceType,
        p_device_name: fingerprint.deviceName,
        p_user_agent: fingerprint.userAgent,
        p_is_trusted: false
      });

      if (error) {
        console.error('Error registering device:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in registerCurrentDevice:', error);
      return null;
    }
  }

  async checkDeviceTrust(deviceId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('user_devices')
        .select('is_trusted')
        .eq('device_fingerprint', deviceId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking device trust:', error);
        return false;
      }

      return data?.is_trusted || false;
    } catch (error) {
      console.error('Error in checkDeviceTrust:', error);
      return false;
    }
  }
}

// Auto-initialize the service
export const deviceRegistrationService = DeviceRegistrationService.getInstance();
