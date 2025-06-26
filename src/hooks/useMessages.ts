
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

export interface MessageWithSender {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  attachment_url: string | null;
  reply_to_id: string | null;
  created_at: string;
  updated_at: string;
  sender: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar: string | null;
  } | null;
}

export function useMessages(conversationId: string | null) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    fetchMessages();

    // Set up real-time subscription for messages
    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          fetchMessages(); // Refetch to get sender details
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    if (!conversationId) return;

    try {
      setLoading(true);

      // First get the messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Then get sender details for each unique sender
      const senderIds = [...new Set(messagesData?.map(m => m.sender_id).filter(Boolean) || [])];
      
      const sendersMap = new Map();
      if (senderIds.length > 0) {
        const { data: sendersData } = await supabase
          .from('users')
          .select('id, first_name, last_name, email, avatar')
          .in('id', senderIds);

        sendersData?.forEach(sender => {
          sendersMap.set(sender.id, sender);
        });
      }

      // Combine messages with sender data
      const messagesWithSenders = messagesData?.map(message => ({
        ...message,
        sender: sendersMap.get(message.sender_id) || {
          id: message.sender_id,
          first_name: 'Unknown',
          last_name: 'User',
          email: '',
          avatar: null
        }
      })) || [];

      setMessages(messagesWithSenders);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, messageType: string = 'text') => {
    if (!conversationId || !user) return;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType
        });

      if (error) throw error;
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    refetch: fetchMessages
  };
}
