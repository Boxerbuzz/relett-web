
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

    const { reference } = await req.json()

    if (!reference) {
      throw new Error('Payment reference is required')
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('PAYSTACK_SECRET_KEY')}`,
      },
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      throw new Error('Payment verification failed')
    }

    const transaction = paystackData.data

    // Find the payment session
    const { data: paymentSession, error: sessionError } = await supabaseClient
      .from('payment_sessions')
      .select('*')
      .eq('session_id', reference)
      .single()

    if (sessionError || !paymentSession) {
      throw new Error('Payment session not found')
    }

    // Update payment session status
    const { error: updateError } = await supabaseClient
      .from('payment_sessions')
      .update({
        status: transaction.status === 'success' ? 'completed' : 'failed',
        completed_at: new Date().toISOString(),
        metadata: {
          ...paymentSession.metadata,
          paystack_transaction: transaction
        }
      })
      .eq('id', paymentSession.id)

    if (updateError) throw updateError

    if (transaction.status === 'success') {
      // Create payment record
      const { error: paymentError } = await supabaseClient
        .from('payments')
        .insert({
          user_id: paymentSession.user_id,
          reference: reference,
          amount: transaction.amount / 100, // Convert from kobo
          currency: transaction.currency,
          status: 'completed',
          method: 'card',
          provider: 'paystack',
          type: 'payment',
          related_type: paymentSession.purpose,
          related_id: paymentSession.user_id,
          paid_at: new Date().toISOString(),
          metadata: {
            paystack_transaction: transaction,
            session_id: paymentSession.id
          }
        })

      if (paymentError) throw paymentError

      // Update user account balance if needed
      if (paymentSession.purpose === 'wallet_topup') {
        const { error: accountError } = await supabaseClient
          .from('accounts')
          .update({
            amount: supabaseClient.raw('amount + ?', [transaction.amount / 100])
          })
          .eq('user_id', paymentSession.user_id)
          .eq('type', 'wallet')

        if (accountError) throw accountError
      }

      // Send success notification
      await supabaseClient.functions.invoke('process-notification', {
        body: {
          user_id: paymentSession.user_id,
          type: 'payment',
          title: 'Payment Successful',
          message: `Your payment of ${transaction.currency} ${(transaction.amount / 100).toLocaleString()} has been processed successfully.`,
          metadata: {
            amount: transaction.amount / 100,
            currency: transaction.currency,
            reference: reference
          }
        }
      })
    }

    return new Response(
      JSON.stringify({
        success: transaction.status === 'success',
        status: transaction.status,
        amount: transaction.amount / 100,
        currency: transaction.currency,
        reference: reference
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Payment verification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
