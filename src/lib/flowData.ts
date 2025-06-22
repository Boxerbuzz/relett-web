
import { Node, Edge } from '@xyflow/react';
import { generateDatabaseNodes, generateDatabaseEdges } from './databaseSchema';

export interface FlowData {
  nodes: Node[];
  edges: Edge[];
}

export function getSystemArchitectureFlow(): FlowData {
  const nodes: Node[] = [
    {
      id: 'frontend',
      type: 'default',
      position: { x: 100, y: 100 },
      data: { label: 'Frontend Layer', description: 'React app with real-time features' }
    },
    {
      id: 'backend',
      type: 'default',
      position: { x: 400, y: 100 },
      data: { label: 'Backend Services', description: 'Supabase edge functions and database' }
    },
    {
      id: 'external',
      type: 'default',
      position: { x: 700, y: 100 },
      data: { label: 'External APIs', description: 'Payment, notifications, AI services' }
    }
  ];

  const edges: Edge[] = [
    { id: 'e1', source: 'frontend', target: 'backend', label: 'API calls' },
    { id: 'e2', source: 'backend', target: 'external', label: 'Integrations' }
  ];

  return { nodes, edges };
}

export function getUserJourneyFlow(): FlowData {
  const nodes: Node[] = [
    {
      id: 'registration',
      type: 'input',
      position: { x: 100, y: 100 },
      data: { label: 'User Registration', description: 'Account creation and setup' }
    },
    {
      id: 'kyc',
      type: 'default',
      position: { x: 300, y: 100 },
      data: { label: 'KYC Verification', description: 'Identity verification process' }
    },
    {
      id: 'discovery',
      type: 'default',
      position: { x: 500, y: 100 },
      data: { label: 'Property Discovery', description: 'Browse and search properties' }
    },
    {
      id: 'investment',
      type: 'output',
      position: { x: 700, y: 100 },
      data: { label: 'Investment', description: 'Token purchase and portfolio management' }
    }
  ];

  const edges: Edge[] = [
    { id: 'e1', source: 'registration', target: 'kyc' },
    { id: 'e2', source: 'kyc', target: 'discovery' },
    { id: 'e3', source: 'discovery', target: 'investment' }
  ];

  return { nodes, edges };
}

export function getPropertyFlow(): FlowData {
  const nodes: Node[] = [
    {
      id: 'creation',
      type: 'input',
      position: { x: 100, y: 100 },
      data: { label: 'Property Creation', description: 'Multi-step property listing wizard' }
    },
    {
      id: 'verification',
      type: 'default',
      position: { x: 300, y: 100 },
      data: { label: 'Verification', description: 'Document and property verification' }
    },
    {
      id: 'tokenization',
      type: 'default',
      position: { x: 500, y: 100 },
      data: { label: 'Tokenization', description: 'Convert to investable tokens' }
    },
    {
      id: 'marketplace',
      type: 'output',
      position: { x: 700, y: 100 },
      data: { label: 'Marketplace', description: 'Available for investment' }
    }
  ];

  const edges: Edge[] = [
    { id: 'e1', source: 'creation', target: 'verification' },
    { id: 'e2', source: 'verification', target: 'tokenization' },
    { id: 'e3', source: 'tokenization', target: 'marketplace' }
  ];

  return { nodes, edges };
}

export function getFinancialFlow(): FlowData {
  const nodes: Node[] = [
    {
      id: 'payment',
      type: 'input',
      position: { x: 100, y: 100 },
      data: { label: 'Payment Processing', description: 'Paystack integration with webhooks' }
    },
    {
      id: 'escrow',
      type: 'default',
      position: { x: 300, y: 100 },
      data: { label: 'Escrow Management', description: 'Secure fund holding during transactions' }
    },
    {
      id: 'distribution',
      type: 'output',
      position: { x: 500, y: 100 },
      data: { label: 'Revenue Distribution', description: 'Automated dividend payments' }
    }
  ];

  const edges: Edge[] = [
    { id: 'e1', source: 'payment', target: 'escrow' },
    { id: 'e2', source: 'escrow', target: 'distribution' }
  ];

  return { nodes, edges };
}

export function getDatabaseFlow(): FlowData {
  const nodes = generateDatabaseNodes();
  const edges = generateDatabaseEdges();
  return { nodes, edges };
}

export function getFlowData(flowType: string): FlowData {
  switch (flowType) {
    case 'system-architecture':
      return getSystemArchitectureFlow();
    case 'user-journey':
      return getUserJourneyFlow();
    case 'property':
      return getPropertyFlow();
    case 'financial':
      return getFinancialFlow();
    case 'database':
      return getDatabaseFlow();
    default:
      return { nodes: [], edges: [] };
  }
}
