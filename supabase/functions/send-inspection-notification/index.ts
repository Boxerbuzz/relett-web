
import { createTypedSupabaseClient, corsHeaders, createResponse, createCorsResponse } from '../shared/supabase-client.ts';

interface InspectionNotificationPayload {
  inspection_id: string;
  status: string;
  previous_status?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  try {
    const supabase = createTypedSupabaseClient();
    const payload = await req.json() as InspectionNotificationPayload;
    
    console.log('Processing inspection notification:', payload);

    // Get inspection details
    const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .select(`
        *,
        properties!inner(title, user_id),
        users!inspections_user_id_fkey(first_name, last_name, email),
        agents:users!inspections_agent_id_fkey(first_name, last_name, email)
      `)
      .eq('id', payload.inspection_id)
      .single();

    if (inspectionError || !inspection) {
      console.error('Error fetching inspection:', inspectionError);
      return createResponse({ success: false, error: 'Inspection not found' }, 404);
    }

    const statusMessages = {
      confirmed: 'Your inspection has been confirmed',
      completed: 'Your inspection has been completed',
      cancelled: 'Your inspection has been cancelled',
      rescheduled: 'Your inspection has been rescheduled',
      pending: 'Your inspection is pending confirmation'
    };

    const message = statusMessages[payload.status as keyof typeof statusMessages] || 
                   `Your inspection status has been updated to ${payload.status}`;

    // Notify the user who requested the inspection
    if (inspection.user_id) {
      const { error: userNotifError } = await supabase
        .from('notifications')
        .insert({
          user_id: inspection.user_id,
          type: 'inspection',
          title: 'Inspection Update',
          message: `${message} for ${inspection.properties.title}`,
          metadata: {
            inspection_id: payload.inspection_id,
            property_id: inspection.property_id,
            status: payload.status,
            previous_status: payload.previous_status
          },
          action_url: `/bookings`,
          action_label: 'View Details'
        });

      if (userNotifError) {
        console.error('Error creating user notification:', userNotifError);
      }
    }

    // Notify the agent
    if (inspection.agent_id && inspection.agent_id !== inspection.user_id) {
      const { error: agentNotifError } = await supabase
        .from('notifications')
        .insert({
          user_id: inspection.agent_id,
          type: 'inspection',
          title: 'Inspection Update',
          message: `Inspection status updated to ${payload.status} for ${inspection.properties.title}`,
          metadata: {
            inspection_id: payload.inspection_id,
            property_id: inspection.property_id,
            status: payload.status,
            is_agent_notification: true
          },
          action_url: `/agent/inspections`,
          action_label: 'View Details'
        });

      if (agentNotifError) {
        console.error('Error creating agent notification:', agentNotifError);
      }
    }

    return createResponse({
      success: true,
      message: 'Inspection notifications sent successfully'
    });

  } catch (error) {
    console.error('Error in send-inspection-notification:', error);
    return createResponse({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
