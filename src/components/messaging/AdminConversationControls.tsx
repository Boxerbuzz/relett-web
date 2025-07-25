import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useConversations } from "@/hooks/useConversations";
import { useUserRoles } from "@/hooks/useUserRoles";
import { PlusIcon, UsersIcon } from "@phosphor-icons/react";

// Create New Conversation Dialog Component
function CreateConversationDialog() {
  const { createConversation } = useConversations();
  const { toast } = useToast();
  const [participantEmail, setParticipantEmail] = useState("");
  const [conversationName, setConversationName] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantEmail.trim() || !conversationName.trim()) return;

    try {
      setLoading(true);
      await createConversation(
        participantEmail.trim(),
        conversationName.trim()
      );

      toast({
        title: "Success",
        description: "Conversation created successfully",
      });

      setParticipantEmail("");
      setConversationName("");
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create conversation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          New Conversation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Start New Conversation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="participantEmail">User Email</Label>
            <Input
              id="participantEmail"
              type="email"
              value={participantEmail}
              onChange={(e) => setParticipantEmail(e.target.value)}
              placeholder="Enter user email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="conversationName">Conversation Name</Label>
            <Input
              id="conversationName"
              value={conversationName}
              onChange={(e) => setConversationName(e.target.value)}
              placeholder="Enter conversation name"
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Create Conversation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Join Existing Conversation Dialog Component
function JoinConversationDialog() {
  const { joinConversation } = useConversations();
  const { toast } = useToast();
  const [conversationId, setConversationId] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationId.trim()) return;

    try {
      setLoading(true);
      await joinConversation(conversationId.trim());

      toast({
        title: "Success",
        description: "Joined conversation successfully",
      });

      setConversationId("");
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to join conversation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <UsersIcon className="h-4 w-4" />
          Join Conversation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Existing Conversation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="conversationId">Conversation ID</Label>
            <Input
              id="conversationId"
              value={conversationId}
              onChange={(e) => setConversationId(e.target.value)}
              placeholder="Enter conversation ID"
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              Join Conversation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Main Admin Controls Component
export function AdminConversationControls() {
  const { hasRole } = useUserRoles();

  // Only show admin controls if user is admin
  if (!hasRole("admin")) {
    return null;
  }

  return (
    <div className="flex gap-2 p-4 border-t">
      <CreateConversationDialog />
      <JoinConversationDialog />
    </div>
  );
}
