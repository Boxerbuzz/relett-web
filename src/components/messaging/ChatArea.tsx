import React, { useState, useRef, useEffect } from "react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/lib/auth";
import { formatDistanceToNow } from "date-fns";
import { ChatIcon, PaperPlaneTiltIcon } from "@phosphor-icons/react";

interface ChatAreaProps {
  conversationId: string | null;
  conversationName: string;
}

export function ChatArea({ conversationId, conversationName }: ChatAreaProps) {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useMessages(conversationId);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !conversationId) return;

    try {
      setSending(true);
      await sendMessage(newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {loading && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 h-full flex items-center justify-center">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      )}

      {!loading && !conversationId && (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="flex justify-center">
            <div className="text-center flex flex-col items-center gap-2">
              <ChatIcon className="h-8 w-8 text-gray-500 mb-2" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-600">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      {conversationId && !loading && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === user?.id}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      )}

      {/* Message Input */}
      {conversationId && !loading && (
        <CardContent className="border-t bg-white p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" disabled={sending || !newMessage.trim()}>
              <PaperPlaneTiltIcon className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      )}
    </div>
  );
}

function MessageBubble({ message, isOwn }: { message: any; isOwn: boolean }) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-xs lg:max-w-md ${
          isOwn ? "flex-row-reverse" : "flex-row"
        } items-end space-x-2`}
      >
        {!isOwn && (
          <Avatar className="h-8 w-8">
            <AvatarImage src={message.sender?.avatar || undefined} />
            <AvatarFallback className="text-xs">
              {message.sender?.first_name?.[0]}
              {message.sender?.last_name?.[0]}
            </AvatarFallback>
          </Avatar>
        )}

        <div
          className={`px-4 py-2 rounded-lg ${
            isOwn ? "bg-blue-600 text-white" : "bg-white text-gray-900 border"
          }`}
        >
          {!isOwn && (
            <div className="text-xs font-medium mb-1 text-gray-600">
              {message.sender?.first_name} {message.sender?.last_name}
            </div>
          )}
          <div className="text-sm">{message.content}</div>
          <div
            className={`text-xs mt-1 ${
              isOwn ? "text-blue-100" : "text-gray-500"
            }`}
          >
            {formatDistanceToNow(new Date(message.created_at), {
              addSuffix: true,
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
