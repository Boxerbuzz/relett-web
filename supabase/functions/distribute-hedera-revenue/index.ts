import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createSuccessResponse,
  createErrorResponse,
  createResponse,
  createCorsResponse,
  verifyUser,
  createTypedSupabaseClient,
} from "../shared/supabase-client.ts";

interface RevenueDistributionRequest {
  tokenizedPropertyId: string;
  totalRevenue: number;
  distributionType: string;
  sourceDescription: string;
  currency?: string;
}

serve(async (req) => {
  console.log("Distribute Hedera Revenue function called");

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return createCorsResponse();
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return createResponse(
        createErrorResponse("Authorization header missing"),
        401
      );
    }

    const userResult = await verifyUser(authHeader);
    if ("error" in userResult) {
      return createResponse(userResult, 401);
    }

    const user = userResult.data;
    console.log("Authenticated user:", user.id);

    // Parse request body
    const body: RevenueDistributionRequest = await req.json();
    const {
      tokenizedPropertyId,
      totalRevenue,
      distributionType,
      sourceDescription,
      currency = "USD",
    } = body;

    // Validate required fields
    if (
      !tokenizedPropertyId ||
      !totalRevenue ||
      !distributionType ||
      !sourceDescription
    ) {
      return createResponse(
        createErrorResponse("Missing required fields"),
        400
      );
    }

    if (totalRevenue <= 0) {
      return createResponse(
        createErrorResponse("Total revenue must be positive"),
        400
      );
    }

    console.log("Distributing revenue:", {
      tokenizedPropertyId,
      totalRevenue,
      distributionType,
    });

    const supabase = createTypedSupabaseClient();

    // Get tokenized property details
    const { data: tokenizedProperty, error: propertyError } = await supabase
      .from("tokenized_properties")
      .select("total_supply, token_name")
      .eq("id", tokenizedPropertyId)
      .single();

    if (propertyError || !tokenizedProperty) {
      console.error("Error fetching tokenized property:", propertyError);
      return createResponse(
        createErrorResponse("Tokenized property not found"),
        404
      );
    }

    // Get all token holders for this property
    const { data: tokenHolders, error: holdersError } = await supabase
      .from("token_holdings")
      .select("holder_id, tokens_owned")
      .eq("tokenized_property_id", tokenizedPropertyId)
      .gt("tokens_owned", "0");

    if (holdersError) {
      console.error("Error fetching token holders:", holdersError);
      return createResponse(
        createErrorResponse("Failed to fetch token holders"),
        500
      );
    }

    if (!tokenHolders || tokenHolders.length === 0) {
      return createResponse(createErrorResponse("No token holders found"), 404);
    }

    console.log(`Found ${tokenHolders.length} token holders`);

    // Calculate total tokens held (excluding treasury)
    const totalTokensHeld = tokenHolders.reduce(
      (sum, holder) => sum + parseFloat(holder.tokens_owned),
      0
    );

    if (totalTokensHeld === 0) {
      return createResponse(
        createErrorResponse("No tokens held by investors"),
        400
      );
    }

    // Calculate revenue per token
    const revenuePerToken = totalRevenue / totalTokensHeld;

    console.log(`Revenue per token: ${revenuePerToken}`);

    // Create revenue distribution record
    const { data: distribution, error: distributionError } = await supabase
      .from("revenue_distributions")
      .insert({
        tokenized_property_id: tokenizedPropertyId,
        total_revenue: totalRevenue,
        revenue_per_token: revenuePerToken,
        distribution_type: distributionType,
        source_description: sourceDescription,
        currency,
        distribution_date: new Date().toISOString(),
        status: "processing",
      })
      .select()
      .single();

    if (distributionError) {
      console.error("Error creating revenue distribution:", distributionError);
      return createResponse(
        createErrorResponse("Failed to create revenue distribution"),
        500
      );
    }

    console.log("Revenue distribution created:", distribution.id);

    // Create dividend payments for each token holder
    const dividendPayments: Array<{
      id: string;
      amount: number;
      net_amount: number;
      recipient_id: string;
    }> = [];
    const errors: Array<{ holderId: string; error: string }> = [];

    for (const holder of tokenHolders) {
      const tokensOwned = parseFloat(holder.tokens_owned);
      const dividendAmount = tokensOwned * revenuePerToken;
      const taxWithholding = dividendAmount * 0.1; // 10% withholding tax (configurable)
      const netAmount = dividendAmount - taxWithholding;

      try {
        const { data: payment, error: paymentError } = await supabase
          .from("dividend_payments")
          .insert({
            revenue_distribution_id: distribution.id,
            recipient_id: holder.holder_id,
            token_holding_id: `${holder.holder_id}-${tokenizedPropertyId}`, // Composite key
            amount: dividendAmount,
            tax_withholding: taxWithholding,
            net_amount: netAmount,
            currency,
            status: "pending",
          })
          .select()
          .single();

        if (paymentError) {
          console.error(
            `Error creating dividend payment for holder ${holder.holder_id}:`,
            paymentError
          );
          errors.push({
            holderId: holder.holder_id,
            error: paymentError.message,
          });
        } else {
          dividendPayments.push(payment);
          console.log(
            `Dividend payment created for holder ${holder.holder_id}: ${netAmount}`
          );
        }
      } catch (error) {
        console.error(
          `Unexpected error for holder ${holder.holder_id}:`,
          error
        );
        errors.push({
          holderId: holder.holder_id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // Update distribution status
    const finalStatus = errors.length === 0 ? "completed" : "partial";
    await supabase
      .from("revenue_distributions")
      .update({
        status: finalStatus,
        metadata: {
          total_holders: tokenHolders.length,
          successful_payments: dividendPayments.length,
          errors: errors.length > 0 ? errors : undefined,
        },
      })
      .eq("id", distribution.id);

    console.log(
      `Revenue distribution ${finalStatus}: ${dividendPayments.length}/${tokenHolders.length} payments created`
    );

    return createResponse(
      createSuccessResponse(
        {
          distributionId: distribution.id,
          totalRevenue,
          revenuePerToken,
          totalHolders: tokenHolders.length,
          successfulPayments: dividendPayments.length,
          failedPayments: errors.length,
          status: finalStatus,
          errors: errors.length > 0 ? errors : undefined,
        },
        "Revenue distribution completed"
      )
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return createResponse(createErrorResponse("Internal server error"), 500);
  }
});
