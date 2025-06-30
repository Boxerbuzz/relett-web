
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { generateDeviceFingerprint, type DeviceFingerprint } from '@/lib/deviceFingerprinting';

export interface UserDevice {
  id: string;
  user_id: string;
  device_id: string;
  device_type: string;
  device_name: string;
  user_agent: string;
  is_trusted: boolean;
  last_used_at: string;
  created_at: string;
  updated_at: string;
  ip_address: unknown;
  location: any;
}

export function useDeviceManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [devices, setDevices] = useState<UserDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDevice, setCurrentDevice] = useState<DeviceFingerprint | null>(null);

  useEffect(() => {
    if (user) {
      initializeDevice();
      fetchUserDevices();
    }
  }, [user]);

  const initializeDevice = async () => {
    try {
      const fingerprint = generateDeviceFingerprint();
      setCurrentDevice(fingerprint);
      
      // Register this device using the RPC function
      const { data, error } = await supabase.rpc('register_user_device', {
        p_device_id: fingerprint.deviceId,
        p_device_type: fingerprint.deviceType,
        p_device_name: fingerprint.deviceName,
        p_user_agent: fingerprint.userAgent,
        p_is_trusted: false
      });

      if (error) {
        console.error('Error registering device:', error);
      }
    } catch (err) {
      console.error('Error initializing device:', err);
    }
  };

  const fetchUserDevices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_devices')
        .select('*')
        .order('last_used', { ascending: false });

      if (error) throw error;
      
      // Map the database fields to our interface
      const mappedDevices: UserDevice[] = (data || []).map(device => ({
        id: device.id,
        user_id: device.user_id,
        device_id: device.device_fingerprint, // Map device_fingerprint to device_id
        device_type: device.device_type,
        device_name: device.device_name,
        user_agent: device.browser || '', // Map browser to user_agent with fallback
        is_trusted: device.is_trusted,
        last_used_at: device.last_used, // Map last_used to last_used_at
        created_at: device.created_at,
        updated_at: device.created_at, // Use created_at as fallback for updated_at
        ip_address: device.ip_address,
        location: device.location,
      }));
      
      setDevices(mappedDevices);
    } catch (err) {
      console.error('Error fetching devices:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch devices',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const trustDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('user_devices')
        .update({ is_trusted: true })
        .eq('id', deviceId);

      if (error) throw error;
      
      await fetchUserDevices();
      toast({
        title: 'Success',
        description: 'Device has been marked as trusted',
      });
    } catch (err) {
      console.error('Error trusting device:', err);
      toast({
        title: 'Error',
        description: 'Failed to trust device',
        variant: 'destructive',
      });
    }
  };

  const revokeDevice = async (deviceId: string) => {
    try {
      const { error } = await supabase
        .from('user_devices')
        .delete()
        .eq('id', deviceId);

      if (error) throw error;
      
      await fetchUserDevices();
      toast({
        title: 'Success',
        description: 'Device access has been revoked',
      });
    } catch (err) {
      console.error('Error revoking device:', err);
      toast({
        title: 'Error',
        description: 'Failed to revoke device',
        variant: 'destructive',
      });
    }
  };

  return {
    devices,
    loading,
    currentDevice,
    trustDevice,
    revokeDevice,
    refetch: fetchUserDevices,
  };
}
