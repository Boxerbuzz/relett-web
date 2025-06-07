
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  BookOpen, Database, Code, Webhook, ArrowLeft, Twitter, Facebook, 
  Instagram, Linkedin, Mail, Phone, MapPin, Key, Server, Activity,
  Globe, FileText, Settings, Zap, Shield, Users, Lock, Eye, HardDrive
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar - Fixed positioning */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white">
        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Technical Documentation</h1>
            <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          {/* Table of Contents */}
          <div className="p-6">
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
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-80">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-bold text-gray-900">Technical Documentation</h1>
          <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Mobile TOC */}
        <div className="lg:hidden p-4">
          <Card className="mb-6">
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

        {/* Content */}
        <div className="p-4 lg:p-8 space-y-8">
          
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
                    <h3 className="text-lg font-semibold mb-4">Core Tables Overview</h3>
                    <p className="text-gray-700 mb-4">
                      Our database consists of 68+ tables organized into logical groups for scalability and maintainability.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-3">User Management</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• <strong>users:</strong> Core user profiles and authentication</li>
                          <li>• <strong>user_roles:</strong> Role-based access control</li>
                          <li>• <strong>user_preferences:</strong> Notification and app settings</li>
                          <li>• <strong>identity_verifications:</strong> KYC and document verification</li>
                          <li>• <strong>kyc_documents:</strong> Identity document storage</li>
                        </ul>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-3">Property System</h4>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• <strong>properties:</strong> Property listings and details</li>
                          <li>• <strong>land_titles:</strong> Legal ownership records</li>
                          <li>• <strong>property_documents:</strong> Legal and verification docs</li>
                          <li>• <strong>property_valuations:</strong> AI and professional valuations</li>
                          <li>• <strong>property_images:</strong> Media and visual content</li>
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
                        <li>• <strong>POST /auth/register:</strong> Create new user account</li>
                        <li>• <strong>POST /auth/login:</strong> Authenticate users</li>
                        <li>• <strong>PUT /users/profile:</strong> Update user information</li>
                        <li>• <strong>POST /auth/reset-password:</strong> Reset forgotten passwords</li>
                        <li>• <strong>POST /auth/verify-email:</strong> Confirm email address</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-3">Property Management</h3>
                      <ul className="text-sm text-green-800 space-y-2">
                        <li>• <strong>POST /properties:</strong> Create property listings</li>
                        <li>• <strong>GET /properties:</strong> Search and filter properties</li>
                        <li>• <strong>GET /properties/:id:</strong> Get property details</li>
                        <li>• <strong>PUT /properties/:id:</strong> Update property information</li>
                        <li>• <strong>POST /properties/:id/book:</strong> Create reservations</li>
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
                      <h3 className="font-semibold text-blue-900 mb-3">AI & Analytics</h3>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• ai-property-valuation</li>
                        <li>• ai-location-analysis</li>
                        <li>• ai-learning-tracker</li>
                        <li>• advanced-search</li>
                      </ul>
                    </div>

                    <div className="bg-green-50 p-6 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-3">Payment Processing</h3>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>• create-payment-session</li>
                        <li>• create-payment-intent</li>
                        <li>• verify-payment</li>
                        <li>• process-token-transaction</li>
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

          <Separator className="my-8" />

          <div className="text-center text-sm text-gray-600 space-y-2">
            <p>For technical support, contact our developers at dev@terravault.com</p>
            <p>This documentation is regularly updated with new features and improvements.</p>
            <p>Join our developer community for discussions and updates.</p>
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
    </div>
  );
};

export default Documentation;
