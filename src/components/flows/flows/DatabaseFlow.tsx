
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

// Generate nodes from the complete schema
const initialNodes: Node[] = generateDatabaseNodes();

// Generate basic relationships between key tables (excluding non-existent tables)
const generateSchemaEdges = (): Edge[] => {
  const edges: Edge[] = [];
  
  // Core relationships - only including tables that actually exist
  const relationships = [
    { from: 'user_roles', to: 'users' },
    { from: 'user_profiles', to: 'users' },
    { from: 'user_devices', to: 'users' },
    { from: 'properties', to: 'users' },
    { from: 'property_images', to: 'properties' },
    { from: 'property_favorites', to: 'properties' },
    { from: 'property_likes', to: 'properties' },
    { from: 'property_views', to: 'properties' },
    { from: 'property_reviews', to: 'properties' },
    { from: 'property_inquiries', to: 'properties' },
    { from: 'property_documents', to: 'properties' },
    { from: 'property_documents', to: 'land_titles' },
    { from: 'legal_agreements', to: 'land_titles' },
    { from: 'compliance_records', to: 'land_titles' },
    { from: 'tokenized_properties', to: 'land_titles' },
    { from: 'tokenized_properties', to: 'properties' },
    { from: 'token_holdings', to: 'tokenized_properties' },
    { from: 'token_transactions', to: 'tokenized_properties' },
    { from: 'revenue_distributions', to: 'tokenized_properties' },
    { from: 'dividend_payments', to: 'revenue_distributions' },
    { from: 'dividend_payments', to: 'token_holdings' },
    { from: 'investment_tracking', to: 'users' },
    { from: 'investment_groups', to: 'tokenized_properties' },
    { from: 'investment_discussions', to: 'investment_groups' },
    { from: 'investment_analytics', to: 'tokenized_properties' },
    { from: 'auction_listings', to: 'properties' },
    { from: 'accounts', to: 'users' },
    { from: 'payments', to: 'users' },
    { from: 'payment_methods', to: 'users' },
    { from: 'payment_sessions', to: 'users' },
    { from: 'escrow_accounts', to: 'properties' },
    { from: 'withdrawal_requests', to: 'users' },
    { from: 'wallets', to: 'users' },
    { from: 'conversations', to: 'users' },
    { from: 'messages', to: 'conversations' },
    { from: 'messages', to: 'users' },
    { from: 'message_reactions', to: 'messages' },
    { from: 'typing_indicators', to: 'conversations' },
    { from: 'notifications', to: 'users' },
    { from: 'notification_preferences', to: 'users' },
    { from: 'portfolio_allocations', to: 'users' },
    { from: 'inspections', to: 'properties' },
    { from: 'rentals', to: 'properties' },
    { from: 'reservations', to: 'properties' },
    { from: 'feedbacks', to: 'users' },
    { from: 'identity_verifications', to: 'users' },
    { from: 'kyc_documents', to: 'users' },
    { from: 'verifier_credentials', to: 'users' },
    { from: 'tree_donations', to: 'users' },
    { from: 'ai_property_valuations', to: 'users' },
    { from: 'ai_property_valuations', to: 'properties' },
    { from: 'investment_polls', to: 'investment_groups' },
    { from: 'smart_contracts', to: 'properties' },
    { from: 'api_keys', to: 'users' }
  ];

  relationships.forEach(({ from, to }, index) => {
    edges.push({
      id: `edge-${index}`,
      source: from,
      target: to,
      type: 'dataFlow',
      animated: true,
      style: { stroke: '#94a3b8', strokeWidth: 2 }
    });
  });

  return edges;
};

const initialEdges: Edge[] = generateSchemaEdges();

export function DatabaseFlow() {
  return (
    <FlowContainer
      nodes={initialNodes}
      edges={initialEdges}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      title={`Complete Database Schema (${initialNodes.filter(n => n.type === 'table').length} tables)`}
    />
  );
}
