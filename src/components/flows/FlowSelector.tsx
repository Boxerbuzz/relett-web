
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building, 
  DollarSign, 
  Network,
  GitBranch,
  Eye,
  Database,
} from 'lucide-react';

interface FlowSelectorProps {
  activeFlow: string;
  onFlowChange: (flow: string) => void;
}

const flows = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Eye,
    description: 'System overview and key integration points',
  },
  {
    id: 'user-journey',
    label: 'User Journey',
    icon: Users,
    description: 'User registration and verification process',
  },
  {
    id: 'property-flow',
    label: 'Property Flow',
    icon: Building,
    description: 'Property listing and transaction workflow',
  },
  {
    id: 'financial-flow',
    label: 'Financial Flow',
    icon: DollarSign,
    description: 'Payment processing and tokenization',
  },
  {
    id: 'system-architecture',
    label: 'Architecture',
    icon: Network,
    description: 'Technical system architecture',
  },
  {
    id: 'database-schema',
    label: 'Database',
    icon: Database,
    description: 'Interactive database schema diagram',
  },
];

export function FlowSelector({ activeFlow, onFlowChange }: FlowSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <GitBranch className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-lg font-semibold">Interactive Data Flow Diagrams</h2>
          <p className="text-sm text-gray-600">Explore system workflows and data relationships</p>
        </div>
      </div>
      
      <Tabs value={activeFlow} onValueChange={onFlowChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-3 md:grid-cols-6">
          {flows.map((flow) => {
            const Icon = flow.icon;
            return (
              <TabsTrigger
                key={flow.id}
                value={flow.id}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{flow.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
      
      <div className="bg-blue-50 p-3 rounded-lg">
        <p className="text-sm text-blue-800">
          {flows.find(f => f.id === activeFlow)?.description}
        </p>
      </div>
    </div>
  );
}
