
import { Node } from '@xyflow/react';

const schemaMarkdown = `
#### 🏠 Property Management Core
properties - Main property listings with details, pricing, location
property_images - Property photos and media gallery
property_documents - Legal documents, certificates, deeds
property_valuations - AI and professional property valuations
property_creation_workflows - Multi-step property creation process tracking
property_favorites - User saved/bookmarked properties
property_likes - Property likes/hearts from users
property_views - Property view tracking and analytics
property_reviews - User reviews and ratings for properties
property_inquiries - Contact requests and inquiries for properties

#### 🏛️ Land Registry & Legal
land_titles - Official land ownership records and titles
legal_agreements - Contracts, leases, sale agreements
compliance_records - Tax, permits, regulatory compliance
compliance_reports - Regulatory reporting for authorities
document_verification_requests - Document review queue for verifiers

#### 🪙 Tokenization & Investment
tokenized_properties - Properties converted to digital tokens
token_holdings - Individual investor token ownership records
token_transactions - Token buying/selling/transfer records
revenue_distributions - Dividend payments to token holders
dividend_payments - Individual payment records to investors
investment_tracking - Portfolio performance tracking
investment_groups - Collaborative investment pools
investment_discussions - Group chat for investors
investment_analytics - Performance metrics and insights
auction_listings - Property auctions and bidding system
investment_polls - Investment group voting and polls
poll_options - Available voting choices for polls
poll_votes - Individual vote records for polls

#### 👤 User Management & Authentication
users - Core user profiles from Supabase Auth (referenced)
accounts - User wallet balances and points system
user_roles - Role assignments (admin, agent, investor, etc.)
identity_verifications - KYC identity verification records
kyc_documents - Identity documents for verification
sanctions_screening - Government sanctions checking
verifier_credentials - Professional verifier licenses

#### 💰 Financial & Payment Systems
payments - Transaction records for all payments
payment_methods - Saved payment cards/methods
payment_sessions - Active payment processing sessions
escrow_accounts - Secure transaction holding accounts
financial_reports - User investment reports and analytics

#### 🔐 Security & Compliance
aml_checks - Anti-money laundering screening
audit_trails - Complete activity logging system
identity_audit_logs - Identity verification audit trail
backup_recovery - System backup management
api_keys - API access management and rate limiting

#### 💬 Communication & Chat
conversations - Chat rooms and groups
messages - Individual chat messages in conversations
chat_messages - Alternative message storage system
message_attachments - File sharing in chats
message_reactions - Emoji reactions on messages
conversation_contexts - AI conversation state management

#### 🔔 Notifications & Alerts
notifications - All user notifications
notification_preferences - User notification settings
notification_deliveries - Delivery status tracking
notification_templates - Pre-defined message templates
system_notifications - Platform-wide announcements

#### 🏢 Business Operations
inspections - Property inspection scheduling and management
rentals - Rental agreements and management
reservations - Property viewing appointments
feedbacks - User feedback and support tickets
contacts_us - Contact form submissions

#### 📈 Analytics & AI
market_analytics - Market trends and insights
ai_property_valuations - AI-generated property valuations
learning_patterns - AI learning and pattern recognition
agent_interactions - AI agent conversation tracking
agent_performance_metrics - Agent effectiveness metrics

#### 🌳 Environmental & Sustainability
trees - Available trees for environmental donations
tree_donations - Environmental contribution tracking

#### 🎯 User Engagement
saved_searches - Saved search criteria and alerts
portfolio_allocations - Investment diversification targets

#### 🔧 System & Infrastructure
smart_contracts - Blockchain contract management
bank_cache - Banking data caching
`;

interface Domain {
  name: string;
  tables: { name: string; description: string }[];
}

function parseSchemaMarkdown(markdown: string): Domain[] {
  const domains: Domain[] = [];
  let currentDomain: Domain | null = null;

  markdown.split('\n').forEach(line => {
    line = line.trim();
    if (!line) return;

    if (line.startsWith('####')) {
      const name = line.replace('####', '').trim();
      currentDomain = { name, tables: [] };
      domains.push(currentDomain);
    } else if (currentDomain) {
      const parts = line.split(' - ');
      if (parts.length >= 2) {
        currentDomain.tables.push({
          name: parts[0].trim(),
          description: parts.slice(1).join(' - ').trim(),
        });
      }
    }
  });

  return domains;
}

export function generateDatabaseNodes(): Node[] {
  const domains = parseSchemaMarkdown(schemaMarkdown);
  const nodes: Node[] = [];

  const BORDER_PADDING = 50;
  const GROUP_PADDING = 20;
  const NODE_WIDTH = 200;
  const NODE_HEIGHT = 45;
  const NODES_PER_ROW = 3;
  const GROUP_VERTICAL_SPACING = 120;
  
  let currentY = BORDER_PADDING;

  domains.forEach((domain, index) => {
    const tableCount = domain.tables.length;
    const numRows = Math.ceil(tableCount / NODES_PER_ROW);
    const groupWidth = (NODE_WIDTH + GROUP_PADDING) * Math.min(tableCount, NODES_PER_ROW) + GROUP_PADDING;
    const groupHeight = numRows * (NODE_HEIGHT + GROUP_PADDING) + GROUP_PADDING * 2;

    const groupId = `group-${domain.name.replace(/\s+/g, '-')}`;
    nodes.push({
      id: groupId,
      type: 'domain',
      position: { x: BORDER_PADDING, y: currentY },
      data: { 
        label: domain.name,
        tableCount: tableCount,
        description: `${tableCount} tables in this domain`
      },
      style: {
        width: groupWidth,
        height: groupHeight,
      },
    });

    domain.tables.forEach((table, tableIndex) => {
      const col = tableIndex % NODES_PER_ROW;
      const row = Math.floor(tableIndex / NODES_PER_ROW);
      
      nodes.push({
        id: table.name,
        type: 'table',
        position: {
          x: col * (NODE_WIDTH + GROUP_PADDING) + GROUP_PADDING,
          y: row * (NODE_HEIGHT + GROUP_PADDING) + GROUP_PADDING * 3,
        },
        data: { 
          label: table.name, 
          description: table.description,
          domain: domain.name
        },
        parentId: groupId,
        extent: 'parent',
      });
    });

    currentY += groupHeight + GROUP_VERTICAL_SPACING;
  });

  return nodes;
}

export function getDatabaseDomains() {
  return parseSchemaMarkdown(schemaMarkdown);
}

export function getTablesByDomain() {
  const domains = parseSchemaMarkdown(schemaMarkdown);
  const tablesByDomain: Record<string, any[]> = {};
  
  domains.forEach(domain => {
    tablesByDomain[domain.name] = domain.tables;
  });
  
  return tablesByDomain;
}
