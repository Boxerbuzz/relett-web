
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  createTypedSupabaseClient,
  createSuccessResponse, 
  createErrorResponse,
  createResponse,
  createCorsResponse 
} from '../shared/supabase-client.ts';

interface InspectionNotificationRequest {
  inspection_id: string;
  status: string;
  previous_status?: string;
}

interface Inspection {
  id: string;
  property_id: string;
  user_id: string;
  agent_id: string;
  property?: {
    id: string;
    title?: string;
    user_id: string;
  };
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  agent?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface NotificationContent {
  title: string;
  message: string;
  action_url: string;
  action_label: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  try {
    const supabase = createTypedSupabaseClient();
    const { inspection_id, status, previous_status }: InspectionNotificationRequest = await req.json();

    if (!inspection_id || !status) {
      return createResponse(createErrorResponse('Inspection ID and status are required'), 400);
    }

    // Get inspection details with related property and user data
    const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .select(`
        *,
        property:properties(id, title, user_id),
        user:users(id, email, first_name, last_name),
        agent:users!inspections_agent_id_fkey(id, email, first_name, last_name)
      `)
      .eq('id', inspection_id)
      .single();

    if (inspectionError || !inspection) {
      return createResponse(createErrorResponse('Inspection not found'), 404);
    }

    console.log('Processing inspection notification:', inspection_id, status);

    const inspectionData = inspection as Inspection;
    const notifications = [];

    // Notification messages based on status
    const getNotificationContent = (status: string, isForAgent: boolean): NotificationContent => {
      const propertyTitle = inspectionData.property?.title || 'Property';
      const userName = `${inspectionData.user?.first_name || ''} ${inspectionData.user?.last_name || ''}`.trim();
      const agentName = `${inspectionData.agent?.first_name || ''} ${inspectionData.agent?.last_name || ''}`.trim();

      switch (status) {
        case 'pending':
          return isForAgent 
            ? {
                title: 'New Inspection Request',
                message: `${userName} has requested an inspection for ${propertyTitle}`,
                action_url: `/agent/inspections`,
                action_label: 'View Request'
              }
            : {
                title: 'Inspection Request Submitted',
                message: `Your inspection request for ${propertyTitle} has been submitted and is pending approval`,
                action_url: `/properties/${inspectionData.property_id}`,
                action_label: 'View Property'
              };

        case 'confirmed':
          return isForAgent
            ? {
                title: 'Inspection Confirmed',
                message: `Inspection for ${propertyTitle} has been confirmed with ${userName}`,
                action_url: `/agent/inspections`,
                action_label: 'View Details'
              }
            : {
                title: 'Inspection Confirmed',
                message: `Your inspection request for ${propertyTitle} has been confirmed by ${agentName}`,
                action_url: `/properties/${inspectionData.property_id}`,
                action_label: 'View Details'
              };

        case 'completed':
          return isForAgent
            ? {
                title: 'Inspection Completed',
                message: `Inspection for ${propertyTitle} with ${userName} has been marked as completed`,
                action_url: `/agent/inspections`,
                action_label: 'View Details'
              }
            : {
                title: 'Inspection Completed',
                message: `Your inspection for ${propertyTitle} has been completed. Thank you for your interest!`,
                action_url: `/properties/${inspectionData.property_id}`,
                action_label: 'View Property'
              };

        case 'cancelled':
          return isForAgent
            ? {
                title: 'Inspection Cancelled',
                message: `Inspection for ${propertyTitle} with ${userName} has been cancelled`,
                action_url: `/agent/inspections`,
                action_label: 'View Details'
              }
            : {
                title: 'Inspection Cancelled',
                message: `Your inspection request for ${propertyTitle} has been cancelled`,
                action_url: `/properties/${inspectionData.property_id}`,
                action_label: 'View Property'
              };

        default:
          return {
            title: 'Inspection Update',
            message: `Your inspection status has been updated to ${status}`,
            action_url: `/properties/${inspectionData.property_id}`,
            action_label: 'View Details'
          };
      }
    };

    // Send notification to the user (inspection requester)
    if (inspectionData.user_id) {
      const userNotification = getNotificationContent(status, false);
      notifications.push(
        supabase.functions.invoke('process-notification', {
          body: {
            user_id: inspectionData.user_id,
            type: 'property_inspection',
            title: userNotification.title,
            message: userNotification.message,
            metadata: {
              inspection_id,
              property_id: inspectionData.property_id,
              status,
              previous_status
            },
            action_url: userNotification.action_url,
            action_label: userNotification.action_label
          }
        })
      );
    }

    // Send notification to the agent (property owner/agent)
    if (inspectionData.agent_id && inspectionData.agent_id !== inspectionData.user_id) {
      const agentNotification = getNotificationContent(status, true);
      notifications.push(
        supabase.functions.invoke('process-notification', {
          body: {
            user_id: inspectionData.agent_id,
            type: 'property_inspection',
            title: agentNotification.title,
            message: agentNotification.message,
            metadata: {
              inspection_id,
              property_id: inspectionData.property_id,
              status,
              previous_status,
              requester_name: `${inspectionData.user?.first_name || ''} ${inspectionData.user?.last_name || ''}`.trim()
            },
            action_url: agentNotification.action_url,
            action_label: agentNotification.action_label
          }
        })
      );
    }

    const results = await Promise.all(notifications);
    const successCount = results.filter(result => result.error === null).length;

    console.log(`Inspection notification processed: ${successCount}/${results.length} notifications sent`);

    const response = {
      success: true,
      notifications_sent: successCount,
      total_notifications: results.length,
      inspection_id,
      status
    };

    return createResponse(createSuccessResponse(response));

  } catch (error) {
    console.error('Error in inspection notification:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(createErrorResponse('Inspection notification failed', errorMessage), 500);
  }
});
