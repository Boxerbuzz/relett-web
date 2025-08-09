# Relett - Real Estate Tokenization Platform

A comprehensive blockchain-based platform for tokenizing real estate properties on the Hedera network, enabling fractional ownership and transparent property investment management.

## 🏠 Platform Overview

Relett revolutionizes real estate investment by enabling property owners to tokenize their assets and investors to purchase fractional ownership through blockchain technology. The platform integrates with Hedera's distributed ledger technology for secure, transparent, and efficient property tokenization.

## ✨ Key Features

### 🔐 User Authentication & Verification

- **Multi-role Authentication**: Landowners, Investors, Agents, Verifiers, and Admins
- **KYC/Identity Verification**: Secure identity validation process
- **Document Verification**: Upload and verification of legal documents
- **Role-based Access Control**: Different permissions for different user types

### 🏡 Property Management

- **Property Registration**: Register properties with detailed information
- **Document Management**: Upload property documents, title deeds, legal papers
- **Property Verification**: Multi-step verification process by certified verifiers
- **Google Maps Integration**: Visual property location mapping
- **Property Analytics**: AI-powered property valuation and market analysis

### 🏠 Property Operations & Activities

#### **Rental Management**

- **Rental Applications**: Complete rental application processing with document collection
- **Active Rentals**: Manage ongoing rental agreements with payment tracking
- **Rental Payments**: Automated payment scheduling with late fee calculations
- **Tenant Relations**: Full tenant management and communication system
- **Lease Management**: Comprehensive lease agreement handling and renewal tracking

#### **Reservation System**

- **Property Viewings**: Schedule property tours and viewings with agent coordination
- **Booking Management**: Complete reservation workflow with agent assignment
- **Payment Integration**: Secure payment processing for reservations and deposits
- **Cancellation Handling**: Comprehensive cancellation policies and refund processing
- **Guest Management**: Track guest information and special requirements

#### **Inspection System**

- **Physical/Virtual Inspections**: Support for both in-person and virtual property inspections
- **Scheduling**: Flexible inspection scheduling with agent coordination
- **Status Tracking**: Real-time inspection status updates and notifications
- **Reporting**: Detailed inspection reports with blockchain verification
- **Follow-up Actions**: Automated follow-up for inspection recommendations

### 🔗 HCS (Hedera Consensus Service) Integration

The platform uses HCS for immutable audit trails of all property activities:

#### **HCS Topic Architecture**

- **Per-Property Topics**: Each property gets its own HCS topic for audit trail
- **Event Recording**: All property activities are recorded as immutable messages
- **Consensus Timestamps**: Every event gets a Hedera consensus timestamp
- **Sequence Numbers**: Ordered event tracking with sequence numbers

#### **Tracked Activities**

- **Property Registration**: Initial property verification and blockchain registration
- **Tokenization Events**: Token creation, distribution, and trading activities
- **Rental Operations**: Rental applications, payments, and management activities
- **Reservation Events**: Booking creation, modifications, and cancellations
- **Inspection Activities**: Inspection scheduling, completion, and reporting
- **Financial Transactions**: All payment and revenue distribution events

#### **HCS Implementation Details**

```typescript
// Example HCS event recording
const eventRecord = {
  eventType: "PROPERTY_REGISTRATION",
  propertyId: property.id,
  timestamp: new Date().toISOString(),
  data: {
    action: "property_verified_and_registered",
    hederaFileId: hederaFileId,
    metadata: propertyMetadata,
  },
};

// Submit to HCS topic
const messageSubmitTx = new TopicMessageSubmitTransaction()
  .setTopicId(TopicId.fromString(hcsTopicId))
  .setMessage(JSON.stringify(eventRecord))
  .setMaxTransactionFee(new Hbar(2));
```

### 🏗️ Smart Contract Architecture

The platform uses both Solidity contracts and Hedera native services:

#### **Solidity Contracts (Ethereum-style)**

- **PropertyRegistry.sol**: Central property registry with verification
- **PropertyToken.sol**: ERC20 tokens for fractional ownership
- **PropertyMarketplace.sol**: Trading platform for token exchanges
- **RevenueDistributor.sol**: Automated profit distribution system

#### **Hedera Native Services**

- **HTS (Hedera Token Service)**: Native token creation and management
- **HCS (Hedera Consensus Service)**: Immutable audit trails
- **HFS (Hedera File Service)**: Document storage and verification
- **Account Management**: Hedera account operations and associations

#### **Hybrid Architecture**

```typescript
// Token creation using HTS
const tokenCreateTx = new TokenCreateTransaction()
  .setTokenName(tokenData.token_name)
  .setTokenSymbol(tokenData.token_symbol)
  .setDecimals(8)
  .setInitialSupply(0)
  .setTreasuryAccountId(treasuryAccountId);

// Audit trail using HCS
const messageSubmitTx = new TopicMessageSubmitTransaction()
  .setTopicId(TopicId.fromString(hcsTopicId))
  .setMessage(JSON.stringify(auditEvent));
```

### 📊 Activity Tracking & Analytics

#### **Real-time Activity Monitoring**

- **Agent Activity Calendar**: Comprehensive calendar view of all agent activities
- **Inspection Tracking**: Real-time inspection status and scheduling
- **Rental Management**: Active rental monitoring and payment tracking
- **Reservation Analytics**: Booking patterns and occupancy rates

#### **HCS Audit Trail Integration**

- **Event Types**: 20+ different event types tracked on HCS
- **Consensus Verification**: All events verified by Hedera consensus
- **Immutable Records**: Tamper-proof audit trail for compliance
- **Real-time Updates**: Live activity feeds with blockchain verification

### 🔄 Complete Activity Flow

#### **Rental Process**

1. **Application**: Tenant submits rental application
2. **HCS Recording**: Application event recorded on blockchain
3. **Verification**: Agent reviews and approves application
4. **Agreement**: Rental agreement created and signed
5. **Payment Setup**: Automated payment scheduling
6. **Ongoing Management**: Monthly payments and maintenance tracking

#### **Reservation Process**

1. **Booking Request**: User requests property reservation
2. **HCS Event**: Reservation event recorded on HCS
3. **Payment Processing**: Secure payment handling
4. **Confirmation**: Booking confirmed with blockchain verification
5. **Stay Management**: Check-in/check-out tracking
6. **Post-Stay**: Review and feedback collection

#### **Inspection Process**

1. **Request**: User requests property inspection
2. **HCS Recording**: Inspection request recorded on blockchain
3. **Scheduling**: Agent schedules inspection
4. **Conducting**: Physical or virtual inspection
5. **Reporting**: Inspection report with blockchain verification
6. **Follow-up**: Action items and recommendations

### 🪙 Tokenization Process

- **Token Creation**: Convert properties into fungible tokens on Hedera network
- **Approval Workflow**: Admin approval system for tokenization requests
- **Legal Framework**: Compliant tokenization with proper legal structure
- **Revenue Distribution**: Automated revenue sharing among token holders
- **Token Trading**: Secondary market for token exchanges

### 💰 Investment Features

- **Token Purchase**: Buy fractional ownership through tokens
- **Portfolio Management**: Track investments and returns
- **Investment Analytics**: Detailed performance metrics and reports
- **Governance Voting**: Token holders can vote on property decisions
- **Revenue Sharing**: Automatic distribution of rental income and profits

### 🔗 Blockchain Integration

- **Hedera Network**: Built on Hedera's enterprise-grade blockchain
- **HCS Topics**: Immutable audit trails using Hedera Consensus Service
- **HTS Integration**: Native Hedera Token Service for token operations
- **HFS Storage**: Hedera File Service for document storage
- **Wallet Integration**: WalletConnect for secure wallet connections
- **Hybrid Architecture**: Combines Solidity contracts with Hedera native services

### 🏪 Marketplace

- **Token Trading**: Buy and sell property tokens
- **Listing Management**: Create and manage token listings
- **Escrow Services**: Secure transaction handling
- **Auction System**: Property auction functionality
- **Price Discovery**: Market-driven token pricing

### 📊 Analytics & Reporting

- **Investment Tracking**: Real-time portfolio performance
- **Property Analytics**: AI-powered insights and valuations
- **Financial Reports**: Comprehensive investment reports
- **Market Trends**: Property market analysis and trends
- **ROI Calculations**: Return on investment tracking
- **Activity Monitoring**: Real-time tracking of all property activities
- **HCS Audit Trails**: Blockchain-verified activity logs
- **Agent Performance**: Agent activity and productivity analytics

### 💬 Communication

- **Investment Group Chats**: Token holders can communicate
- **Notifications**: Real-time updates on investments
- **AI Assistant**: PropertyBot for platform guidance
- **Support Integration**: Intercom and Tawk.to support

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- Hedera Testnet/Mainnet account
- Google Maps API key (optional)

### Environment Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd propertytoken
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Supabase**:
   - Create a Supabase project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Update the configuration or use the provided Supabase integration

4. **Configure Hedera Credentials**:
   Set up the following secrets in Supabase (Project Settings → Edge Functions → Secrets):

   ``` java
   HEDERA_ACCOUNT_ID=0.0.YOUR_ACCOUNT_ID
   HEDERA_PRIVATE_KEY=YOUR_PRIVATE_KEY_HERE
   ```

   For testnet accounts:
   - Visit [Hedera Portal](https://portal.hedera.com/)
   - Create a testnet account (free)
   - Generate account ID and private key

5. **Optional API Keys**:
   Configure these secrets for enhanced functionality:

   ``` java
   OPENAI_API_KEY=your_openai_key        # For AI features
   PAYSTACK_SECRET_KEY=your_paystack_key # For payments
   TWILIO_ACCOUNT_SID=your_twilio_sid    # For SMS
   TWILIO_AUTH_TOKEN=your_twilio_token   # For SMS
   INTERCOM_SECRET_KEY=your_intercom_key # For support
   ```

### Development

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Build for production**:

   ```bash
   npm run build
   ```

3. **Preview production build**:

   ```bash
   npm run preview
   ```

## 📋 Complete Tokenization Flow

### Phase 1: Property Registration

1. **Landowner Registration**: Create account and complete KYC verification
2. **Property Submission**: Upload property details, documents, and images
3. **Document Verification**: Verifiers review and approve property documents
4. **Property Approval**: Admin approves verified properties

### Phase 2: Tokenization Request

1. **Tokenization Form**: Owner fills tokenization parameters:
   - Token name and symbol
   - Total value and supply
   - Minimum investment amount
   - Expected ROI percentage
   - Revenue distribution frequency
   - Lock-up period

2. **Legal Framework Setup**: Configure legal structure and compliance
3. **Submission**: Request submitted with "pending_approval" status
4. **Admin Review**: Platform administrators review tokenization request

### Phase 3: Token Creation (Post-Approval)

1. **Hedera Token Creation**: HTS fungible token created on Hedera network
2. **HCS Topic Setup**: Audit trail topic created for property
3. **Investment Group**: Automatic investment group creation
4. **Sales Window**: Token becomes available for purchase

### Phase 4: Investment Process

1. **Investor Onboarding**: Investors complete KYC and wallet setup
2. **Token Association**: Hedera account associated with property token
3. **Token Purchase**: Investors buy tokens with fiat or crypto
4. **Holding Records**: Token ownership recorded on-chain and database
5. **Portfolio Tracking**: Investment performance tracking begins

### Phase 5: Property Management

1. **Governance Voting**: Token holders vote on property decisions
2. **Revenue Distribution**: Rental income and profits distributed
3. **Token Trading**: Secondary market trading enabled
4. **Performance Analytics**: Ongoing performance monitoring

## 🏗️ Technical Architecture

### Frontend Stack

- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Radix UI** components
- **React Query** for state management
- **React Router** for navigation

### Backend Infrastructure

- **Supabase** for database and authentication
- **Edge Functions** for serverless logic
- **PostgreSQL** with Row Level Security
- **Real-time subscriptions**

### Blockchain Integration

- **Hedera SDK** for network operations
- **WalletConnect** for wallet integration
- **HTS** for token operations
- **HCS** for audit trails

### Smart Contracts & Hedera Services

#### **Solidity Contracts** (Located in `/contracts` directory)

- **PropertyRegistry.sol**: Central property registry with verification
- **PropertyToken.sol**: ERC20 tokens for fractional ownership
- **PropertyMarketplace.sol**: Trading platform for token exchanges
- **RevenueDistributor.sol**: Automated profit distribution system

#### **Hedera Native Services**

- **HTS (Hedera Token Service)**: Native token creation and management
- **HCS (Hedera Consensus Service)**: Immutable audit trails for all activities
- **HFS (Hedera File Service)**: Document storage and verification
- **Account Management**: Hedera account operations and associations

## 🔧 Configuration Guide

### Database Setup

The platform uses Supabase with pre-configured tables and functions. Key tables include:

#### **Core Property Tables**

- `properties`: Property information and details
- `tokenized_properties`: Tokenization records
- `token_holdings`: Investor holdings
- `revenue_distributions`: Revenue sharing
- `governance_proposals`: Voting systems

#### **Property Operations Tables**

- `rentals`: Active rental agreements and management
- `rental_applications`: Rental application processing
- `rental_payments`: Payment tracking and scheduling
- `reservations`: Property booking and reservation system
- `inspections`: Property inspection scheduling and tracking

#### **Audit & Security Tables**

- `audit_events`: Blockchain audit events with HCS integration
- `audit_trails`: System audit logging
- `hcs_topics`: HCS topic management for properties
- `identity_audit_logs`: Identity verification audit trails

### Edge Functions

The platform includes 50+ edge functions for various operations:

#### **Hedera Integration Functions**

- `create-hcs-topic-and-token`: Token creation with HCS audit trail
- `record-hcs-event`: Record events on HCS topics
- `register-property-blockchain`: Property blockchain registration
- `transfer-hedera-tokens`: Token transfer operations
- `distribute-hedera-revenue`: Revenue distribution

#### **Property Operations Functions**

- `send-inspection-notification`: Inspection notifications
- `send-rental-notification`: Rental activity notifications
- `send-booking-notification`: Reservation notifications
- `process-notification`: Notification processing

#### **Payment & Financial Functions**

- `create-payment-session`: Payment session creation
- `verify-payment`: Payment verification
- `create-payment-intent`: Payment intent handling

### Hedera Configuration

1. **Network Selection**: Configure for testnet or mainnet in `src/lib/config.ts`
2. **Account Setup**: Treasury account for token operations
3. **Contract Deployment**: Deploy smart contracts using provided scripts

### Payment Integration

- **Paystack**: For fiat payments (Nigerian market)
- **Cryptocurrency**: Direct token payments
- **Escrow**: Secure transaction handling

## 📚 User Guides

### For Landowners

1. Complete identity verification
2. Register properties with all required documents
3. Wait for verification approval
4. Submit tokenization request with investment terms
5. Monitor token sales and manage property

### For Investors

1. Complete KYC verification
2. Connect Hedera wallet (HashPack, Blade, etc.)
3. Browse available tokenized properties
4. Purchase tokens meeting minimum investment
5. Track portfolio performance and receive distributions

### For Verifiers

1. Review property documents and legal papers
2. Conduct verification checks
3. Approve or reject properties with detailed reasoning
4. Monitor verification queue and assignments

### For Administrators

1. Manage user roles and permissions
2. Review and approve tokenization requests
3. Monitor platform analytics and performance
4. Handle disputes and governance issues

## 🔒 Security Features

- **Row Level Security**: Database-level access control
- **JWT Authentication**: Secure user sessions
- **Rate Limiting**: API protection
- **Audit Trails**: Complete action logging
- **Multi-signature**: Enhanced security for critical operations
- **KYC/AML**: Compliance with regulations

## 🧪 Testing

### Unit Tests

```bash
npm run test
```

### Smart Contract Testing

```bash
cd contracts
npm test
```

### E2E Testing

```bash
npm run test:e2e
```

## 📦 Deployment

### Supabase Deployment

Edge functions deploy automatically with code changes. Manual deployment:

```bash
supabase functions deploy
```

### Contract Deployment

```bash
cd contracts
npm run deploy          # Testnet
npm run deploy:mainnet  # Mainnet
```

### Frontend Deployment

The app can be deployed to any static hosting service:

- Vercel
- Netlify
- AWS S3 + CloudFront
- Azure Static Web Apps

## 🐛 Troubleshooting

### Common Issues

1. **Wallet Connection Failed**:
   - Ensure WalletConnect is properly configured
   - Check network connectivity
   - Verify wallet app is installed and updated

2. **Token Creation Failed**:
   - Verify Hedera credentials are correct
   - Check account balance for transaction fees
   - Ensure all required permissions are granted

3. **Payment Issues**:
   - Verify Paystack configuration
   - Check API keys and webhook setup
   - Ensure proper currency conversion

### Debug Mode

Enable debug logging:

```bash
VITE_DEBUG=true npm run dev
```

## 🤝 Support

- **Documentation**: Comprehensive guides available in-app
- **Community**: Join our Discord/Telegram community
- **Support**: In-app chat support via Intercom
- **Issues**: GitHub issues for bug reports

## 📄 Legal Compliance

The platform includes:

- Terms of Service integration
- Privacy Policy compliance
- KYC/AML procedures
- Regulatory reporting tools
- Legal document templates

## 🌍 Supported Markets

- **Primary**: Nigeria (NGN currency)
- **Expanding**: Multi-currency support planned
- **Global**: Blockchain infrastructure supports worldwide usage

---

**⚠️ Important Notes:**

- This is a complex financial platform involving real estate and cryptocurrency
- Ensure compliance with local regulations before deployment
- Conduct thorough security audits before handling real funds
- Test extensively on Hedera testnet before mainnet deployment

For detailed technical documentation, refer to the `/docs` directory and inline code comments.
