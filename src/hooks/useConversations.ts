import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';

export interface ConversationWithDetails {
  id: string;
  name: string;
  description: string | null;
  type: string;
  participants: string[];
  admin_id: string;
  is_archived: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  participant_details?: Array<{
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    avatar: string | null;
  }>;
}

// Global subscription manager to prevent multiple subscriptions
let globalChannel: any = null;
let subscriptionCount = 0;
let globalCallbacks: (() => void)[] = [];

export function useConversations() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    fetchConversations();
    
    // Add this instance's callback to global callbacks
    globalCallbacks.push(fetchConversations);
    subscriptionCount++;

    // Only create subscription if it doesn't exist
    if (!globalChannel) {
      globalChannel = supabase
        .channel('conversations-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'conversations'
          },
          () => {
            // Trigger all callbacks
            globalCallbacks.forEach(callback => callback());
          }
        )
        .subscribe();
    }

    return () => {
      // Remove this instance's callback
      const index = globalCallbacks.indexOf(fetchConversations);
      if (index > -1) {
        globalCallbacks.splice(index, 1);
      }
      subscriptionCount--;

      // Remove subscription when no more instances
      if (subscriptionCount === 0 && globalChannel) {
        supabase.removeChannel(globalChannel);
        globalChannel = null;
        globalCallbacks = [];
      }
    };
  }, [user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      // Fetch conversations where user is participant or admin
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .or(`admin_id.eq.${user?.id},participants.cs.{${user?.id}}`)
        .order('updated_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      // Fetch participant details and last messages for each conversation
      const conversationsWithDetails = await Promise.all(
        (conversationsData || []).map(async (conv) => {
          // Get participant details
          const { data: participantData } = await supabase
            .from('users')
            .select('id, first_name, last_name, email, avatar')
            .in('id', conv.participants);

          // Get last message
          const { data: lastMessageData } = await supabase
            .from('chat_messages')
            .select('content, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1);

          return {
            ...conv,
            participant_details: participantData || [],
            last_message: lastMessageData?.[0] || null
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
    } finally {
      setLoading(false);
    }
  };

  const createConversation = async (participantEmail: string, name: string) => {
    try {
      // Find user by email using direct query
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .eq('email', participantEmail)
        .single();

      if (userError || !userData) {
        throw new Error('User not found with that email');
      }

      // Create conversation
      const { data: conversationData, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          name,
          type: 'direct',
          admin_id: user?.id,
          participants: [user?.id, userData.id]
        })
        .select()
        .single();

      if (conversationError) throw conversationError;

      await fetchConversations();
      return conversationData;
    } catch (err) {
      console.error('Error creating conversation:', err);
      throw err;
    }
  };

  const joinConversation = async (conversationId: string) => {
    try {
      const { data, error } = await supabase.rpc('add_conversation_participant', {
        conversation_id: conversationId,
        user_id: user?.id
      });

      if (error) throw error;

      await fetchConversations();
      return data;
    } catch (err) {
      console.error('Error joining conversation:', err);
      throw err;
    }
  };

  return {
    conversations,
    loading,
    error,
    refetch: fetchConversations,
    createConversation,
    joinConversation
  };
}
