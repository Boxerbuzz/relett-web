
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useConversations, ConversationWithDetails } from '@/hooks/useConversations';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  selectedConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export function ConversationList({ selectedConversationId, onSelectConversation }: ConversationListProps) {
  const { conversations, loading } = useConversations();

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3 p-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Conversations</h2>
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversationId === conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
            />
          ))}
          {conversations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No conversations yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ConversationItem({ 
  conversation, 
  isSelected, 
  onClick 
}: { 
  conversation: ConversationWithDetails;
  isSelected: boolean;
  onClick: () => void;
}) {
  const getDisplayName = () => {
    if (conversation.name && conversation.name !== 'Untitled') {
      return conversation.name;
    }
    
    // For direct conversations, show other participant's name
    if (conversation.type === 'direct' && conversation.participant_details) {
      const otherParticipant = conversation.participant_details[0];
      return otherParticipant 
        ? `${otherParticipant.first_name} ${otherParticipant.last_name}`.trim() || otherParticipant.email
        : 'Unknown User';
    }
    
    return conversation.name || 'Untitled Conversation';
  };

  const getLastMessageTime = () => {
    if (!conversation.last_message) return '';
    return formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true });
  };

  return (
    <Card 
      className={`cursor-pointer transition-colors hover:bg-gray-50 ${
        isSelected ? 'bg-blue-50 border-blue-200' : ''
      }`}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={conversation.avatar_url || undefined} />
            <AvatarFallback>
              {getDisplayName().split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm truncate">
                {getDisplayName()}
              </h3>
              {conversation.last_message && (
                <span className="text-xs text-gray-500 ml-2">
                  {getLastMessageTime()}
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-600 truncate">
                {conversation.last_message?.content || 'No messages yet'}
              </p>
              
              <div className="flex items-center space-x-1 ml-2">
                <Badge variant="secondary" className="text-xs">
                  {conversation.participants.length}
                </Badge>
                {conversation.type === 'group' && (
                  <Badge variant="outline" className="text-xs">
                    Group
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
