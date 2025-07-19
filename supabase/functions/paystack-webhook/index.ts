
import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { createHmac } from 'https://deno.land/std@0.190.0/node/crypto.ts'
import { timingSafeEqual } from 'https://deno.land/std@0.190.0/crypto/timing_safe_equal.ts'
import { systemLogger } from '../shared/system-logger.ts'

interface PaystackWebhookData {
  event: string;
  data: {
    reference: string;
    amount: number;
    currency: string;
    customer?: Record<string, unknown>;
    status: string;
    [key: string]: unknown;
  };
}

/**
 * Safely compare two strings using timing-safe comparison to prevent timing attacks
 */
function timingSafeStringEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  
  return timingSafeEqual(aBytes, bBytes);
}

/**
 * Validate webhook signature using timing-safe comparison
 */
function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  const hash = createHmac('sha512', secret)
    .update(body, 'utf8')
    .digest('hex');
  
  return timingSafeStringEqual(hash, signature);
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paystack-signature',
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

    // Get the raw body as text for signature verification
    const body = await req.text()
    const signature = req.headers.get('x-paystack-signature')
    
    if (!signature) {
      throw new Error('No Paystack signature found')
    }

    // Verify the webhook signature
    const secret = Deno.env.get('PAYSTACK_SECRET_KEY')
    if (!secret) {
      throw new Error('Paystack secret key not configured')
    }

    if (!verifyWebhookSignature(body, signature, secret)) {
      systemLogger('[PAYSTACK-WEBHOOK]', 'Invalid webhook signature detected')
      throw new Error('Invalid signature')
    }

    systemLogger('[PAYSTACK-WEBHOOK]', 'Webhook signature verified')

    // Parse the webhook data
    const webhookData = JSON.parse(body)
    const { event, data } = webhookData

    systemLogger('[PAYSTACK-WEBHOOK]', `Processing event: ${event}, Reference: ${data?.reference}`)

    // Handle different webhook events
    switch (event) {
      case 'charge.success':
        await handleChargeSuccess(supabaseClient, data)
        break
      
      case 'charge.failed':
        await handleChargeFailed(supabaseClient, data)
        break
      
      case 'transfer.success':
        await handleTransferSuccess(supabaseClient, data)
        break
      
      case 'transfer.failed':
        await handleTransferFailed(supabaseClient, data)
        break
      
      default:
        systemLogger('[PAYSTACK-WEBHOOK]', `Unhandled webhook event: ${event}`)
    }

    return new Response(
      JSON.stringify({ success: true, event }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    systemLogger('[PAYSTACK-WEBHOOK]', `Webhook processing error: ${error.message}`)
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function handleChargeSuccess(supabaseClient: any, data: any) {
  const { reference, amount, currency, customer, status } = data
  
  systemLogger('[PAYSTACK-WEBHOOK]', `Processing successful charge: ${reference}`)

  // Find the payment record
  const { data: payment, error: paymentError } = await supabaseClient
    .from('payments')
    .select('*')
    .eq('reference', reference)
    .single()

  if (paymentError || !payment) {
    systemLogger('[PAYSTACK-WEBHOOK]', `Payment record not found for reference: ${reference}`)
    return
  }

  // Update payment status
  const { error: updateError } = await supabaseClient
    .from('payments')
    .update({
      status: 'success',
      paid_at: new Date().toISOString(),
      metadata: {
        ...payment.metadata,
        paystack_transaction: data
      }
    })
    .eq('id', payment.id)

  if (updateError) {
    systemLogger('[PAYSTACK-WEBHOOK]', `Failed to update payment: ${updateError.message}`)
    return
  }

  systemLogger('[PAYSTACK-WEBHOOK]', `Payment updated successfully: ${payment.id}`)

  // Process based on payment type
  if (payment.related_type === 'rentals') {
    await processRentalPayment(supabaseClient, payment, data)
  } else if (payment.related_type === 'reservations') {
    await processReservationPayment(supabaseClient, payment, data)
  } else if (payment.related_type === 'wallet_topup') {
    await processWalletTopup(supabaseClient, payment, data)
  }

  // Send success notification to user
  await supabaseClient.functions.invoke('process-notification', {
    body: {
      user_id: payment.user_id,
      type: 'payment',
      title: 'Payment Successful',
      message: `Your payment of ₦${(amount / 100).toLocaleString()} has been processed successfully.`,
      metadata: {
        amount: amount / 100,
        currency,
        reference,
        type: payment.related_type
      },
      action_url: getPaymentActionUrl(payment),
      action_label: 'View Details'
    }
  })
}

async function handleChargeFailed(supabaseClient: any, data: any) {
  const { reference, amount, currency } = data
  
  systemLogger('[PAYSTACK-WEBHOOK]', `Processing failed charge: ${reference}`)

  // Find and update payment record
  const { error: updateError } = await supabaseClient
    .from('payments')
    .update({
      status: 'failed',
      metadata: {
        paystack_transaction: data
      }
    })
    .eq('reference', reference)

  if (updateError) {
    systemLogger('[PAYSTACK-WEBHOOK]', `Failed to update failed payment: ${updateError.message}`)
    return
  }

  // Get payment details for notification
  const { data: payment } = await supabaseClient
    .from('payments')
    .select('*')
    .eq('reference', reference)
    .single()

  if (payment) {
    // Send failure notification to user
    await supabaseClient.functions.invoke('process-notification', {
      body: {
        user_id: payment.user_id,
        type: 'payment',
        title: 'Payment Failed',
        message: `Your payment of ₦${(amount / 100).toLocaleString()} could not be processed. Please try again.`,
        metadata: {
          amount: amount / 100,
          currency,
          reference,
          type: payment.related_type
        },
        action_url: getPaymentActionUrl(payment),
        action_label: 'Retry Payment'
      }
    })
  }
}

async function processRentalPayment(supabaseClient: any, payment: any, transactionData: any) {
  // Update rental status
  const { error: rentalError } = await supabaseClient
    .from('rentals')
    .update({
      payment_status: 'paid',
      status: 'confirmed'
    })
    .eq('id', payment.related_id)

  if (rentalError) {
    systemLogger('[PAYSTACK-WEBHOOK]', `Failed to update rental: ${rentalError.message}`)
    return
  }

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
    const agentAmount = Math.round((transactionData.amount / 100) * 0.9 * 100) // Convert back to kobo
    
    // Credit agent account
    await creditAgentAccount(supabaseClient, rental.property.user_id, agentAmount)

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
        },
        action_url: '/agent/rentals',
        action_label: 'View Rentals'
      }
    })
  }

  // Send rental notification
  await supabaseClient.functions.invoke('send-rental-notification', {
    body: {
      rental_id: payment.related_id,
      status: 'confirmed',
      previous_status: 'pending'
    }
  })
}

async function processReservationPayment(supabaseClient: any, payment: any, transactionData: any) {
  // Update reservation status
  const { error: reservationError } = await supabaseClient
    .from('reservations')
    .update({
      status: 'confirmed'
    })
    .eq('id', payment.related_id)

  if (reservationError) {
    systemLogger('[PAYSTACK-WEBHOOK]', `Failed to update reservation: ${reservationError.message}`)
    return
  }

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
    const agentAmount = Math.round((transactionData.amount / 100) * 0.9 * 100) // Convert back to kobo
    
    // Credit agent account
    await creditAgentAccount(supabaseClient, reservation.property.user_id, agentAmount)

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
        },
        action_url: '/agent/reservations',
        action_label: 'View Reservations'
      }
    })
  }
}

async function processWalletTopup(supabaseClient: any, payment: any, transactionData: any) {
  // Update user account balance
  const { error: accountError } = await supabaseClient
    .from('accounts')
    .upsert({
      user_id: payment.user_id,
      type: 'wallet',
      currency: 'NGN',
      amount: transactionData.amount,
      status: 'active'
    }, {
      onConflict: 'user_id,type',
      ignoreDuplicates: false
    })

  if (accountError) {
    systemLogger('[PAYSTACK-WEBHOOK]', `Failed to update wallet: ${accountError.message}`)
  }
}

async function creditAgentAccount(supabaseClient: any, agentId: string, amount: number) {
  // Check if agent account exists
  const { data: existingAccount } = await supabaseClient
    .from('accounts')
    .select('*')
    .eq('user_id', agentId)
    .eq('type', 'main')
    .single()

  if (existingAccount) {
    // Update existing account
    await supabaseClient
      .from('accounts')
      .update({
        amount: existingAccount.amount + amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingAccount.id)
  } else {
    // Create new account
    await supabaseClient
      .from('accounts')
      .insert({
        user_id: agentId,
        type: 'main',
        currency: 'NGN',
        amount: amount,
        status: 'active'
      })
  }
}

async function handleTransferSuccess(supabaseClient: any, data: any) {
  systemLogger('[PAYSTACK-WEBHOOK]', `Transfer successful: ${data.reference || 'unknown'}`)
  // Handle successful transfers (e.g., agent payouts)
}

async function handleTransferFailed(supabaseClient: any, data: any) {
  systemLogger('[PAYSTACK-WEBHOOK]', `Transfer failed: ${data.reference || 'unknown'}`)
  // Handle failed transfers
}

function getPaymentActionUrl(payment: any): string {
  switch (payment.related_type) {
    case 'rentals':
      return `/properties/${payment.property_id}`
    case 'reservations':
      return `/properties/${payment.property_id}`
    case 'wallet_topup':
      return '/dashboard'
    default:
      return '/dashboard'
  }
}
