
import React from 'react';
import { Node, Edge } from '@xyflow/react';
import { FlowContainer } from '../FlowContainer';
import { SystemArchitectureNode } from '../nodes/SystemArchitectureNodes';
import { DataFlowEdge } from '../edges/DataFlowEdge';

const nodeTypes = {
  systemNode: SystemArchitectureNode,
};

const edgeTypes = {
  dataFlow: DataFlowEdge,
};

const nodes: Node[] = [
  {
    id: '1',
    type: 'systemNode',
    position: { x: 250, y: 0 },
    data: {
      label: 'Frontend Layer',
      description: 'React + TypeScript with shadcn/ui components',
      type: 'frontend',
      status: 'active',
      details: {
        Technology: 'React 18, TypeScript, Tailwind CSS',
        Components: 'shadcn/ui, Radix UI',
        State: 'Tanstack Query, Context API',
      },
    },
  },
  {
    id: '2',
    type: 'systemNode',
    position: { x: 250, y: 150 },
    data: {
      label: 'API Gateway',
      description: 'Supabase Edge Functions for business logic',
      type: 'api',
      status: 'active',
      details: {
        Runtime: 'Deno',
        Authentication: 'JWT + RLS',
        Functions: '15+ Edge Functions',
      },
    },
  },
  {
    id: '3',
    type: 'systemNode',
    position: { x: 250, y: 300 },
    data: {
      label: 'Database Layer',
      description: 'PostgreSQL with Row Level Security',
      type: 'database',
      status: 'active',
      details: {
        Database: 'PostgreSQL 15',
        Security: 'Row Level Security (RLS)',
        Tables: '50+ tables',
      },
    },
  },
  {
    id: '4',
    type: 'systemNode',
    position: { x: 250, y: 450 },
    data: {
      label: 'Blockchain Layer',
      description: 'Hedera Hashgraph for tokenization',
      type: 'blockchain',
      status: 'active',
      details: {
        Network: 'Hedera Hashgraph',
        Consensus: 'Proof of Stake',
        Features: 'HTS, Smart Contracts',
      },
    },
  },
  {
    id: '5',
    type: 'systemNode',
    position: { x: 600, y: 150 },
    data: {
      label: 'Payment Gateway',
      description: 'Paystack, Flutterwave integration',
      type: 'integration',
      status: 'active',
      details: {
        Providers: 'Paystack, Flutterwave',
        Currency: 'NGN, USD',
        Methods: 'Card, Bank Transfer, USSD',
      },
    },
  },
  {
    id: '6',
    type: 'systemNode',
    position: { x: 600, y: 300 },
    data: {
      label: 'Identity Services',
      description: 'NIN, BVN verification APIs',
      type: 'integration',
      status: 'active',
      details: {
        Services: 'NIN, BVN, Document OCR',
        Providers: 'Nigerian Identity APIs',
        Compliance: 'KYC/AML compliant',
      },
    },
  },
  {
    id: '7',
    type: 'systemNode',
    position: { x: 0, y: 300 },
    data: {
      label: 'AI Services',
      description: 'Property valuation and analysis',
      type: 'integration',
      status: 'active',
      details: {
        Services: 'Property valuation, Market analysis',
        Models: 'GPT-4, Custom ML models',
        Features: 'Document processing, Fraud detection',
      },
    },
  },
];

const edges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'dataFlow',
    data: { label: 'HTTP/WebSocket', type: 'data' },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'dataFlow',
    data: { label: 'SQL Queries', type: 'data' },
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    type: 'dataFlow',
    data: { label: 'Tokenization Events', type: 'event' },
  },
  {
    id: 'e2-5',
    source: '2',
    target: '5',
    type: 'dataFlow',
    data: { label: 'Payment Processing', type: 'data' },
  },
  {
    id: 'e2-6',
    source: '2',
    target: '6',
    type: 'dataFlow',
    data: { label: 'Identity Verification', type: 'data' },
  },
  {
    id: 'e2-7',
    source: '2',
    target: '7',
    type: 'dataFlow',
    data: { label: 'AI Analysis', type: 'data' },
  },
];

export function SystemArchitectureFlow() {
  return (
    <FlowContainer
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      title="System Architecture Overview"
    />
  );
}
