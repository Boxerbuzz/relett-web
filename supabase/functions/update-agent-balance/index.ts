
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
    )

    const { agent_id, amount } = await req.json()

    if (!agent_id || !amount) {
      throw new Error('Agent ID and amount are required')
    }

    // Check if agent account exists
    const { data: existingAccount, error: checkError } = await supabaseClient
      .from('accounts')
      .select('*')
      .eq('user_id', agent_id)
      .eq('type', 'main')
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existingAccount) {
      // Update existing account
      const { error: updateError } = await supabaseClient
        .from('accounts')
        .update({
          amount: existingAccount.amount + amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingAccount.id)

      if (updateError) throw updateError
    } else {
      // Create new account
      const { error: createError } = await supabaseClient
        .from('accounts')
        .insert({
          user_id: agent_id,
          type: 'main',
          currency: 'NGN',
          amount: amount,
          status: 'active'
        })

      if (createError) throw createError
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error updating agent balance:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
