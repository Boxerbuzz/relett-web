
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Paperclip, 
  Users, 
  MessageSquare, 
  Phone,
  Video,
  MoreVertical,
  Search,
  Star,
  Home
} from 'lucide-react';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatParticipant {
  id: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  role: string;
  last_seen?: string;
  is_online: boolean;
}

interface PropertyChatProps {
  propertyId: string;
  propertyTitle: string;
  chatType: 'inquiry' | 'inspection' | 'investment' | 'general';
  participants?: ChatParticipant[];
  onClose?: () => void;
}

export function PropertyChatIntegration({ 
  propertyId, 
  propertyTitle, 
  chatType, 
  participants = [],
  onClose 
}: PropertyChatProps) {
  const [conversationId, setConversationId] = useState<string>('');
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { messages, typingUsers, isLoading: chatLoading, sendMessage, updateTypingStatus } = useRealtimeChat(conversationId);

  useEffect(() => {
    initializeChat();
  }, [propertyId, chatType]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    getCurrentUserId();
  }, []);

  const getCurrentUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const initializeChat = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if conversation already exists for this property and type
      let { data: existingConversation, error: fetchError } = await supabase
        .from('conversations')
        .select('*')
        .eq('metadata->>property_id', propertyId)
        .eq('metadata->>chat_type', chatType)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (!existingConversation) {
        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            name: `${propertyTitle} - ${chatType}`,
            description: `${chatType} discussion for ${propertyTitle}`,
            type: 'property_chat',
            admin_id: user.id,
            participants: [user.id, ...participants.map(p => p.id)],
            metadata: {
              property_id: propertyId,
              chat_type: chatType,
              property_title: propertyTitle
            },
            activity_type: chatType === 'inspection' ? 'inspection' : 
                          chatType === 'investment' ? 'investment' : null
          })
          .select()
          .single();

        if (createError) throw createError;
        existingConversation = newConversation;
      }

      setConversationId(existingConversation.id);
    } catch (error) {
      console.error('Error initializing chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize chat.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !conversationId) return;

    try {
      await sendMessage(messageInput, 'text');
      setMessageInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message.',
        variant: 'destructive'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = () => {
    updateTypingStatus();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const getChatTypeIcon = () => {
    switch (chatType) {
      case 'inspection': return <Search className="h-4 w-4" />;
      case 'investment': return <Star className="h-4 w-4" />;
      case 'inquiry': return <MessageSquare className="h-4 w-4" />;
      default: return <Home className="h-4 w-4" />;
    }
  };

  const getChatTypeColor = () => {
    switch (chatType) {
      case 'inspection': return 'bg-blue-100 text-blue-800';
      case 'investment': return 'bg-green-100 text-green-800';
      case 'inquiry': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading || chatLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      {/* Chat Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getChatTypeColor()}`}>
              {getChatTypeIcon()}
            </div>
            <div>
              <CardTitle className="text-lg">{propertyTitle}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {chatType}
                </Badge>
                <span>•</span>
                <span>{participants.length + 1} participants</span>
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Users className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-96 p-4">
          <div className="space-y-4">
            {messages.map((message) => {
              const isOwn = message.sender_id === currentUserId;
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.sender?.avatar} />
                    <AvatarFallback>
                      {message.sender?.first_name?.[0]}{message.sender?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-xs lg:max-w-md`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">
                        {message.sender?.first_name} {message.sender?.last_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatMessageTime(message.created_at)}
                      </span>
                    </div>
                    
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        isOwn
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Typing Indicators */}
            {typingUsers.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
                <span>
                  {typingUsers.map(u => `${u.first_name} ${u.last_name}`).join(', ')} 
                  {typingUsers.length === 1 ? ' is' : ' are'} typing...
                </span>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Input
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              handleTyping();
            }}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1"
          />
          
          <Button 
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
