
import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, Folder, ChevronDown, ChevronRight, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TableNodeData {
  label: string;
  description?: string;
  fields?: string[];
  relationships?: string[];
  domain?: string;
}

interface DomainNodeData {
  label: string;
  description?: string;
  tableCount?: number;
}

export const TableNode = memo((props: NodeProps) => {
  const data = props.data as unknown as TableNodeData;
  const [expanded, setExpanded] = useState(false);
  
  return (
    <Card className="min-w-[260px] max-w-[280px] bg-white border-2 border-gray-300 shadow-md">
      <CardHeader className="p-3 bg-gray-50 border-b">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-gray-900 truncate" title={data.label}>
              {data.label}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-3">
        <div className="text-xs text-gray-600 mb-2">
          {data.fields?.length || 0} fields
          {data.relationships && data.relationships.length > 0 && (
            <span className="ml-2 text-blue-600">
              • {data.relationships.length} relations
            </span>
          )}
        </div>
        
        {expanded && (
          <div className="space-y-2">
            {data.fields && data.fields.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-700 mb-1">Fields:</div>
                <div className="max-h-32 overflow-y-auto">
                  {data.fields.slice(0, 10).map((field, index) => (
                    <div key={index} className="text-xs text-gray-600 py-0.5 px-1 bg-gray-50 rounded mb-1">
                      {field}
                    </div>
                  ))}
                  {data.fields.length > 10 && (
                    <div className="text-xs text-gray-500 italic">
                      ... and {data.fields.length - 10} more
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {data.relationships && data.relationships.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                  <Link className="w-3 h-3" />
                  Relations:
                </div>
                <div className="space-y-1">
                  {data.relationships.map((rel, index) => (
                    <div key={index} className="text-xs text-blue-600 py-0.5 px-1 bg-blue-50 rounded">
                      {rel}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <Handle type="target" position={Position.Top} className="!bg-blue-500 !border-blue-600" />
      <Handle type="source" position={Position.Bottom} className="!bg-blue-500 !border-blue-600" />
      <Handle type="target" position={Position.Left} className="!bg-blue-500 !border-blue-600" />
      <Handle type="source" position={Position.Right} className="!bg-blue-500 !border-blue-600" />
    </Card>
  );
});

TableNode.displayName = 'TableNode';

export const DomainNode = memo((props: NodeProps) => {
  const data = props.data as unknown as DomainNodeData;

  return (
    <div className="bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-dashed border-gray-400 rounded-lg w-full h-full shadow-sm">
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-t-lg border-b border-gray-400">
        <Folder className="w-5 h-5 text-gray-600" />
        <div>
          <h2 className="font-bold text-sm text-gray-800">{data.label}</h2>
          <p className="text-xs text-gray-600">{data.description}</p>
        </div>
      </div>
    </div>
  );
});

DomainNode.displayName = 'DomainNode';
