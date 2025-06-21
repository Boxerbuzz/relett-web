
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RentalNotificationRequest {
  rental_id: string;
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

    const { rental_id, status, previous_status }: RentalNotificationRequest = await req.json()

    if (!rental_id || !status) {
      throw new Error('Rental ID and status are required')
    }

    // Get rental details with related property and user data
    const { data: rental, error: rentalError } = await supabaseClient
      .from('rentals')
      .select(`
        *,
        property:properties(id, title, user_id),
        user:users(id, email, first_name, last_name),
        agent:users!rentals_agent_id_fkey(id, email, first_name, last_name)
      `)
      .eq('id', rental_id)
      .single()

    if (rentalError || !rental) {
      throw new Error('Rental not found')
    }

    console.log('Processing rental notification:', rental_id, status)

    const notifications = []

    // Notification messages based on status
    const getNotificationContent = (status: string, isForAgent: boolean) => {
      const propertyTitle = rental.property?.title || 'Property'
      const userName = `${rental.user?.first_name || ''} ${rental.user?.last_name || ''}`.trim()
      const agentName = `${rental.agent?.first_name || ''} ${rental.agent?.last_name || ''}`.trim()
      const amount = rental.price ? `₦${rental.price.toLocaleString()}` : ''

      switch (status) {
        case 'pending':
          return isForAgent 
            ? {
                title: 'New Rental Request',
                message: `${userName} has submitted a rental request for ${propertyTitle} (${amount})`,
                action_url: `/agent/rentals`,
                action_label: 'Review Request'
              }
            : {
                title: 'Rental Request Submitted',
                message: `Your rental request for ${propertyTitle} has been submitted and is pending approval`,
                action_url: `/properties/${rental.property_id}`,
                action_label: 'View Property'
              }

        case 'approved':
          return isForAgent
            ? {
                title: 'Rental Approved',
                message: `You have approved the rental request for ${propertyTitle} by ${userName}`,
                action_url: `/agent/rentals`,
                action_label: 'View Details'
              }
            : {
                title: 'Rental Request Approved!',
                message: `Great news! Your rental request for ${propertyTitle} has been approved by ${agentName}`,
                action_url: `/properties/${rental.property_id}`,
                action_label: 'View Details'
              }

        case 'rejected':
          return isForAgent
            ? {
                title: 'Rental Rejected',
                message: `You have rejected the rental request for ${propertyTitle} by ${userName}`,
                action_url: `/agent/rentals`,
                action_label: 'View Details'
              }
            : {
                title: 'Rental Request Rejected',
                message: `Unfortunately, your rental request for ${propertyTitle} has been rejected`,
                action_url: `/properties/${rental.property_id}`,
                action_label: 'View Property'
              }

        case 'cancelled':
          return isForAgent
            ? {
                title: 'Rental Cancelled',
                message: `The rental for ${propertyTitle} with ${userName} has been cancelled`,
                action_url: `/agent/rentals`,
                action_label: 'View Details'
              }
            : {
                title: 'Rental Cancelled',
                message: `Your rental for ${propertyTitle} has been cancelled`,
                action_url: `/properties/${rental.property_id}`,
                action_label: 'View Property'
              }

        case 'completed':
          return isForAgent
            ? {
                title: 'Rental Completed',
                message: `The rental period for ${propertyTitle} with ${userName} has been completed`,
                action_url: `/agent/rentals`,
                action_label: 'View Details'
              }
            : {
                title: 'Rental Completed',
                message: `Your rental period for ${propertyTitle} has been completed. Thank you for renting with us!`,
                action_url: `/properties/${rental.property_id}`,
                action_label: 'View Property'
              }

        case 'accepted':
          return isForAgent
            ? {
                title: 'Rental Accepted',
                message: `${userName} has accepted the rental terms for ${propertyTitle}`,
                action_url: `/agent/rentals`,
                action_label: 'View Details'
              }
            : {
                title: 'Rental Terms Accepted',
                message: `You have accepted the rental terms for ${propertyTitle}. Please proceed with payment`,
                action_url: `/properties/${rental.property_id}`,
                action_label: 'View Details'
              }

        case 'signing':
          return isForAgent
            ? {
                title: 'Contract Signing',
                message: `Contract signing is in progress for ${propertyTitle} with ${userName}`,
                action_url: `/agent/rentals`,
                action_label: 'View Details'
              }
            : {
                title: 'Contract Signing',
                message: `Please complete the contract signing process for ${propertyTitle}`,
                action_url: `/properties/${rental.property_id}`,
                action_label: 'Sign Contract'
              }

        case 'payment':
          return isForAgent
            ? {
                title: 'Payment Processing',
                message: `Payment is being processed for ${propertyTitle} rental by ${userName}`,
                action_url: `/agent/rentals`,
                action_label: 'View Details'
              }
            : {
                title: 'Payment Processing',
                message: `Your payment for ${propertyTitle} is being processed`,
                action_url: `/properties/${rental.property_id}`,
                action_label: 'View Details'
              }

        case 'ongoing':
          return isForAgent
            ? {
                title: 'Rental Active',
                message: `The rental for ${propertyTitle} with ${userName} is now active`,
                action_url: `/agent/rentals`,
                action_label: 'View Details'
              }
            : {
                title: 'Rental Active',
                message: `Your rental for ${propertyTitle} is now active. Enjoy your stay!`,
                action_url: `/properties/${rental.property_id}`,
                action_label: 'View Details'
              }

        default:
          return {
            title: 'Rental Update',
            message: `Your rental status has been updated to ${status}`,
            action_url: `/properties/${rental.property_id}`,
            action_label: 'View Details'
          }
      }
    }

    // Send notification to the user (rental requester)
    if (rental.user_id) {
      const userNotification = getNotificationContent(status, false)
      notifications.push(
        supabaseClient.functions.invoke('process-notification', {
          body: {
            user_id: rental.user_id,
            type: 'rental_requests',
            title: userNotification.title,
            message: userNotification.message,
            metadata: {
              rental_id,
              property_id: rental.property_id,
              status,
              previous_status,
              amount: rental.price
            },
            action_url: userNotification.action_url,
            action_label: userNotification.action_label
          }
        })
      )
    }

    // Send notification to the agent (property owner/agent)
    if (rental.agent_id && rental.agent_id !== rental.user_id) {
      const agentNotification = getNotificationContent(status, true)
      notifications.push(
        supabaseClient.functions.invoke('process-notification', {
          body: {
            user_id: rental.agent_id,
            type: 'rental_approvals',
            title: agentNotification.title,
            message: agentNotification.message,
            metadata: {
              rental_id,
              property_id: rental.property_id,
              status,
              previous_status,
              requester_name: `${rental.user?.first_name || ''} ${rental.user?.last_name || ''}`.trim(),
              amount: rental.price
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
        message: 'Rental notifications sent successfully',
        notifications_sent: notifications.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Rental notification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
