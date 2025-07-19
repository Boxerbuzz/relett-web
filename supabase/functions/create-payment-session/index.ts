// deno-lint-ignore-file no-explicit-any
import { serve } from "std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.47.6";
import { systemLogger } from "../shared/system-logger.ts";
import { Database } from "../types/database.types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface PaymentSessionRequest {
  type: "rental" | "reservation";
  bookingId: string;
  amount: number;
  currency?: string;
  metadata?: Record<string, any>;
  agentId?: string;
  propertyId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient<Database>(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Authorization header missing");

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user) {
      systemLogger("[PAYMENT-SESSION-ERROR]", userError);
      throw new Error("Invalid or expired token");
    }

    // Parse request body
    let requestBody: PaymentSessionRequest;
    try {
      requestBody = await req.json();
      systemLogger("[PAYMENT-SESSION-DEBUG]", requestBody);
    } catch (parseError) {
      systemLogger("[PAYMENT-SESSION-ERROR]", parseError);
      throw new Error(`Invalid JSON in request body: ${parseError}`);
    }

    const {
      type,
      bookingId,
      amount,
      currency = "NGN",
      metadata = {},
      agentId = "",
      propertyId = "",
    } = requestBody;

    // Validate required fields
    if (!type || !bookingId || amount === undefined || amount === null) {
      throw new Error("Missing required fields: type, bookingId, amount");
    }

    // Validate field types
    if (typeof type !== "string" || !["rental", "reservation"].includes(type)) {
      throw new Error("Invalid type. Must be 'rental' or 'reservation'");
    }

    if (typeof bookingId !== "string" || bookingId.trim() === "") {
      throw new Error("Invalid bookingId. Must be a non-empty string");
    }

    if (typeof amount !== "number" || amount <= 0) {
      throw new Error("Invalid amount. Must be a positive number");
    }

    const paymentReference = `${type}_${bookingId}_${Date.now()}`;
    const paymentAmount = Math.round(amount * 100); // Convert to kobo

    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        amount: paymentAmount,
        agent_id: agentId,
        property_id: propertyId,
        currency,
        type: "initial",
        related_id: bookingId,
        related_type: type,
        status: "pending",
        method: "card",
        provider: "paystack",
        reference: paymentReference,
        metadata: {
          ...metadata,
          booking_id: bookingId,
          user_email: user.email,
        },
      })
      .select()
      .single();

    if (paymentError) {
      systemLogger("[PAYMENT-SESSION-ERROR]", paymentError);
      throw new Error("Failed to create payment record");
    }

    const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!paystackSecretKey) {
      throw new Error("Paystack secret key not configured");
    }

    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: paymentAmount,
          reference: paymentReference,
          currency,
          metadata: {
            user_id: user.id,
            booking_id: bookingId,
            type,
            ...metadata,
          },
          callback_url: `${req.headers.get("origin")}/bookings?payment=success`,
          channels: [
            "card",
            "bank",
            "ussd",
            "qr",
            "mobile_money",
            "bank_transfer",
          ],
        }),
      }
    );

    const paystackData = await paystackResponse.json();
    if (!paystackData.status) {
      systemLogger("[PAYMENT-SESSION-ERROR]", paystackData);
      throw new Error(paystackData.message || "Failed to initialize payment");
    }

    const paymentUrl = paystackData.data.authorization_url;

    const bookingTable = type === "rental" ? "rentals" : "reservations";
    const { error: bookingUpdateError } = await supabase
      .from(bookingTable)
      .update({
        payment_url: paymentUrl,
        payment_reference: paymentReference,
        status: "awaiting_payment",
      })
      .eq("id", bookingId);

    if (bookingUpdateError) {
      systemLogger("[PAYMENT-SESSION-ERROR]", bookingUpdateError);
    }

    await supabase
      .from("payments")
      .update({ link: paymentUrl })
      .eq("id", payment.id);

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: paymentUrl,
        payment_reference: paymentReference,
        payment_id: payment.id,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (err) {
    // Better error logging
    const errorMessage = err instanceof Error ? err.message : String(err);
    const errorStack = err instanceof Error ? err.stack : undefined;

    systemLogger("[PAYMENT-SESSION-ERROR]", {
      message: errorMessage,
      stack: errorStack,
      error: err,
    });

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage || "Internal server error",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
});
