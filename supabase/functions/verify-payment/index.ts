import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { reference } = await req.json();

    if (!reference) {
      throw new Error("Payment reference is required");
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
        },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      throw new Error("Payment verification failed");
    }

    const transaction = paystackData.data;

    // Find the payment record (might not exist for token purchases)
    const { data: payment, error: paymentError } = await supabaseClient
      .from("payments")
      .select("*")
      .eq("reference", reference)
      .single();

    // Update payment status if payment record exists
    if (payment && !paymentError) {
      const { error: updateError } = await supabaseClient
        .from("payments")
        .update({
          status: transaction.status === "success" ? "completed" : "failed",
          paid_at: new Date().toISOString(),
          metadata: {
            ...payment.metadata,
            paystack_transaction: transaction,
          },
        })
        .eq("id", payment.id);

      if (updateError) throw updateError;
    }

    if (transaction.status === "success" && payment) {
      // Process based on payment type
      if (payment.related_type === "rentals") {
        // Update rental status
        const { error: rentalError } = await supabaseClient
          .from("rentals")
          .update({
            payment_status: "paid",
            status: "confirmed",
          })
          .eq("id", payment.related_id);

        if (rentalError) throw rentalError;

        // Get rental details for agent commission
        const { data: rental } = await supabaseClient
          .from("rentals")
          .select(
            `
            *,
            property:properties(user_id, title)
          `
          )
          .eq("id", payment.related_id)
          .single();

        if (rental?.property?.user_id) {
          // Calculate agent commission (90% to agent, 10% platform fee)
          const agentAmount = Math.round(
            (transaction.amount / 100) * 0.9 * 100
          ); // Convert back to kobo

          // Credit agent account
          await supabaseClient.from("accounts").upsert(
            {
              user_id: rental.property.user_id,
              type: "main",
              currency: "NGN",
              amount: agentAmount,
              status: "active",
            },
            {
              onConflict: "user_id,type",
              ignoreDuplicates: false,
            }
          );

          // Update existing account if it exists
          await supabaseClient.rpc("update_agent_balance", {
            agent_id: rental.property.user_id,
            amount: agentAmount,
          });

          // Notify agent
          await supabaseClient.functions.invoke("process-notification", {
            body: {
              user_id: rental.property.user_id,
              type: "payment",
              title: "Payment Received",
              message: `You received ₦${(
                agentAmount / 100
              ).toLocaleString()} for rental of ${rental.property.title}`,
              metadata: {
                amount: agentAmount / 100,
                currency: "NGN",
                rental_id: rental.id,
              },
            },
          });
        }
      } else if (payment.related_type === "reservations") {
        // Update reservation status
        const { error: reservationError } = await supabaseClient
          .from("reservations")
          .update({
            status: "confirmed",
          })
          .eq("id", payment.related_id);

        if (reservationError) throw reservationError;

        // Get reservation details for agent commission
        const { data: reservation } = await supabaseClient
          .from("reservations")
          .select(
            `
            *,
            property:properties(user_id, title)
          `
          )
          .eq("id", payment.related_id)
          .single();

        if (reservation?.property?.user_id) {
          // Calculate agent commission (90% to agent, 10% platform fee)
          const agentAmount = Math.round(
            (transaction.amount / 100) * 0.9 * 100
          ); // Convert back to kobo

          // Credit agent account
          await supabaseClient.from("accounts").upsert(
            {
              user_id: reservation.property.user_id,
              type: "main",
              currency: "NGN",
              amount: agentAmount,
              status: "active",
            },
            {
              onConflict: "user_id,type",
              ignoreDuplicates: false,
            }
          );

          // Update existing account if it exists
          await supabaseClient.rpc("update_agent_balance", {
            agent_id: reservation.property.user_id,
            amount: agentAmount,
          });

          // Notify agent
          await supabaseClient.functions.invoke("process-notification", {
            body: {
              user_id: reservation.property.user_id,
              type: "payment",
              title: "Payment Received",
              message: `You received ₦${(
                agentAmount / 100
              ).toLocaleString()} for reservation of ${
                reservation.property.title
              }`,
              metadata: {
                amount: agentAmount / 100,
                currency: "NGN",
                reservation_id: reservation.id,
              },
            },
          });
        }
      } else if (payment.related_type === "wallet_topup") {
        // Update user account balance
        const { error: accountError } = await supabaseClient
          .from("accounts")
          .upsert(
            {
              user_id: payment.user_id,
              type: "wallet",
              currency: "NGN",
              amount: transaction.amount,
              status: "active",
            },
            {
              onConflict: "user_id,type",
              ignoreDuplicates: false,
            }
          );

        if (accountError) throw accountError;
      }
    }

    // Handle token purchase payments
    const { data: tokenPayment, error: tokenPaymentError } = await supabaseClient
      .from("payment_sessions")
      .select("*")
      .eq("session_id", reference)
      .eq("purpose", "token_purchase")
      .single();

    if (!tokenPaymentError && tokenPayment && transaction.status === "success") {
      console.log("Processing token purchase payment...");
      
      // Extract token purchase details from metadata
      const metadata = tokenPayment.metadata as any;
      
      // Call token transfer function
      const { error: transferError } = await supabaseClient.functions.invoke(
        "transfer-hedera-tokens",
        {
          body: {
            tokenId: metadata.tokenized_property_id,
            fromAccountId: Deno.env.get("HEDERA_ACCOUNT_ID"),
            toAccountId: metadata.investor_account_id,
            amount: metadata.token_amount,
            fromPrivateKey: Deno.env.get("HEDERA_PRIVATE_KEY"),
            tokenizedPropertyId: metadata.tokenized_property_id,
            pricePerToken: metadata.token_price_usd,
            paymentReference: reference,
            userId: tokenPayment.user_id,
          },
        }
      );

      if (transferError) {
        console.error("Token transfer failed:", transferError);
        throw new Error("Token transfer failed after payment");
      }

      // Update payment session status
      await supabaseClient
        .from("payment_sessions")
        .update({
          status: "completed",
          metadata: {
            ...tokenPayment.metadata,
            transfer_completed: true,
            transfer_completed_at: new Date().toISOString(),
          },
        })
        .eq("id", tokenPayment.id);

      console.log("Token purchase completed successfully");
    }

    if (transaction.status === "success") {
      // Send success notification to user (for regular payments)
      if (payment) {
        await supabaseClient.functions.invoke("process-notification", {
          body: {
            user_id: payment.user_id,
            type: "payment",
            title: "Payment Successful",
            message: `Your payment of ₦${(
              transaction.amount / 100
            ).toLocaleString()} has been processed successfully.`,
            metadata: {
              amount: transaction.amount / 100,
              currency: transaction.currency,
              reference: reference,
              type: payment.related_type,
            },
          },
        });
      }

      // Send token purchase notification (for token payments)
      if (tokenPayment) {
        await supabaseClient.functions.invoke("process-notification", {
          body: {
            user_id: tokenPayment.user_id,
            type: "investment",
            title: "Token Purchase Successful",
            message: `You have successfully purchased ${tokenPayment.metadata.token_amount} tokens of ${tokenPayment.metadata.property_name}`,
            metadata: {
              amount: transaction.amount / 100,
              currency: transaction.currency,
              reference: reference,
              token_amount: tokenPayment.metadata.token_amount,
              property_name: tokenPayment.metadata.property_name,
            },
          },
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: transaction.status === "success",
        status: transaction.status,
        amount: transaction.amount / 100,
        currency: transaction.currency,
        reference: reference,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Payment verification error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
