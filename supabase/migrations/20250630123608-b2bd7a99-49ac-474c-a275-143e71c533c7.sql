
-- Add missing columns to system_notifications table
ALTER TABLE system_notifications ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;
ALTER TABLE system_notifications ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone;

-- Enable RLS on user_devices table if not already enabled
ALTER TABLE user_devices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_devices
CREATE POLICY "Users can view their own devices" 
  ON user_devices 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own devices" 
  ON user_devices 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own devices" 
  ON user_devices 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own devices" 
  ON user_devices 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Admin policy for user_devices management
CREATE POLICY "Admins can manage all devices" 
  ON user_devices 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Enable RLS on system_notifications table if not already enabled
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for system_notifications
CREATE POLICY "Everyone can view active system notifications" 
  ON system_notifications 
  FOR SELECT 
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

CREATE POLICY "Admins can manage system notifications" 
  ON system_notifications 
  FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Create function to clean up expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_system_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE system_notifications 
  SET is_active = false, updated_at = now()
  WHERE is_active = true 
    AND expires_at IS NOT NULL 
    AND expires_at <= now();
END;
$$;

-- Create function to register user device
CREATE OR REPLACE FUNCTION register_user_device(
  p_device_id text,
  p_device_type text,
  p_device_name text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_is_trusted boolean DEFAULT false
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  device_record_id uuid;
BEGIN
  -- Check if device already exists for this user
  SELECT id INTO device_record_id
  FROM user_devices
  WHERE user_id = auth.uid() AND device_id = p_device_id;
  
  IF device_record_id IS NOT NULL THEN
    -- Update existing device
    UPDATE user_devices
    SET 
      last_used_at = now(),
      user_agent = COALESCE(p_user_agent, user_agent),
      device_name = COALESCE(p_device_name, device_name),
      updated_at = now()
    WHERE id = device_record_id;
    
    RETURN device_record_id;
  ELSE
    -- Insert new device
    INSERT INTO user_devices (
      user_id, device_id, device_type, device_name, 
      user_agent, is_trusted, last_used_at
    ) VALUES (
      auth.uid(), p_device_id, p_device_type, p_device_name,
      p_user_agent, p_is_trusted, now()
    ) RETURNING id INTO device_record_id;
    
    RETURN device_record_id;
  END IF;
END;
$$;

-- Enable realtime for system_notifications
ALTER TABLE system_notifications REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE system_notifications;

-- Enable realtime for user_devices
ALTER TABLE user_devices REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE user_devices;
