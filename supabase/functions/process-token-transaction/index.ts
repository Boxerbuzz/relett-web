
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
      tokenized_property_id,
      transaction_type, // 'transfer', 'mint', 'burn'
      from_holder,
      to_holder,
      token_amount,
      price_per_token
    } = await req.json()

    // Validate required fields
    if (!tokenized_property_id || !transaction_type || !token_amount) {
      throw new Error('Missing required fields for token transaction')
    }

    // Get tokenized property details
    const { data: tokenizedProperty, error: propertyError } = await supabaseClient
      .from('tokenized_properties')
      .select('*')
      .eq('id', tokenized_property_id)
      .single()

    if (propertyError || !tokenizedProperty) {
      throw new Error('Tokenized property not found')
    }

    const totalValue = parseFloat(token_amount) * price_per_token

    // Process different transaction types
    let transactionData: any = {
      tokenized_property_id,
      transaction_type,
      token_amount: token_amount.toString(),
      price_per_token,
      total_value: totalValue,
      status: 'pending',
      metadata: {
        initiated_by: user.id,
        timestamp: new Date().toISOString()
      }
    }

    if (transaction_type === 'transfer') {
      if (!from_holder || !to_holder) {
        throw new Error('Transfer requires both from_holder and to_holder')
      }

      // Verify sender has enough tokens
      const { data: senderHolding, error: senderError } = await supabaseClient
        .from('token_holdings')
        .select('*')
        .eq('tokenized_property_id', tokenized_property_id)
        .eq('holder_id', from_holder)
        .single()

      if (senderError || !senderHolding) {
        throw new Error('Sender does not have holdings in this property')
      }

      if (parseFloat(senderHolding.tokens_owned) < parseFloat(token_amount)) {
        throw new Error('Insufficient token balance')
      }

      transactionData.from_holder = from_holder
      transactionData.to_holder = to_holder

    } else if (transaction_type === 'mint') {
      // Only property owner can mint new tokens
      const { data: landTitle } = await supabaseClient
        .from('land_titles')
        .select('owner_id')
        .eq('id', tokenizedProperty.land_title_id)
        .single()

      if (landTitle?.owner_id !== user.id) {
        throw new Error('Only property owner can mint new tokens')
      }

      transactionData.to_holder = to_holder || user.id

    } else if (transaction_type === 'burn') {
      if (!from_holder) {
        throw new Error('Burn requires from_holder')
      }
      transactionData.from_holder = from_holder
    }

    // Create transaction record
    const { data: transaction, error: transactionError } = await supabaseClient
      .from('token_transactions')
      .insert(transactionData)
      .select()
      .single()

    if (transactionError) throw transactionError

    // Update token holdings based on transaction type
    if (transaction_type === 'transfer') {
      // Decrease sender's tokens
      const { error: decreaseError } = await supabaseClient
        .from('token_holdings')
        .update({
          tokens_owned: supabaseClient.raw('tokens_owned - ?', [parseFloat(token_amount)])
        })
        .eq('tokenized_property_id', tokenized_property_id)
        .eq('holder_id', from_holder)

      if (decreaseError) throw decreaseError

      // Increase receiver's tokens (or create new holding)
      const { data: receiverHolding } = await supabaseClient
        .from('token_holdings')
        .select('*')
        .eq('tokenized_property_id', tokenized_property_id)
        .eq('holder_id', to_holder)
        .maybeSingle()

      if (receiverHolding) {
        // Update existing holding
        await supabaseClient
          .from('token_holdings')
          .update({
            tokens_owned: supabaseClient.raw('tokens_owned + ?', [parseFloat(token_amount)])
          })
          .eq('id', receiverHolding.id)
      } else {
        // Create new holding
        await supabaseClient
          .from('token_holdings')
          .insert({
            tokenized_property_id,
            holder_id: to_holder,
            tokens_owned: token_amount.toString(),
            purchase_price_per_token: price_per_token,
            total_investment: totalValue,
            acquisition_date: new Date().toISOString()
          })
      }

    } else if (transaction_type === 'mint') {
      // Create or update holder's tokens
      const { data: holderTokens } = await supabaseClient
        .from('token_holdings')
        .select('*')
        .eq('tokenized_property_id', tokenized_property_id)
        .eq('holder_id', to_holder)
        .maybeSingle()

      if (holderTokens) {
        await supabaseClient
          .from('token_holdings')
          .update({
            tokens_owned: supabaseClient.raw('tokens_owned + ?', [parseFloat(token_amount)])
          })
          .eq('id', holderTokens.id)
      } else {
        await supabaseClient
          .from('token_holdings')
          .insert({
            tokenized_property_id,
            holder_id: to_holder,
            tokens_owned: token_amount.toString(),
            purchase_price_per_token: price_per_token,
            total_investment: totalValue,
            acquisition_date: new Date().toISOString()
          })
      }

      // Update total supply
      await supabaseClient
        .from('tokenized_properties')
        .update({
          total_supply: supabaseClient.raw('total_supply::numeric + ?', [parseFloat(token_amount)])
        })
        .eq('id', tokenized_property_id)
    }

    // Update transaction status to confirmed
    await supabaseClient
      .from('token_transactions')
      .update({ status: 'confirmed' })
      .eq('id', transaction.id)

    // Send notifications
    const notifications = []

    if (from_holder && from_holder !== user.id) {
      notifications.push({
        user_id: from_holder,
        type: 'investment',
        title: 'Token Transfer',
        message: `${token_amount} tokens of ${tokenizedProperty.token_name} have been transferred from your account.`,
        metadata: { transaction_id: transaction.id, amount: token_amount }
      })
    }

    if (to_holder && to_holder !== user.id) {
      notifications.push({
        user_id: to_holder,
        type: 'investment',
        title: 'Token Received',
        message: `You have received ${token_amount} tokens of ${tokenizedProperty.token_name}.`,
        metadata: { transaction_id: transaction.id, amount: token_amount }
      })
    }

    for (const notification of notifications) {
      await supabaseClient.functions.invoke('process-notification', { body: notification })
    }

    return new Response(
      JSON.stringify({
        success: true,
        transaction,
        message: 'Token transaction processed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Token transaction error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
