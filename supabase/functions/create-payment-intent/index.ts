
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  createAuthenticatedClient,
  createSuccessResponse, 
  createErrorResponse,
  createResponse,
  createCorsResponse 
} from '../shared/supabase-client.ts';

interface PaymentIntentRequest {
  amount: number;
  currency: string;
  purpose: string;
  metadata?: Record<string, unknown>;
}

interface PaymentIntentResponse {
  success: boolean;
  payment_url: string;
  reference: string;
  session_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  try {
    const authHeader = req.headers.get('Authorization')!;
    const supabaseClient = createAuthenticatedClient(authHeader);

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      return createResponse(createErrorResponse('Unauthorized'), 401);
    }

    const { amount, currency, purpose, metadata }: PaymentIntentRequest = await req.json();

    // Validate required fields
    if (!amount || !currency || !purpose) {
      return createResponse(createErrorResponse('Missing required fields: amount, currency, purpose'), 400);
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
      .single();

    if (sessionError) throw sessionError;

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
    });

    const paystackData = await paystackResponse.json();

    if (!paystackData.status) {
      throw new Error(paystackData.message || 'Payment initialization failed');
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
      .eq('id', paymentSession.id);

    const response: PaymentIntentResponse = {
      success: true,
      payment_url: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
      session_id: paymentSession.id
    };

    return createResponse(createSuccessResponse(response));

  } catch (error) {
    console.error('Payment intent error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(createErrorResponse('Payment intent creation failed', errorMessage), 400);
  }
});
