
-- Create database functions for token approval workflow

-- Function to transition token status with proper validation
CREATE OR REPLACE FUNCTION public.update_tokenized_property_status(
  p_tokenized_property_id UUID,
  p_new_status tokenization_status,
  p_admin_notes TEXT DEFAULT NULL,
  p_admin_id UUID DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_status tokenization_status;
  property_owner_id UUID;
BEGIN
  -- Get current status and owner
  SELECT status, lt.owner_id INTO current_status, property_owner_id
  FROM tokenized_properties tp
  JOIN land_titles lt ON tp.land_title_id = lt.id
  WHERE tp.id = p_tokenized_property_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Tokenized property not found';
  END IF;
  
  -- Validate status transitions
  IF current_status = 'draft' AND p_new_status NOT IN ('pending_approval', 'draft') THEN
    RAISE EXCEPTION 'Invalid status transition from draft to %', p_new_status;
  END IF;
  
  IF current_status = 'pending_approval' AND p_new_status NOT IN ('approved', 'draft', 'pending_approval') THEN
    RAISE EXCEPTION 'Invalid status transition from pending_approval to %', p_new_status;
  END IF;
  
  IF current_status = 'approved' AND p_new_status NOT IN ('minted', 'draft') THEN
    RAISE EXCEPTION 'Invalid status transition from approved to %', p_new_status;
  END IF;
  
  -- Update the tokenized property status
  UPDATE tokenized_properties 
  SET 
    status = p_new_status,
    updated_at = now(),
    metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object(
      'last_status_change', now(),
      'last_admin_action', p_admin_id,
      'admin_notes', p_admin_notes
    )
  WHERE id = p_tokenized_property_id;
  
  -- Create audit trail
  INSERT INTO audit_trails (
    user_id,
    resource_type,
    resource_id,
    action,
    old_values,
    new_values,
    created_at
  ) VALUES (
    COALESCE(p_admin_id, auth.uid()),
    'tokenized_property',
    p_tokenized_property_id,
    'status_change',
    jsonb_build_object('old_status', current_status),
    jsonb_build_object(
      'new_status', p_new_status,
      'admin_notes', p_admin_notes,
      'changed_by', COALESCE(p_admin_id, auth.uid())
    ),
    now()
  );
  
  -- Send notification to property owner
  PERFORM create_notification_with_delivery(
    property_owner_id,
    'investment'::notification_type,
    CASE 
      WHEN p_new_status = 'approved' THEN 'Token Approved'
      WHEN p_new_status = 'draft' THEN 'Token Requires Changes'
      ELSE 'Token Status Updated'
    END,
    CASE 
      WHEN p_new_status = 'approved' THEN 'Your tokenization request has been approved and will proceed to minting.'
      WHEN p_new_status = 'draft' THEN 'Your tokenization request requires changes. Please review the admin feedback.'
      ELSE 'Your token status has been updated to: ' || p_new_status
    END,
    jsonb_build_object(
      'tokenized_property_id', p_tokenized_property_id,
      'new_status', p_new_status,
      'admin_notes', p_admin_notes
    ),
    '/tokens/' || p_tokenized_property_id,
    'View Token'
  );
  
  RETURN TRUE;
END;
$$;

-- Function to get pending token approvals for admin dashboard
CREATE OR REPLACE FUNCTION public.get_pending_token_approvals()
RETURNS TABLE (
  id UUID,
  token_name TEXT,
  token_symbol TEXT,
  total_value_usd NUMERIC,
  total_supply TEXT,
  status tokenization_status,
  created_at TIMESTAMP WITH TIME ZONE,
  property_title TEXT,
  property_location TEXT,
  owner_name TEXT,
  owner_email TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    tp.id,
    tp.token_name,
    tp.token_symbol,
    tp.total_value_usd,
    tp.total_supply,
    tp.status,
    tp.created_at,
    p.title as property_title,
    p.location as property_location,
    COALESCE(up.first_name || ' ' || up.last_name, u.email) as owner_name,
    u.email as owner_email
  FROM tokenized_properties tp
  LEFT JOIN properties p ON tp.property_id = p.id
  LEFT JOIN land_titles lt ON tp.land_title_id = lt.id
  LEFT JOIN auth.users u ON lt.owner_id = u.id
  LEFT JOIN user_profiles up ON lt.owner_id = up.user_id
  WHERE tp.status IN ('draft', 'pending_approval')
  ORDER BY tp.created_at DESC;
$$;

-- Add RLS policy for admin access to token approval functions
CREATE POLICY "Admins can manage token approvals"
ON tokenized_properties
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
