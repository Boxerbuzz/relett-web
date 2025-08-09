
import { Node, Edge } from '@xyflow/react';

// Complete database schema with all fields
const tableSchemas = {
  // Property Management Core
  properties: {
    domain: '🏠 Property Management Core',
    fields: ['id', 'title', 'description', 'category', 'type', 'status', 'price', 'location', 'specification', 'amenities', 'features', 'condition', 'year_built', 'sqrft', 'garages', 'max_guest', 'views', 'likes', 'favorites', 'ratings', 'review_count', 'is_featured', 'is_verified', 'is_tokenized', 'is_ad', 'is_exclusive', 'is_deleted', 'backdrop', 'documents', 'tags', 'user_id', 'land_title_id', 'tokenized_property_id', 'created_at', 'updated_at'],
    relationships: ['user_id', 'land_title_id', 'tokenized_property_id']
  },
  property_images: {
    domain: '🏠 Property Management Core',
    fields: ['id', 'property_id', 'url', 'thumbnail_url', 'category', 'is_primary', 'sort_order', 'ratio'],
    relationships: ['property_id']
  },
  property_documents: {
    domain: '🏠 Property Management Core',
    fields: ['id', 'property_id', 'land_title_id', 'document_type', 'document_name', 'file_url', 'file_size', 'mime_type', 'document_hash', 'status', 'verification_notes', 'verified_by', 'verified_at', 'expires_at', 'metadata', 'created_at', 'updated_at'],
    relationships: ['property_id', 'land_title_id']
  },
  property_valuations: {
    domain: '🏠 Property Management Core',
    fields: ['id', 'land_title_id', 'property_id', 'valuer_id', 'valuation_date', 'valuation_amount', 'valuation_currency', 'valuation_method', 'market_conditions', 'comparable_properties', 'report_url', 'valid_until', 'created_at', 'updated_at'],
    relationships: ['land_title_id', 'property_id']
  },
  property_creation_workflows: {
    domain: '🏠 Property Management Core',
    fields: ['id', 'user_id', 'property_id', 'current_step', 'step_data', 'status', 'created_at', 'updated_at'],
    relationships: ['user_id', 'property_id']
  },
  property_favorites: {
    domain: '🏠 Property Management Core',
    fields: ['id', 'user_id', 'property_id', 'list_name', 'notes', 'created_at'],
    relationships: ['user_id', 'property_id']
  },
  property_likes: {
    domain: '🏠 Property Management Core',
    fields: ['id', 'user_id', 'property_id', 'created_at'],
    relationships: ['user_id', 'property_id']
  },
  property_views: {
    domain: '🏠 Property Management Core',
    fields: ['id', 'property_id', 'user_id', 'session_id', 'ip_address', 'user_agent', 'device_type', 'referrer', 'location_data', 'pages_viewed', 'view_duration', 'created_at'],
    relationships: ['property_id', 'user_id']
  },
  property_reviews: {
    domain: '🏠 Property Management Core',
    fields: ['id', 'property_id', 'user_id', 'user_name', 'rating', 'comment', 'created_at', 'updated_at'],
    relationships: ['property_id', 'user_id']
  },
  property_inquiries: {
    domain: '🏠 Property Management Core',
    fields: ['id', 'property_id', 'inquirer_id', 'agent_id', 'inquiry_type', 'subject', 'message', 'status', 'urgency_level', 'contact_preferences', 'response_count', 'last_contact_at', 'conversion_type', 'converted_at', 'created_at', 'updated_at'],
    relationships: ['property_id', 'inquirer_id', 'agent_id']
  },

  // Land Registry & Legal
  land_titles: {
    domain: '🏛️ Land Registry & Legal',
    fields: ['id', 'title_number', 'owner_id', 'coordinates', 'area_sqm', 'description', 'location_address', 'state', 'lga', 'land_use', 'title_type', 'acquisition_date', 'acquisition_method', 'previous_title_id', 'status', 'blockchain_hash', 'blockchain_transaction_id', 'verification_metadata', 'created_at', 'updated_at'],
    relationships: ['owner_id', 'previous_title_id']
  },
  legal_agreements: {
    domain: '🏛️ Land Registry & Legal',
    fields: ['id', 'land_title_id', 'agreement_type', 'parties', 'terms', 'financial_terms', 'start_date', 'end_date', 'status', 'signed_document_url', 'blockchain_record', 'created_at', 'updated_at'],
    relationships: ['land_title_id']
  },
  document_verification_requests: {
    domain: '🏛️ Land Registry & Legal',
    fields: ['id', 'document_id', 'requested_by', 'assigned_verifier', 'priority', 'status', 'verification_checklist', 'notes', 'completed_at', 'created_at', 'updated_at'],
    relationships: ['document_id', 'requested_by', 'assigned_verifier']
  },

  // Tokenization & Investment
  tokenized_properties: {
    domain: '🪙 Tokenization & Investment',
    fields: ['id', 'land_title_id', 'property_id', 'token_symbol', 'token_name', 'token_type', 'total_supply', 'total_value_usd', 'minimum_investment', 'token_price', 'status', 'blockchain_network', 'token_contract_address', 'token_id', 'hedera_token_id', 'investment_terms', 'expected_roi', 'revenue_distribution_frequency', 'lock_up_period_months', 'metadata', 'legal_structure', 'created_at', 'updated_at'],
    relationships: ['land_title_id', 'property_id']
  },
  token_holdings: {
    domain: '🪙 Tokenization & Investment',
    fields: ['id', 'tokenized_property_id', 'holder_id', 'tokens_owned', 'purchase_price_per_token', 'total_investment', 'acquisition_date', 'vesting_schedule', 'created_at', 'updated_at'],
    relationships: ['tokenized_property_id', 'holder_id']
  },
  token_transactions: {
    domain: '🪙 Tokenization & Investment',
    fields: ['id', 'tokenized_property_id', 'from_holder', 'to_holder', 'token_amount', 'price_per_token', 'total_value', 'transaction_type', 'blockchain_hash', 'hedera_transaction_id', 'status', 'metadata', 'created_at'],
    relationships: ['tokenized_property_id', 'from_holder', 'to_holder']
  },
  revenue_distributions: {
    domain: '🪙 Tokenization & Investment',
    fields: ['id', 'tokenized_property_id', 'distribution_date', 'total_revenue', 'revenue_per_token', 'distribution_type', 'source_description', 'blockchain_transaction_hash', 'metadata', 'created_at'],
    relationships: ['tokenized_property_id']
  },
  dividend_payments: {
    domain: '🪙 Tokenization & Investment',
    fields: ['id', 'revenue_distribution_id', 'token_holding_id', 'recipient_id', 'amount', 'net_amount', 'currency', 'tax_withholding', 'payment_method', 'status', 'external_transaction_id', 'paid_at', 'created_at'],
    relationships: ['revenue_distribution_id', 'token_holding_id', 'recipient_id']
  },
  investment_tracking: {
    domain: '🪙 Tokenization & Investment',
    fields: ['id', 'user_id', 'tokenized_property_id', 'tokens_owned', 'investment_amount', 'current_value', 'roi_percentage', 'last_dividend_amount', 'last_dividend_date', 'total_dividends_received', 'created_at', 'updated_at'],
    relationships: ['user_id', 'tokenized_property_id']
  },
  investment_groups: {
    domain: '🪙 Tokenization & Investment',
    fields: ['id', 'tokenized_property_id', 'lead_investor_id', 'name', 'description', 'target_amount', 'current_amount', 'minimum_investment', 'investor_count', 'max_investors', 'investment_terms', 'voting_power_distribution', 'status', 'closes_at', 'created_at', 'updated_at'],
    relationships: ['tokenized_property_id', 'lead_investor_id']
  },
  investment_discussions: {
    domain: '🪙 Tokenization & Investment',
    fields: ['id', 'investment_group_id', 'user_id', 'parent_id', 'content', 'attachments', 'is_pinned', 'is_private', 'vote_count', 'created_at', 'updated_at'],
    relationships: ['investment_group_id', 'user_id', 'parent_id']
  },
  investment_polls: {
    domain: '🪙 Tokenization & Investment',
    fields: ['id', 'investment_group_id', 'created_by', 'title', 'description', 'poll_type', 'status', 'starts_at', 'ends_at', 'min_participation_percentage', 'requires_consensus', 'consensus_threshold', 'allow_vote_changes', 'is_anonymous', 'voting_power_basis', 'hedera_topic_id', 'hedera_consensus_timestamp', 'metadata', 'created_at', 'updated_at'],
    relationships: ['investment_group_id', 'created_by']
  },

  // User Management & Authentication
  accounts: {
    domain: '👤 User Management & Authentication',
    fields: ['id', 'user_id', 'type', 'amount', 'points', 'currency', 'status', 'created_at', 'updated_at'],
    relationships: ['user_id']
  },
  identity_verifications: {
    domain: '👤 User Management & Authentication',
    fields: ['id', 'user_id', 'identity_type', 'identity_number', 'full_name', 'verification_status', 'verification_provider', 'verification_response', 'verified_at', 'expires_at', 'retry_count', 'last_retry_at', 'created_at', 'updated_at'],
    relationships: ['user_id']
  },
  kyc_documents: {
    domain: '👤 User Management & Authentication',
    fields: ['id', 'user_id', 'document_type', 'document_side', 'file_url', 'file_size', 'mime_type', 'file_hash', 'verification_status', 'verification_provider', 'verification_response', 'extracted_data', 'verified_by', 'verified_at', 'expires_at', 'rejection_reason', 'retry_count', 'created_at', 'updated_at'],
    relationships: ['user_id', 'verified_by']
  },

  // Financial & Payment Systems
  payments: {
    domain: '💰 Financial & Payment Systems',
    fields: ['id', 'user_id', 'agent_id', 'property_id', 'amount', 'currency', 'reference', 'related_id', 'related_type', 'type', 'method', 'provider', 'status', 'link', 'metadata', 'paid_at', 'created_at', 'updated_at'],
    relationships: ['user_id', 'agent_id', 'property_id']
  },
  payment_methods: {
    domain: '💰 Financial & Payment Systems',
    fields: ['id', 'user_id', 'type', 'provider', 'external_id', 'details', 'is_active', 'is_default', 'is_verified', 'expires_at', 'last_used_at', 'created_at', 'updated_at'],
    relationships: ['user_id']
  },
  payment_sessions: {
    domain: '💰 Financial & Payment Systems',
    fields: ['id', 'user_id', 'session_id', 'purpose', 'amount', 'currency', 'payment_provider', 'status', 'metadata', 'expires_at', 'completed_at', 'created_at', 'updated_at'],
    relationships: ['user_id']
  },
  financial_reports: {
    domain: '💰 Financial & Payment Systems',
    fields: ['id', 'user_id', 'report_type', 'period_start', 'period_end', 'data', 'metadata', 'status', 'generated_at', 'created_at', 'updated_at'],
    relationships: ['user_id']
  },

  // Security & Compliance
  aml_checks: {
    domain: '🔐 Security & Compliance',
    fields: ['id', 'user_id', 'transaction_id', 'check_type', 'provider', 'request_payload', 'response_payload', 'status', 'risk_level', 'risk_score', 'alerts', 'reviewed_by', 'reviewed_at', 'review_notes', 'created_at'],
    relationships: ['user_id', 'transaction_id', 'reviewed_by']
  },
  audit_trails: {
    domain: '🔐 Security & Compliance',
    fields: ['id', 'user_id', 'resource_type', 'resource_id', 'action', 'old_values', 'new_values', 'ip_address', 'user_agent', 'session_id', 'request_id', 'api_endpoint', 'http_method', 'response_status', 'processing_time_ms', 'flagged', 'flag_reason', 'risk_score', 'created_at'],
    relationships: ['user_id']
  },
  identity_audit_logs: {
    domain: '🔐 Security & Compliance',
    fields: ['id', 'user_id', 'performed_by', 'action', 'resource_type', 'resource_id', 'old_values', 'new_values', 'ip_address', 'user_agent', 'device_fingerprint', 'created_at'],
    relationships: ['user_id', 'performed_by']
  },
  api_keys: {
    domain: '🔐 Security & Compliance',
    fields: ['id', 'user_id', 'name', 'description', 'key_hash', 'permissions', 'is_active', 'usage_count', 'rate_limit_per_minute', 'rate_limit_per_hour', 'rate_limit_per_day', 'expires_at', 'last_used_at', 'webhook_url', 'webhook_secret', 'created_at', 'updated_at'],
    relationships: ['user_id']
  },

  // Communication & Chat
  conversations: {
    domain: '💬 Communication & Chat',
    fields: ['id', 'admin_id', 'name', 'description', 'type', 'activity_type', 'participants', 'settings', 'is_archived', 'avatar_url', 'metadata', 'created_at', 'updated_at'],
    relationships: ['admin_id']
  },
  messages: {
    domain: '💬 Communication & Chat',
    fields: ['id', 'conversation_id', 'sender_id', 'sender', 'type', 'content', 'properties', 'property_id', 'attachment_id', 'reply_to_id', 'read_by', 'reactions', 'is_deleted', 'is_edited', 'metadata', 'error_message', 'timestamp', 'created_at'],
    relationships: ['conversation_id', 'sender_id', 'property_id', 'attachment_id', 'reply_to_id']
  },
  chat_messages: {
    domain: '💬 Communication & Chat',
    fields: ['id', 'conversation_id', 'sender_id', 'content', 'message_type', 'attachment_url', 'reply_to_id', 'metadata', 'edited_at', 'created_at', 'updated_at'],
    relationships: ['conversation_id', 'sender_id', 'reply_to_id']
  },
  message_attachments: {
    domain: '💬 Communication & Chat',
    fields: ['id', 'name', 'url', 'mime_type', 'size', 'created_at'],
    relationships: []
  },
  message_reactions: {
    domain: '💬 Communication & Chat',
    fields: ['id', 'message_id', 'user_id', 'emoji', 'created_at'],
    relationships: ['message_id', 'user_id']
  },

  // Notifications & Alerts
  notifications: {
    domain: '🔔 Notifications & Alerts',
    fields: ['id', 'user_id', 'sender_id', 'type', 'title', 'message', 'metadata', 'action_url', 'action_label', 'image_url', 'is_read', 'channel', 'external_id', 'delivery_status', 'scheduled_for', 'retry_count', 'action_taken_at', 'created_at', 'updated_at'],
    relationships: ['user_id', 'sender_id']
  },
  notification_preferences: {
    domain: '🔔 Notifications & Alerts',
    fields: ['id', 'user_id', 'email_notifications', 'push_notifications', 'sms_notifications', 'notification_types', 'quiet_hours_start', 'quiet_hours_end', 'do_not_disturb', 'created_at', 'updated_at'],
    relationships: ['user_id']
  },
  notification_deliveries: {
    domain: '🔔 Notifications & Alerts',
    fields: ['id', 'notification_id', 'channel', 'status', 'external_id', 'error_message', 'delivered_at', 'created_at', 'updated_at'],
    relationships: ['notification_id']
  },
  notification_templates: {
    domain: '🔔 Notifications & Alerts',
    fields: ['id', 'category', 'language', 'title', 'body', 'action_text', 'created_at', 'updated_at'],
    relationships: []
  },
  system_notifications: {
    domain: '🔔 Notifications & Alerts',
    fields: ['id', 'created_by', 'title', 'message', 'notification_type', 'severity', 'target_audience', 'target_users', 'action_required', 'action_url', 'action_label', 'is_dismissible', 'auto_dismiss_after', 'display_from', 'display_until', 'created_at'],
    relationships: ['created_by']
  },

  // Business Operations
  inspections: {
    domain: '🏢 Business Operations',
    fields: ['id', 'user_id', 'agent_id', 'property_id', 'conversation_id', 'mode', 'status', 'when', 'notes', 'metadata', 'cancellation_details', 'created_at', 'updated_at'],
    relationships: ['user_id', 'agent_id', 'property_id', 'conversation_id']
  },
  rentals: {
    domain: '🏢 Business Operations',
    fields: ['id', 'user_id', 'agent_id', 'property_id', 'conversation_id', 'payment_id', 'subscription_id', 'plan_id', 'payment_plan', 'payment_status', 'status', 'price', 'move_in_date', 'message', 'metadata', 'cancellation_details', 'created_at', 'updated_at'],
    relationships: ['user_id', 'agent_id', 'property_id', 'conversation_id', 'payment_id']
  },
  reservations: {
    domain: '🏢 Business Operations',
    fields: ['id', 'user_id', 'agent_id', 'property_id', 'conversation_id', 'payment_id', 'from_date', 'to_date', 'nights', 'adults', 'children', 'infants', 'total', 'fee', 'caution_deposit', 'status', 'note', 'metadata', 'cancellation_details', 'created_at', 'updated_at'],
    relationships: ['user_id', 'agent_id', 'property_id', 'conversation_id', 'payment_id']
  },
  feedbacks: {
    domain: '🏢 Business Operations',
    fields: ['id', 'user_id', 'type', 'title', 'description', 'attachments', 'is_anonymous', 'resolved_at', 'created_at', 'updated_at'],
    relationships: ['user_id']
  },
  contacts_us: {
    domain: '🏢 Business Operations',
    fields: ['id', 'first_name', 'last_name', 'email', 'phone_number', 'message', 'created_at'],
    relationships: []
  },

  // Analytics & AI
  market_analytics: {
    domain: '📈 Analytics & AI',
    fields: ['id', 'location_id', 'property_type', 'metric_type', 'metric_value', 'currency', 'period_type', 'calculation_date', 'sample_size', 'confidence_level', 'metadata', 'created_at'],
    relationships: []
  },
  ai_property_valuations: {
    domain: '📈 Analytics & AI',
    fields: ['id', 'user_id', 'property_id', 'ai_model', 'ai_estimated_value', 'confidence_score', 'valuation_factors', 'market_comparisons', 'created_at', 'updated_at'],
    relationships: ['user_id', 'property_id']
  },
  learning_patterns: {
    domain: '📈 Analytics & AI',
    fields: ['id', 'user_id', 'pattern_type', 'pattern_data', 'confidence_score', 'usage_count', 'success_rate', 'last_applied_at', 'created_at', 'updated_at'],
    relationships: ['user_id']
  },
  agent_interactions: {
    domain: '📈 Analytics & AI',
    fields: ['id', 'user_id', 'agent_id', 'conversation_id', 'property_id', 'interaction_type', 'user_message', 'agent_response', 'response_time_ms', 'outcome', 'context_data', 'user_satisfaction_score', 'created_at', 'updated_at'],
    relationships: ['user_id', 'conversation_id', 'property_id']
  },

  // User Engagement
  saved_searches: {
    domain: '🎯 User Engagement',
    fields: ['id', 'user_id', 'name', 'search_criteria', 'alert_enabled', 'last_run_at', 'created_at', 'updated_at'],
    relationships: ['user_id']
  },
  portfolio_allocations: {
    domain: '🎯 User Engagement',
    fields: ['id', 'user_id', 'allocation_type', 'category', 'target_percentage', 'current_percentage', 'current_value', 'rebalance_threshold', 'last_rebalanced_at', 'created_at', 'updated_at'],
    relationships: ['user_id']
  },

  // System & Infrastructure
  smart_contracts: {
    domain: '🔧 System & Infrastructure',
    fields: ['id', 'contract_type', 'contract_address', 'network', 'deployment_transaction_hash', 'deployer_id', 'related_property_id', 'related_tokenized_property_id', 'abi', 'bytecode', 'source_code', 'compiler_version', 'verification_status', 'status', 'deployment_cost', 'gas_used', 'created_at', 'updated_at'],
    relationships: ['deployer_id', 'related_property_id', 'related_tokenized_property_id']
  },
  bank_cache: {
    domain: '🔧 System & Infrastructure',
    fields: ['id', 'data', 'created_at', 'updated_at'],
    relationships: []
  },
  conversation_contexts: {
    domain: '🔧 System & Infrastructure',
    fields: ['id', 'user_id', 'agent_id', 'conversation_id', 'context_data', 'current_intent', 'session_start', 'last_interaction', 'is_active', 'search_history'],
    relationships: ['user_id', 'conversation_id']
  }
};

const domainColors = {
  '🏠 Property Management Core': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900' },
  '🏛️ Land Registry & Legal': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900' },
  '🪙 Tokenization & Investment': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900' },
  '👤 User Management & Authentication': { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-900' },
  '💰 Financial & Payment Systems': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900' },
  '🔐 Security & Compliance': { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-900' },
  '💬 Communication & Chat': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900' },
  '🔔 Notifications & Alerts': { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-900' },
  '🏢 Business Operations': { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-900' },
  '📈 Analytics & AI': { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-900' },
  '🎯 User Engagement': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-900' },
  '🔧 System & Infrastructure': { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-900' }
};

export function generateDatabaseNodes(): Node[] {
  const nodes: Node[] = [];
  const domains = Object.keys(domainColors);
  
  const BORDER_PADDING = 50;
  const GROUP_PADDING = 30;
  const NODE_WIDTH = 280;
  const NODE_HEIGHT = 200;
  const NODES_PER_ROW = 3;
  const GROUP_VERTICAL_SPACING = 150;
  
  let currentY = BORDER_PADDING;

  domains.forEach((domain) => {
    const tablesInDomain = Object.entries(tableSchemas).filter(([_, schema]) => schema.domain === domain);
    const tableCount = tablesInDomain.length;
    const numRows = Math.ceil(tableCount / NODES_PER_ROW);
    const groupWidth = (NODE_WIDTH + GROUP_PADDING) * Math.min(tableCount, NODES_PER_ROW) + GROUP_PADDING;
    const groupHeight = numRows * (NODE_HEIGHT + GROUP_PADDING) + GROUP_PADDING * 2;

    const groupId = `group-${domain.replace(/[^\w]/g, '-')}`;
    nodes.push({
      id: groupId,
      type: 'domain',
      position: { x: BORDER_PADDING, y: currentY },
      data: { 
        label: domain,
        tableCount: tableCount,
        description: `${tableCount} tables in this domain`
      },
      style: {
        width: groupWidth,
        height: groupHeight,
      },
    });

    tablesInDomain.forEach(([tableName, schema], tableIndex) => {
      const col = tableIndex % NODES_PER_ROW;
      const row = Math.floor(tableIndex / NODES_PER_ROW);
      
      nodes.push({
        id: tableName,
        type: 'table',
        position: {
          x: col * (NODE_WIDTH + GROUP_PADDING) + GROUP_PADDING,
          y: row * (NODE_HEIGHT + GROUP_PADDING) + GROUP_PADDING * 3,
        },
        data: { 
          label: tableName, 
          fields: schema.fields,
          relationships: schema.relationships,
          domain: domain,
          description: `${schema.fields.length} fields`
        },
        parentId: groupId,
        extent: 'parent',
      });
    });

    currentY += groupHeight + GROUP_VERTICAL_SPACING;
  });

  return nodes;
}

export function generateDatabaseEdges(): Edge[] {
  const edges: Edge[] = [];
  let edgeId = 0;

  // Define relationships based on foreign keys and logical connections
  const relationships = [
    // Property relationships
    { from: 'properties', to: 'land_titles', field: 'land_title_id' },
    { from: 'properties', to: 'tokenized_properties', field: 'tokenized_property_id' },
    { from: 'property_images', to: 'properties', field: 'property_id' },
    { from: 'property_documents', to: 'properties', field: 'property_id' },
    { from: 'property_documents', to: 'land_titles', field: 'land_title_id' },
    { from: 'property_valuations', to: 'properties', field: 'property_id' },
    { from: 'property_valuations', to: 'land_titles', field: 'land_title_id' },
    { from: 'property_favorites', to: 'properties', field: 'property_id' },
    { from: 'property_likes', to: 'properties', field: 'property_id' },
    { from: 'property_views', to: 'properties', field: 'property_id' },
    { from: 'property_reviews', to: 'properties', field: 'property_id' },
    { from: 'property_inquiries', to: 'properties', field: 'property_id' },
    
    // Land title relationships
    { from: 'legal_agreements', to: 'land_titles', field: 'land_title_id' },
    
    // Tokenization relationships
    { from: 'tokenized_properties', to: 'land_titles', field: 'land_title_id' },
    { from: 'tokenized_properties', to: 'properties', field: 'property_id' },
    { from: 'token_holdings', to: 'tokenized_properties', field: 'tokenized_property_id' },
    { from: 'token_transactions', to: 'tokenized_properties', field: 'tokenized_property_id' },
    { from: 'revenue_distributions', to: 'tokenized_properties', field: 'tokenized_property_id' },
    { from: 'dividend_payments', to: 'revenue_distributions', field: 'revenue_distribution_id' },
    { from: 'dividend_payments', to: 'token_holdings', field: 'token_holding_id' },
    { from: 'investment_tracking', to: 'tokenized_properties', field: 'tokenized_property_id' },
    { from: 'investment_groups', to: 'tokenized_properties', field: 'tokenized_property_id' },
    { from: 'investment_discussions', to: 'investment_groups', field: 'investment_group_id' },
    { from: 'investment_polls', to: 'investment_groups', field: 'investment_group_id' },
    
    // Payment relationships
    { from: 'payments', to: 'properties', field: 'property_id' },
    
    // Communication relationships
    { from: 'messages', to: 'conversations', field: 'conversation_id' },
    { from: 'messages', to: 'properties', field: 'property_id' },
    { from: 'messages', to: 'message_attachments', field: 'attachment_id' },
    { from: 'chat_messages', to: 'conversations', field: 'conversation_id' },
    { from: 'message_reactions', to: 'messages', field: 'message_id' },
    
    // Notification relationships
    { from: 'notification_deliveries', to: 'notifications', field: 'notification_id' },
    
    // Business operations relationships
    { from: 'inspections', to: 'properties', field: 'property_id' },
    { from: 'inspections', to: 'conversations', field: 'conversation_id' },
    { from: 'rentals', to: 'properties', field: 'property_id' },
    { from: 'rentals', to: 'conversations', field: 'conversation_id' },
    { from: 'reservations', to: 'properties', field: 'property_id' },
    { from: 'reservations', to: 'conversations', field: 'conversation_id' },
    
    // Analytics relationships
    { from: 'ai_property_valuations', to: 'properties', field: 'property_id' },
    { from: 'agent_interactions', to: 'conversations', field: 'conversation_id' },
    { from: 'agent_interactions', to: 'properties', field: 'property_id' },
    
    // Smart contracts relationships
    { from: 'smart_contracts', to: 'properties', field: 'related_property_id' },
    { from: 'smart_contracts', to: 'tokenized_properties', field: 'related_tokenized_property_id' },
    
    // Document verification relationships
    { from: 'document_verification_requests', to: 'property_documents', field: 'document_id' }
  ];

  relationships.forEach((rel) => {
    // Check if both tables exist in our schema
    if (tableSchemas[rel.from] && tableSchemas[rel.to]) {
      edges.push({
        id: `edge-${edgeId++}`,
        source: rel.from,
        target: rel.to,
        type: 'smoothstep',
        animated: false,
        style: { 
          stroke: '#64748b', 
          strokeWidth: 2,
          strokeDasharray: '5,5'
        },
        label: rel.field || '',
        labelStyle: { fontSize: 10, fill: '#64748b' }
      });
    }
  });

  return edges;
}

export function getDatabaseDomains() {
  const domains = Object.keys(domainColors).map(domain => ({
    name: domain,
    tables: Object.entries(tableSchemas)
      .filter(([_, schema]) => schema.domain === domain)
      .map(([tableName, schema]) => ({
        name: tableName,
        description: `${schema.fields.length} fields`,
        fields: schema.fields,
        relationships: schema.relationships
      }))
  }));
  
  return domains;
}

export function getTablesByDomain() {
  const tablesByDomain: Record<string, any[]> = {};
  
  Object.keys(domainColors).forEach(domain => {
    tablesByDomain[domain] = Object.entries(tableSchemas)
      .filter(([_, schema]) => schema.domain === domain)
      .map(([tableName, schema]) => ({
        name: tableName,
        description: `${schema.fields.length} fields`,
        fields: schema.fields,
        relationships: schema.relationships
      }));
  });
  
  return tablesByDomain;
}
