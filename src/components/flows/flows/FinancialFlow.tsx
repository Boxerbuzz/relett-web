
import React from 'react';
import { Node, Edge } from '@xyflow/react';
import { FlowContainer } from '../FlowContainer';
import { ProcessStepNode } from '../nodes/ProcessFlowNodes';
import { SystemArchitectureNode } from '../nodes/SystemArchitectureNodes';
import { DataFlowEdge } from '../edges/DataFlowEdge';

const nodeTypes = {
  processStep: ProcessStepNode,
  system: SystemArchitectureNode,
};

const edgeTypes = {
  dataFlow: DataFlowEdge,
};

const initialNodes: Node[] = [
  { id: '1', type: 'system', position: { x: 0, y: 150 }, data: { type: 'frontend', label: 'User Action', description: 'User initiates payment or investment' } },
  { id: '2', type: 'system', position: { x: 250, y: 0 }, data: { type: 'integration', label: 'Payment Gateway', description: 'e.g., Paystack, Flutterwave' } },
  { id: '3', type: 'processStep', position: { x: 250, y: 150 }, data: { label: 'Process Investment', tables: ['payments', 'accounts'], description: 'Deduct funds from user account or process card payment.' } },
  { id: '4', type: 'processStep', position: { x: 500, y: 150 }, data: { label: 'Update Platform Account', tables: ['accounts'], description: 'Credit platform treasury account.' } },
  { id: '5', type: 'system', position: { x: 750, y: 150 }, data: { type: 'blockchain', label: 'Hedera Network', description: 'Token transfers & consensus' } },
  { id: '6', type: 'processStep', position: { x: 500, y: 300 }, data: { label: 'Record Token Transaction', tables: ['token_transactions', 'token_holdings'], description: 'Update ownership records.' } },
  { id: '7', type: 'system', position: { x: 250, y: 450 }, data: { type: 'database', label: 'Collect Property Revenue', description: 'e.g., rent, service fees' } },
  { id: '8', type: 'processStep', position: { x: 500, y: 450 }, data: { label: 'Distribute Revenue', tables: ['revenue_distributions', 'dividend_payments'], description: 'Calculate and queue dividend payouts.' } },
  { id: '9', type: 'processStep', position: { x: 750, y: 450 }, data: { label: 'Credit User Wallets', tables: ['accounts'], description: 'Pay dividends to token holders.' } },
  { id: '10', type: 'processStep', position: { x: 0, y: 300 }, data: { label: 'User Initiates Withdrawal', tables: ['withdrawal_requests'], description: 'Request to cash out from wallet.' } },
];

const initialEdges: Edge[] = [
  // Investment Flow
  { id: 'e1-2', source: '1', target: '2', type: 'dataFlow', data: { type: 'event', label: 'Deposit Funds' } },
  { id: 'e1-3', source: '1', target: '3', type: 'dataFlow', data: { type: 'trigger', label: 'Invest Now' } },
  { id: 'e2-3', source: '2', target: '3', type: 'dataFlow', data: { type: 'data', label: 'Payment Success' } },
  { id: 'e3-4', source: '3', target: '4', type: 'dataFlow', data: { label: 'Fiat Transfer' } },
  { id: 'e4-5', source: '4', target: '5', type: 'dataFlow', data: { type: 'event', label: 'Trigger Token Transfer' } },
  { id: 'e5-6', source: '5', target: '6', type: 'dataFlow', data: { type: 'data', label: 'Transaction Confirmed' } },
  { id: 'e6-1', source: '6', target: '1', type: 'dataFlow', data: { label: 'Update UI' } },
  
  // Revenue Flow
  { id: 'e7-8', source: '7', target: '8', type: 'dataFlow', data: { label: 'Revenue Collected' } },
  { id: 'e8-9', source: '8', target: '9', type: 'dataFlow', data: { label: 'Pay Dividends' } },
  { id: 'e9-1', source: '9', target: '1', type: 'dataFlow', data: { label: 'Notify User' } },

  // Withdrawal Flow
  { id: 'e1-10', source: '1', target: '10', type: 'dataFlow', data: { type: 'trigger', label: 'Withdraw Funds' } },
  { id: 'e10-2', source: '10', target: '2', type: 'dataFlow', data: { type: 'event', label: 'Payout Request' } },
];

export function FinancialFlow() {
  return (
    <FlowContainer
      nodes={initialNodes}
      edges={initialEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      title="Financial Transaction & Revenue Flow"
    />
  );
}
