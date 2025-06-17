import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BookOpen, Database, GitBranch, Search, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const databaseTables = {
  // Core User Management
  users: {
    description: "Core user profiles and authentication data",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'email', type: 'text', nullable: false },
      { name: 'first_name', type: 'text', nullable: false },
      { name: 'last_name', type: 'text', nullable: false },
      { name: 'full_name', type: 'text', nullable: true },
      { name: 'phone', type: 'text', nullable: true },
      { name: 'avatar', type: 'text', nullable: true },
      { name: 'bio', type: 'text', nullable: true },
      { name: 'user_type', type: 'text', nullable: false, default: 'landowner' },
      { name: 'verification_status', type: 'verification_status', nullable: true },
      { name: 'is_active', type: 'boolean', nullable: true, default: true },
      { name: 'is_verified', type: 'boolean', nullable: true, default: false },
      { name: 'has_setup', type: 'boolean', nullable: true, default: false },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: true }
    ],
    relationships: []
  },
  
  user_roles: {
    description: "Role assignments for users",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'role', type: 'app_role', nullable: false },
      { name: 'is_active', type: 'boolean', nullable: true, default: true },
      { name: 'expires_at', type: 'timestamp with time zone', nullable: true },
      { name: 'assigned_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'assigned_by', type: 'uuid', nullable: true },
      { name: 'metadata', type: 'jsonb', nullable: true }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  user_profiles: {
    description: "Extended user profile information",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'middle_name', type: 'text', nullable: true },
      { name: 'date_of_birth', type: 'text', nullable: true },
      { name: 'gender', type: 'text', nullable: true },
      { name: 'address', type: 'jsonb', nullable: true },
      { name: 'nationality', type: 'text', nullable: true },
      { name: 'state_of_origin', type: 'text', nullable: true },
      { name: 'lga', type: 'text', nullable: true },
      { name: 'last_login', type: 'text', nullable: true }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'one-to-one' }
    ]
  },

  user_preferences: {
    description: "User settings and preferences",
    fields: [
      { name: 'user_id', type: 'uuid', nullable: false, primary: true, foreignKey: 'users.id' },
      { name: 'has_setup_preference', type: 'boolean', nullable: true, default: false },
      { name: 'enabled', type: 'boolean', nullable: true, default: true },
      { name: 'notification_channels', type: 'jsonb', nullable: true },
      { name: 'notification_types', type: 'jsonb', nullable: true },
      { name: 'digest', type: 'jsonb', nullable: true },
      { name: 'do_not_disturb', type: 'boolean', nullable: true, default: false },
      { name: 'quiet_hours_start', type: 'text', nullable: true },
      { name: 'quiet_hours_end', type: 'text', nullable: true },
      { name: 'interest', type: 'text', nullable: true },
      { name: 'address', type: 'text', nullable: true },
      { name: 'city', type: 'text', nullable: true },
      { name: 'state', type: 'text', nullable: true },
      { name: 'country', type: 'text', nullable: true },
      { name: 'coordinates', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: true }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'one-to-one' }
    ]
  },

  user_devices: {
    description: "Device registration for security and notifications",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'device_fingerprint', type: 'text', nullable: false },
      { name: 'device_name', type: 'text', nullable: true },
      { name: 'device_type', type: 'text', nullable: true },
      { name: 'browser', type: 'text', nullable: true },
      { name: 'ip_address', type: 'inet', nullable: true },
      { name: 'location', type: 'jsonb', nullable: true },
      { name: 'is_trusted', type: 'boolean', nullable: true, default: false },
      { name: 'last_used', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  // Property Management Core
  properties: {
    description: "Main property listings with details, pricing, location",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'title', type: 'text', nullable: true },
      { name: 'description', type: 'text', nullable: true },
      { name: 'category', type: 'text', nullable: false },
      { name: 'type', type: 'text', nullable: false },
      { name: 'status', type: 'text', nullable: false },
      { name: 'price', type: 'jsonb', nullable: false },
      { name: 'location', type: 'jsonb', nullable: false },
      { name: 'specification', type: 'jsonb', nullable: false },
      { name: 'amenities', type: 'text[]', nullable: true },
      { name: 'features', type: 'text[]', nullable: true },
      { name: 'condition', type: 'text', nullable: true },
      { name: 'year_built', type: 'text', nullable: true },
      { name: 'sqrft', type: 'text', nullable: true },
      { name: 'garages', type: 'integer', nullable: true },
      { name: 'max_guest', type: 'integer', nullable: true },
      { name: 'backdrop', type: 'text', nullable: true },
      { name: 'documents', type: 'jsonb', nullable: true },
      { name: 'tags', type: 'text[]', nullable: true },
      { name: 'views', type: 'integer', nullable: true, default: 0 },
      { name: 'likes', type: 'integer', nullable: true, default: 0 },
      { name: 'favorites', type: 'integer', nullable: true, default: 0 },
      { name: 'ratings', type: 'integer', nullable: true, default: 0 },
      { name: 'review_count', type: 'integer', nullable: true, default: 0 },
      { name: 'is_featured', type: 'boolean', nullable: true, default: false },
      { name: 'is_verified', type: 'boolean', nullable: true, default: false },
      { name: 'is_tokenized', type: 'boolean', nullable: true, default: false },
      { name: 'is_ad', type: 'boolean', nullable: true, default: false },
      { name: 'is_deleted', type: 'boolean', nullable: true, default: false },
      { name: 'is_exclusive', type: 'boolean', nullable: true, default: false },
      { name: 'land_title_id', type: 'uuid', nullable: true, foreignKey: 'land_titles.id' },
      { name: 'tokenized_property_id', type: 'uuid', nullable: true, foreignKey: 'tokenized_properties.id' },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: true }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' },
      { table: 'land_titles', field: 'land_title_id', references: 'id', type: 'many-to-one' },
      { table: 'tokenized_properties', field: 'tokenized_property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  property_images: {
    description: "Property photos and media",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'property_id', type: 'uuid', nullable: false, foreignKey: 'properties.id' },
      { name: 'url', type: 'text', nullable: false },
      { name: 'thumbnail_url', type: 'text', nullable: true },
      { name: 'category', type: 'text', nullable: true },
      { name: 'is_primary', type: 'boolean', nullable: true, default: false },
      { name: 'sort_order', type: 'integer', nullable: true },
      { name: 'ratio', type: 'numeric', nullable: true }
    ],
    relationships: [
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  property_favorites: {
    description: "User saved/bookmarked properties",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'property_id', type: 'uuid', nullable: false, foreignKey: 'properties.id' },
      { name: 'list_name', type: 'text', nullable: true },
      { name: 'notes', type: 'text', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' },
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  property_likes: {
    description: "Property likes/hearts from users",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'property_id', type: 'uuid', nullable: false, foreignKey: 'properties.id' },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' },
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  property_views: {
    description: "Property view tracking and analytics",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'property_id', type: 'uuid', nullable: false, foreignKey: 'properties.id' },
      { name: 'user_id', type: 'uuid', nullable: true, foreignKey: 'users.id' },
      { name: 'session_id', type: 'text', nullable: true },
      { name: 'ip_address', type: 'inet', nullable: true },
      { name: 'user_agent', type: 'text', nullable: true },
      { name: 'referrer', type: 'text', nullable: true },
      { name: 'device_type', type: 'text', nullable: true },
      { name: 'location_data', type: 'jsonb', nullable: true },
      { name: 'view_duration', type: 'integer', nullable: true },
      { name: 'pages_viewed', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' },
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  property_reviews: {
    description: "User reviews and ratings for properties",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'property_id', type: 'uuid', nullable: false, foreignKey: 'properties.id' },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'user_name', type: 'text', nullable: false },
      { name: 'rating', type: 'integer', nullable: false },
      { name: 'comment', type: 'text', nullable: false },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: true }
    ],
    relationships: [
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' },
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  property_inquiries: {
    description: "Contact requests and inquiries for properties",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'property_id', type: 'uuid', nullable: false, foreignKey: 'properties.id' },
      { name: 'inquirer_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'agent_id', type: 'uuid', nullable: true, foreignKey: 'users.id' },
      { name: 'subject', type: 'text', nullable: false },
      { name: 'message', type: 'text', nullable: false },
      { name: 'inquiry_type', type: 'text', nullable: false, default: 'general' },
      { name: 'urgency_level', type: 'text', nullable: false, default: 'medium' },
      { name: 'status', type: 'text', nullable: false, default: 'open' },
      { name: 'response_count', type: 'integer', nullable: false, default: 0 },
      { name: 'last_contact_at', type: 'timestamp with time zone', nullable: true },
      { name: 'contact_preferences', type: 'jsonb', nullable: true },
      { name: 'conversion_type', type: 'text', nullable: true },
      { name: 'converted_at', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' },
      { table: 'users', field: 'inquirer_id', references: 'id', type: 'many-to-one' },
      { table: 'users', field: 'agent_id', references: 'id', type: 'many-to-one' }
    ]
  },

  property_creation_workflows: {
    description: "Multi-step property creation process tracking",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'property_id', type: 'uuid', nullable: true, foreignKey: 'properties.id' },
      { name: 'current_step', type: 'integer', nullable: false, default: 1 },
      { name: 'status', type: 'text', nullable: false, default: 'in_progress' },
      { name: 'step_data', type: 'jsonb', nullable: false, default: '{}' },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' },
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  // Land Registry & Legal
  land_titles: {
    description: "Official land ownership records",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'title_number', type: 'text', nullable: false },
      { name: 'owner_id', type: 'uuid', nullable: false },
      { name: 'coordinates', type: 'jsonb', nullable: false },
      { name: 'area_sqm', type: 'numeric', nullable: false },
      { name: 'description', type: 'text', nullable: false },
      { name: 'location_address', type: 'text', nullable: false },
      { name: 'state', type: 'text', nullable: false },
      { name: 'lga', type: 'text', nullable: false },
      { name: 'land_use', type: 'text', nullable: false },
      { name: 'title_type', type: 'text', nullable: false },
      { name: 'acquisition_date', type: 'date', nullable: false },
      { name: 'acquisition_method', type: 'text', nullable: false },
      { name: 'previous_title_id', type: 'uuid', nullable: true, foreignKey: 'land_titles.id' },
      { name: 'status', type: 'land_title_status', nullable: true, default: 'draft' },
      { name: 'blockchain_hash', type: 'text', nullable: true },
      { name: 'blockchain_transaction_id', type: 'text', nullable: true },
      { name: 'verification_metadata', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'land_titles', field: 'previous_title_id', references: 'id', type: 'self-reference' }
    ]
  },

  property_documents: {
    description: "Legal documents, certificates, deeds",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'property_id', type: 'uuid', nullable: true, foreignKey: 'properties.id' },
      { name: 'land_title_id', type: 'uuid', nullable: true, foreignKey: 'land_titles.id' },
      { name: 'document_type', type: 'document_type', nullable: false },
      { name: 'document_name', type: 'text', nullable: false },
      { name: 'file_url', type: 'text', nullable: false },
      { name: 'file_size', type: 'integer', nullable: false },
      { name: 'mime_type', type: 'text', nullable: false },
      { name: 'document_hash', type: 'text', nullable: false },
      { name: 'status', type: 'document_status', nullable: true, default: 'pending' },
      { name: 'verification_notes', type: 'text', nullable: true },
      { name: 'verified_by', type: 'uuid', nullable: true },
      { name: 'verified_at', type: 'timestamp with time zone', nullable: true },
      { name: 'expires_at', type: 'timestamp with time zone', nullable: true },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' },
      { table: 'land_titles', field: 'land_title_id', references: 'id', type: 'many-to-one' }
    ]
  },

  legal_agreements: {
    description: "Contracts, leases, sale agreements",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'land_title_id', type: 'uuid', nullable: false, foreignKey: 'land_titles.id' },
      { name: 'agreement_type', type: 'agreement_type', nullable: false },
      { name: 'parties', type: 'jsonb', nullable: false },
      { name: 'terms', type: 'jsonb', nullable: false },
      { name: 'financial_terms', type: 'jsonb', nullable: false },
      { name: 'start_date', type: 'date', nullable: false },
      { name: 'end_date', type: 'date', nullable: true },
      { name: 'status', type: 'agreement_status', nullable: true, default: 'draft' },
      { name: 'signed_document_url', type: 'text', nullable: true },
      { name: 'blockchain_record', type: 'text', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'land_titles', field: 'land_title_id', references: 'id', type: 'many-to-one' }
    ]
  },

  compliance_records: {
    description: "Tax, permits, regulatory compliance",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'land_title_id', type: 'uuid', nullable: false, foreignKey: 'land_titles.id' },
      { name: 'compliance_type', type: 'compliance_type', nullable: false },
      { name: 'authority', type: 'text', nullable: false },
      { name: 'reference_number', type: 'text', nullable: false },
      { name: 'issue_date', type: 'date', nullable: false },
      { name: 'expiry_date', type: 'date', nullable: true },
      { name: 'status', type: 'compliance_status', nullable: true, default: 'pending' },
      { name: 'document_url', type: 'text', nullable: true },
      { name: 'renewal_reminder_sent', type: 'boolean', nullable: true, default: false },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'land_titles', field: 'land_title_id', references: 'id', type: 'many-to-one' }
    ]
  },

  compliance_reports: {
    description: "Regulatory reporting for authorities",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'report_type', type: 'text', nullable: false },
      { name: 'jurisdiction', type: 'text', nullable: false },
      { name: 'regulator', type: 'text', nullable: true },
      { name: 'reporting_period_start', type: 'date', nullable: false },
      { name: 'reporting_period_end', type: 'date', nullable: false },
      { name: 'report_data', type: 'jsonb', nullable: false },
      { name: 'status', type: 'text', nullable: false, default: 'draft' },
      { name: 'submitted_by', type: 'uuid', nullable: true },
      { name: 'submitted_at', type: 'timestamp with time zone', nullable: true },
      { name: 'submission_reference', type: 'text', nullable: true },
      { name: 'acknowledgment_received_at', type: 'timestamp with time zone', nullable: true },
      { name: 'file_url', type: 'text', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: []
  },

  document_verification_requests: {
    description: "Document review queue for verifiers",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'document_id', type: 'uuid', nullable: false, foreignKey: 'property_documents.id' },
      { name: 'requested_by', type: 'uuid', nullable: false },
      { name: 'assigned_verifier', type: 'uuid', nullable: true },
      { name: 'priority', type: 'text', nullable: true, default: 'medium' },
      { name: 'status', type: 'text', nullable: true, default: 'pending' },
      { name: 'verification_checklist', type: 'jsonb', nullable: true },
      { name: 'notes', type: 'text', nullable: true },
      { name: 'completed_at', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'property_documents', field: 'document_id', references: 'id', type: 'many-to-one' }
    ]
  },

  // Tokenization & Investment
  tokenized_properties: {
    description: "Properties converted to digital tokens",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'land_title_id', type: 'uuid', nullable: false, foreignKey: 'land_titles.id' },
      { name: 'property_id', type: 'uuid', nullable: true, foreignKey: 'properties.id' },
      { name: 'token_symbol', type: 'text', nullable: false },
      { name: 'token_name', type: 'text', nullable: false },
      { name: 'token_type', type: 'token_type', nullable: false },
      { name: 'total_supply', type: 'text', nullable: false },
      { name: 'total_value_usd', type: 'numeric', nullable: false },
      { name: 'minimum_investment', type: 'numeric', nullable: false },
      { name: 'token_price', type: 'numeric', nullable: false },
      { name: 'status', type: 'tokenization_status', nullable: true, default: 'draft' },
      { name: 'blockchain_network', type: 'text', nullable: false },
      { name: 'token_contract_address', type: 'text', nullable: true },
      { name: 'token_id', type: 'text', nullable: true },
      { name: 'hedera_token_id', type: 'text', nullable: true },
      { name: 'investment_terms', type: 'investment_terms', nullable: false },
      { name: 'expected_roi', type: 'numeric', nullable: false },
      { name: 'revenue_distribution_frequency', type: 'text', nullable: false },
      { name: 'lock_up_period_months', type: 'integer', nullable: false },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'legal_structure', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'land_titles', field: 'land_title_id', references: 'id', type: 'many-to-one' },
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  token_holdings: {
    description: "Individual investor token ownership",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'tokenized_property_id', type: 'uuid', nullable: false, foreignKey: 'tokenized_properties.id' },
      { name: 'holder_id', type: 'uuid', nullable: false },
      { name: 'tokens_owned', type: 'text', nullable: false },
      { name: 'purchase_price_per_token', type: 'numeric', nullable: false },
      { name: 'total_investment', type: 'numeric', nullable: false },
      { name: 'acquisition_date', type: 'date', nullable: false },
      { name: 'vesting_schedule', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'tokenized_properties', field: 'tokenized_property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  token_transactions: {
    description: "Token buying/selling/transfer records",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'tokenized_property_id', type: 'uuid', nullable: false, foreignKey: 'tokenized_properties.id' },
      { name: 'from_holder', type: 'uuid', nullable: true },
      { name: 'to_holder', type: 'uuid', nullable: false },
      { name: 'token_amount', type: 'text', nullable: false },
      { name: 'price_per_token', type: 'numeric', nullable: false },
      { name: 'total_value', type: 'numeric', nullable: false },
      { name: 'transaction_type', type: 'transaction_type', nullable: false },
      { name: 'blockchain_hash', type: 'text', nullable: true },
      { name: 'hedera_transaction_id', type: 'text', nullable: true },
      { name: 'status', type: 'transaction_status', nullable: true, default: 'pending' },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'tokenized_properties', field: 'tokenized_property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  revenue_distributions: {
    description: "Dividend payments to token holders",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'tokenized_property_id', type: 'uuid', nullable: false, foreignKey: 'tokenized_properties.id' },
      { name: 'distribution_date', type: 'date', nullable: false },
      { name: 'total_revenue', type: 'numeric', nullable: false },
      { name: 'revenue_per_token', type: 'numeric', nullable: false },
      { name: 'distribution_type', type: 'text', nullable: false },
      { name: 'source_description', type: 'text', nullable: false },
      { name: 'blockchain_transaction_hash', type: 'text', nullable: true },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'tokenized_properties', field: 'tokenized_property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  dividend_payments: {
    description: "Individual payment records",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'revenue_distribution_id', type: 'uuid', nullable: false, foreignKey: 'revenue_distributions.id' },
      { name: 'token_holding_id', type: 'uuid', nullable: false, foreignKey: 'token_holdings.id' },
      { name: 'recipient_id', type: 'uuid', nullable: false },
      { name: 'amount', type: 'numeric', nullable: false },
      { name: 'tax_withholding', type: 'numeric', nullable: true, default: 0 },
      { name: 'net_amount', type: 'numeric', nullable: false },
      { name: 'currency', type: 'text', nullable: false, default: 'USD' },
      { name: 'payment_method', type: 'text', nullable: false, default: 'bank_transfer' },
      { name: 'status', type: 'text', nullable: false, default: 'pending' },
      { name: 'external_transaction_id', type: 'text', nullable: true },
      { name: 'paid_at', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'revenue_distributions', field: 'revenue_distribution_id', references: 'id', type: 'many-to-one' },
      { table: 'token_holdings', field: 'token_holding_id', references: 'id', type: 'many-to-one' }
    ]
  },

  investment_tracking: {
    description: "Portfolio performance tracking",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'tokenized_property_id', type: 'uuid', nullable: false },
      { name: 'investment_amount', type: 'numeric', nullable: false, default: 0 },
      { name: 'tokens_owned', type: 'numeric', nullable: false, default: 0 },
      { name: 'current_value', type: 'numeric', nullable: false, default: 0 },
      { name: 'roi_percentage', type: 'numeric', nullable: false, default: 0 },
      { name: 'total_dividends_received', type: 'numeric', nullable: false, default: 0 },
      { name: 'last_dividend_amount', type: 'numeric', nullable: false, default: 0 },
      { name: 'last_dividend_date', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  investment_groups: {
    description: "Collaborative investment pools",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'tokenized_property_id', type: 'uuid', nullable: false, foreignKey: 'tokenized_properties.id' },
      { name: 'name', type: 'text', nullable: false },
      { name: 'description', type: 'text', nullable: true },
      { name: 'lead_investor_id', type: 'uuid', nullable: false },
      { name: 'target_amount', type: 'numeric', nullable: false },
      { name: 'current_amount', type: 'numeric', nullable: false, default: 0 },
      { name: 'minimum_investment', type: 'numeric', nullable: false },
      { name: 'max_investors', type: 'integer', nullable: true },
      { name: 'investor_count', type: 'integer', nullable: false, default: 0 },
      { name: 'status', type: 'text', nullable: false, default: 'forming' },
      { name: 'closes_at', type: 'timestamp with time zone', nullable: true },
      { name: 'investment_terms', type: 'jsonb', nullable: false },
      { name: 'voting_power_distribution', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'tokenized_properties', field: 'tokenized_property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  investment_discussions: {
    description: "Group chat for investors",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'investment_group_id', type: 'uuid', nullable: false, foreignKey: 'investment_groups.id' },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'parent_id', type: 'uuid', nullable: true, foreignKey: 'investment_discussions.id' },
      { name: 'content', type: 'text', nullable: false },
      { name: 'attachments', type: 'jsonb', nullable: true, default: '[]' },
      { name: 'is_pinned', type: 'boolean', nullable: false, default: false },
      { name: 'is_private', type: 'boolean', nullable: false, default: false },
      { name: 'vote_count', type: 'integer', nullable: false, default: 0 },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'investment_groups', field: 'investment_group_id', references: 'id', type: 'many-to-one' },
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' },
      { table: 'investment_discussions', field: 'parent_id', references: 'id', type: 'self-reference' }
    ]
  },

  investment_analytics: {
    description: "Performance metrics and insights",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'tokenized_property_id', type: 'uuid', nullable: false, foreignKey: 'tokenized_properties.id' },
      { name: 'metric_type', type: 'text', nullable: false },
      { name: 'metric_value', type: 'numeric', nullable: false },
      { name: 'calculation_date', type: 'date', nullable: false },
      { name: 'period_start', type: 'date', nullable: false },
      { name: 'period_end', type: 'date', nullable: false },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' },
      { table: 'tokenized_properties', field: 'tokenized_property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  auction_listings: {
    description: "Property auctions and bidding",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'property_id', type: 'uuid', nullable: false, foreignKey: 'properties.id' },
      { name: 'tokenized_property_id', type: 'uuid', nullable: true, foreignKey: 'tokenized_properties.id' },
      { name: 'auctioneer_id', type: 'uuid', nullable: false },
      { name: 'auction_type', type: 'text', nullable: false, default: 'english' },
      { name: 'starting_price', type: 'numeric', nullable: false },
      { name: 'reserve_price', type: 'numeric', nullable: true },
      { name: 'current_bid', type: 'numeric', nullable: true, default: 0 },
      { name: 'bid_increment', type: 'numeric', nullable: false, default: 1000 },
      { name: 'total_bids', type: 'integer', nullable: false, default: 0 },
      { name: 'high_bidder_id', type: 'uuid', nullable: true },
      { name: 'start_time', type: 'timestamp with time zone', nullable: false },
      { name: 'end_time', type: 'timestamp with time zone', nullable: false },
      { name: 'auto_extend', type: 'boolean', nullable: false, default: true },
      { name: 'extension_time_minutes', type: 'integer', nullable: true, default: 10 },
      { name: 'status', type: 'text', nullable: false, default: 'scheduled' },
      { name: 'terms_and_conditions', type: 'text', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' },
      { table: 'tokenized_properties', field: 'tokenized_property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  // Financial & Payment Systems
  accounts: {
    description: "User wallet balances and points",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'type', type: 'text', nullable: false },
      { name: 'amount', type: 'bigint', nullable: false, default: 0 },
      { name: 'points', type: 'bigint', nullable: false, default: 0 },
      { name: 'currency', type: 'text', nullable: false, default: 'NGN' },
      { name: 'status', type: 'text', nullable: false, default: 'active' },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: true, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  payments: {
    description: "Transaction records",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'agent_id', type: 'uuid', nullable: true, foreignKey: 'users.id' },
      { name: 'property_id', type: 'uuid', nullable: true, foreignKey: 'properties.id' },
      { name: 'amount', type: 'bigint', nullable: false },
      { name: 'currency', type: 'text', nullable: true, default: 'NGN' },
      { name: 'type', type: 'text', nullable: true, default: 'initial' },
      { name: 'method', type: 'text', nullable: true, default: 'card' },
      { name: 'provider', type: 'text', nullable: true, default: 'paystack' },
      { name: 'status', type: 'text', nullable: true, default: 'pending' },
      { name: 'reference', type: 'text', nullable: false },
      { name: 'related_id', type: 'uuid', nullable: false },
      { name: 'related_type', type: 'text', nullable: false },
      { name: 'link', type: 'text', nullable: true },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'paid_at', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp without time zone', nullable: true, default: 'now()' },
      { name: 'updated_at', type: 'timestamp without time zone', nullable: true }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' },
      { table: 'users', field: 'agent_id', references: 'id', type: 'many-to-one' },
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  payment_methods: {
    description: "Saved payment cards/methods",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'type', type: 'text', nullable: false },
      { name: 'provider', type: 'text', nullable: false, default: 'stripe' },
      { name: 'external_id', type: 'text', nullable: false },
      { name: 'details', type: 'jsonb', nullable: false },
      { name: 'is_default', type: 'boolean', nullable: false, default: false },
      { name: 'is_verified', type: 'boolean', nullable: false, default: false },
      { name: 'is_active', type: 'boolean', nullable: false, default: true },
      { name: 'expires_at', type: 'timestamp with time zone', nullable: true },
      { name: 'last_used_at', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  payment_sessions: {
    description: "Active payment processing sessions",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'session_id', type: 'text', nullable: false },
      { name: 'user_id', type: 'uuid', nullable: true, foreignKey: 'users.id' },
      { name: 'purpose', type: 'text', nullable: false },
      { name: 'amount', type: 'integer', nullable: false },
      { name: 'currency', type: 'text', nullable: true, default: 'USD' },
      { name: 'payment_provider', type: 'text', nullable: true, default: 'stripe' },
      { name: 'status', type: 'text', nullable: true, default: 'pending' },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'expires_at', type: 'timestamp with time zone', nullable: true },
      { name: 'completed_at', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: true, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: true, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  escrow_accounts: {
    description: "Secure transaction holding accounts",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'buyer_id', type: 'uuid', nullable: false },
      { name: 'seller_id', type: 'uuid', nullable: false },
      { name: 'property_id', type: 'uuid', nullable: true, foreignKey: 'properties.id' },
      { name: 'tokenized_property_id', type: 'uuid', nullable: true, foreignKey: 'tokenized_properties.id' },
      { name: 'transaction_id', type: 'uuid', nullable: true },
      { name: 'escrow_amount', type: 'numeric', nullable: false },
      { name: 'currency', type: 'text', nullable: false, default: 'USD' },
      { name: 'conditions', type: 'jsonb', nullable: false },
      { name: 'status', type: 'text', nullable: false, default: 'created' },
      { name: 'release_conditions_met', type: 'boolean', nullable: false, default: false },
      { name: 'mediator_id', type: 'uuid', nullable: true },
      { name: 'dispute_reason', type: 'text', nullable: true },
      { name: 'expires_at', type: 'timestamp with time zone', nullable: false },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' },
      { table: 'tokenized_properties', field: 'tokenized_property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  withdrawal_requests: {
    description: "Cash-out requests from users",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'payment_method_id', type: 'uuid', nullable: false, foreignKey: 'payment_methods.id' },
      { name: 'amount', type: 'numeric', nullable: false },
      { name: 'fee_amount', type: 'numeric', nullable: false, default: 0 },
      { name: 'net_amount', type: 'numeric', nullable: false },
      { name: 'currency', type: 'text', nullable: false, default: 'USD' },
      { name: 'reference', type: 'text', nullable: false },
      { name: 'status', type: 'text', nullable: false, default: 'pending' },
      { name: 'external_transaction_id', type: 'text', nullable: true },
      { name: 'processor_response', type: 'jsonb', nullable: true },
      { name: 'failure_reason', type: 'text', nullable: true },
      { name: 'processed_at', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' },
      { table: 'payment_methods', field: 'payment_method_id', references: 'id', type: 'many-to-one' }
    ]
  },

  transaction_fees: {
    description: "Fee calculations and records",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'transaction_type', type: 'text', nullable: false },
      { name: 'fee_type', type: 'text', nullable: false },
      { name: 'base_fee', type: 'numeric', nullable: false, default: 0 },
      { name: 'percentage_fee', type: 'numeric', nullable: false, default: 0 },
      { name: 'min_fee', type: 'numeric', nullable: false, default: 0 },
      { name: 'max_fee', type: 'numeric', nullable: true },
      { name: 'currency', type: 'text', nullable: false, default: 'USD' },
      { name: 'tier_thresholds', type: 'jsonb', nullable: true },
      { name: 'is_active', type: 'boolean', nullable: false, default: true },
      { name: 'effective_from', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'effective_until', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: []
  },

  wallets: {
    description: "Cryptocurrency wallet connections",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'wallet_type', type: 'text', nullable: false },
      { name: 'address', type: 'text', nullable: false },
      { name: 'public_key', type: 'text', nullable: true },
      { name: 'encrypted_private_key', type: 'text', nullable: true },
      { name: 'balance_hbar', type: 'numeric', nullable: true },
      { name: 'is_primary', type: 'boolean', nullable: false, default: false },
      { name: 'is_verified', type: 'boolean', nullable: false, default: false },
      { name: 'metadata', type: 'jsonb', nullable: false, default: '{}' },
      { name: 'last_sync_at', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  financial_reports: {
    description: "User investment reports",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'report_type', type: 'text', nullable: false, default: 'investment_summary' },
      { name: 'period_start', type: 'date', nullable: false },
      { name: 'period_end', type: 'date', nullable: false },
      { name: 'data', type: 'jsonb', nullable: false },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'status', type: 'text', nullable: false, default: 'generated' },
      { name: 'generated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  // Communication & Chat
  conversations: {
    description: "Chat rooms and groups",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'name', type: 'text', nullable: false },
      { name: 'description', type: 'text', nullable: true },
      { name: 'type', type: 'text', nullable: false },
      { name: 'admin_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'participants', type: 'uuid[]', nullable: false },
      { name: 'activity_type', type: 'activity_type', nullable: true },
      { name: 'avatar_url', type: 'text', nullable: true },
      { name: 'is_archived', type: 'boolean', nullable: false, default: false },
      { name: 'settings', type: 'jsonb', nullable: false },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'admin_id', references: 'id', type: 'many-to-one' }
    ]
  },

  messages: {
    description: "Individual chat messages",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'conversation_id', type: 'uuid', nullable: false, foreignKey: 'conversations.id' },
      { name: 'sender_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'sender', type: 'text', nullable: false },
      { name: 'content', type: 'text', nullable: false },
      { name: 'type', type: 'text', nullable: false },
      { name: 'reply_to_id', type: 'uuid', nullable: true, foreignKey: 'messages.id' },
      { name: 'property_id', type: 'uuid', nullable: true, foreignKey: 'properties.id' },
      { name: 'attachment_id', type: 'uuid', nullable: true, foreignKey: 'message_attachments.id' },
      { name: 'properties', type: 'jsonb', nullable: true },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'reactions', type: 'jsonb', nullable: false, default: '{}' },
      { name: 'read_by', type: 'uuid[]', nullable: false, default: '{}' },
      { name: 'is_edited', type: 'boolean', nullable: false, default: false },
      { name: 'is_deleted', type: 'boolean', nullable: false, default: false },
      { name: 'error_message', type: 'text', nullable: true },
      { name: 'timestamp', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'conversations', field: 'conversation_id', references: 'id', type: 'many-to-one' },
      { table: 'users', field: 'sender_id', references: 'id', type: 'many-to-one' },
      { table: 'messages', field: 'reply_to_id', references: 'id', type: 'self-reference' },
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' },
      { table: 'message_attachments', field: 'attachment_id', references: 'id', type: 'many-to-one' }
    ]
  },

  message_attachments: {
    description: "File sharing in chats",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'name', type: 'text', nullable: false },
      { name: 'url', type: 'text', nullable: false },
      { name: 'mime_type', type: 'text', nullable: false },
      { name: 'size', type: 'bigint', nullable: false },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: []
  },

  message_reactions: {
    description: "Emoji reactions on messages",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'message_id', type: 'uuid', nullable: false, foreignKey: 'messages.id' },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'emoji', type: 'text', nullable: false },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'messages', field: 'message_id', references: 'id', type: 'many-to-one' },
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  typing_indicators: {
    description: "Real-time typing status",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'conversation_id', type: 'uuid', nullable: true, foreignKey: 'conversations.id' },
      { name: 'user_id', type: 'uuid', nullable: true },
      { name: 'last_typed_at', type: 'timestamp with time zone', nullable: true }
    ],
    relationships: [
      { table: 'conversations', field: 'conversation_id', references: 'id', type: 'many-to-one' }
    ]
  },

  // Notifications & Alerts
  notifications: {
    description: "All user notifications",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'sender_id', type: 'uuid', nullable: true, foreignKey: 'users.id' },
      { name: 'type', type: 'notification_type', nullable: false },
      { name: 'title', type: 'text', nullable: false },
      { name: 'message', type: 'text', nullable: true },
      { name: 'metadata', type: 'jsonb', nullable: false, default: '{}' },
      { name: 'action_url', type: 'text', nullable: true },
      { name: 'action_label', type: 'text', nullable: true },
      { name: 'image_url', type: 'text', nullable: true },
      { name: 'is_read', type: 'boolean', nullable: false, default: false },
      { name: 'action_taken_at', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: true }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' },
      { table: 'users', field: 'sender_id', references: 'id', type: 'many-to-one' }
    ]
  },

  notification_preferences: {
    description: "User notification settings",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'email_notifications', type: 'boolean', nullable: false, default: true },
      { name: 'push_notifications', type: 'boolean', nullable: false, default: true },
      { name: 'sms_notifications', type: 'boolean', nullable: false, default: false },
      { name: 'notification_types', type: 'jsonb', nullable: false },
      { name: 'quiet_hours_start', type: 'text', nullable: true, default: '22:00' },
      { name: 'quiet_hours_end', type: 'text', nullable: true, default: '07:00' },
      { name: 'do_not_disturb', type: 'boolean', nullable: false, default: false },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  notification_deliveries: {
    description: "Delivery status tracking",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'notification_id', type: 'uuid', nullable: false, foreignKey: 'notifications.id' },
      { name: 'channel', type: 'text', nullable: false },
      { name: 'status', type: 'text', nullable: false, default: 'pending' },
      { name: 'external_id', type: 'text', nullable: true },
      { name: 'error_message', type: 'text', nullable: true },
      { name: 'delivered_at', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'notifications', field: 'notification_id', references: 'id', type: 'many-to-one' }
    ]
  },

  notification_templates: {
    description: "Pre-defined message templates",
    fields: [
      { name: 'id', type: 'varchar', nullable: false, primary: true },
      { name: 'category', type: 'varchar', nullable: false, default: 'general' },
      { name: 'language', type: 'varchar', nullable: false, default: 'en' },
      { name: 'title', type: 'varchar', nullable: false },
      { name: 'body', type: 'text', nullable: false },
      { name: 'action_text', type: 'varchar', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: true, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: true, default: 'now()' }
    ],
    relationships: []
  },

  system_notifications: {
    description: "Platform-wide announcements",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'title', type: 'text', nullable: false },
      { name: 'message', type: 'text', nullable: false },
      { name: 'notification_type', type: 'text', nullable: false },
      { name: 'severity', type: 'text', nullable: false, default: 'info' },
      { name: 'target_audience', type: 'text', nullable: false, default: 'all' },
      { name: 'target_users', type: 'uuid[]', nullable: true },
      { name: 'is_dismissible', type: 'boolean', nullable: false, default: true },
      { name: 'action_required', type: 'boolean', nullable: false, default: false },
      { name: 'action_url', type: 'text', nullable: true },
      { name: 'action_label', type: 'text', nullable: true },
      { name: 'display_from', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'display_until', type: 'timestamp with time zone', nullable: true },
      { name: 'auto_dismiss_after', type: 'interval', nullable: true },
      { name: 'created_by', type: 'uuid', nullable: false },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: []
  },

  saved_searches: {
    description: "Saved search criteria",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: true },
      { name: 'name', type: 'text', nullable: false },
      { name: 'search_criteria', type: 'jsonb', nullable: false },
      { name: 'alert_enabled', type: 'boolean', nullable: true, default: false },
      { name: 'last_run_at', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: true, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: true, default: 'now()' }
    ],
    relationships: []
  },

  portfolio_allocations: {
    description: "Investment diversification targets",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'allocation_type', type: 'text', nullable: false },
      { name: 'category', type: 'text', nullable: false },
      { name: 'current_percentage', type: 'numeric', nullable: false, default: 0 },
      { name: 'current_value', type: 'numeric', nullable: false, default: 0 },
      { name: 'target_percentage', type: 'numeric', nullable: true },
      { name: 'rebalance_threshold', type: 'numeric', nullable: true },
      { name: 'last_rebalanced_at', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  // Business Operations
  inspections: {
    description: "Property inspection scheduling",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'property_id', type: 'uuid', nullable: false, foreignKey: 'properties.id' },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'agent_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'conversation_id', type: 'uuid', nullable: true, foreignKey: 'conversations.id' },
      { name: 'when', type: 'timestamp with time zone', nullable: true },
      { name: 'mode', type: 'text', nullable: false, default: 'physical' },
      { name: 'status', type: 'text', nullable: false, default: 'pending' },
      { name: 'notes', type: 'text', nullable: true },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'cancellation_details', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: true, default: 'now()' }
    ],
    relationships: [
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' },
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' },
      { table: 'users', field: 'agent_id', references: 'id', type: 'many-to-one' },
      { table: 'conversations', field: 'conversation_id', references: 'id', type: 'many-to-one' }
    ]
  },

  rentals: {
    description: "Rental agreements and management",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'property_id', type: 'uuid', nullable: false, foreignKey: 'properties.id' },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'agent_id', type: 'uuid', nullable: true, foreignKey: 'users.id' },
      { name: 'conversation_id', type: 'uuid', nullable: true, foreignKey: 'conversations.id' },
      { name: 'plan_id', type: 'uuid', nullable: true },
      { name: 'subscription_id', type: 'uuid', nullable: true },
      { name: 'payment_id', type: 'uuid', nullable: true },
      { name: 'price', type: 'numeric', nullable: true },
      { name: 'payment_plan', type: 'text', nullable: false, default: 'monthly' },
      { name: 'payment_status', type: 'text', nullable: false, default: 'pending' },
      { name: 'status', type: 'text', nullable: false, default: 'pending' },
      { name: 'move_in_date', type: 'timestamp with time zone', nullable: true },
      { name: 'message', type: 'text', nullable: true },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'cancellation_details', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: true, default: 'now()' }
    ],
    relationships: [
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' },
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' },
      { table: 'users', field: 'agent_id', references: 'id', type: 'many-to-one' },
      { table: 'conversations', field: 'conversation_id', references: 'id', type: 'many-to-one' }
    ]
  },

  reservations: {
    description: "Property viewing appointments",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'property_id', type: 'uuid', nullable: false, foreignKey: 'properties.id' },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'agent_id', type: 'uuid', nullable: true, foreignKey: 'users.id' },
      { name: 'conversation_id', type: 'uuid', nullable: true, foreignKey: 'conversations.id' },
      { name: 'payment_id', type: 'uuid', nullable: true },
      { name: 'from_date', type: 'timestamp with time zone', nullable: true },
      { name: 'to_date', type: 'timestamp with time zone', nullable: true },
      { name: 'nights', type: 'integer', nullable: true },
      { name: 'adults', type: 'integer', nullable: true },
      { name: 'children', type: 'integer', nullable: true },
      { name: 'infants', type: 'integer', nullable: true },
      { name: 'total', type: 'numeric', nullable: true },
      { name: 'fee', type: 'numeric', nullable: true },
      { name: 'caution_deposit', type: 'numeric', nullable: true },
      { name: 'status', type: 'text', nullable: false, default: 'pending' },
      { name: 'note', type: 'text', nullable: true },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'cancellation_details', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: true, default: 'now()' }
    ],
    relationships: [
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' },
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' },
      { table: 'users', field: 'agent_id', references: 'id', type: 'many-to-one' },
      { table: 'conversations', field: 'conversation_id', references: 'id', type: 'many-to-one' }
    ]
  },

  feedbacks: {
    description: "User feedback and support",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'title', type: 'text', nullable: false },
      { name: 'description', type: 'text', nullable: false },
      { name: 'type', type: 'text', nullable: false },
      { name: 'attachments', type: 'text[]', nullable: true, default: 'ARRAY[]::text[]' },
      { name: 'is_anonymous', type: 'boolean', nullable: true, default: false },
      { name: 'resolved_at', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: true, default: "timezone('utc'::text, now())" },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: true, default: "timezone('utc'::text, now())" }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  contacts_us: {
    description: "Contact form submissions",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'first_name', type: 'text', nullable: false },
      { name: 'last_name', type: 'text', nullable: false },
      { name: 'email', type: 'text', nullable: false },
      { name: 'phone_number', type: 'text', nullable: false },
      { name: 'message', type: 'text', nullable: false },
      { name: 'created_at', type: 'timestamp with time zone', nullable: true, default: 'now()' }
    ],
    relationships: []
  },

  // Analytics & Reporting
  market_analytics: {
    description: "Market trends and insights",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'location_id', type: 'text', nullable: false },
      { name: 'property_type', type: 'text', nullable: false },
      { name: 'metric_type', type: 'text', nullable: false },
      { name: 'metric_value', type: 'numeric', nullable: false },
      { name: 'calculation_date', type: 'date', nullable: false },
      { name: 'period_type', type: 'text', nullable: false, default: 'monthly' },
      { name: 'sample_size', type: 'integer', nullable: false, default: 0 },
      { name: 'confidence_level', type: 'numeric', nullable: true, default: 95 },
      { name: 'currency', type: 'text', nullable: false, default: 'USD' },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: []
  },

  learning_patterns: {
    description: "AI learning and pattern recognition",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: true },
      { name: 'pattern_type', type: 'text', nullable: false },
      { name: 'pattern_data', type: 'jsonb', nullable: false },
      { name: 'confidence_score', type: 'numeric', nullable: true, default: 0.5 },
      { name: 'usage_count', type: 'integer', nullable: true, default: 0 },
      { name: 'success_rate', type: 'numeric', nullable: true, default: 0.0 },
      { name: 'last_applied_at', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: []
  },

  agent_interactions: {
    description: "AI agent conversation tracking",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false },
      { name: 'agent_id', type: 'text', nullable: false },
      { name: 'conversation_id', type: 'uuid', nullable: true },
      { name: 'property_id', type: 'uuid', nullable: true },
      { name: 'interaction_type', type: 'text', nullable: false },
      { name: 'user_message', type: 'text', nullable: false },
      { name: 'agent_response', type: 'text', nullable: false },
      { name: 'response_time_ms', type: 'integer', nullable: true },
      { name: 'outcome', type: 'text', nullable: true },
      { name: 'user_satisfaction_score', type: 'integer', nullable: true },
      { name: 'context_data', type: 'jsonb', nullable: true, default: '{}' },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: []
  },

  agent_performance_metrics: {
    description: "Agent effectiveness metrics",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'agent_id', type: 'text', nullable: false },
      { name: 'metric_type', type: 'text', nullable: false },
      { name: 'metric_value', type: 'numeric', nullable: true },
      { name: 'period_start', type: 'timestamp with time zone', nullable: false },
      { name: 'period_end', type: 'timestamp with time zone', nullable: false },
      { name: 'sample_size', type: 'integer', nullable: true, default: 0 },
      { name: 'metadata', type: 'jsonb', nullable: true, default: '{}' },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: []
  },

  conversation_contexts: {
    description: "AI conversation state management",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false },
      { name: 'agent_id', type: 'text', nullable: false },
      { name: 'conversation_id', type: 'uuid', nullable: true },
      { name: 'context_data', type: 'jsonb', nullable: false },
      { name: 'current_intent', type: 'text', nullable: true },
      { name: 'search_history', type: 'jsonb', nullable: true, default: '[]' },
      { name: 'session_start', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'last_interaction', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'is_active', type: 'boolean', nullable: true, default: true }
    ],
    relationships: []
  },

  // Environmental & Sustainability
  tree_donations: {
    description: "Environmental contribution tracking",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'tree_type', type: 'text', nullable: false },
      { name: 'quantity', type: 'integer', nullable: false },
      { name: 'donation_amount', type: 'numeric', nullable: false },
      { name: 'planting_location', type: 'text', nullable: true },
      { name: 'coordinates', type: 'jsonb', nullable: true },
      { name: 'donation_reference', type: 'text', nullable: false },
      { name: 'certificate_url', type: 'text', nullable: true },
      { name: 'estimated_co2_offset', type: 'numeric', nullable: true },
      { name: 'planting_date', type: 'date', nullable: true },
      { name: 'status', type: 'text', nullable: false, default: 'pending' },
      { name: 'metadata', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  // AI & Machine Learning
  ai_property_valuations: {
    description: "AI-generated property valuations",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'property_id', type: 'uuid', nullable: true, foreignKey: 'properties.id' },
      { name: 'ai_model', type: 'text', nullable: true, default: 'gpt-4o' },
      { name: 'ai_estimated_value', type: 'numeric', nullable: false },
      { name: 'confidence_score', type: 'numeric', nullable: false },
      { name: 'valuation_factors', type: 'jsonb', nullable: true, default: '{}' },
      { name: 'market_comparisons', type: 'jsonb', nullable: true, default: '[]' },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' },
      { table: 'properties', field: 'property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  // Investment Polling System
  investment_polls: {
    description: "Investment group voting polls",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'investment_group_id', type: 'uuid', nullable: false, foreignKey: 'investment_groups.id' },
      { name: 'title', type: 'text', nullable: false },
      { name: 'description', type: 'text', nullable: true },
      { name: 'poll_type', type: 'text', nullable: false, default: 'simple' },
      { name: 'created_by', type: 'uuid', nullable: false },
      { name: 'status', type: 'text', nullable: false, default: 'active' },
      { name: 'starts_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'ends_at', type: 'timestamp with time zone', nullable: false },
      { name: 'min_participation_percentage', type: 'numeric', nullable: true, default: 50.0 },
      { name: 'requires_consensus', type: 'boolean', nullable: true, default: false },
      { name: 'consensus_threshold', type: 'numeric', nullable: true, default: 66.7 },
      { name: 'allow_vote_changes', type: 'boolean', nullable: true, default: true },
      { name: 'is_anonymous', type: 'boolean', nullable: true, default: false },
      { name: 'voting_power_basis', type: 'text', nullable: true, default: 'tokens' },
      { name: 'hedera_topic_id', type: 'text', nullable: true },
      { name: 'hedera_consensus_timestamp', type: 'text', nullable: true },
      { name: 'metadata', type: 'jsonb', nullable: true, default: '{}' },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'investment_groups', field: 'investment_group_id', references: 'id', type: 'many-to-one' }
    ]
  },

  // Identity & Verification
  identity_verifications: {
    description: "KYC identity verification",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'identity_type', type: 'identity_type', nullable: false },
      { name: 'identity_number', type: 'text', nullable: false },
      { name: 'full_name', type: 'text', nullable: false },
      { name: 'verification_status', type: 'verification_status', nullable: true, default: 'pending' },
      { name: 'verification_provider', type: 'text', nullable: true },
      { name: 'verification_response', type: 'jsonb', nullable: true },
      { name: 'verified_at', type: 'timestamp with time zone', nullable: true },
      { name: 'expires_at', type: 'timestamp with time zone', nullable: true },
      { name: 'retry_count', type: 'integer', nullable: true, default: 0 },
      { name: 'last_retry_at', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  kyc_documents: {
    description: "Identity documents for verification",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'document_type', type: 'text', nullable: false },
      { name: 'document_side', type: 'text', nullable: true },
      { name: 'file_url', type: 'text', nullable: false },
      { name: 'file_hash', type: 'text', nullable: false },
      { name: 'file_size', type: 'bigint', nullable: false },
      { name: 'mime_type', type: 'text', nullable: false },
      { name: 'verification_status', type: 'text', nullable: false, default: 'pending' },
      { name: 'verification_provider', type: 'text', nullable: true },
      { name: 'verification_response', type: 'jsonb', nullable: true, default: '{}' },
      { name: 'extracted_data', type: 'jsonb', nullable: true, default: '{}' },
      { name: 'verified_by', type: 'uuid', nullable: true },
      { name: 'verified_at', type: 'timestamp with time zone', nullable: true },
      { name: 'rejection_reason', type: 'text', nullable: true },
      { name: 'retry_count', type: 'integer', nullable: false, default: 0 },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  verifier_credentials: {
    description: "Professional verifier licenses",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'user_id', type: 'uuid', nullable: false, foreignKey: 'users.id' },
      { name: 'verifier_type', type: 'verifier_type', nullable: false },
      { name: 'license_number', type: 'text', nullable: false },
      { name: 'license_name', type: 'text', nullable: false },
      { name: 'issuing_authority', type: 'text', nullable: false },
      { name: 'issue_date', type: 'date', nullable: false },
      { name: 'expiry_date', type: 'date', nullable: false },
      { name: 'verification_status', type: 'verification_status', nullable: true, default: 'pending' },
      { name: 'verified_by', type: 'uuid', nullable: true },
      { name: 'verified_at', type: 'timestamp with time zone', nullable: true },
      { name: 'documents', type: 'jsonb', nullable: true },
      { name: 'reputation_score', type: 'numeric', nullable: true, default: 0 },
      { name: 'total_verifications', type: 'integer', nullable: true, default: 0 },
      { name: 'successful_verifications', type: 'integer', nullable: true, default: 0 },
      { name: 'is_active', type: 'boolean', nullable: true, default: true },
      { name: 'suspension_reason', type: 'text', nullable: true },
      { name: 'suspended_until', type: 'timestamp with time zone', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'users', field: 'user_id', references: 'id', type: 'many-to-one' }
    ]
  },

  // System & Infrastructure
  smart_contracts: {
    description: "Blockchain contract management",
    fields: [
      { name: 'id', type: 'uuid', nullable: false, primary: true },
      { name: 'contract_type', type: 'text', nullable: false },
      { name: 'contract_address', type: 'text', nullable: false },
      { name: 'deployment_transaction_hash', type: 'text', nullable: false },
      { name: 'deployer_id', type: 'uuid', nullable: false },
      { name: 'network', type: 'text', nullable: false, default: 'hedera-testnet' },
      { name: 'abi', type: 'jsonb', nullable: false },
      { name: 'bytecode', type: 'text', nullable: true },
      { name: 'source_code', type: 'text', nullable: true },
      { name: 'compiler_version', type: 'text', nullable: true },
      { name: 'status', type: 'text', nullable: false, default: 'deployed' },
      { name: 'verification_status', type: 'text', nullable: true },
      { name: 'related_property_id', type: 'uuid', nullable: true, foreignKey: 'properties.id' },
      { name: 'related_tokenized_property_id', type: 'uuid', nullable: true, foreignKey: 'tokenized_properties.id' },
      { name: 'deployment_cost', type: 'numeric', nullable: true },
      { name: 'gas_used', type: 'integer', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: false, default: 'now()' }
    ],
    relationships: [
      { table: 'properties', field: 'related_property_id', references: 'id', type: 'many-to-one' },
      { table: 'tokenized_properties', field: 'related_tokenized_property_id', references: 'id', type: 'many-to-one' }
    ]
  },

  bank_cache: {
    description: "Banking data caching",
    fields: [
      { name: 'id', type: 'bigint', nullable: false, primary: true },
      { name: 'data', type: 'jsonb', nullable: true },
      { name: 'created_at', type: 'timestamp with time zone', nullable: false, default: 'now()' },
      { name: 'updated_at', type: 'timestamp with time zone', nullable: true }
    ],
    relationships: []
  }
};

const categories = [
  {
    name: 'User Management & Authentication',
    icon: BookOpen,
    tables: ['users', 'user_roles', 'user_profiles', 'user_preferences', 'user_devices'],
  },
  {
    name: 'Property Management Core',
    icon: Database,
    tables: ['properties', 'property_images', 'property_favorites', 'property_likes', 'property_views', 'property_reviews', 'property_inquiries', 'property_creation_workflows'],
  },
  {
    name: 'Land Registry & Legal',
    icon: GitBranch,
    tables: ['land_titles', 'property_documents', 'legal_agreements', 'compliance_records', 'compliance_reports', 'document_verification_requests'],
  },
  {
    name: 'Tokenization & Investment',
    icon: Code,
    tables: ['tokenized_properties', 'token_holdings', 'token_transactions', 'revenue_distributions', 'dividend_payments', 'investment_tracking', 'investment_groups', 'investment_discussions', 'investment_analytics', 'auction_listings'],
  },
  {
    name: 'Financial & Payment Systems',
    icon: Search,
    tables: ['accounts', 'payments', 'payment_methods', 'payment_sessions', 'escrow_accounts', 'withdrawal_requests', 'transaction_fees', 'wallets', 'financial_reports'],
  },
  {
    name: 'Security & Compliance',
    icon: Database,
    tables: ['aml_checks', 'sanctions_screening', 'audit_trails', 'identity_audit_logs', 'backup_recovery', 'api_keys'],
  },
  {
    name: 'Communication & Chat',
    icon: GitBranch,
    tables: ['conversations', 'messages', 'chat_messages', 'message_attachments', 'message_reactions', 'typing_indicators'],
  },
  {
    name: 'Notifications & Alerts',
    icon: Database,
    tables: ['notifications', 'notification_preferences', 'notification_deliveries', 'notification_templates', 'system_notifications'],
  },
  {
    name: 'User Interaction & Engagement',
    icon: BookOpen,
    tables: ['saved_searches', 'portfolio_allocations'],
  },
  {
    name: 'Business Operations',
    icon: Code,
    tables: ['inspections', 'rentals', 'reservations', 'feedbacks', 'contacts_us'],
  },
  {
    name: 'Analytics & Reporting',
    icon: Search,
    tables: ['market_analytics', 'learning_patterns', 'agent_interactions', 'agent_performance_metrics', 'conversation_contexts'],
  },
  {
    name: 'Environmental & Sustainability',
    icon: BookOpen,
    tables: ['tree_donations'],
  },
  {
    name: 'AI & Machine Learning',
    icon: Code,
    tables: ['ai_property_valuations'],
  },
  {
    name: 'Investment Polling System',
    icon: GitBranch,
    tables: ['investment_polls'],
  },
  {
    name: 'Identity & Verification',
    icon: Database,
    tables: ['identity_verifications', 'kyc_documents', 'verifier_credentials'],
  },
  {
    name: 'System & Infrastructure',
    icon: Search,
    tables: ['smart_contracts', 'bank_cache'],
  },
];

const DatabaseDocumentation = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-900">Database Documentation</h1>
              <p className="text-sm text-gray-600">Complete database schema and table relationships - All {Object.keys(databaseTables).length} tables</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => navigate('/database-schema')} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <GitBranch className="w-4 h-4" />
              Interactive Schema
            </Button>
            <Button 
              onClick={() => navigate('/data-flow')} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Code className="w-4 h-4" />
              Data Flow Diagrams
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Database className="w-8 h-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{Object.keys(databaseTables).length}</div>
                  <div className="text-sm text-gray-600">Total Tables</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{categories.length}</div>
                  <div className="text-sm text-gray-600">Categories</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <GitBranch className="w-8 h-8 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {Object.values(databaseTables).reduce((acc, table) => acc + (table.relationships?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-gray-600">Relationships</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Search className="w-8 h-8 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">
                    {Object.values(databaseTables).reduce((acc, table) => acc + table.fields.length, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total Fields</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Schema Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <GitBranch className="w-5 h-5" />
              Complete Database Schema - All {Object.keys(databaseTables).length} Tables
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-800 mb-4">
              Our documentation now covers all {Object.keys(databaseTables).length} database tables across {categories.length} domain categories. 
              Explore the interactive schema viewer for detailed field definitions, relationships, and constraints.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => navigate('/database-schema')} 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <GitBranch className="w-4 h-4 mr-2" />
                Interactive Schema Viewer
              </Button>
              <Button 
                onClick={() => navigate('/data-flow')} 
                variant="outline"
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                <Code className="w-4 h-4 mr-2" />
                Data Flow Diagrams
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className="text-xs"
              >
                {category.name} ({category.tables.length})
              </Button>
            ))}
          </div>
        </div>

        {/* Categories and Tables */}
        <div className="space-y-8">
          {categories
            .filter(category => selectedCategory === null || category.name === selectedCategory)
            .map((category) => {
              const categoryTables = category.tables.filter(tableName =>
                tableName.toLowerCase().includes(searchTerm.toLowerCase()) && databaseTables[tableName]
              );

              if (categoryTables.length === 0) return null;

              return (
                <div key={category.name} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <category.icon className="w-6 h-6 text-blue-600" />
                    <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                    <Badge variant="secondary">{categoryTables.length} tables</Badge>
                  </div>
                  
                  <div className="grid gap-6">
                    {categoryTables.map((tableName) => {
                      const table = databaseTables[tableName];
                      if (!table) return null;
                      
                      return (
                        <Card key={tableName} className="overflow-hidden">
                          <CardHeader className="bg-gray-50">
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2">
                                <Database className="w-5 h-5" />
                                {tableName}
                              </CardTitle>
                              <Badge variant="outline">
                                {table.fields.length} fields
                              </Badge>
                            </div>
                            <p className="text-gray-600">{table.description}</p>
                          </CardHeader>
                          
                          <CardContent className="p-0">
                            <div className="overflow-x-auto">
                              <table className="w-full">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="text-left p-3 font-semibold">Field</th>
                                    <th className="text-left p-3 font-semibold">Type</th>
                                    <th className="text-left p-3 font-semibold">Nullable</th>
                                    <th className="text-left p-3 font-semibold">Default</th>
                                    <th className="text-left p-3 font-semibold">Constraints</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {table.fields.map((field, index) => (
                                    <tr key={index} className="border-t hover:bg-gray-50">
                                      <td className="p-3">
                                        <div className="flex items-center gap-2">
                                          <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                            {field.name}
                                          </code>
                                          {field.primary && (
                                            <Badge variant="default" className="text-xs">
                                              PK
                                            </Badge>
                                          )}
                                          {field.foreignKey && (
                                            <Badge variant="secondary" className="text-xs">
                                              FK
                                            </Badge>
                                          )}
                                        </div>
                                      </td>
                                      <td className="p-3">
                                        <Badge variant="outline" className="font-mono">
                                          {field.type}
                                        </Badge>
                                      </td>
                                      <td className="p-3">
                                        <Badge variant={field.nullable ? "secondary" : "destructive"}>
                                          {field.nullable ? 'Yes' : 'No'}
                                        </Badge>
                                      </td>
                                      <td className="p-3 font-mono text-sm">
                                        {field.default || '-'}
                                      </td>
                                      <td className="p-3">
                                        {field.foreignKey && (
                                          <Badge variant="outline" className="text-xs">
                                            → {field.foreignKey}
                                          </Badge>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>

        {/* No results message */}
        {categories.every(category => 
          category.tables.filter(tableName =>
            tableName.toLowerCase().includes(searchTerm.toLowerCase()) && databaseTables[tableName]
          ).length === 0
        ) && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No tables found</h3>
            <p className="text-gray-600">Try adjusting your search term or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseDocumentation;
