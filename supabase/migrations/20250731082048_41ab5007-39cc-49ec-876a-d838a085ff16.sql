-- Add new statuses to tokenization_status enum
ALTER TYPE tokenization_status ADD VALUE IF NOT EXISTS 'creating';
ALTER TYPE tokenization_status ADD VALUE IF NOT EXISTS 'creation_failed';

-- Create database function to trigger Hedera token creation
CREATE OR REPLACE FUNCTION trigger_hedera_token_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger if status changed to 'approved'
  IF OLD.status IS DISTINCT FROM NEW.status AND NEW.status = 'approved' THEN
    -- Call the edge function asynchronously
    PERFORM net.http_post(
      url := 'https://wossuijahchhtjzphsgh.supabase.co/functions/v1/create-hedera-token',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'tokenizedPropertyId', NEW.id
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic token creation
DROP TRIGGER IF EXISTS auto_create_hedera_token ON tokenized_properties;
CREATE TRIGGER auto_create_hedera_token
  AFTER UPDATE ON tokenized_properties
  FOR EACH ROW
  EXECUTE FUNCTION trigger_hedera_token_creation();

-- Fix existing approved tokens without Hedera IDs
UPDATE tokenized_properties 
SET status = 'approved', updated_at = now()
WHERE status = 'approved' 
  AND (hedera_token_id IS NULL OR hedera_token_id = '');