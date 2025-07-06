
import { createTypedSupabaseClient, corsHeaders, createResponse, createCorsResponse } from '../shared/supabase-client.ts';

interface RentalNotificationPayload {
  rental_id: string;
  status: string;
  previous_status?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  try {
    const supabase = createTypedSupabaseClient();
    const payload = await req.json() as RentalNotificationPayload;
    
    console.log('Processing rental notification:', payload);

    // Get rental details
    const { data: rental, error: rentalError } = await supabase
      .from('rentals')
      .select(`
        *,
        properties!inner(title, user_id),
        users!rentals_user_id_fkey(first_name, last_name, email),
        agents:users!rentals_agent_id_fkey(first_name, last_name, email)
      `)
      .eq('id', payload.rental_id)
      .single();

    if (rentalError || !rental) {
      console.error('Error fetching rental:', rentalError);
      return createResponse({ success: false, error: 'Rental not found' }, 404);
    }

    // Helper function to mask ID
    const maskId = (id: string) => id.slice(0, 6);

    const statusMessages = {
      confirmed: 'has been confirmed',
      approved: 'has been approved', 
      rejected: 'has been rejected',
      cancelled: 'has been cancelled',
      active: 'is now active',
      expired: 'has expired'
    };

    const statusText = statusMessages[payload.status as keyof typeof statusMessages] || 
                      `status has been updated to ${payload.status}`;

    // Notify the tenant (user who made the rental)
    if (rental.user_id) {
      const { error: tenantNotifError } = await supabase
        .from('notifications')
        .insert({
          user_id: rental.user_id,
          type: 'rental',
          title: 'Rental Update',
          message: `Your rental ${maskId(payload.rental_id)} ${statusText} for ${rental.properties.title}`,
          metadata: {
            rental_id: payload.rental_id,
            property_id: rental.property_id,
            status: payload.status,
            previous_status: payload.previous_status
          },
          action_url: `/bookings`,
          action_label: 'View Details'
        });

      if (tenantNotifError) {
        console.error('Error creating tenant notification:', tenantNotifError);
      }
    }

    // Notify the property owner/agent
    if (rental.properties.user_id && rental.properties.user_id !== rental.user_id) {
      const { error: ownerNotifError } = await supabase
        .from('notifications')
        .insert({
          user_id: rental.properties.user_id,
          type: 'rental',
          title: 'Property Rental Update',
          message: `Your property "${rental.properties.title}" rental ${maskId(payload.rental_id)} ${statusText}`,
          metadata: {
            rental_id: payload.rental_id,
            property_id: rental.property_id,
            status: payload.status,
            is_owner_notification: true
          },
          action_url: `/my-properties`,
          action_label: 'View Property'
        });

      if (ownerNotifError) {
        console.error('Error creating owner notification:', ownerNotifError);
      }
    }

    return createResponse({
      success: true,
      message: 'Rental notifications sent successfully'
    });

  } catch (error) {
    console.error('Error in send-rental-notification:', error);
    return createResponse({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});
