
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

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
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { user_id, preferences, notification_types, portfolio_targets }: UpdateDefaultsRequest = await req.json();
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Updating user defaults for:', user_id);

    // Call the database function to update defaults
    const { data, error } = await supabase.rpc('update_user_defaults', {
      p_user_id: user_id,
      p_preferences: preferences || null,
      p_notification_types: notification_types || null,
      p_portfolio_targets: portfolio_targets || null
    });

    if (error) {
      console.error('Error updating user defaults:', error);
      throw error;
    }

    // Log the update
    await supabase.from('audit_trails').insert({
      user_id: user_id,
      resource_type: 'user_preferences',
      resource_id: user_id,
      action: 'preferences_updated',
      new_values: {
        preferences,
        notification_types,
        portfolio_targets
      }
    });

    console.log('Successfully updated user defaults for:', user_id);

    return new Response(JSON.stringify({
      success: true,
      message: 'User defaults updated successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in update-user-defaults function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
