
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

interface BookingRecord {
  id: string;
  user_id: string;
  agent_id?: string;
  property_id: string;
  status: string;
  type: 'reservation' | 'rental' | 'inspection';
}

async function getPropertyAndOwner(propertyId: string) {
  const { data: property, error } = await supabase
    .from('properties')
    .select(`
      id, title, location,
      users:user_id(id, first_name, last_name, email)
    `)
    .eq('id', propertyId)
    .single();

  return { property, error };
}

async function getUserDetails(userId: string) {
  const { data: user, error } = await supabase
    .from('users')
    .select('id, first_name, last_name, email')
    .eq('id', userId)
    .single();

  return { user, error };
}

function getNotificationContent(record: BookingRecord, isStatusChange: boolean = false) {
  const { type, status } = record;
  
  if (isStatusChange) {
    return {
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Status Updated`,
      getUserMessage: (property: any) => `Your ${type} for "${property.title}" has been ${status}`,
      getOwnerMessage: (user: any, property: any) => `${user.first_name} ${user.last_name}'s ${type} for "${property.title}" is now ${status}`,
      getAgentMessage: (user: any, property: any) => `${type} by ${user.first_name} ${user.last_name} for "${property.title}" is now ${status}`
    };
  } else {
    return {
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Request`,
      getUserMessage: (property: any) => `Your ${type} request for "${property.title}" has been submitted`,
      getOwnerMessage: (user: any, property: any) => `New ${type} request from ${user.first_name} ${user.last_name} for "${property.title}"`,
      getAgentMessage: (user: any, property: any) => `New ${type} request from ${user.first_name} ${user.last_name} for "${property.title}"`
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record, old_record } = await req.json();
    
    if (!record || !record.user_id || !record.property_id) {
      return new Response(
        JSON.stringify({ error: 'Invalid booking record' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing booking notification:', record.id, record.type);

    // Determine if this is a status change or new booking
    const isStatusChange = old_record && old_record.status !== record.status;
    
    // Get property and owner details
    const { property, error: propertyError } = await getPropertyAndOwner(record.property_id);
    if (propertyError || !property) {
      console.error('Property not found:', propertyError);
      return new Response(
        JSON.stringify({ error: 'Property not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user details
    const { user, error: userError } = await getUserDetails(record.user_id);
    if (userError || !user) {
      console.error('User not found:', userError);
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const content = getNotificationContent(record, isStatusChange);
    const notificationPromises = [];

    // Notify the user who made the booking
    notificationPromises.push(
      supabase.rpc('create_notification_with_delivery', {
        p_user_id: record.user_id,
        p_type: record.type,
        p_title: content.title,
        p_message: content.getUserMessage(property),
        p_metadata: {
          booking_id: record.id,
          property_id: record.property_id,
          booking_type: record.type,
          status: record.status,
          is_status_change: isStatusChange
        },
        p_action_url: `/my-bookings/${record.id}`,
        p_action_label: 'View Details'
      })
    );

    // Notify the property owner (if different from user)
    if (property.users && property.users.id !== record.user_id) {
      notificationPromises.push(
        supabase.rpc('create_notification_with_delivery', {
          p_user_id: property.users.id,
          p_type: record.type,
          p_title: content.title,
          p_message: content.getOwnerMessage(user, property),
          p_metadata: {
            booking_id: record.id,
            property_id: record.property_id,
            booking_type: record.type,
            status: record.status,
            user_id: record.user_id,
            is_status_change: isStatusChange
          },
          p_action_url: `/property-bookings/${record.id}`,
          p_action_label: 'Manage Booking'
        })
      );
    }

    // Notify the assigned agent (if any)
    if (record.agent_id && record.agent_id !== record.user_id && record.agent_id !== property.users?.id) {
      notificationPromises.push(
        supabase.rpc('create_notification_with_delivery', {
          p_user_id: record.agent_id,
          p_type: record.type,
          p_title: content.title,
          p_message: content.getAgentMessage(user, property),
          p_metadata: {
            booking_id: record.id,
            property_id: record.property_id,
            booking_type: record.type,
            status: record.status,
            user_id: record.user_id,
            is_status_change: isStatusChange
          },
          p_action_url: `/agent-bookings/${record.id}`,
          p_action_label: 'Manage Booking'
        })
      );
    }

    const results = await Promise.all(notificationPromises);
    const errors = results.filter(result => result.error);
    
    if (errors.length > 0) {
      console.error('Some notifications failed:', errors);
    }

    console.log(`Successfully created ${results.length - errors.length}/${results.length} notifications`);

    return new Response(JSON.stringify({
      success: true,
      notifications_sent: results.length - errors.length,
      total_notifications: results.length,
      errors: errors.length > 0 ? errors : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-booking-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
