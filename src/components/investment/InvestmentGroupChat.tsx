
'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Vote, 
  Bell, 
  Users, 
  TrendingUp, 
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Clock
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
  investorCount: number;
  userSharePercentage: number;
}

export function InvestmentGroupChat({ 
  propertyId, 
  propertyTitle, 
  investorCount, 
  userSharePercentage 
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
    <div className="space-y-4">
      {/* Group Info Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {propertyTitle} - Investor Group
            </span>
            <Badge variant="outline">{investorCount} investors</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Your Share:</span>
              <p className="font-medium text-green-600">{userSharePercentage}%</p>
            </div>
            <div>
              <span className="text-gray-600">Total Investors:</span>
              <p className="font-medium">{investorCount}</p>
            </div>
            <div>
              <span className="text-gray-600">Active Votes:</span>
              <p className="font-medium">{activeVotes.length}</p>
            </div>
            <div>
              <span className="text-gray-600">Property Value:</span>
              <p className="font-medium text-green-600">$450,000</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Group Discussion
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {message.sender === 'AI Moderator' ? 'AI' : message.sender.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-1">
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
          
          {/* Message Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
