
import React from 'react';
import { Node, Edge } from '@xyflow/react';
import { FlowContainer } from '../FlowContainer';
import { ProcessStepNode, DecisionNode } from '../nodes/ProcessFlowNodes';
import { DataFlowEdge } from '../edges/DataFlowEdge';

const nodeTypes = {
  processStep: ProcessStepNode,
  decision: DecisionNode,
};

const edgeTypes = {
  dataFlow: DataFlowEdge,
};

const nodes: Node[] = [
  {
    id: '1',
    type: 'processStep',
    position: { x: 100, y: 0 },
    data: {
      label: 'User Registration',
      description: 'User signs up with email and basic information',
      status: 'completed',
      stepNumber: 1,
      tables: ['users'],
      estimatedTime: '2-3 minutes',
    },
  },
  {
    id: '2',
    type: 'processStep',
    position: { x: 100, y: 150 },
    data: {
      label: 'Email Verification',
      description: 'Verify email address through confirmation link',
      status: 'in-progress',
      stepNumber: 2,
      tables: ['users'],
      estimatedTime: '1-2 minutes',
    },
  },
  {
    id: '3',
    type: 'processStep',
    position: { x: 100, y: 300 },
    data: {
      label: 'Document Upload',
      description: 'Upload identity documents (NIN, BVN, etc.)',
      stepNumber: 3,
      tables: ['kyc_documents', 'identity_verifications'],
      estimatedTime: '5-10 minutes',
    },
  },
  {
    id: '4',
    type: 'decision',
    position: { x: 150, y: 450 },
    data: {
      label: 'KYC Approved?',
    },
  },
  {
    id: '5',
    type: 'processStep',
    position: { x: 100, y: 600 },
    data: {
      label: 'Role Assignment',
      description: 'Assign user roles based on verification',
      status: 'completed',
      stepNumber: 4,
      tables: ['user_roles'],
      estimatedTime: 'Instant',
    },
  },
  {
    id: '6',
    type: 'processStep',
    position: { x: 100, y: 750 },
    data: {
      label: 'Profile Completion',
      description: 'Complete user preferences and profile setup',
      stepNumber: 5,
      tables: ['user_preferences', 'notification_preferences'],
      estimatedTime: '3-5 minutes',
    },
  },
  {
    id: '7',
    type: 'processStep',
    position: { x: 400, y: 450 },
    data: {
      label: 'Manual Review',
      description: 'Document requires manual verification',
      status: 'pending',
      tables: ['identity_verifications'],
      estimatedTime: '1-3 business days',
    },
  },
];

const edges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    type: 'dataFlow',
    data: { label: 'Trigger email verification', type: 'event' },
  },
  {
    id: 'e2-3',
    source: '2',
    target: '3',
    type: 'dataFlow',
    data: { label: 'Email confirmed', type: 'data' },
  },
  {
    id: 'e3-4',
    source: '3',
    target: '4',
    type: 'dataFlow',
    data: { label: 'Documents submitted', type: 'data' },
  },
  {
    id: 'e4-5',
    source: '4',
    target: '5',
    type: 'dataFlow',
    data: { label: 'Auto-approved', type: 'data' },
  },
  {
    id: 'e4-7',
    source: '4',
    target: '7',
    type: 'dataFlow',
    data: { label: 'Requires review', type: 'trigger' },
  },
  {
    id: 'e5-6',
    source: '5',
    target: '6',
    type: 'dataFlow',
    data: { label: 'Role assigned', type: 'data' },
  },
  {
    id: 'e7-5',
    source: '7',
    target: '5',
    type: 'dataFlow',
    data: { label: 'Approved', type: 'data' },
  },
];

export function UserJourneyFlow() {
  return (
    <FlowContainer
      nodes={nodes}
      edges={edges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      title="User Registration & Verification Journey"
    />
  );
}
