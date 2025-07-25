
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, cacheConfig } from '@/lib/queryClient';

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

export function useConversations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: conversations = [],
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery<ConversationWithDetails[], Error>({
    queryKey: queryKeys.messaging.conversations(user?.id || ''),
    queryFn: async (): Promise<ConversationWithDetails[]> => {
      if (!user?.id) return [];

      // Fetch conversations where user is participant or admin
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('*')
        .or(`admin_id.eq.${user.id},participants.cs.{${user.id}}`)
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

      return conversationsWithDetails as ConversationWithDetails[];
    },
    enabled: !!user?.id,
    ...cacheConfig.realtime, // Use realtime config for conversations
  });

  const createConversation = async (participantEmail: string, name: string) => {
    if (!user?.id) throw new Error('User not authenticated');

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
          admin_id: user.id,
          participants: [user.id, userData.id]
        })
        .select()
        .single();

      if (conversationError) throw conversationError;

      // Invalidate conversations cache
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.messaging.conversations(user.id) 
      });

      return conversationData;
    } catch (err) {
      console.error('Error creating conversation:', err);
      throw err;
    }
  };

  const joinConversation = async (conversationId: string) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase.rpc('add_conversation_participant', {
        conversation_id: conversationId,
        user_id: user.id
      });

      if (error) throw error;

      // Invalidate conversations cache
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.messaging.conversations(user.id) 
      });

      return data;
    } catch (err) {
      console.error('Error joining conversation:', err);
      throw err;
    }
  };

  const error = queryError?.message || null;

  return {
    conversations,
    loading,
    error,
    refetch,
    createConversation,
    joinConversation
  };
}
