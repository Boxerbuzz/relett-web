import {
  createTypedSupabaseClient,
  corsHeaders,
  createResponse,
  createCorsResponse,
} from "../shared/supabase-client.ts";

interface UserCreatedPayload {
  id: string;
  email?: string;
  phone?: string;
  created_at: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  user_metadata?: any;
  app_metadata?: any;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return createCorsResponse();
  }

  try {
    const supabase = createTypedSupabaseClient();
    const payload = await req.json();

    const { error: _ } = await supabase.from("user_roles").insert({
      user_id: payload.id,
      role: "user",
    });

    // Create default notification preferences
    const { error: notifError } = await supabase
      .from("notification_preferences")
      .insert({
        user_id: payload.id,
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        notification_types: {
          property_updates: true,
          payment_notifications: true,
          system_announcements: true,
          verification_updates: true,
          investment_opportunities: true,
          auction_notifications: true,
          tokenization_updates: true,
          dividend_alerts: true,
          market_insights: false,
        },
      });

    if (notifError) {
      console.error("Error creating notification preferences:", notifError);
      // Don't fail the entire operation for this
    }

    // Send welcome notification
    const { error: welcomeError } = await supabase
      .from("notifications")
      .insert({
        user_id: payload.id,
        type: "general",
        title: "Welcome to Relett!",
        message:
          "Your account has been created successfully. Complete your profile to get started.",
        metadata: {
          onboarding: true,
          user_created: true,
        },
        action_url: "/profile",
        action_label: "Complete Profile",
      });

    if (welcomeError) {
      console.error("Error sending welcome notification:", welcomeError);
      // Don't fail the entire operation for this
    }

    // Create default account for the user
    const { error: accountError } = await supabase.from("accounts").insert({
      user_id: payload.id,
      amount: 0,
      points: 0,
      currency: "NGN",
      type: "main",
      status: "active",
    });

    if (accountError) {
      console.error("Error creating default account:", accountError);
    }

    console.log("User onboarding completed successfully for:", payload.id);

    await supabase.rpc("process-notification", {
      user_id: payload.id,
      
    });

    await supabase.from("audit_trails").insert({
      user_id: payload.id,
      resource_type: "user_onboarding",
      resource_id: payload.id,
      action: "user_created",
      new_values: {
        profile_created: true,
        notification_preferences_created: true,
        default_account_created: true,
        portfolio_allocations_created: true,
      },
    });

    return createResponse({
      success: true,
      message: "User created and onboarded successfully",
      data: { user_id: payload.id },
    });
  } catch (error) {
    console.error("Error in user-created-webhook:", error);
    return createResponse(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});
