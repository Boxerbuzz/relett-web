
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'file' | 'image' | 'vote' | 'system';
  attachment_url?: string;
  metadata: any;
  created_at: string;
  reply_to_id?: string;
  sender?: {
    first_name: string;
    last_name: string;
    avatar?: string;
  };
}

interface TypingUser {
  user_id: string;
  first_name: string;
  last_name: string;
}

export function useRealtimeChat(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!conversationId) return;

    // Fetch initial messages
    fetchMessages();

    // Subscribe to new messages
    const messagesChannel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          setMessages(prev => prev.map(msg => 
            msg.id === payload.new.id ? payload.new as ChatMessage : msg
          ));
        }
      )
      .subscribe();

    // Subscribe to typing indicators
    const typingChannel = supabase
      .channel('typing-indicators')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          fetchTypingUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(typingChannel);
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select(`
          *,
          sender:users!sender_id(first_name, last_name, avatar)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const processedMessages = (data || []).map(msg => ({
        ...msg,
        message_type: msg.message_type as ChatMessage['message_type'],
        sender: Array.isArray(msg.sender) ? msg.sender[0] : msg.sender
      }));
      
      setMessages(processedMessages as ChatMessage[]);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTypingUsers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('typing_indicators')
        .select(`
          user_id,
          users!user_id(first_name, last_name)
        `)
        .eq('conversation_id', conversationId)
        .neq('user_id', user.id)
        .gte('last_typed_at', new Date(Date.now() - 30000).toISOString());

      if (error) throw error;
      
      const typing = (data || []).map(item => {
        const userData = Array.isArray(item.users) ? item.users[0] : item.users;
        return {
          user_id: item.user_id,
          first_name: userData?.first_name || '',
          last_name: userData?.last_name || ''
        };
      });
      
      setTypingUsers(typing as TypingUser[]);
    } catch (error) {
      console.error('Error fetching typing users:', error);
    }
  };

  const sendMessage = async (content: string, messageType: ChatMessage['message_type'] = 'text', attachmentUrl?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          attachment_url: attachmentUrl
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive'
      });
    }
  };

  const updateTypingStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('typing_indicators')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          last_typed_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating typing status:', error);
    }
  };

  return {
    messages,
    typingUsers,
    isLoading,
    sendMessage,
    updateTypingStatus
  };
}
