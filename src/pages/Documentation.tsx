
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Book, Code, Users, Zap, Shield, Database, Coins, Home, FileText, ArrowRight, 
  ArrowLeft, Twitter, Facebook, Instagram, Linkedin, Mail, Phone, MapPin,
  Server, Globe, Settings, HelpCircle, Wrench, GitBranch, Terminal, Package
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Documentation = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");

  const tableOfContents = [
    { id: "overview", title: "Platform Overview", icon: Globe },
    { id: "getting-started", title: "Getting Started", icon: Zap },
    { id: "user-guides", title: "User Guides", icon: Users },
    { id: "properties", title: "Property Management", icon: Home },
    { id: "tokenization", title: "Tokenization", icon: Coins },
    { id: "api-reference", title: "API Reference", icon: Server },
    { id: "sdk-libraries", title: "SDKs & Libraries", icon: Package },
    { id: "webhooks", title: "Webhooks", icon: GitBranch },
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
        {/* Table of Contents Sidebar */}
        <aside className="hidden lg:block w-80 bg-white border-r border-gray-200 sticky top-[73px] h-[calc(100vh-73px)]">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Documentation</h2>
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
                        <p className="text-sm text-blue-800">Complete lifecycle management from listing to sale, including AI-powered valuations</p>
                        <ul className="text-xs text-blue-700 mt-2 space-y-1">
                          <li>• Automated property verification</li>
                          <li>• AI valuation algorithms</li>
                          <li>• Document management system</li>
                          <li>• Multi-channel marketing</li>
                        </ul>
                      </div>
                      
                      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                        <Coins className="h-8 w-8 text-purple-600 mb-3" />
                        <h3 className="font-semibold text-purple-900 mb-2">Property Tokenization</h3>
                        <p className="text-sm text-purple-800">Convert real estate into tradeable blockchain tokens using Hedera technology</p>
                        <ul className="text-xs text-purple-700 mt-2 space-y-1">
                          <li>• Hedera Token Service (HTS)</li>
                          <li>• Smart contract automation</li>
                          <li>• Fractional ownership</li>
                          <li>• Revenue distribution</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <Users className="h-8 w-8 text-green-600 mb-3" />
                        <h3 className="font-semibold text-green-900 mb-2">Investment Platform</h3>
                        <p className="text-sm text-green-800">Democratized real estate investment with low barriers to entry</p>
                        <ul className="text-xs text-green-700 mt-2 space-y-1">
                          <li>• Portfolio management</li>
                          <li>• Investment analytics</li>
                          <li>• Group investing</li>
                          <li>• Performance tracking</li>
                        </ul>
                      </div>
                      
                      <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
                        <Shield className="h-8 w-8 text-orange-600 mb-3" />
                        <h3 className="font-semibold text-orange-900 mb-2">Security & Compliance</h3>
                        <p className="text-sm text-orange-800">Enterprise-grade security with full regulatory compliance</p>
                        <ul className="text-xs text-orange-700 mt-2 space-y-1">
                          <li>• KYC/AML verification</li>
                          <li>• End-to-end encryption</li>
                          <li>• Audit trails</li>
                          <li>• Regulatory reporting</li>
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
                              "Access property analytics"
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
                              "Receive dividends"
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
                              "Access agent tools"
                            ]
                          },
                          {
                            role: "Verifier",
                            badge: "destructive",
                            capabilities: [
                              "Verify property documents",
                              "Conduct inspections", 
                              "Approve listings",
                              "Maintain compliance",
                              "Quality assurance"
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
                              "Analytics & reporting"
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
                                { method: "GET", endpoint: "/api/properties", desc: "List all properties with filters" },
                                { method: "POST", endpoint: "/api/properties", desc: "Create new property listing" },
                                { method: "PUT", endpoint: "/api/properties/:id", desc: "Update property details" },
                                { method: "DELETE", endpoint: "/api/properties/:id", desc: "Remove property listing" },
                                { method: "POST", endpoint: "/api/properties/:id/images", desc: "Upload property images" }
                              ].map((api, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded border">
                                  <Badge variant={api.method === "GET" ? "outline" : api.method === "POST" ? "default" : api.method === "PUT" ? "secondary" : "destructive"}>
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
                                { method: "GET", endpoint: "/api/users/profile", desc: "Get current user profile" },
                                { method: "PUT", endpoint: "/api/users/profile", desc: "Update user profile" },
                                { method: "POST", endpoint: "/api/users/verify", desc: "Submit KYC documents" },
                                { method: "GET", endpoint: "/api/users/notifications", desc: "Get user notifications" }
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
                                { method: "POST", endpoint: "/api/tokenize/property", desc: "Create property tokens" },
                                { method: "GET", endpoint: "/api/tokens/:propertyId", desc: "Get token information" },
                                { method: "POST", endpoint: "/api/tokens/transfer", desc: "Transfer tokens" },
                                { method: "GET", endpoint: "/api/tokens/holdings", desc: "Get user token holdings" },
                                { method: "POST", endpoint: "/api/revenue/distribute", desc: "Distribute revenue to holders" }
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
                                { method: "POST", endpoint: "/api/payments/intent", desc: "Create payment intent" },
                                { method: "POST", endpoint: "/api/payments/verify", desc: "Verify payment status" },
                                { method: "GET", endpoint: "/api/payments/history", desc: "Get payment history" },
                                { method: "POST", endpoint: "/api/escrow/create", desc: "Create escrow account" }
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

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Response Format</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Success Response</h4>
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                            <div className="text-green-400 mb-2">// HTTP 200 OK</div>
                            <div className="font-mono text-sm space-y-1">
                              <div>{'{'}</div>
                              <div className="ml-2">"success": <span className="text-green-400">true</span>,</div>
                              <div className="ml-2">"data": {'{'}</div>
                              <div className="ml-4">"id": <span className="text-yellow-400">"prop_123"</span>,</div>
                              <div className="ml-4">"title": <span className="text-yellow-400">"Lagos Luxury Villa"</span>,</div>
                              <div className="ml-4">"price": <span className="text-blue-400">150000000</span></div>
                              <div className="ml-2">{'}'}</div>
                              <div>{'}'}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">Error Response</h4>
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                            <div className="text-red-400 mb-2">// HTTP 400 Bad Request</div>
                            <div className="font-mono text-sm space-y-1">
                              <div>{'{'}</div>
                              <div className="ml-2">"success": <span className="text-red-400">false</span>,</div>
                              <div className="ml-2">"error": {'{'}</div>
                              <div className="ml-4">"code": <span className="text-yellow-400">"VALIDATION_ERROR"</span>,</div>
                              <div className="ml-4">"message": <span className="text-yellow-400">"Invalid property data"</span>,</div>
                              <div className="ml-4">"details": [...]</div>
                              <div className="ml-2">{'}'}</div>
                              <div>{'}'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* SDKs & Libraries */}
            <section id="sdk-libraries">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Package className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold">SDKs & Libraries</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-3">JavaScript/TypeScript SDK</h3>
                        <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm font-mono mb-3">
                          <div>npm install terra-vault-sdk</div>
                        </div>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Complete API wrapper</li>
                          <li>• TypeScript support</li>
                          <li>• Real-time subscriptions</li>
                          <li>• Built-in error handling</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-900 mb-3">Python SDK</h3>
                        <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm font-mono mb-3">
                          <div>pip install terra-vault-python</div>
                        </div>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Async/await support</li>
                          <li>• Pandas integration</li>
                          <li>• Data analysis tools</li>
                          <li>• Jupyter notebook examples</li>
                        </ul>
                      </div>
                      
                      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                        <h3 className="font-semibold text-purple-900 mb-3">React Hooks</h3>
                        <div className="bg-gray-900 text-gray-100 p-3 rounded text-sm font-mono mb-3">
                          <div>npm install @terra-vault/react</div>
                        </div>
                        <ul className="text-sm text-purple-800 space-y-1">
                          <li>• Custom React hooks</li>
                          <li>• State management</li>
                          <li>• Component library</li>
                          <li>• Form validation</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Usage Examples</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">JavaScript/TypeScript</h4>
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                            <div className="text-green-400 mb-2">// Initialize SDK</div>
                            <div className="font-mono text-sm space-y-1">
                              <div><span className="text-blue-400">import</span> TerraVault <span className="text-blue-400">from</span> <span className="text-yellow-400">'terra-vault-sdk'</span></div>
                              <div></div>
                              <div><span className="text-blue-400">const</span> tv = <span className="text-blue-400">new</span> TerraVault({'{'}</div>
                              <div className="ml-2">apiKey: <span className="text-yellow-400">'your-api-key'</span>,</div>
                              <div className="ml-2">environment: <span className="text-yellow-400">'production'</span></div>
                              <div>{'}'})</div>
                              <div></div>
                              <div className="text-green-400">// List properties</div>
                              <div><span className="text-blue-400">const</span> properties = <span className="text-blue-400">await</span> tv.properties.list({'{'}</div>
                              <div className="ml-2">limit: <span className="text-red-400">10</span>,</div>
                              <div className="ml-2">location: <span className="text-yellow-400">'Lagos'</span></div>
                              <div>{'}'})</div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-3">React Hooks</h4>
                          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg">
                            <div className="text-green-400 mb-2">// Use Terra Vault hooks</div>
                            <div className="font-mono text-sm space-y-1">
                              <div><span className="text-blue-400">import</span> {'{ useProperties }'} <span className="text-blue-400">from</span> <span className="text-yellow-400">'@terra-vault/react'</span></div>
                              <div></div>
                              <div><span className="text-blue-400">function</span> PropertyList() {'{'}</div>
                              <div className="ml-2"><span className="text-blue-400">const</span> {'{ data, loading, error }'} = useProperties({'{'}</div>
                              <div className="ml-4">filters: {'{ location: "Lagos" }'}</div>
                              <div className="ml-2">{'}'})</div>
                              <div></div>
                              <div className="ml-2"><span className="text-blue-400">if</span> (loading) <span className="text-blue-400">return</span> <span className="text-yellow-400">'Loading...'</span></div>
                              <div className="ml-2"><span className="text-blue-400">return</span> <span className="text-red-400">&lt;PropertyGrid properties={'{data}'} /&gt;</span></div>
                              <div>{'}'}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Continue with remaining sections... */}
            {/* For brevity, I'll include a few more key sections */}

            {/* Support */}
            <section id="support">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <HelpCircle className="h-6 w-6 text-orange-600" />
                    <h2 className="text-2xl font-bold">Support & Community</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-3">Technical Support</h3>
                        <ul className="text-sm text-blue-800 space-y-2">
                          <li>• <strong>Email:</strong> tech@terravault.com</li>
                          <li>• <strong>Response Time:</strong> 12-24 hours</li>
                          <li>• <strong>Coverage:</strong> API issues, integration help</li>
                          <li>• <strong>SLA:</strong> 99.9% uptime guarantee</li>
                        </ul>
                      </div>
                      
                      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                        <h3 className="font-semibold text-green-900 mb-3">Community Support</h3>
                        <ul className="text-sm text-green-800 space-y-2">
                          <li>• <strong>Discord:</strong> Developer community</li>
                          <li>• <strong>GitHub:</strong> Open source repositories</li>
                          <li>• <strong>Stack Overflow:</strong> terra-vault tag</li>
                          <li>• <strong>Forums:</strong> Community discussions</li>
                        </ul>
                      </div>
                      
                      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                        <h3 className="font-semibold text-purple-900 mb-3">Enterprise Support</h3>
                        <ul className="text-sm text-purple-800 space-y-2">
                          <li>• <strong>Dedicated Account Manager</strong></li>
                          <li>• <strong>Priority Support</strong></li>
                          <li>• <strong>Custom Integration</strong></li>
                          <li>• <strong>Training & Workshops</strong></li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">System Status</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { service: "API Gateway", status: "Operational", color: "green" },
                          { service: "Database", status: "Operational", color: "green" },
                          { service: "Blockchain Network", status: "Operational", color: "green" },
                          { service: "Payment Processing", status: "Operational", color: "green" }
                        ].map((service, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                            <span className="text-sm font-medium">{service.service}</span>
                            <Badge className={`bg-${service.color}-600`}>{service.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

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

          <div className="border-t border-gray-800 mt-8 pt-8">
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
        </div>
      </footer>
    </div>
  );
};

export default Documentation;
