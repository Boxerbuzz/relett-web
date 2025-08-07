import {
  createAuthenticatedClient,
  verifyUser,
  handleSupabaseError,
  createResponse,
  createCorsResponse,
} from "../shared/supabase-client.ts";
import { systemLogger } from "../shared/system-logger.ts";

interface CastVoteRequest {
  pollId: string;
  vote: "yes" | "no";
  votingPower: number;
}

Deno.serve(async (req) => {
  systemLogger("cast-poll-vote: Request received", { method: req.method });

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
    systemLogger("cast-poll-vote: User verified", { userId: user.id });

    // Parse request body
    const body: CastVoteRequest = await req.json();
    systemLogger("cast-poll-vote: Request body parsed", {
      pollId: body.pollId,
      vote: body.vote,
    });

    // Create authenticated client
    const supabase = createAuthenticatedClient(authHeader);

    // Get poll details and verify it's active
    const { data: poll, error: pollError } = await supabase
      .from("investment_polls")
      .select("*")
      .eq("id", body.pollId)
      .single();

    if (pollError || !poll) {
      systemLogger("cast-poll-vote: Poll not found", { pollId: body.pollId });
      return createResponse(
        {
          success: false,
          error: "Poll not found",
        },
        404
      );
    }

    if (poll.status !== "active") {
      return createResponse(
        {
          success: false,
          error: "Poll is not active",
        },
        400
      );
    }

    if (new Date() > new Date(poll.ends_at)) {
      return createResponse(
        {
          success: false,
          error: "Poll has expired",
        },
        400
      );
    }

    // Verify user has voting power in this investment group
    const { data: tokenHolding, error: holdingError } = await supabase
      .from("token_holdings")
      .select("*")
      .eq("tokenized_property_id", poll.investment_group_id)
      .eq("holder_id", user.id)
      .single();

    if (holdingError || !tokenHolding) {
      systemLogger("cast-poll-vote: User not authorized to vote", {
        investmentGroupId: poll.investment_group_id,
      });
      return createResponse(
        {
          success: false,
          error: "You must be an investor in this group to vote",
        },
        403
      );
    }

    // Calculate voting power based on poll settings
    let votingPower = body.votingPower;

    // For buyout polls, calculate voting power based on token holdings
    if (poll.poll_type === "buyout_proposal") {
      // Get total supply to calculate percentage
      const { data: property } = await supabase
        .from("tokenized_properties")
        .select("total_supply")
        .eq("id", poll.investment_group_id)
        .single();

      if (property && property.total_supply) {
        votingPower =
          (parseFloat(tokenHolding.tokens_owned) /
            parseFloat(property.total_supply)) *
          100;
      }
    }

    // Check if user has already voted
    const { data: existingVote, error: voteCheckError } = await supabase
      .from("poll_votes")
      .select("*")
      .eq("poll_id", body.pollId)
      .eq("voter_id", user.id)
      .maybeSingle();

    if (voteCheckError) {
      systemLogger("cast-poll-vote: Error checking existing vote", {
        error: voteCheckError,
      });
    }

    // Insert or update vote
    const voteData = {
      poll_id: body.pollId,
      voter_id: user.id,
      vote: body.vote,
      voting_power: votingPower,
      voted_at: new Date().toISOString(),
    };

    let voteResult;
    if (existingVote && poll.allow_vote_changes) {
      // Update existing vote
      const { data, error } = await supabase
        .from("poll_votes")
        .update(voteData)
        .eq("id", existingVote.id)
        .select()
        .single();
      voteResult = { data, error };
      systemLogger("cast-poll-vote: Vote updated", { voteId: existingVote.id });
    } else if (!existingVote) {
      // Insert new vote
      const { data, error } = await supabase
        .from("poll_votes")
        .insert(voteData)
        .select()
        .single();
      voteResult = { data, error };
      systemLogger("cast-poll-vote: New vote cast", { pollId: body.pollId });
    } else {
      return createResponse(
        {
          success: false,
          error:
            "You have already voted on this poll and vote changes are not allowed",
        },
        400
      );
    }

    if (voteResult.error) {
      systemLogger("cast-poll-vote: Error saving vote", {
        error: voteResult.error,
      });
      return createResponse(handleSupabaseError(voteResult.error), 400);
    }

    // Update poll vote counts for buyout proposals
    if (poll.poll_type === "buyout_proposal" && body.vote === "yes") {
      const { error: updateError } = await supabase
        .from("investment_polls")
        .update({
          current_buyout_votes: (poll.current_buyout_votes || 0) + votingPower,
        })
        .eq("id", body.pollId);

      if (updateError) {
        systemLogger("cast-poll-vote: Error updating poll vote count", {
          error: updateError,
        });
      }
    }

    systemLogger("cast-poll-vote: Vote cast successfully", {
      pollId: body.pollId,
      vote: body.vote,
      votingPower,
    });

    return createResponse({
      success: true,
      data: voteResult.data,
      message: "Vote cast successfully",
    });
  } catch (error) {
    systemLogger("cast-poll-vote: Unexpected error", { error });
    return createResponse(handleSupabaseError(error), 500);
  }
});
