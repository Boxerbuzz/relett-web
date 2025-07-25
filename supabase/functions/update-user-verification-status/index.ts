
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { 
  createTypedSupabaseClient, 
  handleSupabaseError, 
  createSuccessResponse, 
  createErrorResponse,
  createResponse,
  createCorsResponse 
} from '../shared/supabase-client.ts';
import { Database } from "../types/database.types.ts";

// Use the actual schema from the database types
type IdentityVerificationData = Database["public"]["Tables"]["identity_verifications"]["Row"];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createCorsResponse();
  }

  try {
    const verificationData: IdentityVerificationData = await req.json();

    console.log("Processing identity verification submission:", {
      user_id: verificationData.user_id,
      verification_id: verificationData.id,
      identity_type: verificationData.identity_type,
      full_name: verificationData.full_name
    });

    if (!verificationData.user_id) {
      return createResponse(createErrorResponse('user_id is required'), 400);
    }

    const supabase = createTypedSupabaseClient();

    // Update user verification status to pending
    const { error: updateError } = await supabase
      .from("users")
      .update({
        verification_status: "pending",
        updated_at: new Date().toISOString()
      })
      .eq("id", verificationData.user_id);

    if (updateError) {
      console.error("Error updating user verification status:", updateError);
      return createResponse(handleSupabaseError(updateError), 500);
    }

    // Create notification for user about verification submission
    await supabase.rpc("create_notification_with_delivery", {
      p_user_id: verificationData.user_id,
      p_type: "verification_updates",
      p_title: "Identity Verification Submitted",
      p_message: `Your ${verificationData.identity_type?.toUpperCase()} verification for ${verificationData.full_name} has been submitted and is now under review. You'll be notified once the review is complete.`,
      p_metadata: {
        verification_submission: true,
        verification_id: verificationData.id,
        identity_type: verificationData.identity_type,
        identity_number: verificationData.identity_number,
        full_name: verificationData.full_name,
      },
      p_action_url: "/profile/verification",
      p_action_label: "View Status",
    });

    // Log the verification status update
    await supabase.from("audit_trails").insert({
      user_id: verificationData.user_id,
      resource_type: "user_verification",
      resource_id: verificationData.id,
      action: "verification_status_updated",
      old_values: {
        verification_status: "unverified"
      },
      new_values: {
        verification_status: "pending",
        verification_id: verificationData.id,
        identity_type: verificationData.identity_type,
        identity_number: verificationData.identity_number,
        full_name: verificationData.full_name,
        verification_provider: verificationData.verification_provider,
      },
    });

    console.log("Successfully updated verification status to pending for user:", verificationData.user_id);

    return createResponse(createSuccessResponse({
      message: "User verification status updated to pending",
      user_id: verificationData.user_id,
      verification_status: "pending",
      identity_type: verificationData.identity_type
    }));

  } catch (error) {
    console.error("Error in update-user-verification-status function:", error);
    return createResponse(handleSupabaseError(error), 500);
  }
});
