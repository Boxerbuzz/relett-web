
import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent } from '@/components/ui/card';
import { Database, Folder } from 'lucide-react';

interface NodeData {
  label: string;
  description?: string;
}

export const TableNode = memo((props: NodeProps) => {
  const data = props.data as unknown as NodeData;
  
  return (
    <Card className="min-w-[180px] max-w-[200px] bg-teal-50 border-teal-200 text-teal-800 border-2">
      <CardContent className="p-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 flex-shrink-0" />
          <h3 className="font-semibold text-xs truncate" title={data.label}>{data.label}</h3>
        </div>
      </CardContent>
      
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Left} />
      <Handle type="source" position={Position.Right} />
    </Card>
  );
});

TableNode.displayName = 'TableNode';

export const DomainNode = memo((props: NodeProps) => {
    const data = props.data as unknown as NodeData;
  
    return (
      <div className="bg-gray-100/70 border-2 border-dashed border-gray-400 rounded-lg w-full h-full">
        <div className="flex items-center gap-2 p-2 bg-gray-200/80 rounded-t-lg">
          <Folder className="w-4 h-4 text-gray-600" />
          <h2 className="font-bold text-sm text-gray-700">{data.label}</h2>
        </div>
      </div>
    );
  });
  
  DomainNode.displayName = 'DomainNode';
