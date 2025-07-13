import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import {
  createTypedSupabaseClient,
  createSuccessResponse,
  createErrorResponse,
  createResponse,
  createCorsResponse,
} from "../shared/supabase-client.ts";
import { systemLogger } from "../shared/system-logger.ts";

interface BookingRecord {
  id: string;
  user_id: string;
  agent_id?: string;
  property_id: string;
  status: string;
  type: "reservation" | "rental" | "inspection";
}

interface BookingNotificationRequest {
  record: BookingRecord;
  old_record?: BookingRecord;
}

interface Property {
  id: string;
  title?: string;
  location?: Record<string, unknown>;
  users?: User;
}

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface NotificationContent {
  title: string;
  getUserMessage: (property: Property) => string;
  getOwnerMessage: (user: User, property: Property) => string;
  getAgentMessage: (user: User, property: Property) => string;
}

async function getPropertyAndOwner(
  propertyId: string,
  supabase: ReturnType<typeof createTypedSupabaseClient>
) {
  const { data: property, error } = await supabase
    .from("properties")
    .select(
      `
      id, title, location,
      users:user_id(id, first_name, last_name, email)
    `
    )
    .eq("id", propertyId)
    .single();

  return { property: property as Property | null, error };
}

async function getUserDetails(
  userId: string,
  supabase: ReturnType<typeof createTypedSupabaseClient>
) {
  const { data: user, error } = await supabase
    .from("users")
    .select("id, first_name, last_name, email")
    .eq("id", userId)
    .single();

  return { user: user as User | null, error };
}

function getNotificationContent(
  record: BookingRecord,
  isStatusChange: boolean = false
): NotificationContent {
  const { type, status, id } = record;
  const maskId = (id: string) => id.slice(0, 6);

  if (isStatusChange) {
    return {
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Status Updated`,
      getUserMessage: (property) =>
        `Your ${type} ${maskId(id)} for "${property.title}" has been ${status}`,
      getOwnerMessage: (user, property) =>
        `Your property "${property.title}" ${type} ${maskId(
          id
        )} is now ${status}`,
      getAgentMessage: (user, property) =>
        `Your property "${property.title}" ${type} ${maskId(
          id
        )} is now ${status}`,
    };
  } else {
    return {
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Request`,
      getUserMessage: (property) =>
        `Your ${type} ${maskId(id)} for "${property.title}" has been submitted`,
      getOwnerMessage: (user, property) =>
        `Your property "${property.title}" has a new ${type} ${maskId(
          id
        )} from ${user.first_name} ${user.last_name}`,
      getAgentMessage: (user, property) =>
        `Your property "${property.title}" has a new ${type} ${maskId(
          id
        )} from ${user.first_name} ${user.last_name}`,
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createCorsResponse();
  }

  try {
    const { record, old_record }: BookingNotificationRequest = await req.json();

    if (!record || !record.user_id || !record.property_id) {
      return createResponse(createErrorResponse("Invalid booking record"), 400);
    }

    systemLogger("[SEND-BOOKING-NOTIFICATION]", { record, old_record });

    const supabase = createTypedSupabaseClient();

    // Determine if this is a status change or new booking
    const isStatusChange = old_record && old_record.status !== record.status;

    // Get property and owner details
    const { property, error: propertyError } = await getPropertyAndOwner(
      record.property_id,
      supabase
    );
    if (propertyError || !property) {
      systemLogger("[SEND-BOOKING-NOTIFICATION]", propertyError);
      return createResponse(createErrorResponse("Property not found"), 404);
    }

    // Get user details
    const { user, error: userError } = await getUserDetails(
      record.user_id,
      supabase
    );
    if (userError || !user) {
      systemLogger("[SEND-BOOKING-NOTIFICATION]", userError);
      return createResponse(createErrorResponse("User not found"), 404);
    }

    const content = getNotificationContent(record, isStatusChange);
    const notificationPromises: Promise<any>[] = [];

    // Notify the user who made the booking
    notificationPromises.push(
      supabase.rpc("create_notification_with_delivery", {
        p_user_id: record.user_id,
        p_type: record.type,
        p_title: content.title,
        p_message: content.getUserMessage(property),
        p_metadata: {
          booking_id: record.id,
          property_id: record.property_id,
          booking_type: record.type,
          status: record.status,
          is_status_change: isStatusChange,
        },
        p_action_url: `/my-bookings/${record.id}`,
        p_action_label: "View Details",
      })
    );

    // Notify the property owner (if different from user)
    if (property.users && property.users.id !== record.user_id) {
      notificationPromises.push(
        supabase.rpc("create_notification_with_delivery", {
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
            is_status_change: isStatusChange,
          },
          p_action_url: `/property-bookings/${record.id}`,
          p_action_label: "Manage Booking",
        })
      );
    }

    // Notify the assigned agent (if any)
    if (
      record.agent_id &&
      record.agent_id !== record.user_id &&
      record.agent_id !== property.users?.id
    ) {
      notificationPromises.push(
        supabase.rpc("create_notification_with_delivery", {
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
            is_status_change: isStatusChange,
          },
          p_action_url: `/agent-bookings/${record.id}`,
          p_action_label: "Manage Booking",
        })
      );
    }

    const results = await Promise.all(notificationPromises);
    const errors = results.filter((result) => result.error);

    if (errors.length > 0) {
      systemLogger("[SEND-BOOKING-NOTIFICATION]", errors);
    }

    systemLogger(
      `Successfully created ${results.length - errors.length}/${
        results.length
      } notifications`
    );

    const response = {
      success: true,
      notifications_sent: results.length - errors.length,
      total_notifications: results.length,
      errors: errors.length > 0 ? errors : undefined,
    };

    return createResponse(createSuccessResponse(response));
  } catch (error) {
    systemLogger("[SEND-BOOKING-NOTIFICATION]", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(
      createErrorResponse("Booking notification failed", errorMessage),
      500
    );
  }
});
