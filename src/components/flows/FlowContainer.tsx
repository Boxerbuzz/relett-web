
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

interface FlowContainerProps {
  nodes: Node[];
  edges: Edge[];
  nodeTypes?: Record<string, React.ComponentType<any>>;
  edgeTypes?: Record<string, React.ComponentType<any>>;
  title: string;
  onNodeClick?: (event: React.MouseEvent, node: Node) => void;
  onEdgeClick?: (event: React.MouseEvent, edge: Edge) => void;
}

export function FlowContainer({
  nodes: initialNodes,
  edges: initialEdges,
  nodeTypes,
  edgeTypes,
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

  const fitView = useCallback(() => {
    // This will be handled by the ReactFlow instance
  }, []);

  return (
    <Card className="h-[600px] w-full relative">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-lg font-semibold bg-white px-2 py-1 rounded shadow">
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
        edgeTypes={edgeTypes}
        fitView
        className="bg-gray-50"
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
          {selectedNode.data.details && (
            <div className="mt-2 space-y-1">
              {Object.entries(selectedNode.data.details as Record<string, any>).map(([key, value]) => (
                <div key={key} className="text-xs">
                  <span className="font-medium">{key}:</span> {String(value)}
                </div>
              ))}
            </div>
          )}
          <Button 
            size="sm" 
            variant="ghost" 
            className="mt-2"
            onClick={() => setSelectedNode(null)}
          >
            Close
          </Button>
        </div>
      )}
    </Card>
  );
}
