
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  Database,
  FileText,
  Users,
  CreditCard
} from 'lucide-react';

interface ProcessNodeData {
  label: string;
  description?: string;
  status?: 'completed' | 'in-progress' | 'pending' | 'error';
  stepNumber?: number;
  tables?: string[];
  estimatedTime?: string;
}

const getStatusIcon = (status?: string) => {
  switch (status) {
    case 'completed': return CheckCircle;
    case 'in-progress': return Clock;
    case 'error': return AlertCircle;
    default: return ArrowRight;
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'completed': return 'bg-green-50 border-green-200 text-green-800';
    case 'in-progress': return 'bg-blue-50 border-blue-200 text-blue-800';
    case 'error': return 'bg-red-50 border-red-200 text-red-800';
    default: return 'bg-gray-50 border-gray-200 text-gray-800';
  }
};

export const ProcessStepNode = memo((props: NodeProps) => {
  const data = props.data as unknown as ProcessNodeData;
  const StatusIcon = getStatusIcon(data.status);
  const colorClass = getStatusColor(data.status);
  
  return (
    <Card className={`min-w-[250px] max-w-[300px] ${colorClass} border-2`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {data.stepNumber && (
            <Badge variant="outline" className="flex-shrink-0">
              {data.stepNumber}
            </Badge>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <StatusIcon className="w-4 h-4" />
              <h3 className="font-semibold text-sm">{data.label}</h3>
            </div>
            {data.description && (
              <p className="text-xs opacity-80 mb-2">{data.description}</p>
            )}
            {data.tables && data.tables.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {data.tables.map((table) => (
                  <Badge key={table} variant="secondary" className="text-xs">
                    <Database className="w-3 h-3 mr-1" />
                    {table}
                  </Badge>
                ))}
              </div>
            )}
            {data.estimatedTime && (
              <div className="text-xs opacity-60">
                <Clock className="w-3 h-3 inline mr-1" />
                {data.estimatedTime}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </Card>
  );
});

ProcessStepNode.displayName = 'ProcessStepNode';

export const DecisionNode = memo((props: NodeProps) => {
  const data = props.data as unknown as ProcessNodeData;
  return (
    <div className="relative">
      <div className="w-32 h-32 bg-yellow-50 border-2 border-yellow-200 transform rotate-45 flex items-center justify-center">
        <div className="transform -rotate-45 text-center">
          <h3 className="font-semibold text-xs text-yellow-800">{data.label}</h3>
        </div>
      </div>
      
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

DecisionNode.displayName = 'DecisionNode';
