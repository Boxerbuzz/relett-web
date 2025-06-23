
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { 
  createTypedSupabaseClient, 
  handleSupabaseError, 
  createSuccessResponse, 
  createErrorResponse,
  createResponse,
  createCorsResponse,
  corsHeaders 
} from '../shared/supabase-client.ts';

interface UpdateDefaultsRequest {
  user_id: string;
  preferences?: {
    email_notifications?: boolean;
    push_notifications?: boolean;
    sms_notifications?: boolean;
    quiet_hours_start?: string;
    quiet_hours_end?: string;
    do_not_disturb?: boolean;
  };
  notification_types?: Record<string, boolean>;
  portfolio_targets?: Record<string, Record<string, { target: number; threshold: number }>>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  try {
    const { user_id, preferences, notification_types, portfolio_targets }: UpdateDefaultsRequest = await req.json();
    
    if (!user_id) {
      return createResponse(createErrorResponse('user_id is required'), 400);
    }

    console.log('Updating user defaults for:', user_id);

    const supabase = createTypedSupabaseClient();

    // Call the database function to update defaults
    const { data, error } = await supabase.rpc('update_user_defaults', {
      p_user_id: user_id,
      p_preferences: preferences || null,
      p_notification_types: notification_types || null,
      p_portfolio_targets: portfolio_targets || null
    });

    if (error) {
      console.error('Error updating user defaults:', error);
      return createResponse(handleSupabaseError(error), 500);
    }

    // Log the update
    await supabase.from('audit_trails').insert({
      user_id: user_id,
      resource_type: 'notification_preferences',
      resource_id: user_id,
      action: 'preferences_updated',
      new_values: {
        preferences,
        notification_types,
        portfolio_targets
      }
    });

    console.log('Successfully updated user defaults for:', user_id);

    return createResponse(createSuccessResponse({
      message: 'User defaults updated successfully'
    }));

  } catch (error) {
    console.error('Error in update-user-defaults function:', error);
    return createResponse(handleSupabaseError(error), 500);
  }
});
