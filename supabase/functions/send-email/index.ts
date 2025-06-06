
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const EMAIL_TEMPLATES = {
  'property-verification': {
    subject: (data: any) => `Property Verification Update - ${data.propertyTitle}`,
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Property Verification Update</h2>
        <p>Hello,</p>
        <p>Your property <strong>"${data.propertyTitle}"</strong> has been ${data.verificationStatus}.</p>
        ${data.verificationStatus === 'approved' ? 
          '<p style="color: green;">Congratulations! Your property is now live and visible to potential buyers/renters.</p>' :
          '<p style="color: orange;">Please review the feedback and make necessary adjustments.</p>'
        }
        <p>Thank you for using our platform.</p>
        <hr>
        <small>This email was sent on ${new Date(data.timestamp).toLocaleDateString()}</small>
      </div>
    `,
    text: (data: any) => `Property Verification Update\n\nYour property "${data.propertyTitle}" has been ${data.verificationStatus}.`
  },
  'welcome': {
    subject: (data: any) => `Welcome to our platform, ${data.userName}!`,
    html: (data: any) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to Our Real Estate Platform!</h2>
        <p>Hello ${data.userName},</p>
        <p>Thank you for joining our platform. You can now:</p>
        <ul>
          <li>List your properties</li>
          <li>Browse available properties</li>
          <li>Invest in tokenized properties</li>
          <li>Connect with verified agents</li>
        </ul>
        <p>Get started by completing your profile and verifying your identity.</p>
        <p>Best regards,<br>The Platform Team</p>
      </div>
    `,
    text: (data: any) => `Welcome ${data.userName}! Thank you for joining our real estate platform.`
  }
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

    const { to, template, data } = await req.json();

    if (!to || !template) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailTemplate = EMAIL_TEMPLATES[template as keyof typeof EMAIL_TEMPLATES];
    if (!emailTemplate) {
      return new Response(JSON.stringify({ error: 'Invalid template' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get email service credentials
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const sendgridApiKey = Deno.env.get('SENDGRID_API_KEY');

    let emailResult;

    if (resendApiKey) {
      // Use Resend
      emailResult = await sendWithResend(resendApiKey, to, emailTemplate, data);
    } else if (sendgridApiKey) {
      // Use SendGrid
      emailResult = await sendWithSendGrid(sendgridApiKey, to, emailTemplate, data);
    } else {
      // Mock email for development
      console.log('Mock email sent:', { to, template, data });
      emailResult = { success: true, messageId: `mock_${Date.now()}` };
    }

    return new Response(JSON.stringify(emailResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Email sending error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to send email',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendWithResend(apiKey: string, to: string, template: any, data: any) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'noreply@yourplatform.com',
      to: [to],
      subject: template.subject(data),
      html: template.html(data),
      text: template.text(data),
    }),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(`Resend API error: ${result.message}`);
  }

  return { success: true, messageId: result.id };
}

async function sendWithSendGrid(apiKey: string, to: string, template: any, data: any) {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email: to }],
      }],
      from: { email: 'noreply@yourplatform.com' },
      subject: template.subject(data),
      content: [
        {
          type: 'text/html',
          value: template.html(data),
        },
        {
          type: 'text/plain',
          value: template.text(data),
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid API error: ${error}`);
  }

  return { success: true, messageId: response.headers.get('x-message-id') };
}
