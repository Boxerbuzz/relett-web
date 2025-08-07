import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateInvestmentGroupRequest {
  tokenizedPropertyId: string;
  salesWindowDays?: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { tokenizedPropertyId, salesWindowDays = 30 }: CreateInvestmentGroupRequest = await req.json();

    console.log('Creating investment group for token:', tokenizedPropertyId);

    // Get tokenized property details
    const { data: tokenProperty, error: tokenError } = await supabaseClient
      .from('tokenized_properties')
      .select('*')
      .eq('id', tokenizedPropertyId)
      .single();

    if (tokenError || !tokenProperty) {
      throw new Error(`Tokenized property not found: ${tokenError?.message}`);
    }

    // Calculate sales window close date
    const closesAt = new Date();
    closesAt.setDate(closesAt.getDate() + salesWindowDays);

    // Create investment group
    const { data: investmentGroup, error: groupError } = await supabaseClient
      .from('investment_groups')
      .insert({
        name: `${tokenProperty.token_name} Investors`,
        description: `Investment group for ${tokenProperty.token_name} token holders`,
        tokenized_property_id: tokenizedPropertyId,
        closes_at: closesAt.toISOString(),
        status: 'active',
        group_type: 'property_investment',
        members: [], // Start with empty members array
        created_by: null // System created
      })
      .select()
      .single();

    if (groupError) {
      throw new Error(`Failed to create investment group: ${groupError.message}`);
    }

    console.log('Investment group created successfully:', investmentGroup.id);

    // Record event to HCS if available
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
            eventType: 'investment_group_created',
            eventData: {
              investment_group_id: investmentGroup.id,
              tokenized_property_id: tokenizedPropertyId,
              closes_at: closesAt.toISOString(),
              sales_window_days: salesWindowDays
            }
          }
        });
      }
    } catch (hcsError) {
      console.warn('Failed to record HCS event:', hcsError);
      // Don't fail the entire operation
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        investmentGroupId: investmentGroup.id,
        closesAt: closesAt.toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error creating investment group:', error);
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