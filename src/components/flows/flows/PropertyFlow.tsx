
import React from 'react';
import { Node, Edge } from '@xyflow/react';
import { FlowContainer } from '../FlowContainer';
import { ProcessStepNode, DecisionNode } from '../nodes/ProcessFlowNodes';
import { SystemArchitectureNode } from '../nodes/SystemArchitectureNodes';
import { DataFlowEdge } from '../edges/DataFlowEdge';

const nodeTypes = {
  processStep: ProcessStepNode,
  decision: DecisionNode,
  system: SystemArchitectureNode,
};

const edgeTypes = {
  dataFlow: DataFlowEdge,
};

const initialNodes: Node[] = [
  { id: '1', type: 'processStep', position: { x: 250, y: 0 }, data: { label: 'Start: User Initiates Listing', stepNumber: 1, status: 'completed' } },
  { id: '2', type: 'processStep', position: { x: 250, y: 120 }, data: { label: 'Add Property Details', description: 'Basic info, specs, pricing.', tables: ['properties', 'property_creation_workflows'], stepNumber: 2, status: 'in-progress' } },
  { id: '3', type: 'processStep', position: { x: 250, y: 260 }, data: { label: 'Upload Documents & Media', description: 'Deeds, surveys, photos.', tables: ['property_documents', 'property_images'], stepNumber: 3 } },
  { id: '4', type: 'processStep', position: { x: 250, y: 400 }, data: { label: 'Submit for Verification', description: 'Queued for review by a verifier.', tables: ['document_verification_requests'], stepNumber: 4 } },
  { id: '5', type: 'system', position: { x: 500, y: 400 }, data: { type: 'integration', label: 'Verifier Network', description: 'Lawyers, surveyors review documents.' } },
  { id: '6', type: 'decision', position: { x: 250, y: 550 }, data: { label: 'Verification Approved?' } },
  { id: '7', type: 'processStep', position: { x: 250, y: 720 }, data: { label: 'Initiate Tokenization', description: 'Define token price, supply, etc.', tables: ['tokenized_properties'], stepNumber: 5 } },
  { id: '8', type: 'system', position: { x: 500, y: 720 }, data: { type: 'blockchain', label: 'Mint Tokens on Hedera', description: 'Create HTS tokens.' } },
  { id: '9', type: 'processStep', position: { x: 250, y: 860 }, data: { label: 'List on Marketplace', description: 'Property becomes available for investment.', tables: ['properties'], stepNumber: 6 } },
  { id: '10', type: 'processStep', position: { x: 250, y: 1000 }, data: { label: 'Secondary Trading', description: 'Investors trade tokens.', tables: ['token_transactions', 'token_holdings'], stepNumber: 7 } },
  { id: '11', type: 'processStep', position: { x: 0, y: 860 }, data: { label: 'Collect Rental Revenue', tables: ['payments', 'rentals'], stepNumber: 'B1' } },
  { id: '12', type: 'processStep', position: { x: 0, y: 1000 }, data: { label: 'Distribute Revenue', description: 'Pay dividends to token holders.', tables: ['revenue_distributions', 'dividend_payments'], stepNumber: 'B2' } },
  { id: '13', type: 'processStep', position: { x: 50, y: 550 }, data: { label: 'Request Corrections', description: 'User is notified to update listing.' } },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'dataFlow', data: { animated: true } },
  { id: 'e2-3', source: '2', target: '3', type: 'dataFlow' },
  { id: 'e3-4', source: '3', target: '4', type: 'dataFlow' },
  { id: 'e4-5', source: '4', target: '5', type: 'dataFlow', data: { type: 'event', label: 'Verification Request' } },
  { id: 'e5-6', source: '5', target: '6', type: 'dataFlow', data: { type: 'data', label: 'Verification Result' } },
  { id: 'e6-7', source: '6', target: '7', type: 'dataFlow', data: { label: 'Yes' } },
  { id: 'e6-13', source: '6', target: '13', type: 'dataFlow', data: { label: 'No' } },
  { id: 'e13-2', source: '13', target: '2', type: 'dataFlow', data: { type: 'trigger', label: 'User updates' } },
  { id: 'e7-8', source: '7', target: '8', type: 'dataFlow', data: { type: 'event', label: 'Mint Request' } },
  { id: 'e8-9', source: '8', target: '9', type: 'dataFlow', data: { type: 'data', label: 'Token ID' } },
  { id: 'e9-10', source: '9', target: '10', type: 'dataFlow' },
  { id: 'e9-11', source: '9', target: '11', type: 'dataFlow' },
  { id: 'e11-12', source: '11', target: '12', type: 'dataFlow' },
  { id: 'e12-10', source: '12', target: '10', type: 'dataFlow', data: { label: 'Dividends affect value' } },
];

export function PropertyFlow() {
  return (
    <FlowContainer
      nodes={initialNodes}
      edges={initialEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      title="Property Lifecycle & Tokenization Flow"
    />
  );
}
