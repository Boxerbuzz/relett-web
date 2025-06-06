import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
    { id: "automatic-data", title: "Automatic Data Creation", icon: Database },
    { id: "verification-flow", title: "Identity Verification", icon: Shield },
    { id: "property-flow", title: "Property Management", icon: Home },
    { id: "document-flow", title: "Document Processing", icon: FileText },
    { id: "tokenization-flow", title: "Tokenization Process", icon: Coins },
    { id: "payment-flow", title: "Payment Processing", icon: Database },
    { id: "security-layers", title: "Security Architecture", icon: Lock },
    { id: "database-schema", title: "Database Design", icon: HardDrive },
    { id: "api-architecture", title: "API & Services", icon: Server },
    { id: "blockchain-integration", title: "Blockchain Layer", icon: Network },
    { id: "triggers-functions", title: "Database Triggers & Functions", icon: GitBranch },
    { id: "edge-functions", title: "Edge Functions Deep Dive", icon: Code },
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
            <h1 className="text-xl font-bold text-gray-900">Technical Data Flow Architecture</h1>
            <p className="text-sm text-gray-600">Comprehensive technical overview of Terra Vault's data architecture</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Table of Contents - Fixed position on larger screens */}
          <aside className="lg:w-80 lg:flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
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
                        <span className="text-xs lg:text-sm">{item.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* Main content - Scrollable */}
          <main className="flex-1 space-y-8">

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
                          <li>• Component-based architecture</li>
                          <li>• State management with TanStack Query</li>
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
                          <li>• Row Level Security (RLS)</li>
                          <li>• Automated triggers and functions</li>
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
                          <li>• Smart Contract Service</li>
                          <li>• Immutable audit trails</li>
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
                          <li>• Data protection (GDPR/NDPR)</li>
                          <li>• Fraud detection systems</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Data Flow Architecture</h3>
                      <p className="text-gray-700 mb-4">
                        Our architecture follows a microservices pattern where each component is responsible for specific business logic:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded border">
                          <h4 className="font-medium mb-2">Input Layer</h4>
                          <p className="text-sm text-gray-600">User interactions, API calls, file uploads, and external integrations</p>
                        </div>
                        <div className="bg-white p-4 rounded border">
                          <h4 className="font-medium mb-2">Processing Layer</h4>
                          <p className="text-sm text-gray-600">Business logic, validation, transformation, and workflow orchestration</p>
                        </div>
                        <div className="bg-white p-4 rounded border">
                          <h4 className="font-medium mb-2">Storage Layer</h4>
                          <p className="text-sm text-gray-600">Database persistence, blockchain records, and file storage</p>
                        </div>
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

            {/* Automatic Data Creation */}
            <section id="automatic-data">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Database className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold">Automatic Data Creation & Database Triggers</h2>
                  </div>
                  
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">User Registration Data Flow</h3>
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h4 className="font-medium text-blue-900 mb-3">When a user is created, automatic data is inserted into:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded border">
                            <h5 className="font-medium mb-2">Primary Tables</h5>
                            <ul className="text-sm space-y-1">
                              <li>• <code>users</code> - Core user information</li>
                              <li>• <code>user_profiles</code> - Extended profile data</li>
                              <li>• <code>user_preferences</code> - Default settings</li>
                              <li>• <code>notification_preferences</code> - Communication settings</li>
                              <li>• <code>accounts</code> - Default wallet account</li>
                            </ul>
                          </div>
                          <div className="bg-white p-4 rounded border">
                            <h5 className="font-medium mb-2">Default Values Created</h5>
                            <ul className="text-sm space-y-1">
                              <li>• Default notification preferences (all enabled)</li>
                              <li>• Empty user profile with basic info</li>
                              <li>• Initial account with 0 balance</li>
                              <li>• Default privacy settings</li>
                              <li>• Audit log entry for user creation</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-6 bg-gray-900 text-gray-100 p-4 rounded-lg">
                        <h5 className="text-green-400 mb-2">Database Trigger Function</h5>
                        <pre className="text-sm overflow-x-auto">
{`-- Trigger function for new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO user_profiles (user_id, created_at)
  VALUES (NEW.id, NOW());
  
  -- Create default preferences
  INSERT INTO user_preferences (user_id, has_setup_preference)
  VALUES (NEW.id, false);
  
  -- Create notification preferences with defaults
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id);
  
  -- Create default account
  INSERT INTO accounts (user_id, type, status)
  VALUES (NEW.id, 'main', 'active');
  
  -- Log the user creation
  INSERT INTO audit_trails (action, resource_type, resource_id, user_id)
  VALUES ('create', 'user', NEW.id, NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;`}
                        </pre>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Property Creation Data Flow</h3>
                      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <h4 className="font-medium text-green-900 mb-3">When a property is created, the system automatically:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-white p-4 rounded border">
                            <h5 className="font-medium mb-2">Data Created</h5>
                            <ul className="text-sm space-y-1">
                              <li>• Property record in <code>properties</code> table</li>
                              <li>• Initial property images placeholder</li>
                              <li>• Property view tracking record</li>
                              <li>• Default property settings</li>
                              <li>• Verification workflow initiation</li>
                            </ul>
                          </div>
                          <div className="bg-white p-4 rounded border">
                            <h5 className="font-medium mb-2">Automatic Processes</h5>
                            <ul className="text-sm space-y-1">
                              <li>• AI valuation request queued</li>
                              <li>• Location analysis triggered</li>
                              <li>• Document verification workflow started</li>
                              <li>• Property analytics initialization</li>
                              <li>• Market comparison data gathering</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Document Upload Data Flow</h3>
                      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                        <h4 className="font-medium text-purple-900 mb-3">Document processing creates:</h4>
                        <div className="space-y-4">
                          <div className="bg-white p-4 rounded border">
                            <h5 className="font-medium mb-2">Immediate Actions</h5>
                            <ul className="text-sm space-y-1">
                              <li>• File uploaded to secure storage with encryption</li>
                              <li>• Document hash generated for integrity verification</li>
                              <li>• Metadata extracted and stored</li>
                              <li>• Virus/malware scanning initiated</li>
                              <li>• OCR processing for text extraction</li>
                            </ul>
                          </div>
                          <div className="bg-white p-4 rounded border">
                            <h5 className="font-medium mb-2">Background Processing</h5>
                            <ul className="text-sm space-y-1">
                              <li>• Document verification queue entry</li>
                              <li>• AI-powered document classification</li>
                              <li>• Thumbnail generation</li>
                              <li>• Compliance checking (if applicable)</li>
                              <li>• Audit trail logging</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Transaction Processing</h3>
                      <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                        <h4 className="font-medium text-orange-900 mb-3">Every transaction automatically creates:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-white p-4 rounded border">
                            <h5 className="font-medium mb-2">Financial Records</h5>
                            <ul className="text-sm space-y-1">
                              <li>• Payment record</li>
                              <li>• Account balance update</li>
                              <li>• Transaction fee calculation</li>
                              <li>• Tax record (if applicable)</li>
                            </ul>
                          </div>
                          <div className="bg-white p-4 rounded border">
                            <h5 className="font-medium mb-2">Compliance & Security</h5>
                            <ul className="text-sm space-y-1">
                              <li>• AML check initiation</li>
                              <li>• Fraud detection analysis</li>
                              <li>• Audit trail entry</li>
                              <li>• Risk assessment update</li>
                            </ul>
                          </div>
                          <div className="bg-white p-4 rounded border">
                            <h5 className="font-medium mb-2">Notifications</h5>
                            <ul className="text-sm space-y-1">
                              <li>• User notification</li>
                              <li>• Email confirmation</li>
                              <li>• SMS alert (if enabled)</li>
                              <li>• Push notification</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Identity Verification */}
            <section id="verification-flow">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold">Identity Verification Process</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">KYC Document Processing</h3>
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">Document Upload Flow</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>1. File validation and security scan</li>
                              <li>2. Image quality assessment</li>
                              <li>3. OCR text extraction</li>
                              <li>4. Document classification (NIN, BVN, Passport, etc.)</li>
                              <li>5. Data extraction and validation</li>
                              <li>6. Biometric data processing (if applicable)</li>
                            </ul>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-900 mb-2">Automated Verification</h4>
                            <ul className="text-sm text-green-800 space-y-1">
                              <li>• Real-time government database checks</li>
                              <li>• Cross-reference with existing records</li>
                              <li>• Face matching with document photo</li>
                              <li>• Address verification</li>
                              <li>• Sanctions and watchlist screening</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Verification Workflow</h3>
                        <div className="space-y-4">
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h4 className="font-medium text-purple-900 mb-2">Multi-tier Verification</h4>
                            <ul className="text-sm text-purple-800 space-y-1">
                              <li>• Tier 1: Basic identity verification</li>
                              <li>• Tier 2: Enhanced due diligence</li>
                              <li>• Tier 3: High-risk customer assessment</li>
                              <li>• Manual review for edge cases</li>
                              <li>• Continuous monitoring</li>
                            </ul>
                          </div>
                          
                          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <h4 className="font-medium text-orange-900 mb-2">Database Updates</h4>
                            <ul className="text-sm text-orange-800 space-y-1">
                              <li>• <code>identity_verifications</code> table</li>
                              <li>• <code>kyc_documents</code> table</li>
                              <li>• <code>user_profiles</code> verification status</li>
                              <li>• <code>audit_trails</code> for compliance</li>
                              <li>• <code>sanctions_screening</code> results</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Property Management */}
            <section id="property-flow">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Home className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold">Property Management</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Property Lifecycle</h3>
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">Property Creation</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• Property listing creation</li>
                              <li>• Initial property images upload</li>
                              <li>• Property metadata setup</li>
                              <li>• Verification workflow initiation</li>
                              <li>• AI valuation request</li>
                            </ul>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-900 mb-2">Property Updates</h4>
                            <ul className="text-sm text-green-800 space-y-1">
                              <li>• Property information updates</li>
                              <li>• Document uploads</li>
                              <li>• Status changes</li>
                              <li>• Market data updates</li>
                              <li>• Verification status updates</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Property Management Features</h3>
                        <div className="space-y-4">
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h4 className="font-medium text-purple-900 mb-2">Property Analytics</h4>
                            <ul className="text-sm text-purple-800 space-y-1">
                              <li>• Market trend analysis</li>
                              <li>• Property performance metrics</li>
                              <li>• Investment return projections</li>
                              <li>• Risk assessment reports</li>
                              <li>• Compliance status tracking</li>
                            </ul>
                          </div>
                          
                          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <h4 className="font-medium text-orange-900 mb-2">Property Security</h4>
                            <ul className="text-sm text-orange-800 space-y-1">
                              <li>• Access control for property data</li>
                              <li>• Document verification status</li>
                              <li>• Audit trail for property changes</li>
                              <li>• Compliance monitoring</li>
                              <li>• Fraud detection for property transactions</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Document Processing */}
            <section id="document-flow">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold">Document Processing & Verification</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Document Types & Processing</h3>
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">Property Documents</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• <strong>Deeds:</strong> Property ownership proof</li>
                              <li>• <strong>Survey Plans:</strong> Boundary and measurements</li>
                              <li>• <strong>C of O:</strong> Certificate of Occupancy</li>
                              <li>• <strong>Government Consent:</strong> Transfer approvals</li>
                              <li>• <strong>Tax Clearance:</strong> Payment verification</li>
                            </ul>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-900 mb-2">Processing Pipeline</h4>
                            <ul className="text-sm text-green-800 space-y-1">
                              <li>1. File upload and virus scanning</li>
                              <li>2. Format validation and conversion</li>
                              <li>3. OCR and text extraction</li>
                              <li>4. AI-powered classification</li>
                              <li>5. Data extraction and validation</li>
                              <li>6. Verification queue assignment</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Verification Workflow</h3>
                        <div className="space-y-4">
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h4 className="font-medium text-purple-900 mb-2">Automated Checks</h4>
                            <ul className="text-sm text-purple-800 space-y-1">
                              <li>• Document authenticity verification</li>
                              <li>• Government registry cross-check</li>
                              <li>• Previous ownership validation</li>
                              <li>• Legal compliance assessment</li>
                              <li>• Fraud detection analysis</li>
                            </ul>
                          </div>
                          
                          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <h4 className="font-medium text-orange-900 mb-2">Manual Review</h4>
                            <ul className="text-sm text-orange-800 space-y-1">
                              <li>• Expert verifier assignment</li>
                              <li>• Document quality assessment</li>
                              <li>• Legal compliance review</li>
                              <li>• Final approval/rejection</li>
                              <li>• Feedback and recommendations</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Document Storage & Security</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                          <h4 className="font-medium text-red-900 mb-2">Encryption</h4>
                          <ul className="text-sm text-red-800 space-y-1">
                            <li>• AES-256 encryption at rest</li>
                            <li>• TLS 1.3 for data in transit</li>
                            <li>• End-to-end encryption for sensitive docs</li>
                            <li>• Key rotation and management</li>
                          </ul>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-900 mb-2">Access Control</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Role-based access permissions</li>
                            <li>• Document owner controls</li>
                            <li>• Verifier access management</li>
                            <li>• Audit logging for all access</li>
                          </ul>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-900 mb-2">Compliance</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• GDPR/NDPR compliance</li>
                            <li>• Document retention policies</li>
                            <li>• Right to erasure support</li>
                            <li>• Regular compliance audits</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Database Triggers & Functions */}
            <section id="triggers-functions">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <GitBranch className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold">Database Triggers & Functions</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Automatic Triggers</h3>
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">User-Related Triggers</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• <code>on_auth_user_created</code> - Profile setup</li>
                              <li>• <code>update_user_timestamp</code> - Last activity</li>
                              <li>• <code>log_profile_changes</code> - Audit tracking</li>
                              <li>• <code>validate_user_data</code> - Data integrity</li>
                            </ul>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-900 mb-2">Property Triggers</h4>
                            <ul className="text-sm text-green-800 space-y-1">
                              <li>• <code>property_created</code> - Workflow initiation</li>
                              <li>• <code>update_property_stats</code> - Analytics</li>
                              <li>• <code>property_status_change</code> - Notifications</li>
                              <li>• <code>calculate_market_metrics</code> - Valuation</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Business Logic Functions</h3>
                        <div className="space-y-4">
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h4 className="font-medium text-purple-900 mb-2">Security Functions</h4>
                            <ul className="text-sm text-purple-800 space-y-1">
                              <li>• <code>has_role(user_id, role)</code> - Permission check</li>
                              <li>• <code>is_user_verified(user_id)</code> - KYC status</li>
                              <li>• <code>can_access_property()</code> - Access control</li>
                              <li>• <code>get_user_active_roles()</code> - Role management</li>
                            </ul>
                          </div>
                          
                          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <h4 className="font-medium text-orange-900 mb-2">Business Functions</h4>
                            <ul className="text-sm text-orange-800 space-y-1">
                              <li>• <code>calculate_roi()</code> - Investment returns</li>
                              <li>• <code>distribute_revenue()</code> - Dividend calculation</li>
                              <li>• <code>update_token_balance()</code> - Blockchain sync</li>
                              <li>• <code>generate_financial_report()</code> - Reporting</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Example Trigger Implementation</h3>
                      <div className="bg-gray-900 text-gray-100 p-6 rounded-lg">
                        <pre className="text-sm overflow-x-auto">
{`-- Example: Property creation trigger
CREATE OR REPLACE FUNCTION handle_property_created()
RETURNS TRIGGER AS $$
DECLARE
  workflow_id UUID;
BEGIN
  -- Create property creation workflow
  INSERT INTO property_creation_workflows (
    user_id, 
    property_id, 
    current_step, 
    status
  ) VALUES (
    NEW.user_id, 
    NEW.id, 
    1, 
    'in_progress'
  ) RETURNING id INTO workflow_id;
  
  -- Queue AI valuation
  INSERT INTO ai_property_valuations (
    property_id,
    user_id,
    status
  ) VALUES (
    NEW.id,
    NEW.user_id,
    'queued'
  );
  
  -- Initialize analytics
  INSERT INTO property_views (
    property_id,
    view_count
  ) VALUES (
    NEW.id,
    0
  );
  
  -- Create audit log
  INSERT INTO audit_trails (
    action,
    resource_type,
    resource_id,
    user_id,
    metadata
  ) VALUES (
    'create',
    'property',
    NEW.id,
    NEW.user_id,
    jsonb_build_object(
      'workflow_id', workflow_id,
      'property_type', NEW.type,
      'created_at', NOW()
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to properties table
CREATE TRIGGER on_property_created
  AFTER INSERT ON properties
  FOR EACH ROW
  EXECUTE FUNCTION handle_property_created();`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Edge Functions Deep Dive */}
            <section id="edge-functions">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Code className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold">Edge Functions Deep Dive</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Core Edge Functions</h3>
                        <div className="space-y-4">
                          {[
                            { 
                              name: "ai-property-valuation", 
                              desc: "AI-powered property valuation using OpenAI GPT-4",
                              inputs: "Property details, location, market data",
                              outputs: "Estimated value, confidence score, comparable properties"
                            },
                            { 
                              name: "create-hedera-token", 
                              desc: "Property tokenization on Hedera blockchain",
                              inputs: "Property ID, token metadata, supply amount",
                              outputs: "Token ID, transaction hash, smart contract address"
                            },
                            { 
                              name: "process-payment", 
                              desc: "Payment processing with multiple providers",
                              inputs: "Amount, currency, payment method, user ID",
                              outputs: "Payment status, transaction ID, receipt"
                            },
                            { 
                              name: "send-notification", 
                              desc: "Multi-channel notification delivery",
                              inputs: "User ID, message, channels, priority",
                              outputs: "Delivery status, message ID, tracking info"
                            }
                          ].map((fn, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border">
                              <div className="flex items-center gap-2 mb-2">
                                <Code className="h-4 w-4 text-indigo-600" />
                                <code className="text-sm font-mono text-indigo-700">{fn.name}</code>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{fn.desc}</p>
                              <div className="text-xs space-y-1">
                                <div><span className="font-medium">Inputs:</span> {fn.inputs}</div>
                                <div><span className="font-medium">Outputs:</span> {fn.outputs}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Function Architecture</h3>
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">Runtime Environment</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• Deno runtime for TypeScript execution</li>
                              <li>• Isolated execution environment</li>
                              <li>• Automatic scaling based on demand</li>
                              <li>• Global edge deployment</li>
                              <li>• Sub-100ms cold start times</li>
                            </ul>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-900 mb-2">Security Features</h4>
                            <ul className="text-sm text-green-800 space-y-1">
                              <li>• JWT token validation</li>
                              <li>• Row Level Security integration</li>
                              <li>• API key authentication</li>
                              <li>• Rate limiting and throttling</li>
                              <li>• Input validation and sanitization</li>
                            </ul>
                          </div>
                          
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h4 className="font-medium text-purple-900 mb-2">Error Handling</h4>
                            <ul className="text-sm text-purple-800 space-y-1">
                              <li>• Structured error responses</li>
                              <li>• Retry mechanisms for transient failures</li>
                              <li>• Dead letter queues for failed requests</li>
                              <li>• Comprehensive logging and monitoring</li>
                              <li>• Graceful degradation strategies</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Example Edge Function</h3>
                      <div className="bg-gray-900 text-gray-100 p-6 rounded-lg">
                        <pre className="text-sm overflow-x-auto">
{`// ai-property-valuation/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { propertyId, propertyDetails } = await req.json()
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!
    const { data: { user } } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (!user) {
      throw new Error('Unauthorized')
    }

    // Call OpenAI for valuation
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${Deno.env.get('OPENAI_API_KEY')}\`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: \`Analyze this property for valuation: \${JSON.stringify(propertyDetails)}\`
        }],
        temperature: 0.3,
      }),
    })

    const aiResult = await openaiResponse.json()
    
    // Store valuation result
    const { data: valuation } = await supabase
      .from('ai_property_valuations')
      .insert({
        property_id: propertyId,
        user_id: user.id,
        ai_estimated_value: aiResult.estimated_value,
        confidence_score: aiResult.confidence,
        valuation_factors: aiResult.factors,
        market_comparisons: aiResult.comparables
      })
      .select()
      .single()

    return new Response(
      JSON.stringify({ success: true, valuation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})`}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Continue with remaining sections... */}
            <section id="tokenization-flow">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Coins className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold">Tokenization Process</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Tokenization Workflow</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-900 mb-2">Token Creation</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Property tokenization request</li>
                            <li>• Token metadata setup</li>
                            <li>• Token supply allocation</li>
                            <li>• Smart contract deployment</li>
                            <li>• Token minting</li>
                          </ul>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-900 mb-2">Token Management</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Token ownership tracking</li>
                            <li>• Token transfers and trading</li>
                            <li>• Token status updates</li>
                            <li>• Token metadata updates</li>
                            <li>• Token audit logs</li>
                          </ul>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <h4 className="font-medium text-purple-900 mb-2">Token Security</h4>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• Token access control</li>
                            <li>• Token verification</li>
                            <li>• Token compliance checks</li>
                            <li>• Token audit trails</li>
                            <li>• Token fraud detection</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="payment-flow">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Database className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold">Payment Processing</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Payment Workflow</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-900 mb-2">Payment Initiation</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Payment request creation</li>
                            <li>• Payment method selection</li>
                            <li>• Payment validation</li>
                            <li>• Payment processing</li>
                            <li>• Payment confirmation</li>
                          </ul>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-900 mb-2">Payment Processing</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Payment execution</li>
                            <li>• Payment confirmation</li>
                            <li>• Payment record creation</li>
                            <li>• Payment audit logging</li>
                            <li>• Payment reconciliation</li>
                          </ul>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <h4 className="font-medium text-purple-900 mb-2">Payment Security</h4>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• Payment encryption</li>
                            <li>• Payment validation</li>
                            <li>• Payment fraud detection</li>
                            <li>• Payment compliance checks</li>
                            <li>• Payment audit trails</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="security-layers">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Lock className="h-6 w-6 text-orange-600" />
                    <h2 className="text-2xl font-bold">Security Architecture</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Security Layers</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-900 mb-2">Data Encryption</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• AES-256 encryption at rest</li>
                            <li>• TLS 1.3 for data in transit</li>
                            <li>• End-to-end encryption for sensitive data</li>
                            <li>• Key rotation and management</li>
                          </ul>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-900 mb-2">Access Control</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Role-based access permissions</li>
                            <li>• User authentication</li>
                            <li>• Device fingerprinting</li>
                            <li>• Session management</li>
                            <li>• Multi-factor authentication</li>
                          </ul>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <h4 className="font-medium text-purple-900 mb-2">Compliance</h4>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• GDPR/NDPR compliance</li>
                            <li>• Data protection policies</li>
                            <li>• Right to erasure support</li>
                            <li>• Regular compliance audits</li>
                            <li>• Security audit logging</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

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

            <section id="blockchain-integration">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Network className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold">Blockchain Integration</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Hedera Hashgraph Services</h3>
                        <div className="space-y-4">
                          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                            <h4 className="font-medium text-purple-900 mb-2">Token Service (HTS)</h4>
                            <ul className="text-sm text-purple-800 space-y-1">
                              <li>• Property tokenization and minting</li>
                              <li>• Token transfers and trading</li>
                              <li>• Supply management and controls</li>
                              <li>• Freeze and wipe capabilities</li>
                              <li>• Custom token properties</li>
                            </ul>
                          </div>
                          
                          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h4 className="font-medium text-blue-900 mb-2">File Service (HFS)</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                              <li>• Document immutable storage</li>
                              <li>• Property metadata storage</li>
                              <li>• Legal agreement archival</li>
                              <li>• Audit trail documentation</li>
                              <li>• Compliance record keeping</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Smart Contract Integration</h3>
                        <div className="space-y-4">
                          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                            <h4 className="font-medium text-green-900 mb-2">Property Registry Contract</h4>
                            <ul className="text-sm text-green-800 space-y-1">
                              <li>• Property ownership verification</li>
                              <li>• Transfer history tracking</li>
                              <li>• Legal compliance automation</li>
                              <li>• Multi-signature requirements</li>
                              <li>• Escrow functionality</li>
                            </ul>
                          </div>
                          
                          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                            <h4 className="font-medium text-orange-900 mb-2">Revenue Distribution</h4>
                            <ul className="text-sm text-orange-800 space-y-1">
                              <li>• Automated dividend calculations</li>
                              <li>• Proportional distribution logic</li>
                              <li>• Tax withholding management</li>
                              <li>• Payment scheduling</li>
                              <li>• Dispute resolution mechanisms</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section id="monitoring">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Cpu className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold">Monitoring & Analytics</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">Monitoring Architecture</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-900 mb-2">System Monitoring</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Real-time performance metrics</li>
                            <li>• Error tracking and logging</li>
                            <li>• Resource utilization monitoring</li>
                            <li>• API request tracking</li>
                            <li>• User activity monitoring</li>
                          </ul>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-900 mb-2">Analytics</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• User behavior analytics</li>
                            <li>• Property market trends</li>
                            <li>• Transaction analytics</li>
                            <li>• Revenue distribution analytics</li>
                            <li>• Security incident analytics</li>
                          </ul>
                        </div>
                        
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <h4 className="font-medium text-purple-900 mb-2">Compliance Monitoring</h4>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• Regulatory compliance tracking</li>
                            <li>• Data protection monitoring</li>
                            <li>• Audit trail monitoring</li>
                            <li>• Security incident monitoring</li>
                            <li>• Risk assessment monitoring</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <Separator className="my-8" />

            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>This technical documentation is continuously updated to reflect our evolving architecture.</p>
              <p>For technical questions or contributions, contact our engineering team at tech@terravault.com</p>
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

export default DataFlow;
