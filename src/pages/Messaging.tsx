"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/lib/auth";
import { PaperPlaneTilt } from "phosphor-react";
import { formatDistanceToNow } from "date-fns";
import { ChatIcon } from "@phosphor-icons/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftIcon,
  PaperPlaneRightIcon,
  DotsThreeVerticalIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

import { ChatArea } from "@/components/messaging/ChatArea";
import { AdminConversationControls } from "@/components/messaging/AdminConversationControls";
import {
  ConversationWithDetails,
  useConversations,
} from "@/hooks/useConversations";
import { AdminActions } from "@/components/messaging/AdminActions";
import { SidebarProvider } from "@/components/ui/sidebar";

type ViewMode = "list" | "detail";

export function Messaging() {
  const [viewMode, setViewMode] = React.useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showUnreadsOnly, setShowUnreadsOnly] = React.useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >(null);
  const { conversations, loading } = useConversations();

  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  );
  const conversationName = selectedConversation?.name || "Conversation";

  // Handle message selection
  const handleMailSelect = (mail: ConversationWithDetails) => {
    setSelectedConversationId(mail.id);
    setViewMode("detail");
  };

  // Handle back to list (mobile/tablet)
  const handleBackToList = () => {
    setViewMode("list");
    setSelectedConversationId(null);
  };

  // Filter mails based on search query
  const filteredMails = conversations.filter(
    (mail) =>
      mail.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mail.last_message?.content
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      mail.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDisplayName = (conversation: ConversationWithDetails) => {
    if (conversation.name && conversation.name !== "Untitled") {
      return conversation.name;
    }

    // For direct conversations, show other participant's name
    if (conversation.type === "direct" && conversation.participant_details) {
      const otherParticipant = conversation.participant_details[0];
      return otherParticipant
        ? `${otherParticipant.first_name} ${otherParticipant.last_name}`.trim() ||
            otherParticipant.email
        : "Unknown User";
    }

    return conversation.name || "Untitled Conversation";
  };

  const getLastMessageTime = (conversation: ConversationWithDetails) => {
    if (!conversation.last_message) return "";
    return formatDistanceToNow(new Date(conversation.last_message.created_at), {
      addSuffix: true,
    });
  };

  return (
    <div className="flex h-full mb-0">
      {/* Messages List Panel */}
      <div
        className={cn(
          "w-full lg:w-80 border-r border-border bg-background overflow-hidden transition-all duration-300",
          // On mobile/tablet: show/hide based on viewMode
          "lg:block",
          viewMode === "list" ? "block" : "hidden lg:block"
        )}
      >
        <div className="gap-3.5 border-b p-4">
          <div className="flex w-full items-center justify-between mb-4">
            <div className="text-foreground text-base font-medium">
              Messages
            </div>
            <AdminActions />
          </div>
          <Input
            placeholder="Type to search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="overflow-y-auto h-[calc(100vh-200px)]">
          <div className="px-0">
            <div>
              {loading ? (
                <ConversationsSkeleton />
              ) : (
                filteredMails.map((conversation) => (
                  <button
                    title={conversation.name}
                    type="button"
                    key={conversation.id}
                    onClick={() => handleMailSelect(conversation)}
                    className={cn(
                      "w-full hover:bg-muted hover:text-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight text-left last:border-b-0 transition-colors",
                      selectedConversationId === conversation.id && "bg-muted"
                    )}
                  >
                    <div className="flex w-full items-center gap-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={selectedConversation?.avatar_url || undefined}
                        />
                        <AvatarFallback>
                          {getDisplayName(conversation)
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col w-full">
                        <span className="font-medium truncate">
                          {conversation.name}
                        </span>
                        <span className="line-clamp-1 w-full text-xs text-muted-foreground text-left">
                          {conversation.last_message?.content ||
                            "No messages yet"}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col transition-all duration-300",
          // On mobile/tablet: show/hide based on viewMode
          "lg:flex",
          viewMode === "detail" ? "flex" : "hidden lg:flex"
        )}
      >
        <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
          {/* Back button for mobile/tablet */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToList}
            className="lg:hidden"
          >
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>

          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">All Inboxes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {selectedConversation ? selectedConversation.name : "Inbox"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {selectedConversation && (
            <div className="ml-auto">
              <Button variant="ghost" size="sm">
                <DotsThreeVerticalIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </header>

        <div className="flex flex-1 flex-col overflow-y-auto h-full items-center justify-center">
          <ChatArea
            conversationId={selectedConversationId}
            conversationName={conversationName}
          />
        </div>
      </div>
    </div>
  );
}

const ConversationsSkeleton = () => {
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
};
