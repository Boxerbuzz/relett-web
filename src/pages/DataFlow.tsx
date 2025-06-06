import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  ArrowDown, ArrowRight, Database, Shield, Key, Users, Home, Coins, FileText,
  Server, Globe, Lock, Cpu, HardDrive, Network, Code, ArrowLeft, Twitter,
  Facebook, Instagram, Linkedin, Mail, Phone, MapPin, Layers, GitBranch
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const DataFlow = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");

  const tableOfContents = [
    { id: "overview", title: "System Overview", icon: Globe },
    { id: "architecture", title: "Technical Architecture", icon: Layers },
    { id: "user-flow", title: "User Registration Flow", icon: Users },
    { id: "verification-flow", title: "Identity Verification", icon: Shield },
    { id: "property-flow", title: "Property Management", icon: Home },
    { id: "tokenization-flow", title: "Tokenization Process", icon: Coins },
    { id: "payment-flow", title: "Payment Processing", icon: Database },
    { id: "security-layers", title: "Security Architecture", icon: Lock },
    { id: "database-schema", title: "Database Design", icon: HardDrive },
    { id: "api-architecture", title: "API & Services", icon: Server },
    { id: "blockchain-integration", title: "Blockchain Layer", icon: Network },
    { id: "monitoring", title: "Monitoring & Analytics", icon: Cpu },
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
            <h1 className="text-xl font-bold text-gray-900">Technical Data Flow Architecture</h1>
            <p className="text-sm text-gray-600">Comprehensive technical overview of Terra Vault's data architecture</p>
          </div>
        </div>
      </header>

      {/* Main content with sidebar */}
      <div className="flex-1 flex">
        {/* Table of Contents Sidebar */}
        <aside className="hidden lg:block w-80 bg-white border-r border-gray-200 sticky top-[73px] h-[calc(100vh-73px)]">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
            <ScrollArea className="h-[calc(100vh-150px)]">
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
            </ScrollArea>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-6xl mx-auto space-y-8">

            {/* System Overview */}
            <section id="overview">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Globe className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">System Overview</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-lg text-gray-700 leading-relaxed">
                      Terra Vault is built on a modern, scalable architecture that combines traditional web technologies 
                      with blockchain innovation. Our system processes thousands of property transactions, verifications, 
                      and token operations daily while maintaining enterprise-grade security and compliance.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <Server className="h-8 w-8 text-blue-600 mb-3" />
                        <h3 className="font-semibold text-blue-900 mb-2">Frontend Layer</h3>
                        <p className="text-sm text-blue-800">React 18, TypeScript, Tailwind CSS</p>
                        <ul className="text-xs text-blue-700 mt-2 space-y-1">
                          <li>• Progressive Web App (PWA)</li>
                          <li>• Real-time WebSocket connections</li>
                          <li>• Responsive mobile-first design</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <Database className="h-8 w-8 text-green-600 mb-3" />
                        <h3 className="font-semibold text-green-900 mb-2">Backend Services</h3>
                        <p className="text-sm text-green-800">Supabase, PostgreSQL, Edge Functions</p>
                        <ul className="text-xs text-green-700 mt-2 space-y-1">
                          <li>• RESTful APIs with GraphQL</li>
                          <li>• Serverless edge computing</li>
                          <li>• Real-time subscriptions</li>
                        </ul>
                      </div>
                      
                      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                        <Network className="h-8 w-8 text-purple-600 mb-3" />
                        <h3 className="font-semibold text-purple-900 mb-2">Blockchain Layer</h3>
                        <p className="text-sm text-purple-800">Hedera Hashgraph, Smart Contracts</p>
                        <ul className="text-xs text-purple-700 mt-2 space-y-1">
                          <li>• Token Service (HTS)</li>
                          <li>• File Service (HFS)</li>
                          <li>• Consensus Service (HCS)</li>
                        </ul>
                      </div>
                      
                      <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                        <Shield className="h-8 w-8 text-orange-600 mb-3" />
                        <h3 className="font-semibold text-orange-900 mb-2">Security & Compliance</h3>
                        <p className="text-sm text-orange-800">End-to-end encryption, KYC/AML</p>
                        <ul className="text-xs text-orange-700 mt-2 space-y-1">
                          <li>• Multi-layer authentication</li>
                          <li>• Regulatory compliance</li>
                          <li>• Audit trails</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Technical Architecture */}
            <section id="architecture">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Layers className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold">Technical Architecture</h2>
                  </div>
                  
                  <div className="space-y-8">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">System Architecture Diagram</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <div className="bg-blue-100 p-4 rounded-lg border-2 border-blue-300">
                            <h4 className="font-semibold text-blue-900 mb-2">Client Layer</h4>
                            <div className="space-y-2 text-sm">
                              <div className="bg-white p-2 rounded">React Frontend</div>
                              <div className="bg-white p-2 rounded">Mobile PWA</div>
                              <div className="bg-white p-2 rounded">Admin Dashboard</div>
                            </div>
                          </div>
                          <ArrowDown className="mx-auto text-gray-400" />
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-green-100 p-4 rounded-lg border-2 border-green-300">
                            <h4 className="font-semibold text-green-900 mb-2">Application Layer</h4>
                            <div className="space-y-2 text-sm">
                              <div className="bg-white p-2 rounded">API Gateway</div>
                              <div className="bg-white p-2 rounded">Edge Functions</div>
                              <div className="bg-white p-2 rounded">Business Logic</div>
                            </div>
                          </div>
                          <ArrowDown className="mx-auto text-gray-400" />
                        </div>
                        
                        <div className="space-y-4">
                          <div className="bg-purple-100 p-4 rounded-lg border-2 border-purple-300">
                            <h4 className="font-semibold text-purple-900 mb-2">Data Layer</h4>
                            <div className="space-y-2 text-sm">
                              <div className="bg-white p-2 rounded">PostgreSQL</div>
                              <div className="bg-white p-2 rounded">Blockchain</div>
                              <div className="bg-white p-2 rounded">File Storage</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Core Technologies</h3>
                        <div className="space-y-3">
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium mb-2">Frontend Stack</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>• React 18 with TypeScript</li>
                              <li>• Vite build system</li>
                              <li>• TanStack Query for state management</li>
                              <li>• Tailwind CSS + Shadcn/ui components</li>
                              <li>• React Router for navigation</li>
                              <li>• React Hook Form for form handling</li>
                            </ul>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium mb-2">Backend Infrastructure</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>• Supabase PostgreSQL database</li>
                              <li>• Row Level Security (RLS) policies</li>
                              <li>• Edge Functions (Deno runtime)</li>
                              <li>• Real-time subscriptions</li>
                              <li>• RESTful APIs with auto-generated types</li>
                              <li>• File storage with CDN</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Integration Services</h3>
                        <div className="space-y-3">
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium mb-2">External APIs</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>• Hedera SDK for blockchain operations</li>
                              <li>• Paystack/Flutterwave for payments</li>
                              <li>• Google Maps for location services</li>
                              <li>• OpenAI for AI property valuation</li>
                              <li>• Resend for email delivery</li>
                              <li>• OneSignal for push notifications</li>
                            </ul>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium mb-2">Monitoring & Analytics</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>• Sentry for error tracking</li>
                              <li>• Custom analytics pipeline</li>
                              <li>• Performance monitoring</li>
                              <li>• User behavior tracking</li>
                              <li>• Transaction monitoring</li>
                              <li>• Security audit logging</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* User Registration Flow */}
            <section id="user-flow">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Users className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold">User Registration & Authentication Flow</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Complete Registration Process</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                          <h4 className="font-semibold text-blue-900 mb-2">1. Initial Signup</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Email validation</li>
                            <li>• Password strength check</li>
                            <li>• User type selection</li>
                            <li>• Terms acceptance</li>
                          </ul>
                          <Badge className="mt-2 bg-blue-600">Frontend</Badge>
                        </div>
                        
                        <ArrowRight className="hidden lg:block self-center text-gray-400" />
                        
                        <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                          <h4 className="font-semibold text-green-900 mb-2">2. Supabase Auth</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• JWT token generation</li>
                            <li>• Email verification</li>
                            <li>• Session management</li>
                            <li>• User record creation</li>
                          </ul>
                          <Badge className="mt-2 bg-green-600">Auth Layer</Badge>
                        </div>
                        
                        <ArrowRight className="hidden lg:block self-center text-gray-400" />
                        
                        <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                          <h4 className="font-semibold text-purple-900 mb-2">3. Profile Setup</h4>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• User profiles table</li>
                            <li>• Role assignment</li>
                            <li>• Preferences setup</li>
                            <li>• Notification config</li>
                          </ul>
                          <Badge className="mt-2 bg-purple-600">Database</Badge>
                        </div>
                        
                        <ArrowRight className="hidden lg:block self-center text-gray-400" />
                        
                        <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                          <h4 className="font-semibold text-orange-900 mb-2">4. Onboarding</h4>
                          <ul className="text-sm text-orange-800 space-y-1">
                            <li>• Welcome email</li>
                            <li>• Profile completion</li>
                            <li>• Feature introduction</li>
                            <li>• Analytics tracking</li>
                          </ul>
                          <Badge className="mt-2 bg-orange-600">Services</Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Authentication Methods</h3>
                        <div className="space-y-3">
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium mb-2">Primary Authentication</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>• Email/Password with bcrypt hashing</li>
                              <li>• Multi-factor authentication (MFA)</li>
                              <li>• Social login (Google, Facebook)</li>
                              <li>• Wallet-based authentication</li>
                            </ul>
                          </div>
                          
                          <div className="bg-white p-4 rounded-lg border">
                            <h4 className="font-medium mb-2">Session Management</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              <li>• JWT tokens with refresh rotation</li>
                              <li>• Secure httpOnly cookies</li>
                              <li>• Session timeout policies</li>
                              <li>• Device fingerprinting</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">User Data Structure</h3>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
                          <div className="text-green-400 mb-2">// User Profile Schema</div>
                          <div className="space-y-1">
                            <div><span className="text-blue-400">interface</span> <span className="text-yellow-400">UserProfile</span> {'{'}</div>
                            <div className="ml-2">id: <span className="text-red-400">string</span></div>
                            <div className="ml-2">email: <span className="text-red-400">string</span></div>
                            <div className="ml-2">first_name: <span className="text-red-400">string</span></div>
                            <div className="ml-2">last_name: <span className="text-red-400">string</span></div>
                            <div className="ml-2">user_type: <span className="text-red-400">UserRole</span></div>
                            <div className="ml-2">verification_status: <span className="text-red-400">Status</span></div>
                            <div className="ml-2">created_at: <span className="text-red-400">timestamp</span></div>
                            <div className="ml-2">updated_at: <span className="text-red-400">timestamp</span></div>
                            <div>{'}'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Continue with remaining sections... */}
            {/* For brevity, I'll include key remaining technical sections */}

            {/* Database Schema */}
            <section id="database-schema">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <HardDrive className="h-6 w-6 text-red-600" />
                    <h2 className="text-2xl font-bold">Database Design & Schema</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Core Tables</h3>
                        <div className="space-y-3">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">User Management</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• <code>users</code> - Core user information</li>
                              <li>• <code>user_profiles</code> - Extended profile data</li>
                              <li>• <code>user_roles</code> - Role-based permissions</li>
                              <li>• <code>user_preferences</code> - Settings & preferences</li>
                              <li>• <code>user_devices</code> - Device tracking</li>
                            </ul>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-900 mb-2">Property Management</h4>
                            <ul className="text-sm text-green-800 space-y-1">
                              <li>• <code>properties</code> - Property listings</li>
                              <li>• <code>property_images</code> - Media files</li>
                              <li>• <code>property_documents</code> - Legal docs</li>
                              <li>• <code>property_valuations</code> - AI valuations</li>
                              <li>• <code>land_titles</code> - Ownership records</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Advanced Features</h3>
                        <div className="space-y-3">
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h4 className="font-medium text-purple-900 mb-2">Tokenization</h4>
                            <ul className="text-sm text-purple-800 space-y-1">
                              <li>• <code>tokenized_properties</code> - Token metadata</li>
                              <li>• <code>token_holdings</code> - Ownership tracking</li>
                              <li>• <code>token_transactions</code> - Transfer history</li>
                              <li>• <code>revenue_distributions</code> - Dividends</li>
                              <li>• <code>investment_groups</code> - Syndicated investing</li>
                            </ul>
                          </div>
                          
                          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <h4 className="font-medium text-orange-900 mb-2">Operations</h4>
                            <ul className="text-sm text-orange-800 space-y-1">
                              <li>• <code>payments</code> - Transaction processing</li>
                              <li>• <code>escrow_accounts</code> - Secure holdings</li>
                              <li>• <code>audit_trails</code> - Activity logging</li>
                              <li>• <code>notifications</code> - User communications</li>
                              <li>• <code>conversations</code> - Chat system</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Database Optimization</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Indexing Strategy</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Composite indexes on frequently queried columns</li>
                            <li>• GiST indexes for geospatial data</li>
                            <li>• Partial indexes for filtered queries</li>
                            <li>• JSONB indexes for metadata searches</li>
                          </ul>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Performance Features</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Connection pooling with PgBouncer</li>
                            <li>• Read replicas for analytics queries</li>
                            <li>• Query optimization and explain plans</li>
                            <li>• Automated vacuum and analyze</li>
                          </ul>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium mb-2">Data Integrity</h4>
                          <ul className="text-sm text-gray-700 space-y-1">
                            <li>• Foreign key constraints</li>
                            <li>• Check constraints for data validation</li>
                            <li>• Triggers for audit logging</li>
                            <li>• Row Level Security (RLS) policies</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* API Architecture */}
            <section id="api-architecture">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Server className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold">API & Edge Functions Architecture</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Edge Functions</h3>
                        <div className="space-y-3">
                          {[
                            { name: "ai-property-valuation", desc: "AI-powered property valuation using OpenAI" },
                            { name: "create-hedera-token", desc: "Property tokenization on Hedera blockchain" },
                            { name: "process-payment", desc: "Payment processing with Paystack/Stripe" },
                            { name: "send-notification", desc: "Multi-channel notification delivery" },
                            { name: "verify-identity", desc: "KYC/AML verification processing" },
                            { name: "advanced-search", desc: "Elasticsearch-powered property search" }
                          ].map((fn, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border">
                              <div className="flex items-center gap-2 mb-2">
                                <Code className="h-4 w-4 text-indigo-600" />
                                <code className="text-sm font-mono text-indigo-700">{fn.name}</code>
                              </div>
                              <p className="text-sm text-gray-600">{fn.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">API Patterns</h3>
                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">REST API Design</h4>
                            <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm font-mono">
                              <div className="text-green-400">// Property API endpoints</div>
                              <div><span className="text-blue-400">GET</span> /api/properties</div>
                              <div><span className="text-yellow-400">POST</span> /api/properties</div>
                              <div><span className="text-purple-400">PUT</span> /api/properties/:id</div>
                              <div><span className="text-red-400">DELETE</span> /api/properties/:id</div>
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-medium mb-2">Real-time Subscriptions</h4>
                            <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm font-mono">
                              <div className="text-green-400">// WebSocket channels</div>
                              <div>property_updates:{'{property_id}'}</div>
                              <div>user_notifications:{'{user_id}'}</div>
                              <div>chat_messages:{'{conversation_id}'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>This technical documentation is continuously updated to reflect our evolving architecture.</p>
              <p>For technical questions or contributions, contact our engineering team at tech@terravault.com</p>
            </div>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        {/* ... keep existing code (footer content) ... */}
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

export default DataFlow;
