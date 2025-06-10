
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VoteRecord {
  pollId: string;
  voterId: string;
  optionId: string;
  votingPower: number;
  timestamp: string;
  signature?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { pollId, voterId, optionId, votingPower } = await req.json();

    console.log('Recording vote:', { pollId, voterId, optionId, votingPower });

    // Create vote record for Hedera Consensus Service
    const voteRecord: VoteRecord = {
      pollId,
      voterId,
      optionId,
      votingPower,
      timestamp: new Date().toISOString()
    };

    // In a production environment, this would submit to Hedera Consensus Service
    // For now, we'll simulate the Hedera integration
    const hederaTopicId = `0.0.${Math.floor(Math.random() * 1000000)}`;
    const hederaTransactionId = `0.0.${Math.floor(Math.random() * 1000000)}-${Date.now()}`;
    const consensusTimestamp = new Date().toISOString();

    console.log('Simulated Hedera submission:', {
      topicId: hederaTopicId,
      transactionId: hederaTransactionId,
      consensusTimestamp
    });

    // Update the vote record with Hedera information
    const { error: updateError } = await supabase
      .from('poll_votes')
      .update({
        hedera_transaction_id: hederaTransactionId,
        hedera_consensus_timestamp: consensusTimestamp
      })
      .eq('poll_id', pollId)
      .eq('voter_id', voterId);

    if (updateError) {
      console.error('Error updating vote with Hedera info:', updateError);
      throw updateError;
    }

    // Update poll with topic ID if not set
    const { error: pollUpdateError } = await supabase
      .from('investment_polls')
      .update({
        hedera_topic_id: hederaTopicId
      })
      .eq('id', pollId)
      .is('hedera_topic_id', null);

    if (pollUpdateError) {
      console.error('Error updating poll with topic ID:', pollUpdateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        hederaTransactionId,
        consensusTimestamp,
        topicId: hederaTopicId
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error recording vote:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to record vote',
        details: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
