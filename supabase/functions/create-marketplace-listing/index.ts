import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get user from authorization header
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { tokenizedPropertyId, tokenAmount, pricePerToken, sellerAccountId } =
      await req.json();

    console.log("Creating marketplace listing:", {
      tokenizedPropertyId,
      tokenAmount,
      pricePerToken,
      sellerAccountId,
      sellerId: user.id,
    });

    // Validate required fields
    if (
      !tokenizedPropertyId ||
      !tokenAmount ||
      !pricePerToken ||
      !sellerAccountId
    ) {
      throw new Error("Missing required fields");
    }

    // Verify user owns enough tokens
    const { data: holdings, error: holdingsError } = await supabase
      .from("token_holdings")
      .select("tokens_owned")
      .eq("holder_id", user.id)
      .eq("tokenized_property_id", tokenizedPropertyId)
      .single();

    if (holdingsError) {
      throw new Error("Failed to verify token holdings");
    }

    if (!holdings || parseInt(holdings.tokens_owned) < tokenAmount) {
      throw new Error("Insufficient token balance");
    }

    // Create marketplace listing
    const { data: listing, error: listingError } = await supabase
      .from("marketplace_listings")
      .insert({
        tokenized_property_id: tokenizedPropertyId,
        seller_id: user.id,
        seller_account_id: sellerAccountId,
        token_amount: tokenAmount,
        price_per_token: pricePerToken,
        total_price: tokenAmount * pricePerToken,
        status: "active",
      })
      .select()
      .single();

    if (listingError) {
      console.error("Error creating listing:", listingError);
      throw new Error("Failed to create marketplace listing");
    }

    console.log("Marketplace listing created successfully:", listing.id);

    return new Response(JSON.stringify({ success: true, data: listing }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in create-marketplace-listing:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
