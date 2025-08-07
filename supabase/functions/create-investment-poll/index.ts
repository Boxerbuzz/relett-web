import {
  //createTypedSupabaseClient,
  createAuthenticatedClient,
  verifyUser,
  handleSupabaseError,
  createResponse,
  //corsHeaders,
  createCorsResponse,
} from "../shared/supabase-client.ts";
import { systemLogger } from "../shared/system-logger.ts";

interface CreatePollRequest {
  investmentGroupId: string;
  pollType: string;
  title: string;
  description?: string;
  buyoutPrice?: number;
  minBuyoutPercentage?: number;
  buyoutDeadline?: string;
  votingPowerBasis?: string;
  requiresConsensus?: boolean;
  consensusThreshold?: number;
  autoExecuteOnSuccess?: boolean;
  metadata?: Record<string, any>;
}

Deno.serve(async (req) => {
  systemLogger("create-investment-poll: Request received", {
    method: req.method,
  });

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return createCorsResponse();
  }

  try {
    // Verify user authentication
    const authHeader = req.headers.get("Authorization") || "";
    const userResponse = await verifyUser(authHeader);
    if (!userResponse.success) {
      return createResponse(userResponse, 401);
    }

    const user = userResponse.data;
    systemLogger("create-investment-poll: User verified", { userId: user.id });

    // Parse request body
    const body: CreatePollRequest = await req.json();
    systemLogger("create-investment-poll: Request body parsed", {
      pollType: body.pollType,
    });

    // Create authenticated client
    const supabase = createAuthenticatedClient(authHeader);

    // Verify user has access to the investment group
    const { data: tokenHolding, error: holdingError } = await supabase
      .from("token_holdings")
      .select("*")
      .eq("tokenized_property_id", body.investmentGroupId)
      .eq("holder_id", user.id)
      .single();

    if (holdingError || !tokenHolding) {
      systemLogger("create-investment-poll: User not authorized", {
        investmentGroupId: body.investmentGroupId,
      });
      return createResponse(
        {
          success: false,
          error: "You must be an investor in this group to create polls",
        },
        403
      );
    }

    // Create the investment poll
    const pollData = {
      investment_group_id: body.investmentGroupId,
      poll_type: body.pollType,
      title: body.title,
      description: body.description,
      created_by: user.id,
      starts_at: new Date().toISOString(),
      ends_at:
        body.buyoutDeadline ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default 7 days
      voting_power_basis: body.votingPowerBasis || "tokens",
      requires_consensus: body.requiresConsensus || false,
      consensus_threshold: body.consensusThreshold || 50.0,
      auto_execute_on_success: body.autoExecuteOnSuccess || true,
      buyout_price: body.buyoutPrice,
      min_buyout_percentage: body.minBuyoutPercentage || 75.0,
      buyout_deadline: body.buyoutDeadline,
      current_buyout_votes: 0,
      metadata: body.metadata || {},
      status: "active",
    };

    const { data: poll, error: pollError } = await supabase
      .from("investment_polls")
      .insert(pollData)
      .select()
      .single();

    if (pollError) {
      systemLogger("create-investment-poll: Error creating poll", {
        error: pollError,
      });
      return createResponse(handleSupabaseError(pollError), 400);
    }

    systemLogger("create-investment-poll: Poll created successfully", {
      pollId: poll.id,
    });

    return createResponse({
      success: true,
      data: poll,
      message: "Investment poll created successfully",
    });
  } catch (error) {
    systemLogger("create-investment-poll: Unexpected error", { error });
    return createResponse(handleSupabaseError(error), 500);
  }
});
