import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Starting expiration job for unpaid bookings...");

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Calculate 4 hours ago
    const fourHoursAgo = new Date();
    fourHoursAgo.setHours(fourHoursAgo.getHours() - 4);

    // Find unpaid rentals older than 4 hours
    const { data: expiredRentals, error: rentalsError } = await supabaseClient
      .from("rentals")
      .select("id, user_id, property_id, status, created_at")
      .in("status", ["pending", "awaiting_payment"])
      .lt("created_at", fourHoursAgo.toISOString());

    if (rentalsError) {
      console.error("Error fetching expired rentals:", rentalsError);
    } else if (expiredRentals && expiredRentals.length > 0) {
      console.log(`Found ${expiredRentals.length} expired rentals to cancel`);

      // Update expired rentals
      const { error: updateRentalsError } = await supabaseClient
        .from("rentals")
        .update({ 
          status: "expired",
          payment_status: "expired" 
        })
        .in("id", expiredRentals.map(r => r.id));

      if (updateRentalsError) {
        console.error("Error updating expired rentals:", updateRentalsError);
      } else {
        console.log(`Successfully expired ${expiredRentals.length} rentals`);
      }
    }

    // Find unpaid reservations older than 4 hours
    const { data: expiredReservations, error: reservationsError } = await supabaseClient
      .from("reservations")
      .select("id, user_id, property_id, status, created_at")
      .in("status", ["pending", "awaiting_payment"])
      .lt("created_at", fourHoursAgo.toISOString());

    if (reservationsError) {
      console.error("Error fetching expired reservations:", reservationsError);
    } else if (expiredReservations && expiredReservations.length > 0) {
      console.log(`Found ${expiredReservations.length} expired reservations to cancel`);

      // Update expired reservations
      const { error: updateReservationsError } = await supabaseClient
        .from("reservations")
        .update({ 
          status: "expired"
        })
        .in("id", expiredReservations.map(r => r.id));

      if (updateReservationsError) {
        console.error("Error updating expired reservations:", updateReservationsError);
      } else {
        console.log(`Successfully expired ${expiredReservations.length} reservations`);
      }
    }

    const totalExpired = (expiredRentals?.length || 0) + (expiredReservations?.length || 0);
    console.log(`Expiration job completed. Total bookings expired: ${totalExpired}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Expired ${totalExpired} unpaid bookings`,
        expired_rentals: expiredRentals?.length || 0,
        expired_reservations: expiredReservations?.length || 0
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Expiration job error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});