
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  createSuccessResponse, 
  createErrorResponse,
  createResponse,
  createCorsResponse,
  verifyUser,
  createTypedSupabaseClient
} from '../shared/supabase-client.ts';

interface PaymentSessionRequest {
  amount: number;
  currency?: string;
  purpose: string;
  metadata?: Record<string, unknown>;
}

interface PaymentSessionResponse {
  session_id: string;
  checkout_url: string;
  provider: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const userResult = await verifyUser(authHeader);
    
    if (!userResult.success) {
      return createResponse(userResult, 401);
    }

    const { amount, currency = 'USD', purpose, metadata = {} }: PaymentSessionRequest = await req.json();

    if (!amount || !purpose) {
      return createResponse(createErrorResponse('Missing required fields'), 400);
    }

    const supabase = createTypedSupabaseClient();

    // Create payment session in database
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

    const { data: _session, error: dbError } = await supabase
      .from('payment_sessions')
      .insert({
        user_id: userResult.data.id,
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
      return createResponse(createErrorResponse('Failed to create session'), 500);
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
        const response: PaymentSessionResponse = {
          session_id: sessionId,
          checkout_url: stripeSession.url,
          provider: 'stripe'
        };
        return createResponse(createSuccessResponse(response));
      }
    }

    // Fallback for development or when Stripe is not configured
    const response: PaymentSessionResponse = {
      session_id: sessionId,
      checkout_url: `${req.headers.get('origin')}/payment/mock?session_id=${sessionId}`,
      provider: 'mock'
    };

    return createResponse(createSuccessResponse(response));

  } catch (error) {
    console.error('Payment session error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(createErrorResponse('Internal server error', errorMessage), 500);
  }
});
