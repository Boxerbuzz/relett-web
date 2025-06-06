import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Database, Code, Webhook, ArrowLeft, Twitter, Facebook, 
  Instagram, Linkedin, Mail, Phone, MapPin, Key, Server, Activity,
  Globe, FileText, Settings, Zap, Shield, Users, Lock, Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Documentation = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");

  const tableOfContents = [
    { id: "overview", title: "Overview", icon: BookOpen },
    { id: "database-schema", title: "Database Schema", icon: Database },
    { id: "api-endpoints", title: "API Endpoints", icon: Code },
    { id: "edge-functions", title: "Edge Functions", icon: Zap },
    { id: "webhooks", title: "Webhooks", icon: Webhook },
    { id: "authentication", title: "Authentication", icon: Key },
    { id: "real-time", title: "Real-time Features", icon: Activity },
    { id: "file-storage", title: "File Storage", icon: Server },
    { id: "security", title: "Security", icon: Shield },
    { id: "user-roles", title: "User Roles & Permissions", icon: Users },
    { id: "compliance", title: "Compliance Features", icon: Lock },
    { id: "monitoring", title: "Monitoring & Analytics", icon: Eye },
    { id: "deployment", title: "Deployment", icon: Globe },
    { id: "troubleshooting", title: "Troubleshooting", icon: Settings },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with back button */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="ml-4">
            <h1 className="text-xl font-bold text-gray-900">Technical Documentation</h1>
            <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Mobile TOC */}
        <div className="lg:hidden mb-8">
          <Card>
            <CardContent className="p-4">
              <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
              <ScrollArea className="h-40">
                <div className="grid grid-cols-2 gap-2">
                  {tableOfContents.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`flex items-center gap-2 px-2 py-1 text-xs rounded transition-colors text-left ${
                          activeSection === item.id 
                            ? "bg-blue-50 text-blue-700" 
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Desktop layout with sidebar */}
        <div className="flex gap-8">
          {/* Table of Contents Sidebar - Fixed on large screens */}
          <aside className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
                  <nav className="space-y-2">
                    {tableOfContents.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => scrollToSection(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                            activeSection === item.id 
                              ? "bg-blue-50 text-blue-700 border-l-4 border-blue-500" 
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <Icon className="h-4 w-4 flex-shrink-0" />
                          <span>{item.title}</span>
                        </button>
                      );
                    })}
                  </nav>
                </CardContent>
              </Card>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 space-y-8">
            
            {/* Overview */}
            <section id="overview">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">Technical Overview</h2>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                      Terra Vault is built on a modern, scalable architecture using React, TypeScript, Supabase, 
                      and the Hedera blockchain network. This documentation provides comprehensive technical details 
                      for developers working with our platform.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-3">Frontend Stack</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• React 18 with TypeScript</li>
                          <li>• Vite for build tooling</li>
                          <li>• Tailwind CSS for styling</li>
                          <li>• Shadcn/ui component library</li>
                          <li>• React Query for state management</li>
                          <li>• React Router for navigation</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-3">Backend Services</h3>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Supabase for database and auth</li>
                          <li>• Edge Functions for serverless logic</li>
                          <li>• Real-time subscriptions</li>
                          <li>• Row Level Security (RLS)</li>
                          <li>• Hedera blockchain integration</li>
                          <li>• Third-party API integrations</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Database Schema */}
            <section id="database-schema">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Database className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold">Database Schema</h2>
                  </div>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Data Storage in Our Database</h3>
                      <p className="text-gray-700 mb-4">
                        When you create an account, we automatically populate several database tables with your information:
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="font-medium text-gray-900 mb-3">Main Users Table</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• <strong>Basic Info:</strong> Email, first name, last name, phone number</li>
                          <li>• <strong>Profile Data:</strong> Avatar, bio, user type, verification status</li>
                          <li>• <strong>Account Status:</strong> is_active, is_verified, has_setup flags</li>
                          <li>• <strong>Timestamps:</strong> created_at, updated_at, last login tracking</li>
                        </ul>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="font-medium text-gray-900 mb-3">Related Tables Created Automatically</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• <strong>Accounts:</strong> NGN wallet with 0 balance and points</li>
                          <li>• <strong>User Roles:</strong> Default 'landowner' role assignment</li>
                          <li>• <strong>Notification Preferences:</strong> Email/push settings with defaults</li>
                          <li>• <strong>Portfolio Allocations:</strong> Investment targets by property type and location</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Personal Information Categories</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-3">Identity Information</h4>
                          <ul className="space-y-1 text-sm text-blue-800">
                            <li>• Full name and preferred name</li>
                            <li>• Date of birth and age verification</li>
                            <li>• Nationality and country of residence</li>
                            <li>• Government-issued ID numbers (NIN, BVN, CAC, Passport)</li>
                            <li>• Biometric data for identity verification</li>
                            <li>• Professional qualifications and certifications</li>
                            <li>• Gender and marital status (optional)</li>
                            <li>• State of origin and LGA information</li>
                          </ul>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-3">Contact Information</h4>
                          <ul className="space-y-1 text-sm text-green-800">
                            <li>• Email addresses (primary and secondary)</li>
                            <li>• Phone numbers (mobile and landline)</li>
                            <li>• Physical addresses (residential and business)</li>
                            <li>• Emergency contact information</li>
                            <li>• Preferred communication methods</li>
                            <li>• Language and timezone preferences</li>
                            <li>• Notification delivery preferences</li>
                            <li>• Geographic coordinates for location services</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Financial & Investment Data</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-medium text-purple-900 mb-3">Payment & Banking</h4>
                          <ul className="space-y-1 text-sm text-purple-800">
                            <li>• Bank account details and routing numbers</li>
                            <li>• Credit and debit card information (tokenized)</li>
                            <li>• Digital wallet addresses and public keys</li>
                            <li>• Payment processor account details (Paystack, Stripe)</li>
                            <li>• Transaction history and payment patterns</li>
                            <li>• Payment method preferences and defaults</li>
                            <li>• Currency preferences and exchange rates</li>
                            <li>• Escrow account information</li>
                          </ul>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-medium text-orange-900 mb-3">Investment Portfolio</h4>
                          <ul className="space-y-1 text-sm text-orange-800">
                            <li>• Property token holdings and balances</li>
                            <li>• Investment amounts and purchase prices</li>
                            <li>• Portfolio allocation preferences</li>
                            <li>• Risk tolerance and investment goals</li>
                            <li>• Income verification documents</li>
                            <li>• Tax identification numbers</li>
                            <li>• Investment experience and sophistication</li>
                            <li>• Dividend payment history</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Property & Real Estate Data</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-red-50 p-4 rounded-lg">
                          <h4 className="font-medium text-red-900 mb-3">Property Information</h4>
                          <ul className="space-y-1 text-sm text-red-800">
                            <li>• Property ownership documents and titles</li>
                            <li>• Property photos, videos, and virtual tours</li>
                            <li>• Location coordinates and address information</li>
                            <li>• Property specifications and condition reports</li>
                            <li>• AI-generated valuations and market analysis</li>
                            <li>• Rental history and income records</li>
                            <li>• Property views, likes, and favorites tracking</li>
                            <li>• Maintenance and inspection records</li>
                          </ul>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <h4 className="font-medium text-indigo-900 mb-3">Legal Documents</h4>
                          <ul className="space-y-1 text-sm text-indigo-800">
                            <li>• Land title documents and certificates</li>
                            <li>• Survey plans and boundary maps</li>
                            <li>• Certificates of occupancy</li>
                            <li>• Government consents and approvals</li>
                            <li>• Tax clearance certificates</li>
                            <li>• Insurance policies and claims history</li>
                            <li>• Legal agreements and contracts</li>
                            <li>• Compliance records and permits</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Technical & Usage Data</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Device Information</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Device identifiers and fingerprints</li>
                            <li>• Operating system and browser details</li>
                            <li>• Screen resolution and display settings</li>
                            <li>• Hardware specifications</li>
                            <li>• App version and update history</li>
                            <li>• Network connection details</li>
                          </ul>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Usage Analytics</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Navigation paths and click patterns</li>
                            <li>• Feature usage and interaction data</li>
                            <li>• Session duration and frequency</li>
                            <li>• Search queries and filters applied</li>
                            <li>• Property views and interest tracking</li>
                            <li>• Chat and communication logs</li>
                          </ul>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Security & Audit</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• IP addresses and geolocation data</li>
                            <li>• Login attempts and security events</li>
                            <li>• API request logs and responses</li>
                            <li>• Error logs and performance metrics</li>
                            <li>• Risk scores and fraud detection data</li>
                            <li>• Compliance and audit trail records</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* API Endpoints */}
            <section id="api-endpoints">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Code className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold">API Endpoints</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      Our platform provides a robust API for developers to interact with our services. Here are some 
                      of the key endpoints:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-3">User Management</h3>
                        <ul className="text-sm text-blue-800 space-y-2">
                          <li>• <strong>Register:</strong> Create a new user account</li>
                          <li>• <strong>Login:</strong> Authenticate existing users</li>
                          <li>• <strong>Update Profile:</strong> Modify user information</li>
                          <li>• <strong>Change Password:</strong> Update user password</li>
                          <li>• <strong>Reset Password:</strong> Reset forgotten passwords</li>
                          <li>• <strong>Verify Email:</strong> Confirm user email address</li>
                          <li>• <strong>Deactivate Account:</strong> Disable user account</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-3">Property Management</h3>
                        <ul className="text-sm text-green-800 space-y-2">
                          <li>• <strong>Create Property:</strong> Add new property listings</li>
                          <li>• <strong>Update Property:</strong> Modify existing property details</li>
                          <li>• <strong>Delete Property:</strong> Remove property listings</li>
                          <li>• <strong>Search Properties:</strong> Retrieve property listings</li>
                          <li>• <strong>Get Property Details:</strong> View detailed property information</li>
                          <li>• <strong>Book Property:</strong> Reserve property listings</li>
                          <li>• <strong>Cancel Booking:</strong> Remove property reservations</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-purple-900 mb-3">Investment Management</h3>
                        <ul className="text-sm text-purple-800 space-y-2">
                          <li>• <strong>Invest Property:</strong> Purchase property tokens</li>
                          <li>• <strong>Withdraw Funds:</strong> Transfer funds from property tokens</li>
                          <li>• <strong>Get Investment History:</strong> View transaction history</li>
                          <li>• <strong>Get Portfolio Allocation:</strong> View investment allocations</li>
                          <li>• <strong>Get Income Verification:</strong> Verify income for investments</li>
                          <li>• <strong>Get Tax Identification:</strong> Retrieve tax identification numbers</li>
                        </ul>
                      </div>

                      <div className="bg-orange-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-orange-900 mb-3">Notification System</h3>
                        <ul className="text-sm text-orange-800 space-y-2">
                          <li>• <strong>Send Notification:</strong> Send custom notifications</li>
                          <li>• <strong>Get Notification History:</strong> View notification logs</li>
                          <li>• <strong>Update Notification Preferences:</strong> Modify notification settings</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Edge Functions */}
            <section id="edge-functions">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Server className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">Edge Functions</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      Our platform uses Supabase Edge Functions for serverless backend operations. These functions 
                      handle everything from AI processing to payment verification and notification delivery.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-3">AI Property Valuation</h3>
                        <div className="bg-gray-900 p-4 rounded text-sm">
                          <code className="text-green-400">
                            {`// Example: Call AI valuation function
const { data, error } = await supabase.functions.invoke(
  'ai-property-valuation',
  {
    body: {
      property_id: 'prop-123',
      location: { lat: 6.5244, lng: 3.3792 },
      specifications: {
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1200,
        type: 'apartment'
      }
    }
  }
);

// Response structure
{
  estimated_value: 45000000,
  confidence_score: 0.87,
  market_comparisons: [...],
  valuation_factors: {...}
}`}
                          </code>
                        </div>
                      </div>

                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-3">Payment Processing</h3>
                        <div className="bg-gray-900 p-4 rounded text-sm">
                          <code className="text-green-400">
                            {`// Create payment session
const { data } = await supabase.functions.invoke(
  'create-payment-session',
  {
                            body: {
      amount: 50000,
      currency: 'NGN',
      purpose: 'property_reservation',
      metadata: {
        property_id: 'prop-123',
        user_id: 'user-456'
      }
    }
  }
);

// Verify payment
const verification = await supabase.functions.invoke(
  'verify-payment',
  {
    body: {
      reference: data.reference,
      provider: 'paystack'
    }
  }
);`}
                          </code>
                        </div>
                      </div>

                      <div className="bg-purple-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-purple-900 mb-3">Notification System</h3>
                        <div className="bg-gray-900 p-4 rounded text-sm">
                          <code className="text-green-400">
                            {`// Send notification
const notification = await supabase.functions.invoke(
  'send-booking-notification',
  {
    body: {
      user_id: 'user-123',
      type: 'reservation_confirmed',
      title: 'Reservation Confirmed',
      message: 'Your property reservation has been confirmed',
      metadata: {
        property_id: 'prop-456',
        reservation_id: 'res-789'
      }
    }
  }
);`}
                          </code>
                        </div>
                      </div>

                      <div className="bg-orange-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-orange-900 mb-3">Hedera Token Operations</h3>
                        <div className="bg-gray-900 p-4 rounded text-sm">
                          <code className="text-green-400">
                            {`// Create property token
const tokenCreation = await supabase.functions.invoke(
  'create-hedera-token',
  {
    body: {
      property_id: 'prop-123',
      token_name: 'Lagos Apartment Token',
      token_symbol: 'LAT001',
      total_supply: 1000000,
      token_price: 50
    }
  }
);

// Transfer tokens
const transfer = await supabase.functions.invoke(
  'transfer-hedera-tokens',
  {
    body: {
      token_id: 'token-123',
      from_account: 'sender-account',
      to_account: 'receiver-account',
      amount: 500
    }
  }
);`}
                          </code>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Complete Edge Functions List</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                          <span>• ai-property-valuation</span>
                          <span>• ai-location-analysis</span>
                          <span>• ai-learning-tracker</span>
                          <span>• advanced-search</span>
                          <span>• create-payment-session</span>
                          <span>• create-payment-intent</span>
                          <span>• verify-payment</span>
                          <span>• send-email</span>
                          <span>• send-sms-notification</span>
                          <span>• send-booking-notification</span>
                          <span>• send-chat-notification</span>
                          <span>• process-notification</span>
                          <span>• create-hedera-token</span>
                          <span>• transfer-hedera-tokens</span>
                          <span>• distribute-hedera-revenue</span>
                          <span>• associate-hedera-token</span>
                          <span>• process-token-transaction</span>
                          <span>• tokenize-property</span>
                          <span>• distribute-revenue</span>
                          <span>• scan-file</span>
                          <span>• track-interaction</span>
                          <span>• update-user-defaults</span>
                          <span>• user-created-webhook</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Webhooks */}
            <section id="webhooks">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Webhook className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold">Webhooks</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      Webhooks allow you to receive real-time notifications and updates from our platform. 
                      Here are some common use cases:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-3">Property Updates</h3>
                        <ul className="text-sm text-blue-800 space-y-2">
                          <li>• <strong>Property Created:</strong> Triggered when a new property is added</li>
                          <li>• <strong>Property Updated:</strong> Sent when property details are modified</li>
                          <li>• <strong>Property Deleted:</strong> Notified when a property is removed</li>
                          <li>• <strong>Property Booked:</strong> Alerts when a property reservation is made</li>
                          <li>• <strong>Property Cancelled:</strong> Notifies when a property reservation is canceled</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-3">Investment Events</h3>
                        <ul className="text-sm text-green-800 space-y-2">
                          <li>• <strong>Investment Purchased:</strong> Notified when property tokens are purchased</li>
                          <li>• <strong>Investment Withdrawn:</strong> Alerts when funds are transferred from tokens</li>
                          <li>• <strong>Investment History:</strong> Receives transaction history updates</li>
                          <li>• <strong>Portfolio Allocation:</strong> Notifies of investment allocation changes</li>
                          <li>• <strong>Income Verification:</strong> Updates with income verification status</li>
                          <li>• <strong>Tax Identification:</strong> Receives tax identification updates</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-purple-900 mb-3">Notification Delivery</h3>
                        <ul className="text-sm text-purple-800 space-y-2">
                          <li>• <strong>Notification Sent:</strong> Triggered when a custom notification is sent</li>
                          <li>• <strong>Notification Received:</strong> Alerts when a notification is received</li>
                          <li>• <strong>Notification Updated:</strong> Sent when notification settings are modified</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Authentication */}
            <section id="authentication">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Key className="h-6 w-6 text-red-600" />
                    <h2 className="text-2xl font-bold">Authentication</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      Terra Vault supports multiple authentication methods to ensure secure access to our platform. 
                      Here are the available options:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-3">Email & Password</h3>
                        <ul className="text-sm text-blue-800 space-y-2">
                          <li>• <strong>Register:</strong> Create a new user account using email and password</li>
                          <li>• <strong>Login:</strong> Authenticate existing users with email and password</li>
                          <li>• <strong>Reset Password:</strong> Reset forgotten passwords via email</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-3">Social Media</h3>
                        <ul className="text-sm text-green-800 space-y-2">
                          <li>• <strong>Google:</strong> Sign in with Google account</li>
                          <li>• <strong>Facebook:</strong> Sign in with Facebook account</li>
                          <li>• <strong>Twitter:</strong> Sign in with Twitter account</li>
                          <li>• <strong>LinkedIn:</strong> Sign in with LinkedIn account</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-purple-900 mb-3">Two-Factor Authentication</h3>
                        <ul className="text-sm text-purple-800 space-y-2">
                          <li>• <strong>Enable:</strong> Add an additional layer of security with 2FA</li>
                          <li>• <strong>Disable:</strong> Remove 2FA for enhanced convenience</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Real-time Features */}
            <section id="real-time">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Activity className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold">Real-time Features</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      Our platform provides real-time updates and notifications to keep you informed. 
                      Here are some of the key features:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-3">Property Notifications</h3>
                        <ul className="text-sm text-blue-800 space-y-2">
                          <li>• <strong>Property Created:</strong> Receive notifications when a new property is added</li>
                          <li>• <strong>Property Updated:</strong> Alerts when property details are modified</li>
                          <li>• <strong>Property Booked:</strong> Get notified when a property reservation is made</li>
                          <li>• <strong>Property Cancelled:</strong> Receive alerts when a property reservation is canceled</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-3">Investment Notifications</h3>
                        <ul className="text-sm text-green-800 space-y-2">
                          <li>• <strong>Investment Purchased:</strong> Get notified when property tokens are purchased</li>
                          <li>• <strong>Investment Withdrawn:</strong> Alerts when funds are transferred from tokens</li>
                          <li>• <strong>Income Verification:</strong> Receive updates with income verification status</li>
                          <li>• <strong>Tax Identification:</strong> Get notified of tax identification updates</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-purple-900 mb-3">Notification Delivery</h3>
                        <ul className="text-sm text-purple-800 space-y-2">
                          <li>• <strong>Notification Sent:</strong> Receive alerts when a custom notification is sent</li>
                          <li>• <strong>Notification Received:</strong> Alerts when a notification is received</li>
                          <li>• <strong>Notification Updated:</strong> Get notified when notification settings are modified</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* File Storage */}
            <section id="file-storage">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Server className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold">File Storage</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      Terra Vault provides secure file storage for your documents and files. Here are some 
                      of the key features:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-3">File Uploads</h3>
                        <ul className="text-sm text-blue-800 space-y-2">
                          <li>• <strong>Upload:</strong> Upload files directly to the platform</li>
                          <li>• <strong>Download:</strong> Access files securely</li>
                          <li>• <strong>Share:</strong> Share files with others</li>
                          <li>• <strong>Version Control:</strong> Manage file versions</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-3">File Management</h3>
                        <ul className="text-sm text-green-800 space-y-2">
                          <li>• <strong>Search:</strong> Find files by name or metadata</li>
                          <li>• <strong>Filter:</strong> Filter files by type or status</li>
                          <li>• <strong>Sort:</strong> Sort files by date or size</li>
                          <li>• <strong>Trash:</strong> Manage files in the trash</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Security */}
            <section id="security">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="h-6 w-6 text-red-600" />
                    <h2 className="text-2xl font-bold">Security</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            Encryption & Security
                          </h4>
                          <ul className="text-sm text-red-800 space-y-1">
                            <li>• AES-256 encryption for data at rest</li>
                            <li>• TLS 1.3 for data in transit</li>
                            <li>• End-to-end encryption for sensitive communications</li>
                            <li>• Multi-factor authentication (MFA) requirements</li>
                            <li>• Biometric authentication options</li>
                            <li>• Hardware security modules (HSMs) for key management</li>
                            <li>• Zero-knowledge architecture for sensitive data</li>
                          </ul>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-900 mb-3 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Access Controls
                          </h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Role-based access control (RBAC)</li>
                            <li>• Principle of least privilege</li>
                            <li>• Regular access reviews and audits</li>
                            <li>• Automated access provisioning and deprovisioning</li>
                            <li>• Privileged access management (PAM)</li>
                            <li>• Session monitoring and anomaly detection</li>
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
                            <HardDrive className="h-4 w-4" />
                            Infrastructure Security
                          </h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• SOC 2 Type II certified data centers</li>
                            <li>• 24/7 security monitoring and incident response</li>
                            <li>• Regular penetration testing and vulnerability assessments</li>
                            <li>• Network segmentation and firewalls</li>
                            <li>• Intrusion detection and prevention systems</li>
                            <li>• Automated backup and disaster recovery</li>
                          </ul>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <h4 className="font-medium text-purple-900 mb-3 flex items-center gap-2">
                            <Badge className="h-4 w-4" />
                            Compliance & Auditing
                          </h4>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• ISO 27001 information security management</li>
                            <li>• NDPR and GDPR compliance frameworks</li>
                            <li>• Regular third-party security audits</li>
                            <li>• Comprehensive audit logging and monitoring</li>
                            <li>• Data processing impact assessments</li>
                            <li>• Annual compliance certifications</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* User Roles & Permissions */}
            <section id="user-roles">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Users className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">User Roles & Permissions</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      Terra Vault provides flexible user roles and permissions to suit your needs. Here are some 
                      of the key features:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-3">Role-Based Access</h3>
                        <ul className="text-sm text-blue-800 space-y-2">
                          <li>• <strong>Admin:</strong> Full access to all features</li>
                          <li>• <strong>Landowner:</strong> Manage property listings and investments</li>
                          <li>• <strong>Investor:</strong> Purchase and manage property tokens</li>
                          <li>• <strong>Viewer:</strong> View property listings and notifications</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-3">Permission Management</h3>
                        <ul className="text-sm text-green-800 space-y-2">
                          <li>• <strong>Customize:</strong> Assign specific permissions to users</li>
                          <li>• <strong>Review:</strong> Monitor and update user permissions</li>
                          <li>• <strong>Deactivate:</strong> Disable user permissions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Compliance Features */}
            <section id="compliance">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Lock className="h-6 w-6 text-red-600" />
                    <h2 className="text-2xl font-bold">Compliance Features</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      Terra Vault is committed to complying with relevant data protection laws and regulations. 
                      Here are some of the key features:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-3">Data Protection</h3>
                        <ul className="text-sm text-blue-800 space-y-2">
                          <li>• <strong>GDPR Compliance:</strong> Adheres to GDPR regulations</li>
                          <li>• <strong>NDPR Compliance:</strong> Complies with NDPR guidelines</li>
                          <li>• <strong>CCPA Compliance:</strong> Protects California residents' data</li>
                          <li>• <strong>ISO 27001:</strong> ISO 27001 certified information security</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-3">Compliance Audits</h3>
                        <ul className="text-sm text-green-800 space-y-2">
                          <li>• <strong>Regular Audits:</strong> Conducts regular compliance audits</li>
                          <li>• <strong>Compliance Reports:</strong> Generates compliance reports</li>
                          <li>• <strong>Compliance Certifications:</strong> Maintains compliance certifications</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Monitoring & Analytics */}
            <section id="monitoring">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Eye className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold">Monitoring & Analytics</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      Terra Vault provides comprehensive monitoring and analytics tools to help you make informed decisions. 
                      Here are some of the key features:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-3">Real-time Monitoring</h3>
                        <ul className="text-sm text-blue-800 space-y-2">
                          <li>• <strong>Activity Logs:</strong> Track user activity and system events</li>
                          <li>• <strong>Performance Metrics:</strong> Monitor system performance</li>
                          <li>• <strong>Alerts:</strong> Receive alerts for unusual activity</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-3">Data Analytics</h3>
                        <ul className="text-sm text-green-800 space-y-2">
                          <li>• <strong>Usage Reports:</strong> Generate usage reports</li>
                          <li>• <strong>Performance Metrics:</strong> Analyze system performance</li>
                          <li>• <strong>Insights:</strong> Gain insights into user behavior</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Deployment */}
            <section id="deployment">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Globe className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold">Deployment</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      Terra Vault is deployed on a scalable cloud infrastructure to ensure high availability and performance. 
                      Here are some of the key features:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-3">Scalability</h3>
                        <ul className="text-sm text-blue-800 space-y-2">
                          <li>• <strong>Auto-scaling:</strong> Automatically adjust resources based on demand</li>
                          <li>• <strong>Load Balancing:</strong> Distribute traffic across multiple servers</li>
                          <li>• <strong>High Availability:</strong> Ensure high availability with failover capabilities</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-3">Security</h3>
                        <ul className="text-sm text-green-800 space-y-2">
                          <li>• <strong>SSL/TLS:</strong> Secure communication with SSL/TLS encryption</li>
                          <li>• <strong>Firewall:</strong> Protect against unauthorized access with firewalls</li>
                          <li>• <strong>DDoS Protection:</strong> Protect against distributed denial-of-service attacks</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Troubleshooting */}
            <section id="troubleshooting">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Settings className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">Troubleshooting</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      Terra Vault provides comprehensive troubleshooting tools to help you resolve issues quickly. 
                      Here are some of the key features:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-3">Error Logging</h3>
                        <ul className="text-sm text-blue-800 space-y-2">
                          <li>• <strong>Log Viewer:</strong> View detailed error logs</li>
                          <li>• <strong>Search Logs:</strong> Search for specific error messages</li>
                          <li>• <strong>Alerts:</strong> Receive alerts for critical errors</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-3">Support Tools</h3>
                        <ul className="text-sm text-green-800 space-y-2">
                          <li>• <strong>Knowledge Base:</strong> Access a comprehensive knowledge base</li>
                          <li>• <strong>Chat Support:</strong> Get real-time support via chat</li>
                          <li>• <strong>Email Support:</strong> Contact support via email</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <Separator className="my-8" />

            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>For technical support, contact our developers at dev@terravault.com</p>
              <p>This documentation is regularly updated with new features and improvements.</p>
              <p>Join our developer community for discussions and updates.</p>
            </div>
          </main>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold">Terra Vault</h3>
              <p className="text-gray-400 text-sm">
                Revolutionary property tokenization platform making real estate investment accessible to everyone.
              </p>
              <div className="flex space-x-4">
                <Twitter className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Facebook className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Instagram className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                <Linkedin className="h-5 w-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

            {/* Products */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Products</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Property Tokenization</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Investment Marketplace</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Property Management</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Revenue Distribution</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">News & Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Investor Relations</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>hello@terravault.com</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+234 800 123 4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Lagos, Nigeria</span>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-gray-800" />

          {/* Bottom footer */}
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <div className="mb-4 md:mb-0">
              <p>&copy; 2024 Terra Vault. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              <a href="#" className="hover:text-white transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Documentation;
