import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createSuccessResponse,
  createErrorResponse,
  createResponse,
  createCorsResponse,
} from "../shared/supabase-client.ts";
import { systemLogger } from "../shared/system-logger.ts";

interface EmailRequest {
  to: string;
  template: string;
  data: Record<string, unknown>;
}

interface EmailTemplate {
  subject: (data: Record<string, unknown>) => string;
  html: (data: Record<string, unknown>) => string;
  text: (data: Record<string, unknown>) => string;
}

interface EmailResponse {
  success: boolean;
  messageId: string;
}

const EMAIL_TEMPLATES: Record<string, EmailTemplate> = {
  "property-verification": {
    subject: (data) => `Property Verification Update - ${data.propertyTitle}`,
    html: (data) => `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Property Verification Update</h2>
        <p>Hello,</p>
        <p>Your property <strong>"${data.propertyTitle}"</strong> has been ${
      data.verificationStatus
    }.</p>
        ${
          data.verificationStatus === "approved"
            ? '<p style="color: green;">Congratulations! Your property is now live and visible to potential buyers/renters.</p>'
            : '<p style="color: orange;">Please review the feedback and make necessary adjustments.</p>'
        }
        <p>Thank you for using our platform.</p>
        <hr>
        <small>This email was sent on ${new Date(
          data.timestamp as string
        ).toLocaleDateString()}</small>
      </div>
    `,
    text: (data) =>
      `Property Verification Update\n\nYour property "${data.propertyTitle}" has been ${data.verificationStatus}.`,
  },
  welcome: {
    subject: (data) => `Welcome to our platform, ${data.userName}!`,
    html: (data) => `
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
    text: (data) =>
      `Welcome ${data.userName}! Thank you for joining our real estate platform.`,
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createCorsResponse();
  }

  try {
    const { to, template, data }: EmailRequest = await req.json();

    if (!to || !template) {
      return createResponse(
        createErrorResponse("Missing required fields"),
        400
      );
    }

    const emailTemplate = EMAIL_TEMPLATES[template];
    if (!emailTemplate) {
      return createResponse(createErrorResponse("Invalid template"), 400);
    }

    // Get email service credentials
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");

    let emailResult: EmailResponse;

    if (resendApiKey) {
      // Use Resend
      emailResult = await sendWithResend(resendApiKey, to, emailTemplate, data);
    } else if (sendgridApiKey) {
      // Use SendGrid
      emailResult = await sendWithSendGrid(
        sendgridApiKey,
        to,
        emailTemplate,
        data
      );
    } else {
      // Mock email for development
      systemLogger("[SEND-EMAIL]", { to, template, data });
      emailResult = { success: true, messageId: `mock_${Date.now()}` };
    }

    return createResponse(createSuccessResponse(emailResult));
  } catch (error) {
    systemLogger("[SEND-EMAIL]", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(
      createErrorResponse("Failed to send email", errorMessage),
      500
    );
  }
});

async function sendWithResend(
  apiKey: string,
  to: string,
  template: EmailTemplate,
  data: Record<string, unknown>
): Promise<EmailResponse> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "noreply@yourplatform.com",
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

async function sendWithSendGrid(
  apiKey: string,
  to: string,
  template: EmailTemplate,
  data: Record<string, unknown>
): Promise<EmailResponse> {
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to }],
        },
      ],
      from: { email: "noreply@yourplatform.com" },
      subject: template.subject(data),
      content: [
        {
          type: "text/html",
          value: template.html(data),
        },
        {
          type: "text/plain",
          value: template.text(data),
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid API error: ${error}`);
  }

  return {
    success: true,
    messageId: response.headers.get("x-message-id") || "unknown",
  };
}
