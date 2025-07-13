import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { systemLogger } from "../shared/system-logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  notification_id: string;
}

interface NotificationPreferences {
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_types: Record<string, boolean>;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  do_not_disturb: boolean;
}

interface DeliveryResult {
  channel: string;
  success: boolean;
}

interface PushNotificationData {
  notification_id?: string;
  action_url?: string;
  [key: string]: unknown;
}

interface NotificationServiceResponse {
  success: boolean;
  error?: string;
  data?: unknown;
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

async function sendPushNotification(
  userToken: string,
  title: string,
  message: string,
  data?: PushNotificationData
): Promise<NotificationServiceResponse> {
  const oneSignalAppId = Deno.env.get("ONESIGNAL_APP_ID");
  const oneSignalApiKey = Deno.env.get("ONESIGNAL_API_KEY");

  if (!oneSignalAppId || !oneSignalApiKey) {
    systemLogger("[PUSH-NOTIFICATION]", "OneSignal credentials not configured");
    return { success: false, error: "OneSignal not configured" };
  }

  try {
    const response = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${oneSignalApiKey}`,
      },
      body: JSON.stringify({
        app_id: oneSignalAppId,
        include_external_user_ids: [userToken],
        headings: { en: title },
        contents: { en: message },
        data: data || {},
      }),
    });

    const result = await response.json();
    return { success: response.ok, data: result };
  } catch (error) {
    systemLogger("[PUSH-NOTIFICATION]", error);
    return { success: false, error: error.message };
  }
}

async function sendEmail(to: string, subject: string, content: string): Promise<NotificationServiceResponse> {
  const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const twilioEmailApiKey = Deno.env.get("TWILIO_EMAIL_API_KEY");

  if (!twilioAccountSid || !twilioEmailApiKey) {
    systemLogger(
      "[EMAIL-NOTIFICATION]",
      "Twilio email credentials not configured"
    );
    return { success: false, error: "Twilio email not configured" };
  }

  try {
    const response = await fetch("https://email.twilio.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${twilioEmailApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to }],
            subject: subject,
          },
        ],
        from: {
          email: "noreply@propertyplatform.com",
          name: "Property Platform",
        },
        content: [
          {
            type: "text/html",
            value: content,
          },
        ],
      }),
    });

    const result = await response.text();
    return { success: response.ok, data: result };
  } catch (error) {
    systemLogger("[EMAIL-NOTIFICATION]", error);
    return { success: false, error: error.message };
  }
}

async function sendSMS(to: string, message: string): Promise<NotificationServiceResponse> {
  const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
    systemLogger("[SMS-NOTIFICATION]", "Twilio SMS credentials not configured");
    return { success: false, error: "Twilio SMS not configured" };
  }

  try {
    const auth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          From: twilioPhoneNumber,
          To: to,
          Body: message,
        }),
      }
    );

    const result = await response.json();
    return { success: response.ok, data: result };
  } catch (error) {
    systemLogger("[SMS-NOTIFICATION]", error);
    return { success: false, error: error.message };
  }
}

function isWithinQuietHours(quietStart?: string, quietEnd?: string): boolean {
  if (!quietStart || !quietEnd) return false;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTime = currentHour * 60 + currentMinute;

  const [startHour, startMinute] = quietStart.split(":").map(Number);
  const [endHour, endMinute] = quietEnd.split(":").map(Number);

  const startTime = startHour * 60 + startMinute;
  const endTime = endHour * 60 + endMinute;

  if (startTime <= endTime) {
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    return currentTime >= startTime || currentTime <= endTime;
  }
}

async function processNotification(notificationId: string) {
  systemLogger(
    "[PROCESS-NOTIFICATION]",
    `Processing notification: ${notificationId}`
  );

  // Get notification details
  const { data: notification, error: notificationError } = await supabase
    .from("notifications")
    .select("*")
    .eq("id", notificationId)
    .single();

  if (notificationError || !notification) {
    systemLogger("[PROCESS-NOTIFICATION]", notificationError);
    return { success: false, error: "Notification not found" };
  }

  // Get user data
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("id, email, phone, first_name, last_name")
    .eq("id", notification.user_id)
    .single();

  if (userError || !user) {
    systemLogger("[PROCESS-NOTIFICATION]", userError);
    return { success: false, error: "User not found" };
  }

  // Get user notification preferences
  const { data: preferences, error: preferencesError } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", notification.user_id)
    .single();

  const userPreferences: NotificationPreferences = preferences || {
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    notification_types: {},
    do_not_disturb: false,
  };

  // Check if user wants this type of notification
  const notificationType = notification.type;
  if (userPreferences.notification_types[notificationType] === false) {
    systemLogger(
      "[PROCESS-NOTIFICATION]",
      `User has disabled ${notificationType} notifications`
    );
    return { success: true, message: "Notification type disabled by user" };
  }

  // Check do not disturb
  if (userPreferences.do_not_disturb) {
    systemLogger("[PROCESS-NOTIFICATION]", "User has do not disturb enabled");
    return { success: true, message: "Do not disturb enabled" };
  }

  // Check quiet hours
  if (
    isWithinQuietHours(
      userPreferences.quiet_hours_start,
      userPreferences.quiet_hours_end
    )
  ) {
    systemLogger(
      "[PROCESS-NOTIFICATION]",
      "Within quiet hours, scheduling for later"
    );

    // Schedule for end of quiet hours
    const [endHour, endMinute] = (userPreferences.quiet_hours_end || "07:00")
      .split(":")
      .map(Number);
    const scheduledFor = new Date();
    scheduledFor.setHours(endHour, endMinute, 0, 0);

    if (scheduledFor <= new Date()) {
      scheduledFor.setDate(scheduledFor.getDate() + 1);
    }

    await supabase
      .from("notifications")
      .update({ scheduled_for: scheduledFor.toISOString() })
      .eq("id", notificationId);

    return { success: true, message: "Scheduled for after quiet hours" };
  }

  const deliveryResults: DeliveryResult[] = [];

  // Send push notification
  if (userPreferences.push_notifications) {
    systemLogger("[PROCESS-NOTIFICATION]", "Sending push notification");

    const { data: deliveryRecord } = await supabase
      .from("notification_deliveries")
      .insert({
        notification_id: notificationId,
        channel: "push",
        status: "pending",
      })
      .select()
      .single();

    const pushResult = await sendPushNotification(
      user.id,
      notification.title,
      notification.message || "",
      { notification_id: notificationId, action_url: notification.action_url }
    );

    if (deliveryRecord) {
      await supabase
        .from("notification_deliveries")
        .update({
          status: pushResult.success ? "delivered" : "failed",
          error_message: pushResult.success ? null : pushResult.error,
          delivered_at: pushResult.success ? new Date().toISOString() : null,
          external_id: pushResult.data?.id,
        })
        .eq("id", deliveryRecord.id);
    }

    deliveryResults.push({ channel: "push", success: pushResult.success });
  }

  // Send email notification
  if (userPreferences.email_notifications && user.email) {
    systemLogger("[PROCESS-NOTIFICATION]", "Sending email notification");

    const { data: deliveryRecord } = await supabase
      .from("notification_deliveries")
      .insert({
        notification_id: notificationId,
        channel: "email",
        status: "pending",
      })
      .select()
      .single();

    const emailContent = `
      <h2>${notification.title}</h2>
      <p>${notification.message || ""}</p>
      ${
        notification.action_url
          ? `<a href="${
              notification.action_url
            }" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">${
              notification.action_label || "View Details"
            }</a>`
          : ""
      }
    `;

    const emailResult = await sendEmail(
      user.email,
      notification.title,
      emailContent
    );

    if (deliveryRecord) {
      await supabase
        .from("notification_deliveries")
        .update({
          status: emailResult.success ? "delivered" : "failed",
          error_message: emailResult.success ? null : emailResult.error,
          delivered_at: emailResult.success ? new Date().toISOString() : null,
        })
        .eq("id", deliveryRecord.id);
    }

    deliveryResults.push({ channel: "email", success: emailResult.success });
  }

  // Send SMS notification
  if (userPreferences.sms_notifications && user.phone) {
    systemLogger("[PROCESS-NOTIFICATION]", "Sending SMS notification");

    const { data: deliveryRecord } = await supabase
      .from("notification_deliveries")
      .insert({
        notification_id: notificationId,
        channel: "sms",
        status: "pending",
      })
      .select()
      .single();

    const smsMessage = `${notification.title}\n${notification.message || ""}${
      notification.action_url ? `\nView: ${notification.action_url}` : ""
    }`;

    const smsResult = await sendSMS(user.phone, smsMessage);

    if (deliveryRecord) {
      await supabase
        .from("notification_deliveries")
        .update({
          status: smsResult.success ? "delivered" : "failed",
          error_message: smsResult.success ? null : smsResult.error,
          delivered_at: smsResult.success ? new Date().toISOString() : null,
          external_id: smsResult.data?.sid,
        })
        .eq("id", deliveryRecord.id);
    }

    deliveryResults.push({ channel: "sms", success: smsResult.success });
  }

  systemLogger("[PROCESS-NOTIFICATION]", deliveryResults);

  return {
    success: true,
    deliveryResults,
    message: "Notification processed successfully",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { notification_id }: NotificationRequest = await req.json();

    if (!notification_id) {
      return new Response(
        JSON.stringify({ error: "notification_id is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await processNotification(notification_id);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    systemLogger("[PROCESS-NOTIFICATION]", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
