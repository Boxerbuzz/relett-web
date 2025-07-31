-- Fix the trigger function to set search path
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;