
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();
    
    if (!record || !record.conversation_id || !record.sender_id) {
      return new Response(
        JSON.stringify({ error: 'Invalid message record' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing chat notification for message:', record.id);

    // Get conversation details and participants
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .select('*, users:admin_id(first_name, last_name)')
      .eq('id', record.conversation_id)
      .single();

    if (conversationError || !conversation) {
      console.error('Conversation not found:', conversationError);
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get sender details
    const { data: sender, error: senderError } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', record.sender_id)
      .single();

    if (senderError || !sender) {
      console.error('Sender not found:', senderError);
      return new Response(
        JSON.stringify({ error: 'Sender not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Notify all participants except the sender
    const participantsToNotify = conversation.participants.filter(
      (participantId: string) => participantId !== record.sender_id
    );

    console.log(`Notifying ${participantsToNotify.length} participants`);

    const notificationPromises = participantsToNotify.map(async (participantId: string) => {
      const { data, error } = await supabase.rpc('create_notification_with_delivery', {
        p_user_id: participantId,
        p_type: 'chat',
        p_title: `New message in ${conversation.name}`,
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

      return { participantId, success: !error, error };
    });

    const results = await Promise.all(notificationPromises);
    const successCount = results.filter(r => r.success).length;

    console.log(`Successfully created ${successCount}/${results.length} notifications`);

    return new Response(JSON.stringify({
      success: true,
      notified_count: successCount,
      total_participants: results.length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-chat-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
