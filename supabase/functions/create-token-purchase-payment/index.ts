import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createAuthenticatedClient,
  createSuccessResponse,
  createErrorResponse,
  createResponse,
  createCorsResponse,
} from "../shared/supabase-client.ts";

interface TokenPurchaseRequest {
  tokenizedPropertyId: string;
  tokenAmount: number;
  investorAccountId: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createCorsResponse();
  }

  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabaseClient = createAuthenticatedClient(authHeader);

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) {
      return createResponse(createErrorResponse("Unauthorized"), 401);
    }

    const { tokenizedPropertyId, tokenAmount, investorAccountId }: TokenPurchaseRequest =
      await req.json();

    // Validate required fields
    if (!tokenizedPropertyId || !tokenAmount || !investorAccountId) {
      return createResponse(
        createErrorResponse("Missing required fields: tokenizedPropertyId, tokenAmount, investorAccountId"),
        400
      );
    }

    // Get tokenized property details
    const { data: property, error: propertyError } = await supabaseClient
      .from("tokenized_properties")
      .select("*")
      .eq("id", tokenizedPropertyId)
      .eq("status", "sale_active")
      .single();

    if (propertyError || !property) {
      return createResponse(
        createErrorResponse("Tokenized property not found or not available for purchase"),
        404
      );
    }

    // Validate purchase parameters
    if (tokenAmount <= 0) {
      return createResponse(
        createErrorResponse("Token amount must be greater than 0"),
        400
      );
    }

    const totalCostUSD = tokenAmount * property.token_price;
    if (totalCostUSD < property.minimum_investment) {
      return createResponse(
        createErrorResponse(`Minimum investment is $${property.minimum_investment}`),
        400
      );
    }

    // Convert USD to NGN (approximate rate for demo - should use real exchange rate)
    const usdToNgnRate = 1650; // This should come from a real exchange rate API
    const totalCostNGN = Math.round(totalCostUSD * usdToNgnRate);

    // Generate payment reference
    const paymentReference = `TOKEN_${tokenizedPropertyId.slice(-8)}_${Date.now()}`;

    // Create payment session record
    const { data: paymentSession, error: sessionError } = await supabaseClient
      .from("payment_sessions")
      .insert({
        user_id: user.id,
        amount: totalCostNGN,
        currency: "NGN",
        purpose: "token_purchase",
        related_type: "token_purchase",
        related_id: tokenizedPropertyId,
        metadata: {
          tokenized_property_id: tokenizedPropertyId,
          token_amount: tokenAmount,
          token_price_usd: property.token_price,
          total_cost_usd: totalCostUSD,
          investor_account_id: investorAccountId,
          exchange_rate: usdToNgnRate,
          property_name: property.token_name,
        },
        status: "pending",
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        session_id: paymentReference,
        payment_provider: "paystack",
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Session creation error:", sessionError);
      return createResponse(
        createErrorResponse("Failed to create payment session"),
        500
      );
    }

    // Initialize Paystack payment
    const paystackResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${Deno.env.get("PAYSTACK_SECRET_KEY")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: user.email,
          amount: totalCostNGN * 100, // Paystack uses kobo
          currency: "NGN",
          reference: paymentReference,
          callback_url: `${Deno.env.get("SITE_URL")}/payment/callback`,
          metadata: {
            user_id: user.id,
            purpose: "token_purchase",
            session_id: paymentSession.id,
            tokenized_property_id: tokenizedPropertyId,
            token_amount: tokenAmount,
            investor_account_id: investorAccountId,
          },
        }),
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      console.error("Paystack initialization failed:", paystackData);
      return createResponse(
        createErrorResponse("Payment initialization failed"),
        500
      );
    }

    // Update payment session with Paystack reference
    await supabaseClient
      .from("payment_sessions")
      .update({
        session_id: paystackData.data.reference,
        metadata: {
          ...paymentSession.metadata,
          paystack_reference: paystackData.data.reference,
          access_code: paystackData.data.access_code,
        },
      })
      .eq("id", paymentSession.id);

    return createResponse(
      createSuccessResponse({
        payment_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        session_id: paymentSession.id,
        total_cost_ngn: totalCostNGN,
        total_cost_usd: totalCostUSD,
        token_amount: tokenAmount,
        property_name: property.token_name,
      })
    );
  } catch (error) {
    console.error("Token purchase payment creation failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(
      createErrorResponse("Token purchase payment creation failed", errorMessage),
      500
    );
  }
});