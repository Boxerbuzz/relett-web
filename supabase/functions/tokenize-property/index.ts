
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Unauthorized')
    }

    const {
      land_title_id,
      property_id,
      token_symbol,
      token_name,
      total_supply,
      total_value_usd,
      minimum_investment,
      token_price,
      investment_terms,
      expected_roi,
      revenue_distribution_frequency,
      lock_up_period_months
    } = await req.json()

    // Validate required fields
    if (!land_title_id || !token_symbol || !token_name || !total_supply || !total_value_usd) {
      throw new Error('Missing required fields for tokenization')
    }

    // Verify user owns the land title
    const { data: landTitle, error: titleError } = await supabaseClient
      .from('land_titles')
      .select('*')
      .eq('id', land_title_id)
      .eq('owner_id', user.id)
      .single()

    if (titleError || !landTitle) {
      throw new Error('Land title not found or you do not own this property')
    }

    // Check if property is already tokenized
    const { data: existingToken, error: existingError } = await supabaseClient
      .from('tokenized_properties')
      .select('id')
      .eq('land_title_id', land_title_id)
      .maybeSingle()

    if (existingToken) {
      throw new Error('Property is already tokenized')
    }

    // Create tokenized property record with pending_approval status
    const { data: tokenizedProperty, error: tokenError } = await supabaseClient
      .from('tokenized_properties')
      .insert({
        land_title_id,
        property_id,
        token_symbol,
        token_name,
        token_type: 'hts_fungible',
        total_supply: total_supply.toString(),
        total_value_usd,
        minimum_investment: minimum_investment || 1000,
        token_price: token_price || (total_value_usd / parseFloat(total_supply)),
        status: 'pending_approval', // Changed from 'pending_approval' to trigger approval workflow
        blockchain_network: 'hedera',
        investment_terms: investment_terms || 'fixed',
        expected_roi: expected_roi || 8.0,
        revenue_distribution_frequency: revenue_distribution_frequency || 'quarterly',
        lock_up_period_months: lock_up_period_months || 12,
        metadata: {
          created_by: user.id,
          land_title_number: landTitle.title_number,
          location: landTitle.location_address,
          awaiting_approval: true,
          submitted_for_review: new Date().toISOString()
        },
        legal_structure: {
          ownership_type: 'fractional',
          jurisdiction: 'Nigeria',
          compliance_status: 'pending'
        }
      })
      .select()
      .single()

    if (tokenError) throw tokenError

    // Create audit trail for tokenization request
    await supabaseClient
      .from('audit_trails')
      .insert({
        user_id: user.id,
        resource_type: 'tokenized_property',
        resource_id: tokenizedProperty.id,
        action: 'create_pending_approval',
        new_values: {
          token_symbol,
          token_name,
          total_supply,
          total_value_usd,
          status: 'pending_approval'
        }
      })

    // Send notification to user about submission
    await supabaseClient.functions.invoke('process-notification', {
      body: {
        user_id: user.id,
        type: 'investment',
        title: 'Tokenization Request Submitted',
        message: `Your tokenization request for "${token_name}" has been submitted for admin review.`,
        metadata: {
          tokenized_property_id: tokenizedProperty.id,
          token_symbol,
          total_value_usd,
          status: 'pending_approval'
        },
        action_url: `/tokens/${tokenizedProperty.id}`,
        action_label: 'View Request'
      }
    })

    // Notify admins about new tokenization request
    const { data: admins } = await supabaseClient
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin')
      .eq('is_active', true)

    if (admins && admins.length > 0) {
      for (const admin of admins) {
        await supabaseClient.functions.invoke('process-notification', {
          body: {
            user_id: admin.user_id,
            type: 'admin',
            title: 'New Token Approval Request',
            message: `A new tokenization request for "${token_name}" requires admin review.`,
            metadata: {
              tokenized_property_id: tokenizedProperty.id,
              token_symbol,
              total_value_usd,
              owner_id: user.id
            },
            action_url: `/admin?tab=tokens`,
            action_label: 'Review Request'
          }
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        tokenized_property: tokenizedProperty,
        message: 'Tokenization request submitted successfully and is pending admin approval'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('[TOKENIZE-PROPERTY]', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
