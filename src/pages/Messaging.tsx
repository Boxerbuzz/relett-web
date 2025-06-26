
import React, { useState } from 'react';
import { ConversationList } from '@/components/messaging/ConversationList';
import { ChatArea } from '@/components/messaging/ChatArea';
import { AdminConversationControls } from '@/components/messaging/AdminConversationControls';
import { useConversations } from '@/hooks/useConversations';

export function Messaging() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const { conversations } = useConversations();

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const conversationName = selectedConversation?.name || 'Conversation';

  return (
    <div className="h-screen flex bg-gray-100 overflow-hidden">
      {/* Sidebar with conversations */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <ConversationList
            selectedConversationId={selectedConversationId}
            onSelectConversation={setSelectedConversationId}
          />
        </div>
        <AdminConversationControls />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <ChatArea
          conversationId={selectedConversationId}
          conversationName={conversationName}
        />
      </div>
    </div>
  );
}
