
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  Client,
  AccountId,
  PrivateKey,
  TopicMessageSubmitTransaction,
  Hbar
} from "https://esm.sh/@hashgraph/sdk@2.65.1";
import { 
  createTypedSupabaseClient,
  createSuccessResponse, 
  createErrorResponse,
  createResponse,
  createCorsResponse,
  verifyUser 
} from '../shared/supabase-client.ts';

interface PollVoteRequest {
  poll_id: string;
  poll_option_id?: string;
  ranked_choices?: string[];
  vote_data?: Record<string, unknown>;
}

interface PollVoteResponse {
  success: boolean;
  vote_id: string;
  hedera_transaction_id?: string;
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const userResult = await verifyUser(authHeader);
    
    if (!userResult.success) {
      return createResponse(userResult, 401);
    }

    const { poll_id, poll_option_id, ranked_choices, vote_data }: PollVoteRequest = await req.json();

    if (!poll_id) {
      return createResponse(createErrorResponse('Missing poll ID'), 400);
    }

    const supabase = createTypedSupabaseClient();
    const userId = userResult.data.id;

    // Get poll details and check if user can vote
    const { data: poll, error: pollError } = await supabase
      .from('investment_polls')
      .select('*, investment_groups(*)')
      .eq('id', poll_id)
      .single();

    if (pollError || !poll) {
      return createResponse(createErrorResponse('Poll not found'), 404);
    }

    if (poll.status !== 'active') {
      return createResponse(createErrorResponse('Poll is not active'), 400);
    }

    if (new Date() > new Date(poll.ends_at)) {
      return createResponse(createErrorResponse('Poll has ended'), 400);
    }

    // Check if user already voted (if vote changes not allowed)
    if (!poll.allow_vote_changes) {
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('id')
        .eq('poll_id', poll_id)
        .eq('voter_id', userId)
        .single();

      if (existingVote) {
        return createResponse(createErrorResponse('You have already voted on this poll'), 400);
      }
    }

    // Calculate voting power
    const { data: votingPowerData } = await supabase.rpc('calculate_voting_power', {
      p_poll_id: poll_id,
      p_voter_id: userId
    });

    const votingPower = votingPowerData || 1.0;

    let hederaTransactionId: string | undefined;

    // Submit to Hedera Consensus Service if topic ID is available
    if (poll.hedera_topic_id) {
      const hederaAccountId = Deno.env.get('HEDERA_ACCOUNT_ID');
      const hederaPrivateKey = Deno.env.get('HEDERA_PRIVATE_KEY');

      if (hederaAccountId && hederaPrivateKey) {
        try {
          const client = Client.forTestnet();
          const operatorId = AccountId.fromString(hederaAccountId);
          const operatorKey = PrivateKey.fromStringECDSA(hederaPrivateKey);
          client.setOperator(operatorId, operatorKey);

          const voteMessage = JSON.stringify({
            poll_id,
            voter_id: userId,
            poll_option_id,
            ranked_choices,
            vote_data,
            voting_power: votingPower,
            timestamp: new Date().toISOString()
          });

          const submitTransaction = new TopicMessageSubmitTransaction()
            .setTopicId(poll.hedera_topic_id)
            .setMessage(voteMessage)
            .setMaxTransactionFee(new Hbar(2));

          const submitResponse = await submitTransaction.execute(client);
          const _submitReceipt = await submitResponse.getReceipt(client);
          
          hederaTransactionId = submitResponse.transactionId.toString();
          
          client.close();
          console.log('Vote submitted to Hedera:', hederaTransactionId);
        } catch (hederaError) {
          console.error('Hedera submission error:', hederaError);
          // Continue without Hedera - this is not a blocking error
        }
      }
    }

    // Store vote in database
    const { data: vote, error: voteError } = await supabase
      .from('poll_votes')
      .upsert({
        poll_id,
        voter_id: userId,
        poll_option_id,
        ranked_choices,
        vote_data: vote_data || {},
        voting_power: votingPower,
        vote_weight: votingPower,
        hedera_transaction_id: hederaTransactionId,
        voted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'poll_id,voter_id'
      })
      .select()
      .single();

    if (voteError) {
      console.error('Vote storage error:', voteError);
      return createResponse(createErrorResponse('Failed to record vote'), 500);
    }

    // Create notification for poll creator
    await supabase.rpc('create_notification_with_delivery', {
      p_user_id: poll.created_by,
      p_type: 'poll_updates',
      p_title: 'New Vote Received',
      p_message: `A new vote has been cast on your poll`,
      p_metadata: {
        poll_id,
        voter_id: userId,
        poll_title: poll.title
      },
      p_action_url: `/investment/polls/${poll_id}`,
      p_action_label: 'View Poll'
    });

    const response: PollVoteResponse = {
      success: true,
      vote_id: vote.id,
      hedera_transaction_id: hederaTransactionId,
      message: 'Vote recorded successfully'
    };

    return createResponse(createSuccessResponse(response));

  } catch (error) {
    console.error('Poll vote error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(createErrorResponse('Internal server error', errorMessage), 500);
  }
});
