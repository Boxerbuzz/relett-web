
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

interface TrackInteractionRequest {
  property_id: string;
  user_id: string;
  interaction_type: 'view' | 'like' | 'favorite' | 'share' | 'inquiry' | 'contact';
  metadata?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { property_id, user_id, interaction_type, metadata = {}, ip_address, user_agent }: TrackInteractionRequest = await req.json();
    
    if (!property_id || !user_id || !interaction_type) {
      return new Response(
        JSON.stringify({ error: 'property_id, user_id, and interaction_type are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Tracking interaction:', { property_id, user_id, interaction_type });

    // Call the database function to track the interaction
    const { error: trackError } = await supabase.rpc('track_property_interaction', {
      p_property_id: property_id,
      p_user_id: user_id,
      p_interaction_type: interaction_type,
      p_metadata: metadata
    });

    if (trackError) {
      console.error('Error tracking interaction:', trackError);
      throw trackError;
    }

    // Handle specific interaction types
    switch (interaction_type) {
      case 'view':
        // Insert into property_views table for detailed tracking
        await supabase.from('property_views').insert({
          property_id,
          user_id,
          ip_address,
          user_agent,
          location_data: metadata.location || null,
          device_type: metadata.device_type || null,
          referrer: metadata.referrer || null,
          session_id: metadata.session_id || null,
          view_duration: metadata.view_duration || null
        });
        break;

      case 'like':
        // Insert into property_likes table
        await supabase.from('property_likes').upsert({
          property_id,
          user_id
        }, { onConflict: 'property_id,user_id' });
        break;

      case 'favorite':
        // Insert into property_favorites table
        await supabase.from('property_favorites').upsert({
          property_id,
          user_id,
          list_name: metadata.list_name || 'default',
          notes: metadata.notes || null
        }, { onConflict: 'property_id,user_id' });
        break;

      case 'inquiry':
        // Create notification for property owner
        const { data: property } = await supabase
          .from('properties')
          .select('user_id, title')
          .eq('id', property_id)
          .single();

        if (property && property.user_id !== user_id) {
          await supabase.rpc('create_notification_with_delivery', {
            p_user_id: property.user_id,
            p_type: 'inquiry_responses',
            p_title: 'New Property Inquiry',
            p_message: `Someone is interested in your property "${property.title}"`,
            p_metadata: {
              property_id,
              inquirer_id: user_id,
              interaction_type
            },
            p_action_url: `/properties/${property_id}`,
            p_action_label: 'View Property'
          });
        }
        break;
    }

    console.log('Successfully tracked interaction:', interaction_type);

    return new Response(JSON.stringify({
      success: true,
      message: 'Interaction tracked successfully',
      interaction_type
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in track-interaction function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
