
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Vote, 
  Bell, 
  Users, 
  TrendingUp, 
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Clock,
  ArrowLeft,
  MapPin,
  DollarSign
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  message: string;
  timestamp: string;
  type: 'message' | 'vote' | 'update' | 'ai_summary';
  votes?: {
    proposal: string;
    options: { label: string; votes: number }[];
    totalVotes: number;
    deadline: string;
  };
}

interface InvestmentGroupChatProps {
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  investorCount: number;
  userSharePercentage: number;
  tokenPrice: number;
  currentValue: number;
  totalValue: number;
  roi: number;
  ownedTokens: number;
  totalTokens: number;
  onBack: () => void;
}

export function InvestmentGroupChat({ 
  propertyId, 
  propertyTitle,
  propertyLocation,
  investorCount, 
  userSharePercentage,
  tokenPrice,
  currentValue,
  totalValue,
  roi,
  ownedTokens,
  totalTokens,
  onBack
}: InvestmentGroupChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'AI Moderator',
      senderId: 'ai',
      message: 'Welcome to the Downtown Commercial Plot investor group. I will help moderate discussions and provide updates about your investment.',
      timestamp: '2024-01-20T10:00:00Z',
      type: 'ai_summary'
    },
    {
      id: '2',
      sender: 'John Doe',
      senderId: 'user1',
      message: 'Excited to be part of this investment! Looking forward to the quarterly updates.',
      timestamp: '2024-01-20T10:15:00Z',
      type: 'message'
    },
    {
      id: '3',
      sender: 'AI Moderator',
      senderId: 'ai',
      message: 'Proposal: Should we approve the renovation budget of $25,000 for the building facade?',
      timestamp: '2024-01-20T11:00:00Z',
      type: 'vote',
      votes: {
        proposal: 'Approve renovation budget of $25,000',
        options: [
          { label: 'Yes, approve', votes: 7 },
          { label: 'No, reject', votes: 2 },
          { label: 'Need more info', votes: 1 }
        ],
        totalVotes: 10,
        deadline: '2024-01-25T23:59:59Z'
      }
    },
    {
      id: '4',
      sender: 'Sarah Wilson',
      senderId: 'user2',
      message: 'I think the renovation will increase property value. Count me in for approval.',
      timestamp: '2024-01-20T11:30:00Z',
      type: 'message'
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [activeVotes, setActiveVotes] = useState<string[]>(['3']);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      senderId: 'current_user',
      message: newMessage,
      timestamp: new Date().toISOString(),
      type: 'message'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate AI response after user message
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'AI Moderator',
        senderId: 'ai',
        message: 'Thank you for your input. I will include this in the discussion summary for all investors.',
        timestamp: new Date().toISOString(),
        type: 'ai_summary'
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 2000);
  };

  const castVote = (messageId: string, optionIndex: number) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId && msg.votes) {
        const updatedVotes = { ...msg.votes };
        updatedVotes.options[optionIndex].votes += 1;
        updatedVotes.totalVotes += 1;
        return { ...msg, votes: updatedVotes };
      }
      return msg;
    }));
    
    setActiveVotes(prev => prev.filter(id => id !== messageId));
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'vote': return <Vote className="h-4 w-4 text-blue-600" />;
      case 'update': return <Bell className="h-4 w-4 text-green-600" />;
      case 'ai_summary': return <MessageSquare className="h-4 w-4 text-purple-600" />;
      default: return null;
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header with Back Button and Title */}
      <div className="flex-shrink-0 border-b bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold flex items-center gap-2 truncate">
              <Users className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{propertyTitle}</span>
              <Badge variant="outline" className="flex-shrink-0">{investorCount} investors</Badge>
            </h1>
          </div>
        </div>
      </div>

      {/* Pinned Investment Details */}
      <Card className="flex-shrink-0 m-4 mb-2">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-600">Location</p>
                <p className="font-medium truncate">{propertyLocation}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-600">Your Investment</p>
                <p className="font-medium text-green-600">${totalValue.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-600">ROI</p>
                <p className={`font-medium ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-600">Your Share</p>
                <p className="font-medium">{ownedTokens}/{totalTokens} tokens ({userSharePercentage.toFixed(1)}%)</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages Area - Takes remaining space */}
      <div className="flex-1 flex flex-col min-h-0 mx-4 mb-4">
        <Card className="flex-1 flex flex-col min-h-0">
          <CardHeader className="flex-shrink-0 py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" />
              Group Discussion
              {activeVotes.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {activeVotes.length} active vote{activeVotes.length > 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          
          {/* Messages */}
          <div className="flex-1 min-h-0 px-4">
            <ScrollArea className="h-full">
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback>
                          {message.sender === 'AI Moderator' ? 'AI' : message.sender.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{message.sender}</span>
                          {getMessageIcon(message.type)}
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>
                        
                        <div className={`p-3 rounded-lg ${
                          message.type === 'ai_summary' 
                            ? 'bg-purple-50 border border-purple-200' 
                            : message.senderId === 'current_user'
                              ? 'bg-blue-50 border border-blue-200'
                              : 'bg-gray-50 border border-gray-200'
                        }`}>
                          <p className="text-sm">{message.message}</p>
                          
                          {/* Voting Component */}
                          {message.type === 'vote' && message.votes && (
                            <div className="mt-3 space-y-2">
                              <Separator />
                              <div>
                                <h4 className="font-medium text-sm mb-2">{message.votes.proposal}</h4>
                                <div className="space-y-2">
                                  {message.votes.options.map((option, index) => (
                                    <div key={index} className="flex items-center justify-between">
                                      <span className="text-sm">{option.label}</span>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">{option.votes} votes</span>
                                        {activeVotes.includes(message.id) && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => castVote(message.id, index)}
                                          >
                                            Vote
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                                  <span>Total votes: {message.votes.totalVotes}</span>
                                  <span>Deadline: {formatTimestamp(message.votes.deadline)}</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>
          
          {/* Message Input - Fixed at bottom */}
          <div className="flex-shrink-0 p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                className="flex-1"
              />
              <Button onClick={sendMessage} size="icon" className="flex-shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
