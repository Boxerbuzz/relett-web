"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, ThumbsUp, ThumbsDown } from "lucide-react";
import { agentManager } from "@/lib/agents/AgentManager";
import { AgentContext, AgentResponse } from "@/lib/agents/BaseAgent";

interface Message {
  id: string;
  content: string;
  sender: "user" | "agent";
  timestamp: Date;
  agentId?: string;
  interactionId?: string;
  metadata?: Record<string, any>;
}

interface AgentChatProps {
  agentId: string;
  context: AgentContext;
  className?: string;
}

export function AgentChat({
  agentId,
  context,
  className = "",
}: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agent = agentManager.getAgent(agentId);

  useEffect(() => {
    if (agent) {
      // Add welcome message
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        content: `Hello! I'm ${agent.getConfig().name}. ${
          agent.getConfig().description
        }. How can I help you today?`,
        sender: "agent",
        timestamp: new Date(),
        agentId,
      };
      setMessages([welcomeMessage]);
    }
  }, [agent, agentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing || !agent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsProcessing(true);

    try {
      const response = await agentManager.processMessage(
        agentId,
        inputMessage,
        context
      );

      if (response) {
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: response.message,
          sender: "agent",
          timestamp: new Date(),
          agentId,
          metadata: response.metadata,
        };

        setMessages((prev) => [...prev, agentMessage]);
      }
    } catch (error) {
      console.error("Error sending message to agent:", error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I encountered an error. Please try again.",
        sender: "agent",
        timestamp: new Date(),
        agentId,
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFeedback = async (messageId: string, isPositive: boolean) => {
    const message = messages.find((m) => m.id === messageId);
    if (!message || !message.interactionId) return;

    try {
      // Update the message to show feedback was given
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                metadata: {
                  ...m.metadata,
                  feedback_given: isPositive ? "positive" : "negative",
                },
              }
            : m
        )
      );

      // If using a learning agent, provide feedback
      const learningAgent = agent as any;
      if (learningAgent.provideFeedback) {
        await learningAgent.provideFeedback(
          message.interactionId,
          isPositive ? 5 : 2,
          isPositive ? "satisfied" : "unsatisfied"
        );
      }
    } catch (error) {
      console.error("Error providing feedback:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!agent) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <p className="text-center text-gray-600">Agent not found</p>
        </CardContent>
      </Card>
    );
  }

  const isAdaptiveAgent = agentId === "adaptive-property-agent";

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      <CardHeader className="flex-shrink-0 pb-3">
        <CardTitle className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          {agent.getConfig().name}
          <Badge variant="outline" className="ml-auto">
            {isAdaptiveAgent ? "AI Learning" : "AI Agent"}
          </Badge>
        </CardTitle>
        {isAdaptiveAgent && (
          <p className="text-sm text-gray-500">
            This agent learns from your interactions to provide personalized
            responses
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 py-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {message.sender === "agent" && (
                      <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    {message.sender === "user" && (
                      <User className="w-4 h-4 mt-0.5 flex-shrink-0 text-blue-100" />
                    )}
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p
                          className={`text-xs ${
                            message.sender === "user"
                              ? "text-blue-100"
                              : "text-gray-500"
                          }`}
                        >
                          {message.timestamp.toLocaleTimeString()}
                        </p>

                        {/* Feedback buttons for agent messages */}
                        {message.sender === "agent" &&
                          isAdaptiveAgent &&
                          !message.metadata?.feedback_given && (
                            <div className="flex gap-1 ml-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-gray-200"
                                onClick={() => handleFeedback(message.id, true)}
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 w-6 p-0 hover:bg-gray-200"
                                onClick={() =>
                                  handleFeedback(message.id, false)
                                }
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </Button>
                            </div>
                          )}

                        {/* Show feedback given */}
                        {message.metadata?.feedback_given && (
                          <Badge variant="outline" className="text-xs">
                            {message.metadata.feedback_given === "positive"
                              ? "👍"
                              : "👎"}
                          </Badge>
                        )}
                      </div>

                      {/* Show personalization info for adaptive agent */}
                      {message.metadata?.personalization_applied && (
                        <div className="mt-2 text-xs text-gray-400 border-t pt-1">
                          <Badge variant="secondary" className="text-xs">
                            Personalized response
                          </Badge>
                          {message.metadata.user_profile_type && (
                            <span className="ml-2">
                              Profile: {message.metadata.user_profile_type}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 border-t p-4">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={isProcessing}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isProcessing}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
