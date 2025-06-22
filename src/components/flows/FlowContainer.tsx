
import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Panel,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize, Download } from 'lucide-react';
import { TableNode, DomainNode } from './nodes/DatabaseNodes';

const nodeTypes = {
  table: TableNode,
  domain: DomainNode,
};

interface FlowContainerProps {
  nodes: Node[];
  edges: Edge[];
  title: string;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
}

export function FlowContainer({
  nodes: initialNodes,
  edges: initialEdges,
  title,
  onNodeClick,
  onEdgeClick,
}: FlowContainerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
      onNodeClick?.(event, node);
    },
    [onNodeClick]
  );

  return (
    <Card className="h-[800px] w-full relative">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-semibold bg-white px-3 py-2 rounded shadow-md border">
          {title}
        </h3>
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-50"
        fitViewOptions={{ padding: 0.1, minZoom: 0.1, maxZoom: 1.5 }}
      >
        <Controls />
        <MiniMap 
          nodeColor="#3B82F6"
          maskColor="rgba(255, 255, 255, 0.2)"
          className="bg-white"
        />
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
        
        <Panel position="top-right" className="flex gap-2">
          <Button size="sm" variant="outline">
            <Download className="w-4 h-4" />
          </Button>
          <Button size="sm" variant="outline">
            <Maximize className="w-4 h-4" />
          </Button>
        </Panel>
      </ReactFlow>
      
      {selectedNode && (
        <div className="absolute top-4 right-4 w-80 bg-white p-4 rounded-lg shadow-lg border z-20">
          <h4 className="font-semibold mb-2">{String(selectedNode.data.label || '')}</h4>
          <p className="text-sm text-gray-600">{String(selectedNode.data.description || '')}</p>
          {selectedNode.data.fields && (
            <div className="mt-3">
              <div className="text-sm font-semibold text-gray-700 mb-2">Fields ({selectedNode.data.fields.length}):</div>
              <div className="max-h-40 overflow-y-auto space-y-1">
                {selectedNode.data.fields.slice(0, 15).map((field: string, index: number) => (
                  <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {field}
                  </div>
                ))}
                {selectedNode.data.fields.length > 15 && (
                  <div className="text-xs text-gray-500 italic">
                    ... and {selectedNode.data.fields.length - 15} more fields
                  </div>
                )}
              </div>
            </div>
          )}
          {selectedNode.data.relationships && selectedNode.data.relationships.length > 0 && (
            <div className="mt-3">
              <div className="text-sm font-semibold text-blue-700 mb-2">Relationships:</div>
              <div className="space-y-1">
                {selectedNode.data.relationships.map((rel: string, index: number) => (
                  <div key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                    {rel}
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button 
            size="sm" 
            variant="ghost" 
            className="mt-3"
            onClick={() => setSelectedNode(null)}
          >
            Close
          </Button>
        </div>
      )}
    </Card>
  );
}
