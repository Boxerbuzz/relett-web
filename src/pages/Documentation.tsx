
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Book, Code, Users, Zap, Shield, Database, Coins, Home, FileText, ArrowRight, 
  ArrowLeft, Twitter, Facebook, Instagram, Linkedin, Mail, Phone, MapPin,
  Server, Globe, Settings, HelpCircle, Wrench, GitBranch, Terminal, Package,
  Layers, Activity, Lock, Eye, Smartphone, Cloud, Webhook
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Documentation = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");

  const tableOfContents = [
    { id: "overview", title: "Platform Overview", icon: Globe },
    { id: "getting-started", title: "Getting Started", icon: Zap },
    { id: "architecture", title: "System Architecture", icon: Layers },
    { id: "database", title: "Database Schema", icon: Database },
    { id: "api-reference", title: "API Reference", icon: Server },
    { id: "edge-functions", title: "Edge Functions", icon: Cloud },
    { id: "database-functions", title: "Database Functions", icon: Terminal },
    { id: "authentication", title: "Authentication", icon: Lock },
    { id: "properties", title: "Property Management", icon: Home },
    { id: "tokenization", title: "Tokenization", icon: Coins },
    { id: "payments", title: "Payment Processing", icon: Activity },
    { id: "notifications", title: "Notifications", icon: Eye },
    { id: "webhooks", title: "Webhooks", icon: Webhook },
    { id: "sdk-libraries", title: "SDKs & Libraries", icon: Package },
    { id: "security", title: "Security", icon: Shield },
    { id: "troubleshooting", title: "Troubleshooting", icon: Wrench },
    { id: "changelog", title: "Changelog", icon: FileText },
    { id: "support", title: "Support", icon: HelpCircle },
  ];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
            <h1 className="text-xl font-bold text-gray-900">Terra Vault Documentation</h1>
            <p className="text-sm text-gray-600">Complete developer and user guide</p>
          </div>
        </div>
      </header>

      {/* Main content with sidebar */}
      <div className="flex-1 flex">
        {/* Table of Contents Sidebar - Fixed on large screens */}
        <aside className="hidden lg:block w-80 bg-white border-r border-gray-200 sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Documentation</h2>
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
          </div>
        </aside>

        {/* Mobile TOC */}
        <div className="lg:hidden w-full bg-white border-b border-gray-200">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Documentation</h2>
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
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-8">

            {/* Platform Overview */}
            <section id="overview">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Globe className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">Platform Overview</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Terra Vault is a comprehensive property tokenization platform that enables users to digitize, trade, 
                      and invest in real estate through blockchain technology. Our platform combines traditional real estate 
                      management with cutting-edge fintech innovations.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <Home className="h-8 w-8 text-blue-600 mb-3" />
                        <h3 className="font-semibold text-blue-900 mb-2">Property Management</h3>
                        <p className="text-sm text-blue-800 mb-3">Complete lifecycle management from listing to sale, including AI-powered valuations</p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Automated property verification</li>
                          <li>• AI valuation algorithms (GPT-4)</li>
                          <li>• Document management system</li>
                          <li>• Multi-channel marketing</li>
                          <li>• Real-time analytics tracking</li>
                        </ul>
                      </div>
                      
                      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                        <Coins className="h-8 w-8 text-purple-600 mb-3" />
                        <h3 className="font-semibold text-purple-900 mb-2">Property Tokenization</h3>
                        <p className="text-sm text-purple-800 mb-3">Convert real estate into tradeable blockchain tokens using Hedera technology</p>
                        <ul className="text-xs text-purple-700 space-y-1">
                          <li>• Hedera Token Service (HTS)</li>
                          <li>• Smart contract automation</li>
                          <li>• Fractional ownership</li>
                          <li>• Automated revenue distribution</li>
                          <li>• Secondary market trading</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <Users className="h-8 w-8 text-green-600 mb-3" />
                        <h3 className="font-semibold text-green-900 mb-2">Investment Platform</h3>
                        <p className="text-sm text-green-800 mb-3">Democratized real estate investment with low barriers to entry</p>
                        <ul className="text-xs text-green-700 space-y-1">
                          <li>• Portfolio management</li>
                          <li>• Investment analytics</li>
                          <li>• Group investing features</li>
                          <li>• Performance tracking</li>
                          <li>• Risk assessment tools</li>
                        </ul>
                      </div>
                      
                      <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                        <Shield className="h-8 w-8 text-orange-600 mb-3" />
                        <h3 className="font-semibold text-orange-900 mb-2">Security & Compliance</h3>
                        <p className="text-sm text-orange-800 mb-3">Enterprise-grade security with full regulatory compliance</p>
                        <ul className="text-xs text-orange-700 space-y-1">
                          <li>• KYC/AML verification</li>
                          <li>• End-to-end encryption</li>
                          <li>• Comprehensive audit trails</li>
                          <li>• Regulatory reporting</li>
                          <li>• NDPR/GDPR compliance</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">User Roles & Capabilities</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          {
                            role: "Landowner",
                            badge: "primary",
                            capabilities: [
                              "List properties for sale/rent",
                              "Request property tokenization", 
                              "Manage property portfolio",
                              "Receive revenue distributions",
                              "Access property analytics",
                              "Upload property documents"
                            ]
                          },
                          {
                            role: "Investor", 
                            badge: "secondary",
                            capabilities: [
                              "Browse marketplace",
                              "Purchase property tokens",
                              "Track investment performance", 
                              "Join investment groups",
                              "Receive dividend payments",
                              "Access market analytics"
                            ]
                          },
                          {
                            role: "Agent",
                            badge: "outline", 
                            capabilities: [
                              "Assist with transactions",
                              "Provide market insights",
                              "Manage client relationships",
                              "Earn commissions",
                              "Access agent dashboard",
                              "Handle property inquiries"
                            ]
                          },
                          {
                            role: "Verifier",
                            badge: "destructive",
                            capabilities: [
                              "Verify property documents",
                              "Conduct property inspections", 
                              "Approve property listings",
                              "Maintain compliance records",
                              "Quality assurance reviews",
                              "Generate verification reports"
                            ]
                          },
                          {
                            role: "Admin",
                            badge: "default",
                            capabilities: [
                              "Platform administration",
                              "User management",
                              "System monitoring", 
                              "Support & moderation",
                              "Analytics & reporting",
                              "System configuration"
                            ]
                          }
                        ].map((user, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant={user.badge as any}>{user.role}</Badge>
                            </div>
                            <ul className="text-sm space-y-1">
                              {user.capabilities.map((capability, idx) => (
                                <li key={idx}>• {capability}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Database Schema */}
            <section id="database">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Database className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold">Database Schema</h2>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Core Tables Overview</h3>
                      <p className="text-gray-700 mb-4">
                        Our database uses PostgreSQL with Supabase, featuring over 50 specialized tables for 
                        comprehensive real estate management. Here are the key table groups:
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-3">User Management</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• <strong>users:</strong> Main user profile data</li>
                            <li>• <strong>user_roles:</strong> Role assignments (admin, verifier, etc.)</li>
                            <li>• <strong>accounts:</strong> User wallet and point balances</li>
                            <li>• <strong>notification_preferences:</strong> User notification settings</li>
                            <li>• <strong>portfolio_allocations:</strong> Investment target allocations</li>
                          </ul>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-3">Property System</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• <strong>properties:</strong> Core property information</li>
                            <li>• <strong>property_images:</strong> Property photo storage</li>
                            <li>• <strong>property_documents:</strong> Legal document storage</li>
                            <li>• <strong>property_views:</strong> Analytics tracking</li>
                            <li>• <strong>property_favorites:</strong> User favorites</li>
                            <li>• <strong>property_reviews:</strong> User reviews and ratings</li>
                          </ul>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-purple-900 mb-3">Verification & Compliance</h4>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• <strong>identity_verifications:</strong> KYC data</li>
                            <li>• <strong>kyc_documents:</strong> Identity document storage</li>
                            <li>• <strong>verifier_credentials:</strong> Verifier qualifications</li>
                            <li>• <strong>aml_checks:</strong> Anti-money laundering records</li>
                            <li>• <strong>sanctions_screening:</strong> Compliance screening</li>
                          </ul>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-orange-900 mb-3">Tokenization & Investment</h4>
                          <ul className="text-sm text-orange-800 space-y-1">
                            <li>• <strong>tokenized_properties:</strong> Token metadata</li>
                            <li>• <strong>token_holdings:</strong> User token balances</li>
                            <li>• <strong>token_transactions:</strong> Token transfer history</li>
                            <li>• <strong>revenue_distributions:</strong> Dividend distributions</li>
                            <li>• <strong>investment_tracking:</strong> Performance tracking</li>
                          </ul>
                        </div>

                        <div className="bg-red-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-red-900 mb-3">Transactions & Payments</h4>
                          <ul className="text-sm text-red-800 space-y-1">
                            <li>• <strong>payments:</strong> Payment processing records</li>
                            <li>• <strong>payment_methods:</strong> User payment options</li>
                            <li>• <strong>escrow_accounts:</strong> Transaction escrow</li>
                            <li>• <strong>transaction_fees:</strong> Fee structure</li>
                            <li>• <strong>withdrawal_requests:</strong> Payout requests</li>
                          </ul>
                        </div>

                        <div className="bg-indigo-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-indigo-900 mb-3">Communication</h4>
                          <ul className="text-sm text-indigo-800 space-y-1">
                            <li>• <strong>conversations:</strong> Chat conversation metadata</li>
                            <li>• <strong>messages:</strong> Individual chat messages</li>
                            <li>• <strong>notifications:</strong> System notifications</li>
                            <li>• <strong>feedbacks:</strong> User feedback submissions</li>
                            <li>• <strong>property_inquiries:</strong> Property interest tracking</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Automatic Data Creation</h3>
                      <p className="text-gray-700 mb-4">
                        When users and properties are created, our system automatically populates related tables 
                        with default data through database triggers:
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-3">User Creation Triggers</h4>
                          <ul className="text-sm space-y-1">
                            <li>• <strong>Default Account:</strong> NGN wallet with 0 balance/points</li>
                            <li>• <strong>User Role:</strong> 'landowner' role automatically assigned</li>
                            <li>• <strong>Notification Preferences:</strong> Email/push enabled by default</li>
                            <li>• <strong>Portfolio Allocations:</strong> Default investment targets set</li>
                            <li>• <strong>Verification Status:</strong> Set to 'unverified' initially</li>
                          </ul>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-3">Property Creation Triggers</h4>
                          <ul className="text-sm space-y-1">
                            <li>• <strong>Analytics Counters:</strong> Views, likes, favorites set to 0</li>
                            <li>• <strong>Status Flags:</strong> is_featured, is_verified set to false</li>
                            <li>• <strong>AI Valuation:</strong> Automatic valuation request triggered</li>
                            <li>• <strong>Document Processing:</strong> Secure storage setup</li>
                            <li>• <strong>Location Analysis:</strong> Geocoding and area analysis</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Database Functions */}
            <section id="database-functions">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Terminal className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold">Database Functions</h2>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Core Database Functions</h3>
                      <p className="text-gray-700 mb-4">
                        Our platform uses over 20 custom PostgreSQL functions for complex business logic, 
                        security enforcement, and data integrity. Here are the key functions:
                      </p>
                      
                      <div className="space-y-6">
                        <div className="bg-blue-50 p-6 rounded-lg">
                          <h4 className="font-semibold text-blue-900 mb-3">User Management Functions</h4>
                          <div className="space-y-4">
                            <div>
                              <code className="bg-blue-100 px-2 py-1 rounded text-sm">get_current_user_profile()</code>
                              <p className="text-sm text-blue-800 mt-1">Returns the complete user profile for the authenticated user</p>
                            </div>
                            <div>
                              <code className="bg-blue-100 px-2 py-1 rounded text-sm">has_role(_user_id uuid, _role app_role)</code>
                              <p className="text-sm text-blue-800 mt-1">Checks if a user has a specific active role</p>
                            </div>
                            <div>
                              <code className="bg-blue-100 px-2 py-1 rounded text-sm">get_user_active_roles(_user_id uuid)</code>
                              <p className="text-sm text-blue-800 mt-1">Returns all active roles for a user</p>
                            </div>
                            <div>
                              <code className="bg-blue-100 px-2 py-1 rounded text-sm">is_user_verified(_user_id uuid)</code>
                              <p className="text-sm text-blue-800 mt-1">Checks if user has completed KYC verification</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-green-50 p-6 rounded-lg">
                          <h4 className="font-semibold text-green-900 mb-3">Property & Security Functions</h4>
                          <div className="space-y-4">
                            <div>
                              <code className="bg-green-100 px-2 py-1 rounded text-sm">can_access_property(_property_id uuid, _user_id uuid)</code>
                              <p className="text-sm text-green-800 mt-1">Security function to check property access permissions</p>
                            </div>
                            <div>
                              <code className="bg-green-100 px-2 py-1 rounded text-sm">get_property_secure(_property_id uuid)</code>
                              <p className="text-sm text-green-800 mt-1">Returns property data only if user has access permissions</p>
                            </div>
                            <div>
                              <code className="bg-green-100 px-2 py-1 rounded text-sm">track_property_interaction(...)</code>
                              <p className="text-sm text-green-800 mt-1">Records user interactions with properties for analytics</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-purple-50 p-6 rounded-lg">
                          <h4 className="font-semibold text-purple-900 mb-3">Notification & Communication</h4>
                          <div className="space-y-4">
                            <div>
                              <code className="bg-purple-100 px-2 py-1 rounded text-sm">create_notification_with_delivery(...)</code>
                              <p className="text-sm text-purple-800 mt-1">Creates notifications and triggers delivery via edge functions</p>
                            </div>
                            <div>
                              <code className="bg-purple-100 px-2 py-1 rounded text-sm">add_conversation_participant(...)</code>
                              <p className="text-sm text-purple-800 mt-1">Manages chat conversation membership</p>
                            </div>
                            <div>
                              <code className="bg-purple-100 px-2 py-1 rounded text-sm">cleanup_typing_indicators()</code>
                              <p className="text-sm text-purple-800 mt-1">Removes stale typing indicators from chat</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-orange-50 p-6 rounded-lg">
                          <h4 className="font-semibold text-orange-900 mb-3">Verification & Compliance</h4>
                          <div className="space-y-4">
                            <div>
                              <code className="bg-orange-100 px-2 py-1 rounded text-sm">assign_verification_task(...)</code>
                              <p className="text-sm text-orange-800 mt-1">Assigns property verification tasks to qualified verifiers</p>
                            </div>
                            <div>
                              <code className="bg-orange-100 px-2 py-1 rounded text-sm">complete_verification_task(...)</code>
                              <p className="text-sm text-orange-800 mt-1">Processes verification completion and updates property status</p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-3">Trigger Functions</h4>
                          <div className="space-y-4">
                            <div>
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm">handle_new_user()</code>
                              <p className="text-sm text-gray-800 mt-1">Triggered after user signup - creates default accounts, roles, preferences</p>
                            </div>
                            <div>
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm">handle_new_property()</code>
                              <p className="text-sm text-gray-800 mt-1">Sets default values when properties are created</p>
                            </div>
                            <div>
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm">notify_property_price_change()</code>
                              <p className="text-sm text-gray-800 mt-1">Sends notifications when property prices are updated</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Function Usage Examples</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Role-Based Access Control</h4>
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                            <div className="text-green-400 mb-2">-- Check if user is an admin</div>
                            <div className="font-mono text-sm space-y-1">
                              <div><span className="text-blue-400">SELECT</span> public.has_role(</div>
                              <div className="ml-2">auth.uid(), <span className="text-yellow-400">'admin'</span></div>
                              <div>) <span className="text-blue-400">AS</span> is_admin;</div>
                              <div></div>
                              <div className="text-green-400">-- Get all user roles</div>
                              <div><span className="text-blue-400">SELECT</span> * <span className="text-blue-400">FROM</span></div>
                              <div className="ml-2">public.get_user_active_roles();</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">Property Access Control</h4>
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                            <div className="text-green-400 mb-2">-- Secure property access</div>
                            <div className="font-mono text-sm space-y-1">
                              <div><span className="text-blue-400">SELECT</span> * <span className="text-blue-400">FROM</span></div>
                              <div className="ml-2">public.get_property_secure(</div>
                              <div className="ml-4"><span className="text-yellow-400">'property-uuid-here'</span></div>
                              <div className="ml-2">);</div>
                              <div></div>
                              <div className="text-green-400">-- Returns NULL if no access</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* API Reference */}
            <section id="api-reference">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Server className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold">API Reference</h2>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Authentication</h3>
                      <div className="bg-gray-900 text-gray-100 p-6 rounded-lg">
                        <div className="text-green-400 mb-3">// Initialize Supabase client</div>
                        <div className="space-y-2 font-mono text-sm">
                          <div><span className="text-blue-400">import</span> {'{ createClient }'} <span className="text-blue-400">from</span> <span className="text-yellow-400">'@supabase/supabase-js'</span></div>
                          <div></div>
                          <div><span className="text-blue-400">const</span> <span className="text-white">supabase</span> = <span className="text-yellow-400">createClient</span>(</div>
                          <div className="ml-4"><span className="text-yellow-400">process.env.SUPABASE_URL</span>,</div>
                          <div className="ml-4"><span className="text-yellow-400">process.env.SUPABASE_ANON_KEY</span></div>
                          <div>)</div>
                          <div></div>
                          <div className="text-green-400">// Authenticate user</div>
                          <div><span className="text-blue-400">const</span> {'{ data, error }'} = <span className="text-blue-400">await</span> supabase.auth</div>
                          <div className="ml-4">.signInWithPassword({'{ email, password }'})</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Core API Endpoints</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-3">Property Management</h4>
                            <div className="space-y-2">
                              {[
                                { method: "GET", endpoint: "/rest/v1/properties", desc: "List properties with filters" },
                                { method: "POST", endpoint: "/rest/v1/properties", desc: "Create new property" },
                                { method: "PATCH", endpoint: "/rest/v1/properties", desc: "Update property" },
                                { method: "DELETE", endpoint: "/rest/v1/properties", desc: "Delete property" },
                                { method: "POST", endpoint: "/rest/v1/property_images", desc: "Upload images" }
                              ].map((api, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
                                  <Badge variant={api.method === "GET" ? "outline" : api.method === "POST" ? "default" : api.method === "PATCH" ? "secondary" : "destructive"}>
                                    {api.method}
                                  </Badge>
                                  <code className="text-sm font-mono flex-1">{api.endpoint}</code>
                                  <span className="text-xs text-gray-600">{api.desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">User Management</h4>
                            <div className="space-y-2">
                              {[
                                { method: "GET", endpoint: "/rest/v1/rpc/get_current_user_profile", desc: "Get user profile" },
                                { method: "PATCH", endpoint: "/rest/v1/users", desc: "Update profile" },
                                { method: "POST", endpoint: "/rest/v1/kyc_documents", desc: "Upload KYC docs" },
                                { method: "GET", endpoint: "/rest/v1/notifications", desc: "Get notifications" }
                              ].map((api, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
                                  <Badge variant={api.method === "GET" ? "outline" : api.method === "POST" ? "default" : "secondary"}>
                                    {api.method}
                                  </Badge>
                                  <code className="text-sm font-mono flex-1">{api.endpoint}</code>
                                  <span className="text-xs text-gray-600">{api.desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-3">Tokenization</h4>
                            <div className="space-y-2">
                              {[
                                { method: "POST", endpoint: "/rest/v1/tokenized_properties", desc: "Create tokens" },
                                { method: "GET", endpoint: "/rest/v1/token_holdings", desc: "Get holdings" },
                                { method: "POST", endpoint: "/rest/v1/token_transactions", desc: "Transfer tokens" },
                                { method: "GET", endpoint: "/rest/v1/revenue_distributions", desc: "Get dividends" },
                                { method: "POST", endpoint: "/functions/v1/distribute-revenue", desc: "Process dividends" }
                              ].map((api, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
                                  <Badge variant={api.method === "GET" ? "outline" : "default"}>
                                    {api.method}
                                  </Badge>
                                  <code className="text-sm font-mono flex-1">{api.endpoint}</code>
                                  <span className="text-xs text-gray-600">{api.desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-3">Payments</h4>
                            <div className="space-y-2">
                              {[
                                { method: "POST", endpoint: "/functions/v1/create-payment", desc: "Create payment" },
                                { method: "POST", endpoint: "/functions/v1/verify-payment", desc: "Verify payment" },
                                { method: "GET", endpoint: "/rest/v1/payments", desc: "Payment history" },
                                { method: "POST", endpoint: "/rest/v1/escrow_accounts", desc: "Create escrow" }
                              ].map((api, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
                                  <Badge variant={api.method === "GET" ? "outline" : "default"}>
                                    {api.method}
                                  </Badge>
                                  <code className="text-sm font-mono flex-1">{api.endpoint}</code>
                                  <span className="text-xs text-gray-600">{api.desc}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
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
                    <Cloud className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">Edge Functions</h2>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <p className="text-gray-700 leading-relaxed mb-6">
                        Terra Vault uses Supabase Edge Functions for serverless backend processing, 
                        including payment processing, notifications, AI integration, and blockchain operations.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-blue-50 p-6 rounded-lg">
                          <h3 className="font-semibold text-blue-900 mb-3">Payment Processing</h3>
                          <ul className="text-sm text-blue-800 space-y-2">
                            <li className="flex flex-col">
                              <span className="font-medium">create-payment</span>
                              <span className="text-xs">Generates payment intents with Paystack/Stripe integration</span>
                            </li>
                            <li className="flex flex-col">
                              <span className="font-medium">verify-payment</span>
                              <span className="text-xs">Validates payment callbacks and updates transaction records</span>
                            </li>
                            <li className="flex flex-col">
                              <span className="font-medium">process-withdrawal</span>
                              <span className="text-xs">Handles user withdrawal requests and bank transfers</span>
                            </li>
                          </ul>
                          <div className="mt-4 p-3 bg-blue-100 rounded">
                            <div className="text-xs text-blue-900 font-mono overflow-x-auto">
                              <pre className="whitespace-pre-wrap">
{`// Example flow in create-payment
async function createPayment(req, res) {
  const { amount, type, userId, propertyId } = req.body;
  
  // Initialize payment provider
  const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);
  
  // Create payment intent
  const paymentIntent = await paystack.transaction.initialize({
    amount: amount * 100, // Convert to kobo
    email: user.email,
    metadata: {
      userId,
      propertyId,
      paymentType: type
    }
  });
  
  // Store payment session
  await supabase
    .from('payment_sessions')
    .insert({
      amount,
      purpose: type,
      session_id: paymentIntent.data.reference,
      user_id: userId
    });
  
  return res.status(200).json({
    success: true,
    redirectUrl: paymentIntent.data.authorization_url
  });
}`}
                              </pre>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 p-6 rounded-lg">
                          <h3 className="font-semibold text-green-900 mb-3">Notification Delivery</h3>
                          <ul className="text-sm text-green-800 space-y-2">
                            <li className="flex flex-col">
                              <span className="font-medium">process-notification</span>
                              <span className="text-xs">Handles multi-channel notification delivery (email, push, SMS)</span>
                            </li>
                            <li className="flex flex-col">
                              <span className="font-medium">send-push-notification</span>
                              <span className="text-xs">Delivers push notifications via OneSignal</span>
                            </li>
                            <li className="flex flex-col">
                              <span className="font-medium">send-bulk-notifications</span>
                              <span className="text-xs">Batch processing for marketing communications</span>
                            </li>
                          </ul>
                          <div className="mt-4 p-3 bg-green-100 rounded">
                            <div className="text-xs text-green-900 font-mono overflow-x-auto">
                              <pre className="whitespace-pre-wrap">
{`// Example from process-notification
export async function processNotification(req, res) {
  const { notification_id } = req.body;
  
  // Fetch notification details
  const { data: notification } = await supabase
    .from('notifications')
    .select('*')
    .eq('id', notification_id)
    .single();
    
  // Get user preferences
  const { data: prefs } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', notification.user_id)
    .single();
  
  // Send via each enabled channel
  if (prefs.email_notifications) {
    await sendEmailNotification(notification);
  }
  
  if (prefs.push_notifications) {
    await sendPushNotification(notification);
  }
  
  if (prefs.sms_notifications) {
    await sendSMSNotification(notification);
  }
  
  return res.status(200).json({
    success: true
  });
}`}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-purple-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-purple-900 mb-3">AI Integration</h3>
                        <ul className="text-sm text-purple-800 space-y-2">
                          <li className="flex flex-col">
                            <span className="font-medium">property-valuation</span>
                            <span className="text-xs">AI-powered property valuation using GPT-4 and market data</span>
                          </li>
                          <li className="flex flex-col">
                            <span className="font-medium">document-extraction</span>
                            <span className="text-xs">Extracts key information from property documents</span>
                          </li>
                          <li className="flex flex-col">
                            <span className="font-medium">market-analysis</span>
                            <span className="text-xs">Generates market insights and investment recommendations</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="bg-orange-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-orange-900 mb-3">Blockchain Operations</h3>
                        <ul className="text-sm text-orange-800 space-y-2">
                          <li className="flex flex-col">
                            <span className="font-medium">create-token</span>
                            <span className="text-xs">Mints new property tokens on Hedera network</span>
                          </li>
                          <li className="flex flex-col">
                            <span className="font-medium">transfer-token</span>
                            <span className="text-xs">Handles secure token transfers between users</span>
                          </li>
                          <li className="flex flex-col">
                            <span className="font-medium">distribute-revenue</span>
                            <span className="text-xs">Calculates and distributes property dividends</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Event Handling</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium text-sm mb-2">User Events</h4>
                          <ul className="text-xs text-gray-700 space-y-1">
                            <li>• <strong>user-created-webhook:</strong> User onboarding flow</li>
                            <li>• <strong>user-verification:</strong> KYC verification processing</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-2">Property Events</h4>
                          <ul className="text-xs text-gray-700 space-y-1">
                            <li>• <strong>process-property-images:</strong> Image optimization</li>
                            <li>• <strong>property-verification:</strong> Document validation</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-sm mb-2">System Events</h4>
                          <ul className="text-xs text-gray-700 space-y-1">
                            <li>• <strong>scheduled-backups:</strong> Data backup automation</li>
                            <li>• <strong>generate-analytics:</strong> Analytics processing</li>
                          </ul>
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
                    <Webhook className="h-6 w-6 text-orange-600" />
                    <h2 className="text-2xl font-bold">Webhooks</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      Integrate with Terra Vault using our webhook system for real-time event notifications. 
                      Webhooks let your systems receive instant updates about property changes, transactions, 
                      and user activities.
                    </p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Webhook Setup</h3>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                          <div className="text-green-400 mb-2">// Create a webhook endpoint</div>
                          <div className="font-mono text-sm space-y-1">
                            <div><span className="text-blue-400">const</span> response = <span className="text-blue-400">await</span> fetch(</div>
                            <div className="ml-2"><span className="text-yellow-400">'https://api.terravault.com/v1/webhooks'</span>,</div>
                            <div className="ml-2">{'{'}</div>
                            <div className="ml-4">method: <span className="text-yellow-400">'POST'</span>,</div>
                            <div className="ml-4">headers: {'{'}</div>
                            <div className="ml-6"><span className="text-yellow-400">'Authorization'</span>: <span className="text-yellow-400">`Bearer ${apiKey}`</span>,</div>
                            <div className="ml-6"><span className="text-yellow-400">'Content-Type'</span>: <span className="text-yellow-400">'application/json'</span></div>
                            <div className="ml-4">{'}'},</div>
                            <div className="ml-4">body: JSON.stringify({'{'}</div>
                            <div className="ml-6">url: <span className="text-yellow-400">'https://your-server.com/webhook'</span>,</div>
                            <div className="ml-6">events: [<span className="text-yellow-400">'property.created'</span>, <span className="text-yellow-400">'token.transferred'</span>],</div>
                            <div className="ml-6">secret: <span className="text-yellow-400">'your-signing-secret'</span></div>
                            <div className="ml-4">{'}'})</div>
                            <div className="ml-2">{'}'})</div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Webhook Security</h3>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                          <div className="text-green-400 mb-2">// Verify webhook signature</div>
                          <div className="font-mono text-sm space-y-1">
                            <div><span className="text-blue-400">import</span> crypto <span className="text-blue-400">from</span> <span className="text-yellow-400">'crypto'</span>;</div>
                            <div></div>
                            <div><span className="text-blue-400">function</span> <span className="text-yellow-400">verifySignature</span>(req) {'{'}</div>
                            <div className="ml-2"><span className="text-blue-400">const</span> signature = req.headers[<span className="text-yellow-400">'tv-signature'</span>];</div>
                            <div className="ml-2"><span className="text-blue-400">const</span> timestamp = req.headers[<span className="text-yellow-400">'tv-timestamp'</span>];</div>
                            <div className="ml-2"><span className="text-blue-400">const</span> body = JSON.stringify(req.body);</div>
                            <div></div>
                            <div className="ml-2"><span className="text-blue-400">const</span> payload = <span className="text-yellow-400">`${timestamp}.${body}`</span>;</div>
                            <div className="ml-2"><span className="text-blue-400">const</span> expectedSignature = crypto</div>
                            <div className="ml-4">.createHmac(<span className="text-yellow-400">'sha256'</span>, WEBHOOK_SECRET)</div>
                            <div className="ml-4">.update(payload)</div>
                            <div className="ml-4">.digest(<span className="text-yellow-400">'hex'</span>);</div>
                            <div></div>
                            <div className="ml-2"><span className="text-blue-400">return</span> signature === expectedSignature;</div>
                            <div>{'}'}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Available Webhook Events</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 px-4 py-2 text-left">Event Name</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Payload Example</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code>property.created</code></td>
                              <td className="border border-gray-300 px-4 py-2">New property listing created</td>
                              <td className="border border-gray-300 px-4 py-2">
                                <code className="text-xs">{'{ "id": "uuid", "type": "for_sale", "price": 150000000 }'}</code>
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code>property.updated</code></td>
                              <td className="border border-gray-300 px-4 py-2">Property details changed</td>
                              <td className="border border-gray-300 px-4 py-2">
                                <code className="text-xs">{'{ "id": "uuid", "changes": ["price", "status"] }'}</code>
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code>property.verified</code></td>
                              <td className="border border-gray-300 px-4 py-2">Property verification completed</td>
                              <td className="border border-gray-300 px-4 py-2">
                                <code className="text-xs">{'{ "id": "uuid", "verifier_id": "uuid", "timestamp": "..." }'}</code>
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code>token.created</code></td>
                              <td className="border border-gray-300 px-4 py-2">Property tokenization completed</td>
                              <td className="border border-gray-300 px-4 py-2">
                                <code className="text-xs">{'{ "id": "uuid", "token_id": "0.0.123456", "supply": "1000000" }'}</code>
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2"><code>token.transferred</code></td>
                              <td className="border border-gray-300 px-4 py-2">Token ownership transferred</td>
                              <td className="border border-gray-300 px-4 py-2">
                                <code className="text-xs">{'{ "id": "uuid", "from": "uuid", "to": "uuid", "amount": "1000" }'}</code>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <Separator className="my-8" />

            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>This documentation is continuously updated. Last updated: {new Date().toLocaleDateString()}</p>
              <p>For suggestions or corrections, please contact us at docs@terravault.com</p>
            </div>
          </div>
        </main>
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
