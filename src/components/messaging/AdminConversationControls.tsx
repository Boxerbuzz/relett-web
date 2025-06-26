
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useConversations } from '@/hooks/useConversations';
import { useUserRoles } from '@/hooks/useUserRoles';
import { Plus, Users } from 'lucide-react';

export function AdminConversationControls() {
  const { hasRole } = useUserRoles();
  const { createConversation, joinConversation } = useConversations();
  const { toast } = useToast();
  const [participantEmail, setParticipantEmail] = useState('');
  const [conversationName, setConversationName] = useState('');
  const [conversationIdToJoin, setConversationIdToJoin] = useState('');
  const [loading, setLoading] = useState(false);

  // Only show admin controls if user is admin
  if (!hasRole('admin')) {
    return null;
  }

  const handleCreateConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!participantEmail.trim() || !conversationName.trim()) return;

    try {
      setLoading(true);
      await createConversation(participantEmail.trim(), conversationName.trim());
      
      toast({
        title: 'Success',
        description: 'Conversation created successfully'
      });
      
      setParticipantEmail('');
      setConversationName('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create conversation',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversationIdToJoin.trim()) return;

    try {
      setLoading(true);
      await joinConversation(conversationIdToJoin.trim());
      
      toast({
        title: 'Success',
        description: 'Joined conversation successfully'
      });
      
      setConversationIdToJoin('');
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to join conversation',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border-t">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Start New Conversation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleCreateConversation} className="space-y-3">
            <div>
              <Label htmlFor="participantEmail" className="text-sm">User Email</Label>
              <Input
                id="participantEmail"
                type="email"
                value={participantEmail}
                onChange={(e) => setParticipantEmail(e.target.value)}
                placeholder="Enter user email"
                required
              />
            </div>
            <div>
              <Label htmlFor="conversationName" className="text-sm">Conversation Name</Label>
              <Input
                id="conversationName"
                value={conversationName}
                onChange={(e) => setConversationName(e.target.value)}
                placeholder="Enter conversation name"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              Create Conversation
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4" />
            Join Existing Conversation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoinConversation} className="space-y-3">
            <div>
              <Label htmlFor="conversationId" className="text-sm">Conversation ID</Label>
              <Input
                id="conversationId"
                value={conversationIdToJoin}
                onChange={(e) => setConversationIdToJoin(e.target.value)}
                placeholder="Enter conversation ID"
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              Join Conversation
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
