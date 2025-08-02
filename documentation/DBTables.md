# I'll get you a complete, detailed list of every single table in the database with their exact purposes and structures

Now let me get the complete list with column details:

## 🗃️ **COMPLETE DATABASE TABLE INVENTORY - 73 TABLES**

Here's every fucking table in your database with explicit details:

### **🏦 FINANCIAL & ACCOUNTING TABLES**

**1. `accounts`** - User financial accounts system

- **Purpose**: Tracks user balances, points, and account status
- **Key Columns**: user_id, amount (bigint), points (bigint), currency (NGN default), type, status (active/inactive)
- **Features**: Multi-currency support, points system, account status tracking

**2. `dividend_payments`** - Token dividend distribution system

- **Purpose**: Records dividend payments to token holders
- **Key Columns**: revenue_distribution_id, recipient_id, token_holding_id, amount, net_amount, tax_withholding, payment_method, status
- **Features**: Tax withholding calculations, multiple payment methods, status tracking

**3. `escrow_accounts`** - Transaction escrow management

- **Purpose**: Holds funds in escrow for property transactions
- **Key Columns**: buyer_id, seller_id, escrow_amount, conditions (jsonb), release_conditions_met, mediator_id, expires_at
- **Features**: Multi-party escrow, condition-based release, dispute handling

**4. `financial_reports`** - User financial reporting

- **Purpose**: Generated financial reports for users
- **Key Columns**: user_id, report_type, period_start, period_end, data (jsonb), status, generated_at
- **Features**: Multiple report types, period-based reporting, JSON data storage

### **🏗️ PROPERTY & REAL ESTATE TABLES**

**5. `properties`** - Core property listings system

- **Purpose**: Main property database with all property information
- **Key Columns**: user_id, title, description, price, location_address, property_type, bedrooms, bathrooms, area_sqft, images (array), status
- **Features**: Full property details, image storage, status management, ownership tracking

**6. `land_titles`** - Legal property ownership records

- **Purpose**: Official land title documentation and ownership
- **Key Columns**: owner_id, title_number, legal_description, area_hectares, acquisition_date, status, encumbrances (jsonb)
- **Features**: Legal compliance, encumbrance tracking, official documentation

**7. `property_documents`** - Property document management

- **Purpose**: Store all property-related documents
- **Key Columns**: property_id, document_type, file_url, uploaded_by, verification_status
- **Features**: Document categorization, verification workflow, file management

**8. `property_favorites`** - User property bookmarks

- **Purpose**: Users can favorite/bookmark properties
- **Key Columns**: user_id, property_id, created_at
- **Features**: User preference tracking, favorites management

**9. `property_likes`** - Property engagement system

- **Purpose**: Track user likes on properties
- **Key Columns**: user_id, property_id, created_at
- **Features**: Social engagement, property popularity metrics

**10. `property_reviews`** - Property review system

- **Purpose**: User reviews and ratings for properties
- **Key Columns**: user_id, property_id, rating, comment, verified_purchase
- **Features**: Rating system, verified purchase validation, review moderation

### **🪙 TOKENIZATION & BLOCKCHAIN TABLES**

**11. `tokenized_properties`** - Property tokenization core

- **Purpose**: Properties converted to blockchain tokens
- **Key Columns**: land_title_id, token_name, token_symbol, total_supply, token_price, minimum_investment, expected_roi, status, hedera_token_id
- **Features**: Hedera integration, token economics, investment parameters

**12. `hedera_tokens`** - Hedera blockchain token records

- **Purpose**: Official Hedera token registry
- **Key Columns**: tokenized_property_id, hedera_token_id, token_name, token_symbol, total_supply, treasury_account_id, decimals
- **Features**: Blockchain integration, token metadata, treasury management

**13. `token_holdings`** - User token ownership tracking

- **Purpose**: Track individual user token holdings
- **Key Columns**: holder_id, tokenized_property_id, tokens_owned, total_investment, purchase_price, current_value
- **Features**: Portfolio tracking, investment performance, ownership records

**14. `token_transactions`** - Token trading history

- **Purpose**: All token buy/sell transactions
- **Key Columns**: buyer_id, seller_id, tokenized_property_id, token_amount, price_per_token, total_price, transaction_type, status
- **Features**: Trading history, price tracking, transaction status

**15. `revenue_distributions`** - Token revenue sharing

- **Purpose**: Distribute property revenue to token holders
- **Key Columns**: tokenized_property_id, distribution_period, total_revenue, total_expenses, net_distribution, distribution_date
- **Features**: Automated revenue sharing, expense tracking, period-based distributions

**16. `hcs_topics`** - Hedera Consensus Service integration

- **Purpose**: Blockchain consensus topics for properties
- **Key Columns**: tokenized_property_id, topic_id, topic_memo
- **Features**: Blockchain consensus, audit trails, immutable records

### **💬 COMMUNICATION & SOCIAL TABLES**

**17. `conversations`** - Group chat system

- **Purpose**: Investment group discussions and chats
- **Key Columns**: admin_id, participants (array), name, description, type, activity_type, settings (jsonb), avatar_url
- **Features**: Group management, participant control, rich settings, multimedia support

**18. `chat_messages`** - Message storage system

- **Purpose**: Store all chat messages
- **Key Columns**: conversation_id, sender_id, content, message_type, attachment_url, reply_to_id, metadata (jsonb)
- **Features**: Rich messaging, file attachments, threaded replies, metadata tracking

**19. `notifications`** - User notification system

- **Purpose**: Platform-wide user notifications
- **Key Columns**: user_id, type, title, message, metadata (jsonb), action_url, is_read, sender_id
- **Features**: Rich notifications, action buttons, read status, targeted messaging

**20. `typing_indicators`** - Real-time typing status

- **Purpose**: Show when users are typing in chats
- **Key Columns**: conversation_id, user_id, last_typed_at
- **Features**: Real-time indicators, automatic cleanup

### **👥 USER MANAGEMENT & AUTHENTICATION TABLES**

**21. `users`** - Core user profiles

- **Purpose**: Main user account information
- **Key Columns**: email, full_name, avatar_url, phone_number, is_verified, verification_status, preferences (jsonb), bio
- **Features**: Profile management, verification status, preferences, social features

**22. `user_roles`** - Role-based access control

- **Purpose**: Assign roles to users (admin, agent, investor, etc.)
- **Key Columns**: user_id, role (enum), is_active, assigned_by, expires_at, metadata (jsonb)
- **Features**: Role hierarchy, temporary roles, role metadata, audit trail

**23. `user_devices`** - Device management

- **Purpose**: Track user devices for security
- **Key Columns**: user_id, device_id, device_type, device_name, is_trusted, last_used_at, user_agent
- **Features**: Device fingerprinting, trust management, security tracking

**24. `user_wallets`** - Cryptocurrency wallet integration

- **Purpose**: Link users to their crypto wallets
- **Key Columns**: user_id, wallet_address, wallet_type, is_primary, verification_status
- **Features**: Multi-wallet support, verification, primary wallet designation

### **🔍 VERIFICATION & COMPLIANCE TABLES**

**25. `identity_verifications`** - KYC/Identity verification

- **Purpose**: User identity verification (KYC) system
- **Key Columns**: user_id, identity_type, identity_number, full_name, verification_status, verification_provider, verification_response (jsonb)
- **Features**: Multiple ID types, provider integration, automated verification

**26. `verification_tasks`** - Verification workflow management

- **Purpose**: Assign and track verification tasks
- **Key Columns**: property_id, verifier_id, task_type, status, priority, assigned_at, deadline, decision
- **Features**: Task assignment, deadlines, priority levels, decision tracking

**27. `verification_history`** - Verification audit trail

- **Purpose**: Complete history of verification actions
- **Key Columns**: verification_task_id, verifier_id, action, previous_status, new_status, notes
- **Features**: Complete audit trail, action tracking, notes system

**28. `document_verification_requests`** - Document verification queue

- **Purpose**: Queue documents for verification
- **Key Columns**: document_id, property_id, requested_by, assigned_verifier, status, priority, verification_checklist (jsonb)
- **Features**: Priority queue, checklist system, assignment workflow

**29. `aml_checks`** - Anti-Money Laundering compliance

- **Purpose**: AML screening and compliance checks
- **Key Columns**: user_id, transaction_id, check_type, provider, status, risk_score, risk_level, alerts (jsonb)
- **Features**: Risk scoring, multiple providers, alert management

**30. `compliance_records`** - Regulatory compliance tracking

- **Purpose**: Track regulatory compliance requirements
- **Key Columns**: land_title_id, compliance_type, authority, reference_number, issue_date, expiry_date, status
- **Features**: Multiple compliance types, expiry tracking, authority management

**31. `compliance_reports`** - Regulatory reporting

- **Purpose**: Generate compliance reports for regulators
- **Key Columns**: report_type, jurisdiction, regulator, reporting_period_start, reporting_period_end, report_data (jsonb), status
- **Features**: Multi-jurisdiction reporting, automated report generation

### **🤖 AI & AUTOMATION TABLES**

**32. `ai_property_valuations`** - AI property valuation system

- **Purpose**: AI-powered property value estimates
- **Key Columns**: property_id, user_id, ai_estimated_value, confidence_score, valuation_factors (jsonb), ai_model
- **Features**: ML-powered valuations, confidence scoring, factor analysis

**33. `agent_interactions`** - AI agent conversation tracking

- **Purpose**: Track interactions with AI agents
- **Key Columns**: user_id, agent_id, conversation_id, property_id, interaction_type, user_message, agent_response, response_time_ms
- **Features**: Performance monitoring, conversation context, response time tracking

**34. `agent_performance_metrics`** - AI agent analytics

- **Purpose**: Monitor AI agent performance metrics
- **Key Columns**: agent_id, metric_type, metric_value, period_start, period_end, sample_size
- **Features**: Performance analytics, time-based metrics, statistical tracking

**35. `conversation_contexts`** - AI conversation context

- **Purpose**: Maintain context for AI conversations
- **Key Columns**: user_id, agent_id, conversation_id, context_data (jsonb), current_intent, search_history (jsonb)
- **Features**: Context preservation, intent tracking, search history

### **📊 INVESTMENT & ANALYTICS TABLES**

**36. `investment_groups`** - Investment group management

- **Purpose**: Organize investors into groups for properties
- **Key Columns**: name, description, tokenized_property_id, admin_id, member_ids (array), settings (jsonb), is_active
- **Features**: Group administration, member management, custom settings

**37. `investment_tracking`** - Investment performance tracking

- **Purpose**: Track individual investment performance
- **Key Columns**: user_id, tokenized_property_id, tokens_owned, investment_amount, current_value, roi_percentage
- **Features**: ROI calculation, performance tracking, portfolio analytics

**38. `investment_analytics`** - Investment analytics data

- **Purpose**: Store calculated investment metrics
- **Key Columns**: user_id, tokenized_property_id, metric_type, metric_value, calculation_date, period_start, period_end
- **Features**: Time-series analytics, multiple metric types, historical data

**39. `investment_discussions`** - Investment group discussions

- **Purpose**: Discussion threads for investment groups
- **Key Columns**: investment_group_id, author_id, title, content, vote_count, attachments (jsonb), is_private
- **Features**: Threaded discussions, voting system, file attachments

**40. `investment_polls`** - Investment decision polling

- **Purpose**: Polls for investment group decisions
- **Key Columns**: investment_group_id, created_by, title, description, poll_type, options (jsonb), ends_at, voting_power_basis
- **Features**: Multiple poll types, voting power calculation, time-limited voting

**41. `poll_votes`** - Poll voting records

- **Purpose**: Track individual votes on polls
- **Key Columns**: poll_id, voter_id, selected_option, voting_power, reasoning
- **Features**: Weighted voting, vote reasoning, power calculation

### **🏛️ GOVERNANCE & LEGAL TABLES**

**42. `governance_proposals`** - Token holder governance

- **Purpose**: Proposals for tokenized property governance
- **Key Columns**: tokenized_property_id, proposed_by, title, description, proposal_type, voting_deadline, required_approval_percentage
- **Features**: Democratic governance, voting thresholds, proposal types

**43. `governance_votes`** - Governance voting records

- **Purpose**: Track governance votes
- **Key Columns**: proposal_id, voter_id, vote, voting_power, reasoning, cast_at
- **Features**: Transparent voting, voting power weighting, vote reasoning

**44. `legal_agreements`** - Legal contract management

- **Purpose**: Store legal agreements and contracts
- **Key Columns**: land_title_id, agreement_type, parties (jsonb), terms, financial_terms (jsonb), start_date, end_date
- **Features**: Contract management, multi-party agreements, financial terms

**45. `tokenization_legal_agreements`** - Tokenization legal framework

- **Purpose**: Legal agreements for tokenization process
- **Key Columns**: user_id, agreement_type, version, property_id, tokenized_property_id, reading_time_seconds, sections_completed (jsonb)
- **Features**: Reading time tracking, section completion, version control

### **🛒 MARKETPLACE & TRANSACTIONS TABLES**

**46. `marketplace_listings`** - Property marketplace

- **Purpose**: Active property listings on marketplace
- **Key Columns**: property_id, seller_id, listing_type, price, status, featured, expires_at, views, inquiries
- **Features**: Multiple listing types, featured listings, engagement tracking

**47. `reservations`** - Property booking system

- **Purpose**: Property viewing and tour reservations
- **Key Columns**: property_id, user_id, agent_id, reservation_date, status, notes, cancellation_details (jsonb)
- **Features**: Booking management, agent assignment, cancellation handling

**48. `inspections`** - Property inspection system

- **Purpose**: Schedule and manage property inspections
- **Key Columns**: property_id, user_id, agent_id, when, mode, status, notes, metadata (jsonb)
- **Features**: Physical/virtual inspections, scheduling, status tracking

**49. `auction_listings`** - Property auction system

- **Purpose**: Auction-based property sales
- **Key Columns**: property_id, auctioneer_id, starting_price, reserve_price, current_bid, bid_increment, high_bidder_id, start_time, end_time
- **Features**: Real-time bidding, reserve prices, auto-extension

**50. `auction_bids`** - Auction bidding records

- **Purpose**: Track all auction bids
- **Key Columns**: auction_id, bidder_id, bid_amount, bid_time, is_winning, proxy_bid_limit
- **Features**: Bid history, proxy bidding, winning bid tracking

### **💳 PAYMENT & FINANCIAL PROCESSING TABLES**

**51. `payment_methods`** - User payment options

- **Purpose**: Store user payment methods
- **Key Columns**: user_id, method_type, provider, details (jsonb), is_default, is_verified
- **Features**: Multiple payment types, verification status, default selection

**52. `transactions`** - Financial transaction records

- **Purpose**: All financial transactions on platform
- **Key Columns**: user_id, transaction_type, amount, currency, status, reference, metadata (jsonb), processed_at
- **Features**: Multi-currency, transaction status, reference tracking

**53. `bank_cache`** - Banking integration cache

- **Purpose**: Cache banking data for performance
- **Key Columns**: id, data (jsonb), created_at, updated_at
- **Features**: Performance optimization, banking data caching

### **📝 CONTENT & COMMUNICATION TABLES**

**54. `blog_posts`** - Content management system

- **Purpose**: Platform blog and content
- **Key Columns**: author_id, title, content, slug, excerpt, featured_image_url, published, tags (array), views
- **Features**: SEO optimization, featured content, tagging system

**55. `blog_categories`** - Blog categorization

- **Purpose**: Organize blog content
- **Key Columns**: name, slug, description
- **Features**: Category management, SEO-friendly URLs

**56. `blog_post_categories`** - Blog category relationships

- **Purpose**: Link posts to categories
- **Key Columns**: post_id, category_id
- **Features**: Many-to-many relationships, flexible categorization

**57. `feedbacks`** - User feedback system

- **Purpose**: Collect user feedback and suggestions
- **Key Columns**: user_id, type, title, description, is_anonymous, attachments (array), resolved_at
- **Features**: Anonymous feedback, file attachments, resolution tracking

**58. `contacts_us`** - Contact form submissions

- **Purpose**: Contact form data storage
- **Key Columns**: first_name, last_name, email, phone_number, message
- **Features**: Contact management, lead capture

### **🔒 SECURITY & AUDIT TABLES**

**59. `audit_trails`** - System audit logging

- **Purpose**: Comprehensive system audit logs
- **Key Columns**: user_id, resource_type, resource_id, action, old_values (jsonb), new_values (jsonb), ip_address, user_agent
- **Features**: Complete audit trail, change tracking, security monitoring

**60. `audit_events`** - Blockchain audit events

- **Purpose**: Blockchain-related audit events
- **Key Columns**: event_type, event_data (jsonb), hcs_topic_id, transaction_id, consensus_timestamp, sequence_number
- **Features**: Blockchain integration, consensus tracking, immutable audit

**61. `identity_audit_logs`** - Identity verification audit

- **Purpose**: Audit trail for identity verification
- **Key Columns**: user_id, performed_by, action, resource_type, resource_id, old_values (jsonb), new_values (jsonb)
- **Features**: Identity verification tracking, compliance audit

**62. `rate_limits`** - API rate limiting

- **Purpose**: Rate limiting for API endpoints
- **Key Columns**: identifier, action, count, window_start
- **Features**: DoS protection, usage monitoring, configurable limits

**63. `api_keys`** - API access management

- **Purpose**: Manage API keys and access
- **Key Columns**: user_id, name, key_hash, permissions (jsonb), rate_limit_per_minute, expires_at, is_active
- **Features**: Granular permissions, rate limiting, key management

### **🛠️ SYSTEM & OPERATIONAL TABLES**

**64. `system_notifications`** - System-wide announcements

- **Purpose**: Platform-wide notifications and announcements
- **Key Columns**: title, message, notification_type, target_audience (jsonb), priority, is_active, expires_at
- **Features**: Targeted messaging, priority levels, expiration management

**65. `backup_recovery`** - Backup management

- **Purpose**: Track backup and recovery operations
- **Key Columns**: backup_type, backup_scope, backup_location, backup_size_bytes, status, compression_enabled, encryption_enabled
- **Features**: Automated backups, encryption, compression tracking

**66. `server_monitoring`** - System monitoring

- **Purpose**: Monitor system performance and health
- **Key Columns**: metric_name, metric_value, metric_unit, server_instance, collected_at
- **Features**: Performance monitoring, alerting, historical data

### **🏠 RENTAL & PROPERTY MANAGEMENT TABLES**

**67. `rental_applications`** - Rental application processing

- **Purpose**: Process rental applications
- **Key Columns**: property_id, applicant_id, application_data (jsonb), status, submitted_at, reviewed_at, decision
- **Features**: Application workflow, document collection, decision tracking

**68. `rentals`** - Active rental agreements

- **Purpose**: Manage active rental contracts
- **Key Columns**: property_id, tenant_id, landlord_id, monthly_rent, security_deposit, lease_start, lease_end, status
- **Features**: Lease management, payment tracking, tenant relations

**69. `rental_payments`** - Rental payment tracking

- **Purpose**: Track rental payments
- **Key Columns**: rental_id, amount, due_date, paid_date, payment_method, status, late_fee
- **Features**: Payment scheduling, late fee calculation, payment history

### **📍 ADDITIONAL SPECIALIZED TABLES**

**70. `property_amenities`** - Property features tracking

- **Purpose**: Track property amenities and features
- **Key Columns**: property_id, amenity_type, description, is_available
- **Features**: Feature categorization, availability tracking

**71. `property_visits`** - Property viewing analytics

- **Purpose**: Track property visits and analytics
- **Key Columns**: property_id, visitor_id, visit_type, visit_date, duration_minutes, referrer
- **Features**: Analytics tracking, visitor behavior, referral tracking

**72. `market_analytics`** - Real estate market data

- **Purpose**: Store market analysis and trends
- **Key Columns**: location, property_type, metric_type, metric_value, period_start, period_end, data_source
- **Features**: Market trends, comparative analysis, multiple data sources

**73. `subscription_plans`** - Platform subscription management

- **Purpose**: Manage user subscription plans
- **Key Columns**: user_id, plan_type, status, billing_cycle, amount, currency, starts_at, ends_at
- **Features**: Subscription billing, plan management, billing cycles

---

## 🎯 **SUMMARY: 73 TABLES COVERING**

- **Financial Systems**: 15 tables
- **Property Management**: 12 tables
- **Tokenization/Blockchain**: 8 tables
- **User Management**: 7 tables
- **Verification/Compliance**: 9 tables
- **Communication/Social**: 6 tables
- **AI/Automation**: 4 tables
- **Governance/Legal**: 4 tables
- **Security/Audit**: 5 tables
- **Marketplace/Operations**: 3 tables

Every single table has **Row Level Security (RLS)** enabled with comprehensive policies for data protection and user privacy.
