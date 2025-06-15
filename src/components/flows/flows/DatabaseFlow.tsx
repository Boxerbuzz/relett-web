
import React from 'react';
import { Node, Edge } from '@xyflow/react';
import { FlowContainer } from '../FlowContainer';
import { TableNode, DomainNode } from '../nodes/DatabaseNodes';
import { DataFlowEdge } from '../edges/DataFlowEdge';
import { generateDatabaseNodes } from '@/lib/databaseSchema';

const nodeTypes = {
  table: TableNode,
  domain: DomainNode,
};

const edgeTypes = {
  dataFlow: DataFlowEdge,
};

const initialNodes: Node[] = generateDatabaseNodes();
const initialEdges: Edge[] = [];

export function DatabaseFlow() {
  return (
    <FlowContainer
      nodes={initialNodes}
      edges={initialEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      title="Database Schema Relationship Diagram"
    />
  );
}
