import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentStatusRequest {
  reference: string;
  bookingId?: string;
  type?: 'rental' | 'reservation';
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

    const { reference, bookingId, type }: PaymentStatusRequest = await req.json();

    if (!reference) {
      throw new Error("Payment reference is required");
    }

    console.log(`[VERIFY-PAYMENT-STATUS] Checking status for reference: ${reference}`);

    // Get payment record from database
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .eq("user_id", user.id) // Ensure user can only check their own payments
      .single();

    if (paymentError || !payment) {
      console.error(`[VERIFY-PAYMENT-STATUS] Payment not found:`, paymentError);
      throw new Error("Payment record not found");
    }

    console.log(`[VERIFY-PAYMENT-STATUS] Found payment:`, {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      type: payment.type
    });

    // If payment is already completed, return success
    if (payment.status === "completed") {
      return new Response(
        JSON.stringify({
          success: true,
          status: "completed",
          payment: {
            id: payment.id,
            reference: payment.reference,
            amount: payment.amount / 100, // Convert from kobo
            currency: payment.currency,
            status: payment.status,
            paid_at: payment.paid_at,
          },
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // If payment is pending, check with Paystack
    if (payment.status === "pending" && payment.provider === "paystack") {
      const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!paystackSecretKey) {
        console.error(`[VERIFY-PAYMENT-STATUS] Paystack secret key not configured`);
        throw new Error("Payment verification not available");
      }

      console.log(`[VERIFY-PAYMENT-STATUS] Verifying with Paystack...`);

      const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      });

      const paystackData = await paystackResponse.json();
      
      console.log(`[VERIFY-PAYMENT-STATUS] Paystack response:`, {
        status: paystackData.status,
        data: paystackData.data ? {
          status: paystackData.data.status,
          amount: paystackData.data.amount,
          reference: paystackData.data.reference
        } : null
      });

      if (paystackData.status && paystackData.data.status === "success") {
        // Payment is successful, trigger verification flow
        try {
          const { error: verifyError } = await supabaseClient.functions.invoke('verify-payment', {
            body: { reference },
          });

          if (verifyError) {
            console.error(`[VERIFY-PAYMENT-STATUS] Verification function error:`, verifyError);
          }
        } catch (verifyErr) {
          console.error(`[VERIFY-PAYMENT-STATUS] Failed to call verify-payment:`, verifyErr);
        }

        return new Response(
          JSON.stringify({
            success: true,
            status: "completed",
            payment: {
              id: payment.id,
              reference: payment.reference,
              amount: paystackData.data.amount / 100, // Convert from kobo
              currency: paystackData.data.currency,
              status: "completed",
              paid_at: paystackData.data.paid_at || new Date().toISOString(),
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      } else if (paystackData.data && paystackData.data.status === "failed") {
        // Update payment status to failed
        await supabaseClient
          .from("payments")
          .update({ status: "failed" })
          .eq("id", payment.id);

        return new Response(
          JSON.stringify({
            success: false,
            status: "failed",
            payment: {
              id: payment.id,
              reference: payment.reference,
              amount: payment.amount / 100,
              currency: payment.currency,
              status: "failed",
            },
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      }
    }

    // Return current status for other cases
    return new Response(
      JSON.stringify({
        success: payment.status === "completed",
        status: payment.status,
        payment: {
          id: payment.id,
          reference: payment.reference,
          amount: payment.amount / 100,
          currency: payment.currency,
          status: payment.status,
          paid_at: payment.paid_at,
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error) {
    console.error("[VERIFY-PAYMENT-STATUS] Error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : "Verification failed",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});