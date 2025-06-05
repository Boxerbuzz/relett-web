
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

interface UserCreatedPayload {
  id: string;
  email: string;
  raw_user_meta_data?: {
    first_name?: string;
    last_name?: string;
    user_type?: string;
    phone?: string;
  };
  created_at: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const userData: UserCreatedPayload = await req.json();
    
    console.log('Processing new user creation:', userData.id);

    // The database trigger handles most defaults, but we can add additional processing here
    
    // Send welcome notification
    await supabase.rpc('create_notification_with_delivery', {
      p_user_id: userData.id,
      p_type: 'general',
      p_title: 'Welcome to Property Platform!',
      p_message: 'Your account has been created successfully. Start exploring properties and investment opportunities.',
      p_metadata: {
        user_creation: true,
        welcome_notification: true
      },
      p_action_url: '/dashboard',
      p_action_label: 'Get Started'
    });

    // Log the user creation event
    await supabase.from('audit_trails').insert({
      user_id: userData.id,
      resource_type: 'user',
      resource_id: userData.id,
      action: 'user_created',
      new_values: {
        email: userData.email,
        created_at: userData.created_at,
        meta_data: userData.raw_user_meta_data
      }
    });

    console.log('Successfully processed user creation for:', userData.id);

    return new Response(JSON.stringify({
      success: true,
      message: 'User defaults created successfully',
      user_id: userData.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing user creation:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
