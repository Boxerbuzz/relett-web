import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Paperclip, Users, MoreVertical } from "lucide-react";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import { useToast } from "@/hooks/use-toast";

interface InvestmentGroupChatProps {
  conversationId: string;
  groupName: string;
  participantCount?: number;
}

export function InvestmentGroupChat({
  conversationId,
  groupName,
  participantCount = 0,
}: InvestmentGroupChatProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const { messages, typingUsers, isLoading, sendMessage, updateTypingStatus } =
    useRealtimeChat(conversationId);
  const { uploadFile, isUploading } = useSupabaseStorage();
  const { toast } = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setIsTyping(false);

    try {
      await sendMessage(messageContent);
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);

    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      updateTypingStatus();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 2000);

    // Update typing status periodically while typing
    if (value.length > 0) {
      updateTypingStatus();
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadFile(file, {
        bucket: "chat-attachments",
        path: `conversation-${conversationId}`, // Now required parameter
        maxSize: 25 * 1024 * 1024, // 25MB limit for chat files
      });

      await sendMessage(file.name, "file", result.url);

      toast({
        title: "File shared",
        description: `${file.name} has been shared with the group.`,
      });
    } catch (error) {
      console.error("File upload failed:", error);
    }

    // Reset input
    event.target.value = "";
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {groupName}
            </CardTitle>
            <CardDescription>
              {participantCount} participants • Investment Group Discussion
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto mb-4" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {getInitials(
                      message.sender?.first_name || "",
                      message.sender?.last_name || ""
                    )}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {message.sender?.first_name} {message.sender?.last_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatMessageTime(message.created_at)}
                    </span>
                    {message.message_type !== "text" && (
                      <Badge variant="outline" className="text-xs">
                        {message.message_type}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm">
                    {message.message_type === "file" &&
                    message.attachment_url ? (
                      <div className="flex items-center gap-2 p-2 border rounded bg-gray-50">
                        <Paperclip className="h-4 w-4" />
                        <a
                          href={message.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {message.content}
                        </a>
                      </div>
                    ) : (
                      <p className="text-gray-900">{message.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <TypingIndicator typingUsers={typingUsers} />
            <div ref={messagesEndRef} />
          </>
        )}
      </CardContent>

      {/* Message Input */}
      <div className="flex-shrink-0 p-4 border-t">
        <div className="flex gap-2">
          <div className="flex-1 flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Type your message..."
              disabled={isUploading}
            />
            <label>
              <input
                aria-label="file"
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <Button
                variant="outline"
                size="icon"
                disabled={isUploading}
                asChild
              >
                <div>
                  <Paperclip className="h-4 w-4" />
                </div>
              </Button>
            </label>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isUploading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
