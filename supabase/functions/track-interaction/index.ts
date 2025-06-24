import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  createTypedSupabaseClient,
  createSuccessResponse, 
  createErrorResponse,
  createResponse,
  createCorsResponse 
} from '../shared/supabase-client.ts';

interface InteractionRequest {
  user_id: string;
  property_id: string;
  interaction_type: string;
  metadata?: Record<string, unknown>;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
}

interface InteractionResponse {
  success: boolean;
  interaction_id: string;
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  try {
    const {
      user_id,
      property_id,
      interaction_type,
      metadata = {},
      session_id,
      ip_address,
      user_agent
    }: InteractionRequest = await req.json();

    if (!user_id || !property_id || !interaction_type) {
      return createResponse(createErrorResponse('Missing required fields'), 400);
    }

    const supabase = createTypedSupabaseClient();

    // Record the interaction in audit trails
    const { data: auditTrail, error: auditError } = await supabase
      .from('audit_trails')
      .insert({
        user_id,
        resource_type: 'property',
        resource_id: property_id,
        action: interaction_type,
        new_values: metadata,
        session_id,
        ip_address: ip_address ? ip_address : null,
        user_agent
      })
      .select()
      .single();

    if (auditError) {
      console.error('Audit trail error:', auditError);
      return createResponse(createErrorResponse('Failed to record interaction'), 500);
    }

    // Update property counters based on interaction type
    switch (interaction_type) {
      case 'view': {
        await supabase
          .from('properties')
          .update({ views: supabase.sql`COALESCE(views, 0) + 1` })
          .eq('id', property_id);
        break;
      }
      case 'like': {
        await supabase
          .from('properties')
          .update({ likes: supabase.sql`COALESCE(likes, 0) + 1` })
          .eq('id', property_id);
        break;
      }
      case 'favorite': {
        await supabase
          .from('properties')
          .update({ favorites: supabase.sql`COALESCE(favorites, 0) + 1` })
          .eq('id', property_id);
        break;
      }
      case 'inquiry': {
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
      default:
        // Other interaction types don't need special handling
        break;
    }

    const response: InteractionResponse = {
      success: true,
      interaction_id: auditTrail.id,
      message: 'Interaction tracked successfully'
    };

    return createResponse(createSuccessResponse(response));

  } catch (error) {
    console.error('Interaction tracking error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(createErrorResponse('Internal server error', errorMessage), 500);
  }
});
