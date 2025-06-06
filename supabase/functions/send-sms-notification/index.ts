
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

    const { phoneNumber, message, notificationId } = await req.json();

    if (!phoneNumber || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.log('Twilio credentials not found, skipping SMS');
      
      // Log mock delivery
      if (notificationId) {
        await supabaseClient
          .from('notification_delivery_logs')
          .insert({
            notification_id: notificationId,
            channel: 'sms',
            status: 'sent',
            provider: 'twilio_mock',
            external_id: `mock_sms_${Date.now()}`
          });
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Mock SMS sent (development mode)',
        sid: `mock_sms_${Date.now()}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const formData = new URLSearchParams();
    formData.append('From', twilioPhoneNumber);
    formData.append('To', phoneNumber);
    formData.append('Body', message);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${twilioAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      throw new Error(`Twilio API error: ${twilioData.message}`);
    }

    // Log delivery status
    if (notificationId) {
      await supabaseClient
        .from('notification_delivery_logs')
        .insert({
          notification_id: notificationId,
          channel: 'sms',
          status: twilioData.status === 'queued' ? 'sent' : 'failed',
          provider: 'twilio',
          external_id: twilioData.sid,
          delivered_at: new Date().toISOString()
        });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'SMS sent successfully',
      sid: twilioData.sid,
      status: twilioData.status
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('SMS notification error:', error);
    
    // Log failed delivery
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { notificationId } = await req.json().catch(() => ({}));
    if (notificationId) {
      await supabaseClient
        .from('notification_delivery_logs')
        .insert({
          notification_id: notificationId,
          channel: 'sms',
          status: 'failed',
          provider: 'twilio',
          error_message: error.message
        });
    }

    return new Response(JSON.stringify({ 
      error: 'Failed to send SMS',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
