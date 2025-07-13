import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  createTypedSupabaseClient,
  createSuccessResponse,
  createErrorResponse,
  createResponse,
  createCorsResponse,
} from "../shared/supabase-client.ts";
import { systemLogger } from "../shared/system-logger.ts";

interface ChatNotificationRequest {
  message_id: string;
  conversation_id: string;
  sender_id: string;
}

interface ChatNotificationResponse {
  success: boolean;
  notifications_sent: number;
  message: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return createCorsResponse();
  }

  try {
    const { message_id, conversation_id, sender_id }: ChatNotificationRequest =
      await req.json();

    if (!message_id || !conversation_id || !sender_id) {
      return createResponse(
        createErrorResponse("Missing required fields"),
        400
      );
    }

    const supabase = createTypedSupabaseClient();

    // Get message details
    const { data: message, error: messageError } = await supabase
      .from("messages")
      .select("content, sender, type, property_id")
      .eq("id", message_id)
      .single();

    if (messageError || !message) {
      return createResponse(createErrorResponse("Message not found"), 404);
    }

    // Get conversation details and participants
    const { data: conversation, error: conversationError } = await supabase
      .from("conversations")
      .select("name, participants, type, admin_id")
      .eq("id", conversation_id)
      .single();

    if (conversationError || !conversation) {
      return createResponse(createErrorResponse("Conversation not found"), 404);
    }

    // Get sender profile
    const { data: senderProfile } = await supabase
      .from("users")
      .select("first_name, last_name, avatar")
      .eq("user_id", sender_id)
      .single();

    const senderName = senderProfile
      ? `${senderProfile.first_name} ${senderProfile.last_name}`.trim()
      : message.sender;

    // Create notifications for all participants except the sender
    const recipients = conversation.participants.filter(
      (id: string) => id !== sender_id
    );

    let notificationsSent = 0;

    for (const recipientId of recipients) {
      try {
        // Create notification using the database function
        const { data: _data, error } = await supabase.rpc(
          "create_notification_with_delivery",
          {
            p_user_id: recipientId,
            p_type: "chat_messages",
            p_title: `New message from ${senderName}`,
            p_message:
              message.type === "text"
                ? message.content.substring(0, 100) +
                  (message.content.length > 100 ? "..." : "")
                : `Sent a ${message.type}`,
            p_metadata: {
              message_id,
              conversation_id,
              sender_id,
              sender_name: senderName,
              conversation_name: conversation.name,
              message_type: message.type,
              property_id: message.property_id,
            },
            p_action_url: `/chat/${conversation_id}`,
            p_action_label: "View Chat",
            p_image_url: senderProfile?.avatar,
            p_sender_id: sender_id,
          }
        );

        if (!error) {
          notificationsSent++;
        } else {
          systemLogger(
            `Failed to create notification for user ${recipientId}:`,
            error
          );
        }
      } catch (notificationError) {
        systemLogger(
          `Error creating notification for user ${recipientId}:`,
          notificationError
        );
      }
    }

    const response: ChatNotificationResponse = {
      success: true,
      notifications_sent: notificationsSent,
      message: `Chat notifications sent to ${notificationsSent} participants`,
    };

    return createResponse(createSuccessResponse(response));
  } catch (error) {
    systemLogger("[SEND-CHAT-NOTIFICATION]", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(
      createErrorResponse("Internal server error", errorMessage),
      500
    );
  }
});
