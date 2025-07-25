
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Cloud, 
  Globe, 
  Server, 
  Smartphone,
  Zap
} from 'lucide-react';

interface NodeData {
  label: string;
  description?: string;
  type: 'frontend' | 'api' | 'database' | 'blockchain' | 'integration';
  status?: 'active' | 'warning' | 'error';
  details?: Record<string, any>;
}

const getNodeIcon = (type: string) => {
  switch (type) {
    case 'frontend': return Globe;
    case 'api': return Server;
    case 'database': return Database;
    case 'blockchain': return Zap;
    case 'integration': return Cloud;
    default: return Server;
  }
};

const getNodeColor = (type: string) => {
  switch (type) {
    case 'frontend': return 'bg-blue-50 border-blue-200 text-blue-800';
    case 'api': return 'bg-green-50 border-green-200 text-green-800';
    case 'database': return 'bg-purple-50 border-purple-200 text-purple-800';
    case 'blockchain': return 'bg-orange-50 border-orange-200 text-orange-800';
    case 'integration': return 'bg-gray-50 border-gray-200 text-gray-800';
    default: return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

export const SystemArchitectureNode = memo((props: NodeProps) => {
  const data = props.data as unknown as NodeData;
  const Icon = getNodeIcon(data.type);
  const colorClass = getNodeColor(data.type);
  
  return (
    <Card className={`min-w-[200px] ${colorClass} border-2`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-5 h-5" />
          <h3 className="font-semibold text-sm">{data.label}</h3>
          {data.status && (
            <Badge 
              variant={data.status === 'active' ? 'default' : 
                      data.status === 'warning' ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {data.status}
            </Badge>
          )}
        </div>
        {data.description && (
          <p className="text-xs opacity-80">{data.description}</p>
        )}
      </CardContent>
      
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </Card>
  );
});

SystemArchitectureNode.displayName = 'SystemArchitectureNode';
