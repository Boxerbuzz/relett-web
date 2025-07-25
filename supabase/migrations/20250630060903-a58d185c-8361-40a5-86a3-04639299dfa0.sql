
-- Create trigger function to update user verification status when identity verification is approved
CREATE OR REPLACE FUNCTION update_user_verification_on_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if verification status changed to 'verified'
  IF OLD.verification_status IS DISTINCT FROM NEW.verification_status 
     AND NEW.verification_status = 'verified' THEN
    
    -- Update the user's verification status in the users table
    UPDATE users 
    SET 
      verification_status = 'verified',
      is_verified = true,
      updated_at = now()
    WHERE id = NEW.user_id;
    
    -- Also update any user_roles if they exist to reflect verified status
    UPDATE user_roles 
    SET metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('verified_at', now())
    WHERE user_id = NEW.user_id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER trigger_update_user_verification_on_approval
  AFTER UPDATE ON identity_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_user_verification_on_approval();
