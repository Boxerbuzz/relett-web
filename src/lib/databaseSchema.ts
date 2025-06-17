
import { Node } from '@xyflow/react';

const schemaMarkdown = `
#### 🏠 Property Management Core
properties - Main property listings with details, pricing, location
property_images - Property photos and media
property_documents - Legal documents, certificates, deeds
property_valuations - AI and professional property valuations
property_creation_workflows - Multi-step property creation process tracking
property_favorites - User saved/bookmarked properties
property_likes - Property likes/hearts from users
property_views - Property view tracking and analytics
property_reviews - User reviews and ratings for properties
property_inquiries - Contact requests and inquiries for properties

#### 🏛️ Land Registry & Legal
land_titles - Official land ownership records
legal_agreements - Contracts, leases, sale agreements
compliance_records - Tax, permits, regulatory compliance
compliance_reports - Regulatory reporting for authorities
document_verification_requests - Document review queue for verifiers

#### 🪙 Tokenization & Investment
tokenized_properties - Properties converted to digital tokens
token_holdings - Individual investor token ownership
token_transactions - Token buying/selling/transfer records
revenue_distributions - Dividend payments to token holders
dividend_payments - Individual payment records
investment_tracking - Portfolio performance tracking
investment_groups - Collaborative investment pools
investment_discussions - Group chat for investors
investment_analytics - Performance metrics and insights
auction_listings - Property auctions and bidding

#### 👤 User Management & Authentication
users - Core user profiles and basic info
user_roles - Role assignments (admin, agent, investor, etc.)
user_profiles - Extended user profile information
user_devices - Device registration for security and notifications
user_preferences - User settings and preferences
identity_verifications - KYC identity verification
kyc_documents - Identity documents for verification
verifier_credentials - Professional verifier licenses
sanctions_screening - Government sanctions checking

#### 💰 Financial & Payment Systems
accounts - User wallet balances and points
payments - Transaction records
payment_methods - Saved payment cards/methods
payment_sessions - Active payment processing sessions
escrow_accounts - Secure transaction holding accounts
withdrawal_requests - Cash-out requests from users
transaction_fees - Fee calculations and records
wallets - Cryptocurrency wallet connections
financial_reports - User investment reports

#### 🔐 Security & Compliance
aml_checks - Anti-money laundering screening
audit_trails - Complete activity logging
identity_audit_logs - Identity verification audit trail
backup_recovery - System backup management
api_keys - API access management

#### 💬 Communication & Chat
conversations - Chat rooms and groups
messages - Individual chat messages
message_attachments - File sharing in chats
message_reactions - Emoji reactions on messages
typing_indicators - Real-time typing status

#### 🔔 Notifications & Alerts
notifications - All user notifications
notification_preferences - User notification settings
notification_deliveries - Delivery status tracking
notification_templates - Pre-defined message templates
system_notifications - Platform-wide announcements

#### 🎯 User Interaction & Engagement
saved_searches - Saved search criteria
portfolio_allocations - Investment diversification targets

#### 🏢 Business Operations
inspections - Property inspection scheduling
rentals - Rental agreements and management
reservations - Property viewing appointments
feedbacks - User feedback and support
contacts_us - Contact form submissions

#### 📈 Analytics & Reporting
market_analytics - Market trends and insights
learning_patterns - AI learning and pattern recognition
agent_interactions - AI agent conversation tracking
agent_performance_metrics - Agent effectiveness metrics
conversation_contexts - AI conversation state management

#### 🌳 Environmental & Sustainability
tree_donations - Environmental contribution tracking

#### 🤖 AI & Machine Learning
ai_property_valuations - AI-generated property valuations

#### 🗳️ Investment Polling System
investment_polls - Investment group voting polls
poll_options - Available voting choices
poll_votes - Individual vote records

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
  const NODE_WIDTH = 180;
  const NODE_HEIGHT = 40;
  const NODES_PER_ROW = 4;
  const GROUP_VERTICAL_SPACING = 100;
  
  let currentY = BORDER_PADDING;

  domains.forEach((domain, index) => {
    const tableCount = domain.tables.length;
    const numRows = Math.ceil(tableCount / NODES_PER_ROW);
    const groupWidth = (NODE_WIDTH + GROUP_PADDING) * Math.min(tableCount, NODES_PER_ROW) + GROUP_PADDING;
    const groupHeight = numRows * (NODE_HEIGHT + GROUP_PADDING) + GROUP_PADDING;

    const groupId = `group-${domain.name.replace(/\s+/g, '-')}`;
    nodes.push({
      id: groupId,
      type: 'domain',
      position: { x: BORDER_PADDING, y: currentY },
      data: { label: domain.name },
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
          y: row * (NODE_HEIGHT + GROUP_PADDING) + GROUP_PADDING * 2,
        },
        data: { label: table.name, description: table.description },
        parentId: groupId,
        extent: 'parent',
      });
    });

    currentY += groupHeight + GROUP_VERTICAL_SPACING;
  });

  return nodes;
}
