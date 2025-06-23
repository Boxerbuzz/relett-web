
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { 
  createTypedSupabaseClient, 
  handleSupabaseError, 
  createSuccessResponse, 
  createErrorResponse,
  createResponse,
  createCorsResponse 
} from '../shared/supabase-client.ts';

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
    return createCorsResponse();
  }

  try {
    const { property_id, user_id, interaction_type, metadata = {}, ip_address, user_agent }: TrackInteractionRequest = await req.json();
    
    if (!property_id || !user_id || !interaction_type) {
      return createResponse(createErrorResponse('property_id, user_id, and interaction_type are required'), 400);
    }

    console.log('Tracking interaction:', { property_id, user_id, interaction_type });

    const supabase = createTypedSupabaseClient();

    // Call the database function to track the interaction
    const { error: trackError } = await supabase.rpc('track_property_interaction', {
      p_property_id: property_id,
      p_user_id: user_id,
      p_interaction_type: interaction_type,
      p_metadata: metadata
    });

    if (trackError) {
      console.error('Error tracking interaction:', trackError);
      return createResponse(handleSupabaseError(trackError), 500);
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

    return createResponse(createSuccessResponse({
      message: 'Interaction tracked successfully',
      interaction_type
    }));

  } catch (error) {
    console.error('Error in track-interaction function:', error);
    return createResponse(handleSupabaseError(error), 500);
  }
});
