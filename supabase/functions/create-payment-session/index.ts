
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { amount, currency = 'USD', purpose, metadata = {} } = await req.json();

    if (!amount || !purpose) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create payment session in database
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const { data: session, error: dbError } = await supabaseClient
      .from('payment_sessions')
      .insert({
        user_id: user.id,
        session_id: sessionId,
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        purpose,
        metadata,
        expires_at: expiresAt.toISOString(),
        payment_provider: 'stripe'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(JSON.stringify({ error: 'Failed to create session' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Stripe checkout session (when STRIPE_SECRET_KEY is available)
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (stripeKey) {
      const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stripeKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'payment_method_types[]': 'card',
          'line_items[0][price_data][currency]': currency.toLowerCase(),
          'line_items[0][price_data][product_data][name]': purpose,
          'line_items[0][price_data][unit_amount]': Math.round(amount * 100).toString(),
          'line_items[0][quantity]': '1',
          'mode': 'payment',
          'success_url': `${req.headers.get('origin')}/payment/success?session_id=${sessionId}`,
          'cancel_url': `${req.headers.get('origin')}/payment/cancel?session_id=${sessionId}`,
          'client_reference_id': sessionId,
        }),
      });

      if (stripeResponse.ok) {
        const stripeSession = await stripeResponse.json();
        return new Response(JSON.stringify({
          session_id: sessionId,
          checkout_url: stripeSession.url,
          provider: 'stripe'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Fallback for development or when Stripe is not configured
    return new Response(JSON.stringify({
      session_id: sessionId,
      checkout_url: `${req.headers.get('origin')}/payment/mock?session_id=${sessionId}`,
      provider: 'mock'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Payment session error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
