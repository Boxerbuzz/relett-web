
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

    // Find the payment record
    const { data: payment, error: paymentError } = await supabaseClient
      .from('payments')
      .select('*')
      .eq('reference', reference)
      .single()

    if (paymentError || !payment) {
      throw new Error('Payment record not found')
    }

    // Update payment status
    const { error: updateError } = await supabaseClient
      .from('payments')
      .update({
        status: transaction.status === 'success' ? 'completed' : 'failed',
        paid_at: new Date().toISOString(),
        metadata: {
          ...payment.metadata,
          paystack_transaction: transaction
        }
      })
      .eq('id', payment.id)

    if (updateError) throw updateError

    if (transaction.status === 'success') {
      // Process based on payment type
      if (payment.related_type === 'rentals') {
        // Update rental status
        const { error: rentalError } = await supabaseClient
          .from('rentals')
          .update({
            payment_status: 'paid',
            status: 'confirmed'
          })
          .eq('id', payment.related_id)

        if (rentalError) throw rentalError

        // Get rental details for agent commission
        const { data: rental } = await supabaseClient
          .from('rentals')
          .select(`
            *,
            property:properties(user_id, title)
          `)
          .eq('id', payment.related_id)
          .single()

        if (rental?.property?.user_id) {
          // Calculate agent commission (90% to agent, 10% platform fee)
          const agentAmount = Math.round((transaction.amount / 100) * 0.9 * 100) // Convert back to kobo
          
          // Credit agent account
          await supabaseClient
            .from('accounts')
            .upsert({
              user_id: rental.property.user_id,
              type: 'main',
              currency: 'NGN',
              amount: agentAmount,
              status: 'active'
            }, {
              onConflict: 'user_id,type',
              ignoreDuplicates: false
            })

          // Update existing account if it exists
          await supabaseClient.rpc('update_agent_balance', {
            agent_id: rental.property.user_id,
            amount: agentAmount
          })

          // Notify agent
          await supabaseClient.functions.invoke('process-notification', {
            body: {
              user_id: rental.property.user_id,
              type: 'payment',
              title: 'Payment Received',
              message: `You received ₦${(agentAmount / 100).toLocaleString()} for rental of ${rental.property.title}`,
              metadata: {
                amount: agentAmount / 100,
                currency: 'NGN',
                rental_id: rental.id
              }
            }
          })
        }

      } else if (payment.related_type === 'reservations') {
        // Update reservation status
        const { error: reservationError } = await supabaseClient
          .from('reservations')
          .update({
            status: 'confirmed'
          })
          .eq('id', payment.related_id)

        if (reservationError) throw reservationError

        // Get reservation details for agent commission
        const { data: reservation } = await supabaseClient
          .from('reservations')
          .select(`
            *,
            property:properties(user_id, title)
          `)
          .eq('id', payment.related_id)
          .single()

        if (reservation?.property?.user_id) {
          // Calculate agent commission (90% to agent, 10% platform fee)
          const agentAmount = Math.round((transaction.amount / 100) * 0.9 * 100) // Convert back to kobo
          
          // Credit agent account
          await supabaseClient
            .from('accounts')
            .upsert({
              user_id: reservation.property.user_id,
              type: 'main',
              currency: 'NGN',
              amount: agentAmount,
              status: 'active'
            }, {
              onConflict: 'user_id,type',
              ignoreDuplicates: false
            })

          // Update existing account if it exists
          await supabaseClient.rpc('update_agent_balance', {
            agent_id: reservation.property.user_id,
            amount: agentAmount
          })

          // Notify agent
          await supabaseClient.functions.invoke('process-notification', {
            body: {
              user_id: reservation.property.user_id,
              type: 'payment',
              title: 'Payment Received',
              message: `You received ₦${(agentAmount / 100).toLocaleString()} for reservation of ${reservation.property.title}`,
              metadata: {
                amount: agentAmount / 100,
                currency: 'NGN',
                reservation_id: reservation.id
              }
            }
          })
        }

      } else if (payment.related_type === 'wallet_topup') {
        // Update user account balance
        const { error: accountError } = await supabaseClient
          .from('accounts')
          .upsert({
            user_id: payment.user_id,
            type: 'wallet',
            currency: 'NGN',
            amount: transaction.amount,
            status: 'active'
          }, {
            onConflict: 'user_id,type',
            ignoreDuplicates: false
          })

        if (accountError) throw accountError
      }

      // Send success notification to user
      await supabaseClient.functions.invoke('process-notification', {
        body: {
          user_id: payment.user_id,
          type: 'payment',
          title: 'Payment Successful',
          message: `Your payment of ₦${(transaction.amount / 100).toLocaleString()} has been processed successfully.`,
          metadata: {
            amount: transaction.amount / 100,
            currency: transaction.currency,
            reference: reference,
            type: payment.related_type
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
