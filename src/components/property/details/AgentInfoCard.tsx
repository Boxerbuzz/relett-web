import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Phone, Envelope, User, ChatCircleDots } from "phosphor-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useConversations } from "@/hooks/useConversations";
import { useToast } from "@/hooks/use-toast";

function maskEmail(email: string) {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (!name || !domain) return email;
  return (
    name.slice(0, 3) + "****@" + domain
  );
}

function maskPhone(phone: string) {
  if (!phone) return "";
  return phone.slice(0, 3) + "****" + phone.slice(-3);
}

interface AgentInfoCardProps {
  agent: any;
}

export function AgentInfoCard({ agent }: AgentInfoCardProps) {
  const { createConversation } = useConversations();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleContactAgent = async () => {
    if (!agent?.email) return;
    setLoading(true);
    try {
      await createConversation(agent.email, `${agent.first_name} ${agent.last_name}`);
      toast({ title: "Conversation started", description: `You can now chat with ${agent.first_name}.` });
      // Optionally, redirect or open chat UI here
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to start conversation", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!agent) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Agent</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            {agent.avatar ? (
              <img
                src={agent.avatar}
                alt="Agent"
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <User className="w-6 h-6 text-gray-500" />
            )}
          </div>
          <div>
            <h4 className="font-semibold">
              {agent.first_name} {agent.last_name}
            </h4>
            <p className="text-sm text-gray-600">Property Agent</p>
          </div>
        </div>
        <div className="space-y-3">
          {agent.phone && (
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-3 text-gray-500" />
              <span className="text-sm">{maskPhone(agent.phone)}</span>
            </div>
          )}
          {agent.email && (
            <div className="flex items-center">
              <Envelope className="w-4 h-4 mr-3 text-gray-500" />
              <span className="text-sm">{maskEmail(agent.email)}</span>
            </div>
          )}
        </div>
        <Button
          className="w-full mt-4 text-base font-semibold flex items-center justify-center gap-2"
          variant="default"
          onClick={handleContactAgent}
          disabled={loading}
        >
          <ChatCircleDots className="w-5 h-5" />
          {loading ? "Starting..." : "Contact Agent"}
        </Button>
      </CardContent>
    </Card>
  );
} 