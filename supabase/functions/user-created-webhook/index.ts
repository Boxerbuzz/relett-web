import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { 
  createTypedSupabaseClient, 
  handleSupabaseError, 
  createSuccessResponse, 
  createResponse,
  createCorsResponse 
} from '../shared/supabase-client.ts';

// Local type definition for the user data we expect
interface UserData {
  id: string;
  email?: string;
  created_at: string;
  first_name?: string;
  last_name?: string;
  user_type?: string;
  phone?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createCorsResponse();
  }

  try {
    const userData: UserData = await req.json();

    console.log("Processing new user creation:", userData.id);

    const supabase = createTypedSupabaseClient();

    // Update users table with metadata from signup
    const fullName = `${userData?.first_name || ""} ${
      userData?.last_name || ""
    }`.trim();

    // Create default notification preferences
    await supabase.from("notification_preferences").insert({
      user_id: userData.id,
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      notification_types: {
        property_updates: true,
        property_verification: true,
        property_viewing: true,
        property_inspection: true,
        payment_notifications: true,
        dividend_alerts: true,
        transaction_alerts: true,
        investment_opportunities: true,
        tokenization_updates: true,
        auction_notifications: true,
        rental_requests: true,
        rental_approvals: true,
        reservation_updates: true,
        chat_messages: true,
        inquiry_responses: true,
        verification_updates: true,
        system_announcements: true,
        market_insights: false,
        purchase_confirmations: true,
        purchase_updates: true,
        delivery_notifications: false,
      },
      quiet_hours_start: "22:00",
      quiet_hours_end: "07:00",
      do_not_disturb: false,
    });

    // Create default account
    await supabase.from("accounts").insert({
      user_id: userData.id,
      type: "wallet",
      amount: 0,
      points: 0,
      currency: "NGN",
      status: "active",
    });

    // Assign default 'user' role
    await supabase.from("user_roles").upsert(
      {
        user_id: userData.id,
        role: "user",
        is_active: true,
      },
      {
        onConflict: "user_id,role",
        ignoreDuplicates: true,
      }
    );

    // Create default portfolio allocations
    await supabase.from("portfolio_allocations").insert([
      {
        user_id: userData.id,
        allocation_type: "property_type",
        category: "residential",
        current_percentage: 0,
        current_value: 0,
        target_percentage: 60,
        rebalance_threshold: 5,
      },
      {
        user_id: userData.id,
        allocation_type: "property_type",
        category: "commercial",
        current_percentage: 0,
        current_value: 0,
        target_percentage: 30,
        rebalance_threshold: 5,
      },
      {
        user_id: userData.id,
        allocation_type: "property_type",
        category: "land",
        current_percentage: 0,
        current_value: 0,
        target_percentage: 10,
        rebalance_threshold: 5,
      },
      {
        user_id: userData.id,
        allocation_type: "location",
        category: "lagos",
        current_percentage: 0,
        current_value: 0,
        target_percentage: 40,
        rebalance_threshold: 5,
      },
      {
        user_id: userData.id,
        allocation_type: "location",
        category: "abuja",
        current_percentage: 0,
        current_value: 0,
        target_percentage: 30,
        rebalance_threshold: 5,
      },
      {
        user_id: userData.id,
        allocation_type: "location",
        category: "other",
        current_percentage: 0,
        current_value: 0,
        target_percentage: 30,
        rebalance_threshold: 5,
      },
    ]);

    await supabase
      .from("users")
      .update({
        full_name: fullName,
        verification_status: "unverified",
        is_active: true,
        is_verified: false,
        has_setup: false,
        has_setup_preference: true,
      })
      .eq("id", userData.id);

    // Send welcome notification
    await supabase.rpc("create_notification_with_delivery", {
      p_user_id: userData.id,
      p_type: "general",
      p_title: "Welcome to Property Platform!",
      p_message:
        "Your account has been created successfully. Start exploring properties and investment opportunities.",
      p_metadata: {
        user_creation: true,
        welcome_notification: true,
      },
      p_action_url: "/dashboard",
      p_action_label: "Get Started",
    });

    // Log the user creation event
    await supabase.from("audit_trails").insert({
      user_id: userData.id,
      resource_type: "user",
      resource_id: userData.id,
      action: "user_created",
      new_values: {
        email: userData.email,
        created_at: userData.created_at,
        meta_data: {
          first_name: userData.first_name,
          last_name: userData.last_name,
          user_type: userData.user_type,
          phone: userData.phone,
        },
      },
    });

    console.log("Successfully processed user creation for:", userData.id);

    return createResponse(createSuccessResponse({
      message: "User defaults created successfully",
      user_id: userData.id,
    }));
  } catch (error) {
    console.error("Error processing user creation:", error);
    return createResponse(handleSupabaseError(error), 500);
  }
});
