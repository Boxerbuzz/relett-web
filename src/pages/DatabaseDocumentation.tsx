
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Database, Users, Building, CreditCard, MessageSquare, Shield, Brain, TrendingUp, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DatabaseDocumentation = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center">
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
            <h1 className="text-xl font-bold text-gray-900">Database Architecture Documentation</h1>
            <p className="text-sm text-gray-600">Comprehensive guide to all database tables and relationships</p>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Database className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Database Architecture Documentation</h1>
          <p className="text-gray-600">Comprehensive guide to all database tables, relationships, and business logic</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="blockchain">Blockchain</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Database Architecture Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Our real estate platform database consists of 70+ interconnected tables organized into 8 logical domains. 
                Each domain serves specific business functions while maintaining referential integrity across the system.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <Users className="w-8 h-8 text-blue-600 mb-2" />
                  <h3 className="font-semibold">User Management</h3>
                  <p className="text-sm text-gray-600">Authentication, profiles, roles, verification</p>
                  <Badge variant="outline" className="mt-2">12 tables</Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <Building className="w-8 h-8 text-green-600 mb-2" />
                  <h3 className="font-semibold">Property System</h3>
                  <p className="text-sm text-gray-600">Listings, documents, images, valuations</p>
                  <Badge variant="outline" className="mt-2">15 tables</Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <CreditCard className="w-8 h-8 text-purple-600 mb-2" />
                  <h3 className="font-semibold">Financial Layer</h3>
                  <p className="text-sm text-gray-600">Payments, investments, tokenization</p>
                  <Badge variant="outline" className="mt-2">18 tables</Badge>
                </div>
                <div className="p-4 border rounded-lg">
                  <MessageSquare className="w-8 h-8 text-orange-600 mb-2" />
                  <h3 className="font-semibold">Communication</h3>
                  <p className="text-sm text-gray-600">Chat, notifications, feedback</p>
                  <Badge variant="outline" className="mt-2">8 tables</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  User Management & Authentication System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-lg">users</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Core user registry storing essential profile information and account status. 
                      This is the central hub that all user-related data references.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> id (UUID), email, first_name, last_name, phone, avatar, verification_status, is_active, has_setup
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>→ user_profiles:</strong> One-to-one extended profile data (addresses, demographics)</li>
                      <li><strong>→ user_roles:</strong> One-to-many role assignments (admin, agent, investor, etc.)</li>
                      <li><strong>→ properties:</strong> One-to-many property ownership</li>
                      <li><strong>→ notifications:</strong> One-to-many notification delivery</li>
                      <li><strong>→ accounts:</strong> One-to-many financial accounts</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Separates core identity from extended profile data for performance. 
                      The verification_status drives access control across the platform.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-bold text-lg">user_profiles</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Extended user information including demographics, addresses, and personal details 
                      that don't need to be loaded with every authentication check.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), date_of_birth, gender, address (JSONB), nationality, state_of_origin, lga, middle_name
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ user_profiles:</strong> One-to-one via user_id foreign key</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Normalizes data by separating frequently accessed (users) from 
                      occasionally accessed (profiles) information. Critical for KYC compliance in Nigerian market.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-bold text-lg">user_roles</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Multi-role system allowing users to have different access levels and capabilities. 
                      Supports role-based access control (RBAC) with temporal permissions.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), role (ENUM: admin, verifier, agent, landowner, investor), is_active, expires_at, assigned_by
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ user_roles:</strong> One-to-many (users can have multiple roles)</li>
                      <li><strong>→ verification_tasks:</strong> Drives which verification tasks users can access</li>
                      <li><strong>→ properties:</strong> Controls property creation and management permissions</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Enables flexible permission system where a user can be both an investor 
                      and a landowner, or have temporary admin access. Critical for marketplace trust and compliance.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="font-bold text-lg">identity_verifications</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> KYC (Know Your Customer) compliance system storing identity document verification 
                      results from Nigerian identity systems (NIN, BVN) and international documents.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), identity_type (ENUM), identity_number, full_name, verification_status, verification_provider, verification_response (JSONB)
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ identity_verifications:</strong> One-to-many (multiple ID types per user)</li>
                      <li><strong>→ kyc_documents:</strong> Links to supporting document uploads</li>
                      <li><strong>→ identity_audit_logs:</strong> Audit trail for verification attempts</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Nigerian real estate law requires verified identity for property transactions. 
                      Supports multiple verification providers (Paystack, Flutterwave identity APIs) with fallback options.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-red-500 pl-4">
                    <h3 className="font-bold text-lg">kyc_documents</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Secure storage and verification tracking for identity documents (passports, driver's licenses, utility bills). 
                      Includes automated verification via AI/ML services.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), document_type, file_url, file_hash, verification_status, extracted_data (JSONB), verification_response (JSONB)
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ kyc_documents:</strong> One-to-many document submissions</li>
                      <li><strong>identity_verifications ←→ kyc_documents:</strong> Cross-validation between documents and identity checks</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> File hashing prevents document tampering. Extracted_data stores OCR results 
                      for address verification. Critical for anti-money laundering (AML) compliance.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-teal-500 pl-4">
                    <h3 className="font-bold text-lg">verifier_credentials</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Professional credential system for users who can verify properties and documents. 
                      Stores surveyor licenses, legal credentials, and government authority permissions.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), verifier_type (ENUM), license_number, issuing_authority, expiry_date, reputation_score, total_verifications
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ verifier_credentials:</strong> One-to-many (professionals can have multiple credentials)</li>
                      <li><strong>→ verification_tasks:</strong> Determines which tasks verifiers can be assigned</li>
                      <li><strong>→ property_documents:</strong> Links verifier to document verification actions</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Reputation scoring system builds trust. Automatic license expiry checking 
                      prevents invalid verifications. Essential for legal compliance in property verification.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h3 className="font-bold text-lg">user_preferences</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> User-customizable settings for notifications, location preferences, investment interests, 
                      and platform behavior. Enables personalized user experience.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), notification_channels (JSONB), coordinates (JSONB), interest, digest (JSONB), quiet_hours
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ user_preferences:</strong> One-to-one preference storage</li>
                      <li><strong>→ notification_preferences:</strong> Cross-references with detailed notification settings</li>
                      <li><strong>→ saved_searches:</strong> Influences search recommendation algorithms</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Location data drives property recommendations. Interest categories 
                      customize investment opportunities. Critical for user retention and engagement.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-pink-500 pl-4">
                    <h3 className="font-bold text-lg">user_devices</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Device fingerprinting and trust management for security. Tracks user devices 
                      for fraud prevention and enables trusted device features.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), device_fingerprint, device_type, browser, ip_address (INET), location (JSONB), is_trusted
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ user_devices:</strong> One-to-many device registrations</li>
                      <li><strong>→ audit_trails:</strong> Device information logged with all actions</li>
                      <li><strong>→ identity_audit_logs:</strong> Enhanced security tracking</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Trusted devices can bypass certain verification steps. 
                      Location tracking helps detect suspicious activity. Essential for financial transaction security.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Property Management System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-lg">properties</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Central property registry containing all listings with comprehensive details, 
                      pricing, location data, and status tracking. Core entity driving the entire marketplace.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> id, user_id (FK), title, description, location (JSONB), price (JSONB), specification (JSONB), 
                      category, type, status, is_verified, is_tokenized, views, likes, favorites, ratings
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ properties:</strong> One-to-many ownership</li>
                      <li><strong>→ property_images:</strong> One-to-many media gallery</li>
                      <li><strong>→ property_documents:</strong> One-to-many legal documents</li>
                      <li><strong>→ property_valuations:</strong> One-to-many valuation history</li>
                      <li><strong>→ tokenized_properties:</strong> One-to-one tokenization</li>
                      <li><strong>→ land_titles:</strong> Many-to-one land registry connection</li>
                      <li><strong>→ reservations, rentals, inspections:</strong> One-to-many activity tracking</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> JSONB fields enable flexible property specifications without schema changes. 
                      Status workflow controls visibility and transaction availability. View/like counters drive recommendation algorithms.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-bold text-lg">property_images</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Media management system for property photos, virtual tours, and visual content. 
                      Optimized for fast loading with thumbnail generation and categorization.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> property_id (FK), url, thumbnail_url, category, sort_order, is_primary, ratio
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>properties ←→ property_images:</strong> One-to-many image gallery</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Sort_order enables custom image arrangement. Category field supports 
                      different image types (exterior, interior, amenities). Primary image drives listing previews.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-bold text-lg">property_documents</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Legal document storage and verification system for property ownership papers, 
                      certificates, surveys, and government approvals required for legitimate property transactions.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> property_id (FK), land_title_id (FK), document_type (ENUM), document_name, 
                      file_url, document_hash, status, verified_by, verification_notes
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>properties ←→ property_documents:</strong> One-to-many document storage</li>
                      <li><strong>land_titles ←→ property_documents:</strong> One-to-many land registry documents</li>
                      <li><strong>→ document_verification_requests:</strong> One-to-many verification workflow</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Document hashing prevents tampering. Verification workflow ensures 
                      legal compliance. Different document types require different verification processes.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="font-bold text-lg">property_valuations</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Professional and AI-powered property valuation system maintaining historical 
                      pricing data, market comparisons, and valuation methodology tracking for investment decisions.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> property_id (FK), land_title_id (FK), valuer_id (FK), valuation_amount, 
                      valuation_method, market_conditions (JSONB), comparable_properties (JSONB), valid_until
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>properties ←→ property_valuations:</strong> One-to-many valuation history</li>
                      <li><strong>land_titles ←→ property_valuations:</strong> One-to-many land-specific valuations</li>
                      <li><strong>users ←→ property_valuations:</strong> Many-to-one (valuer relationship)</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Multiple valuations create confidence intervals. Historical data enables 
                      market trend analysis. Expiry dates ensure fresh valuations for major transactions.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-red-500 pl-4">
                    <h3 className="font-bold text-lg">land_titles</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Official land registry system connecting to Nigerian land administration. 
                      Stores government-issued land titles, coordinates, ownership history, and legal status.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> title_number, owner_id (FK), coordinates (JSONB), area_sqm, location_address, 
                      state, lga, land_use, acquisition_method, status, blockchain_hash
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ land_titles:</strong> Many-to-one ownership</li>
                      <li><strong>→ properties:</strong> One-to-many property development</li>
                      <li><strong>→ tokenized_properties:</strong> One-to-one tokenization eligibility</li>
                      <li><strong>→ legal_agreements:</strong> One-to-many contracts and leases</li>
                      <li><strong>→ compliance_records:</strong> One-to-many regulatory compliance</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Land titles are the foundation of property ownership in Nigeria. 
                      Blockchain integration provides immutable ownership records. Critical for legal property transactions.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-teal-500 pl-4">
                    <h3 className="font-bold text-lg">property_creation_workflows</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Multi-step property listing creation process tracking user progress through 
                      property details, documents, media upload, and verification steps.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), property_id (FK), current_step, step_data (JSONB), status
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ property_creation_workflows:</strong> One-to-many workflow tracking</li>
                      <li><strong>properties ←→ property_creation_workflows:</strong> One-to-one completion tracking</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Prevents incomplete listings. Saves user progress for complex property submissions. 
                      Step_data enables resuming interrupted workflows.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h3 className="font-bold text-lg">property_favorites, property_likes, property_views</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> User engagement tracking system measuring property interest through favorites, 
                      likes, and view analytics. Drives recommendation algorithms and market insights.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), property_id (FK), created_at, view_duration, referrer, session_data
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ favorites/likes/views:</strong> One-to-many engagement tracking</li>
                      <li><strong>properties ←→ favorites/likes/views:</strong> One-to-many popularity metrics</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Anonymous views vs. authenticated interactions provide different insights. 
                      Time-based analytics show market trends. Critical for search ranking and recommendations.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-pink-500 pl-4">
                    <h3 className="font-bold text-lg">property_reviews, property_inquiries</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> User feedback and communication system enabling property reviews, ratings, 
                      and inquiry management between potential buyers/renters and property owners/agents.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), property_id (FK), rating, comment, inquiry_type, status, response_count
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ reviews/inquiries:</strong> One-to-many user interactions</li>
                      <li><strong>properties ←→ reviews/inquiries:</strong> One-to-many property feedback</li>
                      <li><strong>→ conversations:</strong> Inquiries can escalate to chat conversations</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Reviews build property reputation. Inquiries drive lead generation. 
                      Status tracking ensures timely responses. Critical for marketplace trust.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Financial & Investment Layer
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-lg">accounts</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> User financial account system managing wallet balances, loyalty points, 
                      and account status. Foundation for all financial transactions within the platform.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), type, amount, points, currency, status
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ accounts:</strong> One-to-many account management</li>
                      <li><strong>→ payments:</strong> One-to-many transaction processing</li>
                      <li><strong>→ withdrawal_requests:</strong> One-to-many cash-out operations</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Separate accounts enable multi-currency support. Points system drives 
                      user engagement. Account status controls transaction permissions.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-bold text-lg">payments</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Universal payment processing system handling property purchases, rent payments, 
                      service fees, and commission transactions across multiple payment providers.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), agent_id (FK), property_id (FK), amount, currency, type, 
                      status, method, provider, reference, related_id, related_type
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ payments:</strong> One-to-many payment history</li>
                      <li><strong>properties ←→ payments:</strong> One-to-many property transactions</li>
                      <li><strong>→ reservations, rentals, inspections:</strong> One-to-one payment linking</li>
                      <li><strong>→ payment_sessions:</strong> One-to-one session tracking</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Related_id/related_type enables polymorphic payment associations. 
                      Multi-provider support ensures payment reliability. Critical for marketplace revenue.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-bold text-lg">tokenized_properties</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Property tokenization system enabling fractional ownership through blockchain tokens. 
                      Converts real estate into investable digital assets with smart contract integration.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> land_title_id (FK), property_id (FK), token_symbol, token_name, total_supply, 
                      token_price, blockchain_network, hedera_token_id, investment_terms, expected_roi
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>land_titles ←→ tokenized_properties:</strong> One-to-one tokenization</li>
                      <li><strong>properties ←→ tokenized_properties:</strong> One-to-one property backing</li>
                      <li><strong>→ token_holdings:</strong> One-to-many investor ownership</li>
                      <li><strong>→ revenue_distributions:</strong> One-to-many dividend payments</li>
                      <li><strong>→ investment_groups:</strong> One-to-one group investment</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Enables property investment with lower barriers to entry. 
                      Smart contracts automate revenue distribution. Revolutionary for real estate accessibility.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="font-bold text-lg">token_holdings</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Individual investor token ownership records tracking purchase history, 
                      current holdings, and investment performance for each tokenized property.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> tokenized_property_id (FK), holder_id (FK), tokens_owned, purchase_price_per_token, 
                      total_investment, acquisition_date, vesting_schedule (JSONB)
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>tokenized_properties ←→ token_holdings:</strong> One-to-many ownership records</li>
                      <li><strong>users ←→ token_holdings:</strong> One-to-many investment portfolio</li>
                      <li><strong>→ dividend_payments:</strong> One-to-many revenue sharing</li>
                      <li><strong>→ token_transactions:</strong> One-to-many trading history</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Tracks fractional ownership percentages. Vesting schedules prevent 
                      immediate token dumping. Essential for investment transparency and compliance.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-red-500 pl-4">
                    <h3 className="font-bold text-lg">revenue_distributions, dividend_payments</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Automated revenue sharing system distributing property income (rent, sales proceeds) 
                      to token holders based on ownership percentages. Includes blockchain consensus tracking.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> tokenized_property_id (FK), total_revenue, revenue_per_token, distribution_type, 
                      recipient_id (FK), amount, payment_method, status, hedera_transaction_id
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>tokenized_properties ←→ revenue_distributions:</strong> One-to-many distribution events</li>
                      <li><strong>revenue_distributions ←→ dividend_payments:</strong> One-to-many individual payments</li>
                      <li><strong>token_holdings ←→ dividend_payments:</strong> One-to-many payment history</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Automated calculations based on token ownership. Hedera consensus 
                      ensures transparent, immutable payment records. Core value proposition for tokenized properties.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-teal-500 pl-4">
                    <h3 className="font-bold text-lg">investment_groups, investment_discussions</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Collaborative investment system enabling multiple investors to pool resources 
                      for larger property purchases. Includes group communication and decision-making tools.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> tokenized_property_id (FK), lead_investor_id (FK), name, target_amount, 
                      current_amount, minimum_investment, status, investment_terms (JSONB)
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>tokenized_properties ←→ investment_groups:</strong> One-to-one group formation</li>
                      <li><strong>users ←→ investment_groups:</strong> Many-to-one leadership</li>
                      <li><strong>→ investment_discussions:</strong> One-to-many group communications</li>
                      <li><strong>→ investment_polls:</strong> One-to-many group decisions</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Enables access to high-value properties through group buying power. 
                      Democratic decision-making through polls. Critical for community-driven investment.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h3 className="font-bold text-lg">investment_polls, poll_options, poll_votes</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Blockchain-backed voting system for investment group decisions including 
                      property management, major renovations, and sale timing with Hedera consensus integration.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> investment_group_id (FK), title, poll_type, voting_power_basis, 
                      consensus_threshold, hedera_topic_id, voter_id (FK), voting_power, hedera_transaction_id
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>investment_groups ←→ investment_polls:</strong> One-to-many decision making</li>
                      <li><strong>investment_polls ←→ poll_options:</strong> One-to-many voting choices</li>
                      <li><strong>poll_options ←→ poll_votes:</strong> One-to-many vote casting</li>
                      <li><strong>users ←→ poll_votes:</strong> One-to-many voting participation</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Voting power based on token ownership ensures proportional influence. 
                      Hedera consensus provides immutable voting records. Essential for transparent governance.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-pink-500 pl-4">
                    <h3 className="font-bold text-lg">escrow_accounts, transaction_fees</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Secure transaction facilitation with escrow protection and transparent fee 
                      calculation for property purchases, ensuring buyer and seller protection.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> buyer_id (FK), seller_id (FK), property_id (FK), escrow_amount, 
                      conditions (JSONB), release_conditions_met, fee_type, percentage_fee, base_fee
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ escrow_accounts:</strong> Many-to-one buyer/seller relationships</li>
                      <li><strong>properties ←→ escrow_accounts:</strong> One-to-many transaction protection</li>
                      <li><strong>→ payments:</strong> One-to-many escrow funding and release</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Automated escrow release based on condition fulfillment. 
                      Tiered fee structure encourages larger transactions. Critical for transaction trust.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="communication">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Communication & Engagement System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-lg">conversations, messages</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Real-time messaging system facilitating communication between users, agents, 
                      and property stakeholders with support for multimedia, property sharing, and conversation management.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> admin_id (FK), participants (UUID[]), type, activity_type, sender_id (FK), 
                      content, message_type, attachment_url, property_id (FK), reactions (JSONB)
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ conversations:</strong> Many-to-many participation</li>
                      <li><strong>conversations ←→ messages:</strong> One-to-many message history</li>
                      <li><strong>properties ←→ messages:</strong> One-to-many property discussions</li>
                      <li><strong>→ reservations, rentals, inspections:</strong> One-to-one conversation linking</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Activity-typed conversations organize property-related discussions. 
                      Property references enable contextual communication. Essential for customer service and sales.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-bold text-lg">notifications, notification_preferences</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Multi-channel notification system with user preferences supporting email, 
                      SMS, push notifications, and in-app alerts for property updates, transactions, and system events.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), type (ENUM), title, message, metadata (JSONB), 
                      action_url, channel, delivery_status (JSONB), notification_types (JSONB), quiet_hours
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ notifications:</strong> One-to-many notification delivery</li>
                      <li><strong>users ←→ notification_preferences:</strong> One-to-one preference settings</li>
                      <li><strong>→ notification_deliveries:</strong> One-to-many delivery tracking</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Preference-based filtering prevents notification fatigue. 
                      Multi-channel delivery ensures critical messages reach users. Crucial for user engagement.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-bold text-lg">feedbacks, contacts_us</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> User feedback and support system collecting platform improvement suggestions, 
                      bug reports, and customer service inquiries with attachment support and resolution tracking.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), type, title, description, attachments (TEXT[]), 
                      is_anonymous, resolved_at, first_name, last_name, email, phone_number
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ feedbacks:</strong> One-to-many feedback submissions</li>
                      <li><strong>→ notifications:</strong> Feedback responses generate notifications</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Anonymous feedback encourages honest input. Resolution tracking 
                      ensures customer satisfaction. Critical for platform improvement and support.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="font-bold text-lg">reservations, rentals, inspections</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Activity management system handling property reservations, rental agreements, 
                      and inspection scheduling with integrated communication and payment processing.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), agent_id (FK), property_id (FK), conversation_id (FK), 
                      status, payment_id (FK), from_date, to_date, adults, children, mode, notes
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ activities:</strong> One-to-many activity booking</li>
                      <li><strong>properties ←→ activities:</strong> One-to-many property engagement</li>
                      <li><strong>conversations ←→ activities:</strong> One-to-one communication threading</li>
                      <li><strong>payments ←→ activities:</strong> One-to-one payment processing</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Integrated workflows reduce friction in property transactions. 
                      Status tracking enables automated follow-ups. Essential for converting leads to transactions.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-red-500 pl-4">
                    <h3 className="font-bold text-lg">typing_indicators, message_reactions, message_attachments</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Real-time chat enhancement features providing typing indicators, emoji reactions, 
                      and file sharing capabilities to improve user communication experience.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> conversation_id (FK), user_id (FK), last_typed_at, message_id (FK), 
                      emoji, url, mime_type, size, name
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>conversations ←→ typing_indicators:</strong> One-to-many real-time status</li>
                      <li><strong>messages ←→ message_reactions:</strong> One-to-many emoji responses</li>
                      <li><strong>messages ←→ message_attachments:</strong> One-to-one file sharing</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Real-time features improve user engagement. File sharing enables 
                      document exchange during negotiations. Enhances modern messaging experience.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security & Compliance System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-lg">audit_trails, identity_audit_logs</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Comprehensive activity logging system tracking all user actions, data changes, 
                      and system events for security monitoring, compliance, and forensic investigation.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), resource_type, resource_id, action, old_values (JSONB), 
                      new_values (JSONB), ip_address (INET), user_agent, flagged, risk_score
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ audit_trails:</strong> One-to-many activity tracking</li>
                      <li><strong>→ All tables:</strong> Polymorphic logging via resource_type/resource_id</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Immutable audit trail ensures compliance with financial regulations. 
                      Risk scoring enables automated fraud detection. Critical for regulatory compliance and security.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-bold text-lg">aml_checks, sanctions_screening</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Anti-Money Laundering (AML) and sanctions compliance system performing 
                      automated screening against global watchlists and suspicious activity detection.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), check_type, provider, request_payload (JSONB), 
                      response_payload (JSONB), risk_level, risk_score, alerts (JSONB), matches_found (JSONB)
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ aml_checks:</strong> One-to-many compliance screening</li>
                      <li><strong>→ payments:</strong> AML checks required for large transactions</li>
                      <li><strong>→ identity_verifications:</strong> Cross-validation with identity data</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Automated screening prevents prohibited users from transacting. 
                      Multiple provider support ensures comprehensive coverage. Mandatory for financial compliance.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-bold text-lg">api_keys</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> API access management system providing secure authentication for external 
                      integrations with rate limiting, permission controls, and usage monitoring.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), name, key_hash, permissions (JSONB), is_active, 
                      rate_limit_per_minute, usage_count, webhook_url, webhook_secret
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ api_keys:</strong> One-to-many API access</li>
                      <li><strong>→ audit_trails:</strong> API usage logging</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Granular permissions control API access scope. Rate limiting prevents abuse. 
                      Webhook integration enables real-time data synchronization. Essential for platform ecosystem.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="font-bold text-lg">backup_recovery</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> System backup and disaster recovery management tracking backup schedules, 
                      encryption status, recovery testing, and retention policies for business continuity.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> backup_type, backup_location, backup_scope, started_at, completed_at, 
                      backup_size_bytes, encryption_enabled, recovery_tested, retention_until
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>→ All tables:</strong> Backup scope determination</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Automated backup verification ensures data recoverability. 
                      Encryption protects sensitive data. Critical for business continuity and compliance.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-red-500 pl-4">
                    <h3 className="font-bold text-lg">system_notifications</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Platform-wide notification system for maintenance announcements, security alerts, 
                      regulatory updates, and system status communications with targeted audience control.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> created_by (FK), title, message, notification_type, severity, 
                      target_audience, target_users (UUID[]), display_from, display_until, action_required
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ system_notifications:</strong> One-to-many administrative communications</li>
                      <li><strong>→ notifications:</strong> System notifications generate individual user notifications</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Severity levels control notification prominence. Targeted delivery 
                      ensures relevant communication. Essential for platform governance and user safety.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blockchain">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Blockchain & Smart Contract Integration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-lg">smart_contracts</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Smart contract management system tracking deployed contracts on Hedera blockchain 
                      for property tokenization, automated payments, and trustless transactions.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> contract_address, contract_type, deployer_id (FK), network, abi (JSONB), 
                      bytecode, deployment_transaction_hash, related_property_id (FK), status
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ smart_contracts:</strong> One-to-many contract deployment</li>
                      <li><strong>properties ←→ smart_contracts:</strong> One-to-many property contracts</li>
                      <li><strong>tokenized_properties ←→ smart_contracts:</strong> One-to-one tokenization contracts</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Contract verification ensures trustless operation. ABI storage enables 
                      contract interaction. Revolutionary for transparent, automated real estate transactions.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-bold text-lg">token_transactions</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Blockchain transaction tracking for token transfers, minting, burning, 
                      and splits with Hedera consensus timestamps and transaction verification.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> tokenized_property_id (FK), from_holder (FK), to_holder (FK), 
                      token_amount, transaction_type (ENUM), blockchain_hash, hedera_transaction_id, status
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>tokenized_properties ←→ token_transactions:</strong> One-to-many transaction history</li>
                      <li><strong>users ←→ token_transactions:</strong> Many-to-one trading activity</li>
                      <li><strong>token_holdings ←→ token_transactions:</strong> One-to-many ownership changes</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Immutable transaction records ensure ownership transparency. 
                      Hedera integration provides fast, low-cost consensus. Essential for token trading trust.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-bold text-lg">wallets</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Cryptocurrency wallet management system supporting Hedera HBAR and custom tokens 
                      with secure key storage and transaction signing capabilities.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), address, wallet_type, encrypted_private_key, public_key, 
                      balance_hbar, is_primary, is_verified, metadata (JSONB)
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ wallets:</strong> One-to-many wallet management</li>
                      <li><strong>→ token_transactions:</strong> Wallet addresses in transaction records</li>
                      <li><strong>→ payments:</strong> Crypto payment processing</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Multiple wallet support enables user choice. Encrypted storage ensures security. 
                      Primary wallet designation simplifies user experience.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="font-bold text-lg">legal_agreements, compliance_records</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Legal document blockchain anchoring system storing agreement hashes and 
                      compliance records on immutable ledger for dispute resolution and regulatory compliance.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> land_title_id (FK), agreement_type (ENUM), parties (JSONB), terms (JSONB), 
                      blockchain_record, compliance_type (ENUM), authority, reference_number
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>land_titles ←→ legal_agreements:</strong> One-to-many contract tracking</li>
                      <li><strong>land_titles ←→ compliance_records:</strong> One-to-many regulatory compliance</li>
                      <li><strong>→ smart_contracts:</strong> Automated contract execution</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Blockchain anchoring prevents document tampering. Automated compliance 
                      monitoring ensures regulatory adherence. Critical for legal property transactions.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Analytics & Intelligence System
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <h3 className="font-bold text-lg">market_analytics</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Market intelligence system analyzing property prices, trends, and market conditions 
                      across different locations and property types for investment decision support.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> location_id, property_type, metric_type, metric_value, calculation_date, 
                      sample_size, confidence_level, currency, metadata (JSONB)
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>→ properties:</strong> Market data influences property recommendations</li>
                      <li><strong>→ property_valuations:</strong> Market trends inform valuation models</li>
                      <li><strong>→ investment_analytics:</strong> Macro trends affect individual investments</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Aggregated market data provides investment insights. Confidence levels 
                      indicate data reliability. Essential for informed investment decisions.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-green-500 pl-4">
                    <h3 className="font-bold text-lg">investment_analytics, investment_tracking</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Individual investment performance tracking system calculating ROI, dividend yields, 
                      and portfolio analytics for tokenized property investments.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), tokenized_property_id (FK), metric_type, metric_value, 
                      current_value, roi_percentage, total_dividends_received, last_dividend_date
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ investment_tracking:</strong> One-to-many portfolio tracking</li>
                      <li><strong>tokenized_properties ←→ investment_analytics:</strong> One-to-many performance metrics</li>
                      <li><strong>token_holdings ←→ investment_tracking:</strong> One-to-one performance tracking</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Real-time ROI calculation drives investment decisions. Historical tracking 
                      enables performance comparison. Critical for investor satisfaction and retention.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-purple-500 pl-4">
                    <h3 className="font-bold text-lg">ai_property_valuations</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> AI-powered property valuation system using machine learning models to estimate 
                      property values based on location, features, market conditions, and comparable sales.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> property_id (FK), user_id (FK), ai_estimated_value, confidence_score, 
                      ai_model, valuation_factors (JSONB), market_comparisons (JSONB)
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>properties ←→ ai_property_valuations:</strong> One-to-many AI valuations</li>
                      <li><strong>users ←→ ai_property_valuations:</strong> One-to-many valuation requests</li>
                      <li><strong>→ property_valuations:</strong> Cross-validation with professional valuations</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> AI provides instant, cost-effective valuations. Confidence scoring indicates 
                      reliability. Enables rapid property assessment for investment decisions.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-orange-500 pl-4">
                    <h3 className="font-bold text-lg">portfolio_allocations</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Investment portfolio management system tracking user asset allocation across 
                      property types, locations, and investment strategies with rebalancing recommendations.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), allocation_type, category, current_percentage, current_value, 
                      target_percentage, rebalance_threshold, last_rebalanced_at
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ portfolio_allocations:</strong> One-to-many allocation tracking</li>
                      <li><strong>→ token_holdings:</strong> Portfolio composition analysis</li>
                      <li><strong>→ investment_tracking:</strong> Performance against allocation targets</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Automatic rebalancing suggestions optimize portfolio performance. 
                      Threshold monitoring prevents overexposure. Essential for sophisticated investment management.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-red-500 pl-4">
                    <h3 className="font-bold text-lg">financial_reports</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> Automated financial reporting system generating investment summaries, tax documents, 
                      and performance reports for users and regulatory compliance.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), report_type, period_start, period_end, data (JSONB), 
                      generated_at, status, metadata (JSONB)
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ financial_reports:</strong> One-to-many report generation</li>
                      <li><strong>→ investment_tracking:</strong> Portfolio data aggregation</li>
                      <li><strong>→ dividend_payments:</strong> Income reporting</li>
                      <li><strong>→ payments:</strong> Transaction history</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Automated report generation saves time and ensures accuracy. 
                      Multiple report types serve different purposes. Critical for tax compliance and investment tracking.
                    </p>
                  </div>

                  <Separator />

                  <div className="border-l-4 border-teal-500 pl-4">
                    <h3 className="font-bold text-lg">saved_searches</h3>
                    <p className="text-gray-700 mb-2">
                      <strong>Purpose:</strong> User search preference system storing search criteria and enabling automated 
                      alerts when matching properties become available, improving user experience and engagement.
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Key Fields:</strong> user_id (FK), name, search_criteria (JSONB), alert_enabled, last_run_at
                    </p>
                    <p className="text-gray-700 mb-2">
                      <strong>Relationships:</strong>
                    </p>
                    <ul className="list-disc list-inside ml-4 space-y-1 text-sm">
                      <li><strong>users ←→ saved_searches:</strong> One-to-many search saving</li>
                      <li><strong>→ notifications:</strong> Search alerts generate notifications</li>
                      <li><strong>→ properties:</strong> Matching algorithm against property database</li>
                    </ul>
                    <p className="text-gray-700">
                      <strong>Business Logic:</strong> Saved searches reduce user friction. Automated alerts drive engagement. 
                      Search patterns inform recommendation algorithms. Essential for user retention.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default DatabaseDocumentation;
