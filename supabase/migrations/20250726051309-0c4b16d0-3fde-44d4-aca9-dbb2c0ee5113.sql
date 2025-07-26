-- Add ownership_transfer_history column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS ownership_transfer_history jsonb DEFAULT '[]'::jsonb;

-- Update the handle_property_ownership_transfer function to work with the new column
CREATE OR REPLACE FUNCTION public.handle_property_ownership_transfer()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path TO 'public' AS $function$
DECLARE
  previous_owner_id uuid;
BEGIN
  -- Only trigger if user_id (ownership) actually changed
  IF OLD.user_id IS DISTINCT FROM NEW.user_id THEN
    previous_owner_id := OLD.user_id;
    
    -- Update the ownership_transfer_history array
    NEW.ownership_transfer_history := COALESCE(NEW.ownership_transfer_history, '[]'::jsonb) || 
      jsonb_build_object(
        'previousOwner', previous_owner_id,
        'newOwner', NEW.user_id,
        'transferDate', now(),
        'transferType', 'database_update',
        'previousBlockchainHash', OLD.blockchain_hash
      );
    
    -- Log the ownership change in audit trails
    INSERT INTO public.audit_trails (
      user_id,
      resource_type,
      resource_id,
      action,
      old_values,
      new_values,
      created_at
    ) VALUES (
      NEW.user_id,
      'property',
      NEW.id,
      'ownership_transfer',
      jsonb_build_object(
        'previous_owner_id', previous_owner_id,
        'previous_blockchain_hash', OLD.blockchain_hash
      ),
      jsonb_build_object(
        'new_owner_id', NEW.user_id,
        'transfer_timestamp', now()
      ),
      now()
    );
    
    -- Call the ownership transfer edge function asynchronously
    PERFORM net.http_post(
      url := 'https://wossuijahchhtjzphsgh.supabase.co/functions/v1/transfer-property-ownership',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
      ),
      body := jsonb_build_object(
        'propertyId', NEW.id,
        'newOwnerId', NEW.user_id,
        'previousOwnerId', previous_owner_id,
        'transferReason', 'Database ownership change detected',
        'transferType', 'database_update',
        'previousBlockchainHash', OLD.blockchain_hash
      )
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the trigger on properties table for ownership changes
DROP TRIGGER IF EXISTS property_ownership_transfer_trigger ON public.properties;
CREATE TRIGGER property_ownership_transfer_trigger
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_property_ownership_transfer();