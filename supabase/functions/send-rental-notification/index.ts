
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

    const statusMessages = {
      confirmed: 'Your rental application has been confirmed',
      approved: 'Your rental application has been approved',
      rejected: 'Your rental application has been rejected',
      cancelled: 'Your rental has been cancelled',
      active: 'Your rental is now active',
      expired: 'Your rental has expired'
    };

    const message = statusMessages[payload.status as keyof typeof statusMessages] || 
                   `Your rental status has been updated to ${payload.status}`;

    // Notify the tenant
    if (rental.user_id) {
      const { error: tenantNotifError } = await supabase
        .from('notifications')
        .insert({
          user_id: rental.user_id,
          type: 'rental',
          title: 'Rental Update',
          message: `${message} for ${rental.properties.title}`,
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

    // Notify the property owner
    if (rental.properties.user_id && rental.properties.user_id !== rental.user_id) {
      const { error: ownerNotifError } = await supabase
        .from('notifications')
        .insert({
          user_id: rental.properties.user_id,
          type: 'rental',
          title: 'Rental Update',
          message: `Rental status updated to ${payload.status} for your property ${rental.properties.title}`,
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
