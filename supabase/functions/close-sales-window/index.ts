import { createTypedSupabaseClient } from '../shared/supabase-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CloseSalesWindowRequest {
  tokenizedPropertyId: string;
}

const supabaseClient = createTypedSupabaseClient();

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tokenizedPropertyId }: CloseSalesWindowRequest = await req.json();

    console.log('Closing sales window for token:', tokenizedPropertyId);

    // Get all committed token holdings for this property
    const { data: commitments, error: commitmentsError } = await supabaseClient
      .from('token_holdings')
      .select('*')
      .eq('tokenized_property_id', tokenizedPropertyId)
      .eq('status', 'committed');

    if (commitmentsError) {
      throw new Error(`Failed to fetch commitments: ${commitmentsError.message}`);
    }

    console.log(`Found ${commitments?.length || 0} commitments to process`);

    if (commitments && commitments.length > 0) {
      // Calculate total committed tokens
      const totalCommittedTokens = commitments.reduce((sum, commitment) => {
        return sum + parseInt(commitment.tokens_owned);
      }, 0);

      console.log(`Total committed tokens: ${totalCommittedTokens}`);

      // Update all committed holdings to distributed status
      const { error: updateError } = await supabaseClient
        .from('token_holdings')
        .update({ status: 'distributed' })
        .eq('tokenized_property_id', tokenizedPropertyId)
        .eq('status', 'committed');

      if (updateError) {
        throw new Error(`Failed to update holdings status: ${updateError.message}`);
      }

      // Update tokenized property status to minted
      const { error: propertyUpdateError } = await supabaseClient
        .from('tokenized_properties')
        .update({ 
          status: 'minted',
          metadata: {
            sales_window_closed_at: new Date().toISOString(),
            total_committed_tokens: totalCommittedTokens,
            total_investors: commitments.length
          }
        })
        .eq('id', tokenizedPropertyId);

      if (propertyUpdateError) {
        throw new Error(`Failed to update property status: ${propertyUpdateError.message}`);
      }

      // Close the investment group
      const { error: groupUpdateError } = await supabaseClient
        .from('investment_groups')
        .update({ status: 'closed' })
        .eq('tokenized_property_id', tokenizedPropertyId);

      if (groupUpdateError) {
        console.warn('Failed to close investment group:', groupUpdateError);
      }

      // Record to HCS
      try {
        const { data: hcsTopic } = await supabaseClient
          .from('hcs_topics')
          .select('topic_id')
          .eq('tokenized_property_id', tokenizedPropertyId)
          .single();

        if (hcsTopic) {
          await supabaseClient.functions.invoke('record-hcs-event', {
            body: {
              topicId: hcsTopic.topic_id,
              eventType: 'sales_window_closed',
              eventData: {
                tokenized_property_id: tokenizedPropertyId,
                total_committed_tokens: totalCommittedTokens,
                total_investors: commitments.length,
                closed_at: new Date().toISOString()
              }
            }
          });
        }
      } catch (hcsError) {
        console.warn('Failed to record HCS event:', hcsError);
      }

      // TODO: In a real implementation, here you would:
      // 1. Mint the actual tokens on Hedera (totalCommittedTokens)
      // 2. Transfer tokens to each committed investor
      // 3. Update Hedera token metadata

      console.log('Sales window closed successfully');

      return new Response(
        JSON.stringify({ 
          success: true,
          totalCommittedTokens,
          totalInvestors: commitments.length,
          message: 'Sales window closed and tokens distributed'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } else {
      // No commitments, just close the window
      const { error: propertyUpdateError } = await supabaseClient
        .from('tokenized_properties')
        .update({ 
          status: 'cancelled',
          metadata: {
            sales_window_closed_at: new Date().toISOString(),
            total_committed_tokens: 0,
            total_investors: 0,
            reason: 'No commitments received'
          }
        })
        .eq('id', tokenizedPropertyId);

      if (propertyUpdateError) {
        throw new Error(`Failed to update property status: ${propertyUpdateError.message}`);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          totalCommittedTokens: 0,
          totalInvestors: 0,
          message: 'Sales window closed with no commitments'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

  } catch (error) {
    console.error('Error closing sales window:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});