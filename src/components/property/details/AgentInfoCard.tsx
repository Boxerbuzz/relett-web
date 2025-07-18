import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Phone, Envelope, User } from "phosphor-react";

interface AgentInfoCardProps {
  agent: any;
}

export function AgentInfoCard({ agent }: AgentInfoCardProps) {
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
              <span className="text-sm">{agent.phone}</span>
            </div>
          )}
          {agent.email && (
            <div className="flex items-center">
              <Envelope className="w-4 h-4 mr-3 text-gray-500" />
              <span className="text-sm">{agent.email}</span>
            </div>
          )}
        </div>
        <button className="w-full mt-4 btn btn-outline">Contact Agent</button>
      </CardContent>
    </Card>
  );
} 