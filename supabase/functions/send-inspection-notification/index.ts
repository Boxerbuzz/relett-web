
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InspectionNotificationRequest {
  inspection_id: string;
  status: string;
  previous_status?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { inspection_id, status, previous_status }: InspectionNotificationRequest = await req.json()

    if (!inspection_id || !status) {
      throw new Error('Inspection ID and status are required')
    }

    // Get inspection details with related property and user data
    const { data: inspection, error: inspectionError } = await supabaseClient
      .from('inspections')
      .select(`
        *,
        property:properties(id, title, user_id),
        user:users(id, email, first_name, last_name),
        agent:users!inspections_agent_id_fkey(id, email, first_name, last_name)
      `)
      .eq('id', inspection_id)
      .single()

    if (inspectionError || !inspection) {
      throw new Error('Inspection not found')
    }

    console.log('Processing inspection notification:', inspection_id, status)

    const notifications = []

    // Notification messages based on status
    const getNotificationContent = (status: string, isForAgent: boolean) => {
      const propertyTitle = inspection.property?.title || 'Property'
      const userName = `${inspection.user?.first_name || ''} ${inspection.user?.last_name || ''}`.trim()
      const agentName = `${inspection.agent?.first_name || ''} ${inspection.agent?.last_name || ''}`.trim()

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
                action_url: `/properties/${inspection.property_id}`,
                action_label: 'View Property'
              }

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
                action_url: `/properties/${inspection.property_id}`,
                action_label: 'View Details'
              }

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
                action_url: `/properties/${inspection.property_id}`,
                action_label: 'View Property'
              }

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
                action_url: `/properties/${inspection.property_id}`,
                action_label: 'View Property'
              }

        default:
          return {
            title: 'Inspection Update',
            message: `Your inspection status has been updated to ${status}`,
            action_url: `/properties/${inspection.property_id}`,
            action_label: 'View Details'
          }
      }
    }

    // Send notification to the user (inspection requester)
    if (inspection.user_id) {
      const userNotification = getNotificationContent(status, false)
      notifications.push(
        supabaseClient.functions.invoke('process-notification', {
          body: {
            user_id: inspection.user_id,
            type: 'property_inspection',
            title: userNotification.title,
            message: userNotification.message,
            metadata: {
              inspection_id,
              property_id: inspection.property_id,
              status,
              previous_status
            },
            action_url: userNotification.action_url,
            action_label: userNotification.action_label
          }
        })
      )
    }

    // Send notification to the agent (property owner/agent)
    if (inspection.agent_id && inspection.agent_id !== inspection.user_id) {
      const agentNotification = getNotificationContent(status, true)
      notifications.push(
        supabaseClient.functions.invoke('process-notification', {
          body: {
            user_id: inspection.agent_id,
            type: 'property_inspection',
            title: agentNotification.title,
            message: agentNotification.message,
            metadata: {
              inspection_id,
              property_id: inspection.property_id,
              status,
              previous_status,
              requester_name: `${inspection.user?.first_name || ''} ${inspection.user?.last_name || ''}`.trim()
            },
            action_url: agentNotification.action_url,
            action_label: agentNotification.action_label
          }
        })
      )
    }

    // Wait for all notifications to be sent
    await Promise.all(notifications)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Inspection notifications sent successfully',
        notifications_sent: notifications.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Inspection notification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
