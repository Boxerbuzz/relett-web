import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentSessionRequest {
  type: 'rental' | 'reservation';
  bookingId: string;
  amount: number;
  currency: string;
  metadata: Record<string, any>;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header missing");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error("Invalid or expired token");
    }

    const { type, bookingId, amount, currency, metadata }: PaymentSessionRequest = await req.json();

    if (!type || !bookingId || !amount) {
      throw new Error("Missing required fields: type, bookingId, amount");
    }

    // Generate payment reference
    const paymentReference = `${type}_${bookingId}_${Date.now()}`;

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .insert({
        user_id: user.id,
        amount: Math.round(amount * 100), // Convert to kobo
        currency: currency || "NGN",
        type: type,
        related_id: bookingId,
        related_type: type === 'rental' ? 'rentals' : 'reservations',
        status: "pending",
        method: "card",
        provider: "paystack",
        reference: paymentReference,
        metadata: {
          ...metadata,
          booking_id: bookingId,
          user_email: user.email
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Payment creation error:", paymentError);
      throw new Error("Failed to create payment record");
    }

    // Create Paystack payment session
    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(amount * 100), // Convert to kobo
        reference: paymentReference,
        currency: currency || "NGN",
        metadata: {
          user_id: user.id,
          booking_id: bookingId,
          type: type,
          ...metadata
        },
        callback_url: `${req.headers.get("origin")}/bookings?payment=success`,
        channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"]
      }),
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error("Paystack initialization failed:", paystackData);
      throw new Error(paystackData.message || "Failed to initialize payment");
    }

    const paymentUrl = paystackData.data.authorization_url;

    // Update booking record with payment URL
    const table = type === 'rental' ? 'rentals' : 'reservations';
    const { error: updateError } = await supabaseClient
      .from(table)
      .update({
        payment_url: paymentUrl,
        payment_reference: paymentReference,
        status: "awaiting_payment"
      })
      .eq("id", bookingId);

    if (updateError) {
      console.error("Booking update error:", updateError);
      // Continue even if booking update fails - payment URL is still valid
    }

    // Also update payment record with URL
    await supabaseClient
      .from("payments")
      .update({
        link: paymentUrl
      })
      .eq("id", payment.id);

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: paymentUrl,
        payment_reference: paymentReference,
        payment_id: payment.id
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("Payment session creation error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});