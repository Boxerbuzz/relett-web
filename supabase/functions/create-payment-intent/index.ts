
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
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

    const { amount, currency, purpose, metadata } = await req.json()

    // Validate required fields
    if (!amount || !currency || !purpose) {
      throw new Error('Missing required fields: amount, currency, purpose')
    }

    // Create payment session record
    const { data: paymentSession, error: sessionError } = await supabaseClient
      .from('payment_sessions')
      .insert({
        user_id: user.id,
        amount: amount,
        currency: currency,
        purpose: purpose,
        metadata: metadata || {},
        status: 'pending',
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        session_id: crypto.randomUUID(),
        payment_provider: 'paystack'
      })
      .select()
      .single()

    if (sessionError) throw sessionError

    // Initialize Paystack payment
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: amount * 100, // Paystack uses kobo
        currency: currency,
        reference: paymentSession.session_id,
        callback_url: `${Deno.env.get('SITE_URL')}/payment/callback`,
        metadata: {
          user_id: user.id,
          purpose: purpose,
          session_id: paymentSession.session_id,
          ...metadata
        }
      })
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Payment initialization failed')
    }

    // Update payment session with external reference
    await supabaseClient
      .from('payment_sessions')
      .update({
        session_id: paystackData.data.reference,
        metadata: {
          ...paymentSession.metadata,
          paystack_reference: paystackData.data.reference,
          access_code: paystackData.data.access_code
        }
      })
      .eq('id', paymentSession.id)

    return new Response(
      JSON.stringify({
        success: true,
        payment_url: paystackData.data.authorization_url,
        reference: paystackData.data.reference,
        session_id: paymentSession.id
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Payment intent error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
