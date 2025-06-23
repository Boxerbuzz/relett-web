
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { 
  createTypedSupabaseClient, 
  createSuccessResponse, 
  createErrorResponse,
  createResponse,
  createCorsResponse 
} from '../shared/supabase-client.ts';

interface ChatNotificationRequest {
  record: {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
  };
}

interface NotificationResult {
  participantId: string;
  success: boolean;
  error?: unknown;
}

interface User {
  first_name: string;
  last_name: string;
}

interface Conversation {
  id: string;
  name: string;
  participants: string[];
  users?: User;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createCorsResponse();
  }

  try {
    const { record }: ChatNotificationRequest = await req.json();
    
    if (!record || !record.conversation_id || !record.sender_id) {
      return createResponse(createErrorResponse('Invalid message record'), 400);
    }

    console.log('Processing chat notification for message:', record.id);

    const supabase = createTypedSupabaseClient();

    // Get conversation details and participants
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('*, users:admin_id(first_name, last_name)')
      .eq('id', record.conversation_id)
      .single();

    if (conversationError || !conversation) {
      console.error('Conversation not found:', conversationError);
      return createResponse(createErrorResponse('Conversation not found'), 404);
    }

    // Get sender details
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', record.sender_id)
      .single();

    if (senderError || !sender) {
      console.error('Sender not found:', senderError);
      return createResponse(createErrorResponse('Sender not found'), 404);
    }

    // Notify all participants except the sender
    const participantsToNotify = (conversation as Conversation).participants.filter(
      (participantId: string) => participantId !== record.sender_id
    );

    console.log(`Notifying ${participantsToNotify.length} participants`);

    const notificationPromises = participantsToNotify.map(async (participantId: string) => {
      const { data, error } = await supabase.rpc('create_notification_with_delivery', {
        p_user_id: participantId,
        p_type: 'chat',
        p_title: `New message in ${(conversation as Conversation).name}`,
        p_message: `${sender.first_name} ${sender.last_name}: ${record.content.substring(0, 100)}${record.content.length > 100 ? '...' : ''}`,
        p_metadata: {
          conversation_id: record.conversation_id,
          message_id: record.id,
          sender_id: record.sender_id
        },
        p_action_url: `/conversations/${record.conversation_id}`,
        p_action_label: 'View Conversation',
        p_sender_id: record.sender_id
      });

      if (error) {
        console.error(`Failed to create notification for user ${participantId}:`, error);
      }

      const result: NotificationResult = { participantId, success: !error, error };
      return result;
    });

    const results = await Promise.all(notificationPromises);
    const successCount = results.filter(r => r.success).length;

    console.log(`Successfully created ${successCount}/${results.length} notifications`);

    const response = {
      success: true,
      notified_count: successCount,
      total_participants: results.length,
      results
    };

    return createResponse(createSuccessResponse(response));

  } catch (error) {
    console.error('Error in send-chat-notification function:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return createResponse(createErrorResponse('Chat notification failed', errorMessage), 500);
  }
});
