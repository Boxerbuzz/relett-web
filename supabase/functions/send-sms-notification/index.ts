
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  createTypedSupabaseClient,
  createSuccessResponse, 
  createErrorResponse,
  createResponse,
  createCorsResponse 
} from '../shared/supabase-client.ts';

interface SMSNotificationRequest {
  phoneNumber: string;
  message: string;
  notificationId?: string;
}

interface SMSResponse {
  success: boolean;
  message: string;
  sid: string;
  status?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  try {
    const { phoneNumber, message, notificationId }: SMSNotificationRequest = await req.json();

    if (!phoneNumber || !message) {
      return createResponse(createErrorResponse('Missing required fields'), 400);
    }

    const supabase = createTypedSupabaseClient();

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.log('Twilio credentials not found, skipping SMS');
      
      // Log mock delivery
      if (notificationId) {
        await supabase
          .from('notification_delivery_logs')
          .insert({
            notification_id: notificationId,
            channel: 'sms',
            status: 'sent',
            provider: 'twilio_mock',
            external_id: `mock_sms_${Date.now()}`
          });
      }

      const mockResponse: SMSResponse = {
        success: true,
        message: 'Mock SMS sent (development mode)',
        sid: `mock_sms_${Date.now()}`
      };

      return createResponse(createSuccessResponse(mockResponse));
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
      await supabase
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

    const response: SMSResponse = {
      success: true,
      message: 'SMS sent successfully',
      sid: twilioData.sid,
      status: twilioData.status
    };

    return createResponse(createSuccessResponse(response));

  } catch (error) {
    console.error('SMS notification error:', error);
    
    // Log failed delivery
    const supabase = createTypedSupabaseClient();
    const { notificationId } = await req.json().catch(() => ({}));
    if (notificationId) {
      await supabase
        .from('notification_delivery_logs')
        .insert({
          notification_id: notificationId,
          channel: 'sms',
          status: 'failed',
          provider: 'twilio',
          error_message: error instanceof Error ? error.message : String(error)
        });
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(createErrorResponse('Failed to send SMS', errorMessage), 500);
  }
});
