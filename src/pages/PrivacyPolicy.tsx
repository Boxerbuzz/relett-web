import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Eye, Database, Lock, Share, FileText, AlertTriangle, ArrowLeft, 
  Twitter, Facebook, Instagram, Linkedin, Mail, Phone, MapPin, Users,
  Globe, Settings, Clock, Trash2, Server, Activity, Smartphone, HardDrive
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("commitment");

  const tableOfContents = [
    { id: "commitment", title: "Our Privacy Commitment", icon: Shield },
    { id: "collection", title: "Information We Collect", icon: Database },
    { id: "usage", title: "How We Use Information", icon: Eye },
    { id: "sharing", title: "Information Sharing", icon: Share },
    { id: "protection", title: "Data Protection & Security", icon: Lock },
    { id: "rights", title: "Your Privacy Rights", icon: Users },
    { id: "retention", title: "Data Retention", icon: Clock },
    { id: "international", title: "International Transfers", icon: Globe },
    { id: "cookies", title: "Cookies & Tracking", icon: Settings },
    { id: "automated-processing", title: "Automated Processing & AI", icon: Activity },
    { id: "blockchain", title: "Blockchain & Public Data", icon: Server },
    { id: "children", title: "Children's Privacy", icon: AlertTriangle },
    { id: "changes", title: "Policy Changes", icon: FileText },
    { id: "contact", title: "Contact Information", icon: Mail },
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
            <h1 className="text-xl font-bold text-gray-900">Privacy Policy</h1>
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
            <div className="sticky top-20 max-h-screen overflow-y-auto">
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
            
            {/* Privacy Commitment */}
            <section id="commitment">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">Our Privacy Commitment</h2>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                      At Relett, protecting your privacy is fundamental to our mission of democratizing real estate investment. 
                      This Privacy Policy explains how we collect, use, protect, and share your information when you use our 
                      property tokenization platform and related services.
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg">
                      <h3 className="font-semibold text-blue-900 mb-3">Our Core Privacy Principles</h3>
                      <ul className="space-y-2 text-blue-800">
                        <li>• <strong>Transparency:</strong> We clearly explain what data we collect and why</li>
                        <li>• <strong>Control:</strong> You have control over your personal information</li>
                        <li>• <strong>Security:</strong> We implement industry-leading security measures</li>
                        <li>• <strong>Compliance:</strong> We adhere to all applicable privacy laws and regulations</li>
                        <li>• <strong>Purpose Limitation:</strong> We only use data for legitimate business purposes</li>
                        <li>• <strong>Data Minimization:</strong> We collect only what's necessary for our services</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Information We Collect */}
            <section id="collection">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Database className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold">Information We Collect</h2>
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

            {/* Automated Processing & AI */}
            <section id="automated-processing">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Activity className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold">Automated Processing & AI</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      We use artificial intelligence and automated processing to enhance your experience and provide 
                      intelligent services. Here's how we use AI with your data:
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-3">Property Valuation AI</h3>
                        <ul className="text-sm text-blue-800 space-y-2">
                          <li>• <strong>Model Used:</strong> GPT-4 with custom real estate training</li>
                          <li>• <strong>Data Processed:</strong> Property details, location, market comparables</li>
                          <li>• <strong>Purpose:</strong> Generate accurate property valuations</li>
                          <li>• <strong>Human Oversight:</strong> All AI valuations reviewed by certified valuers</li>
                          <li>• <strong>Your Rights:</strong> Request manual review of any AI valuation</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-3">Fraud Detection</h3>
                        <ul className="text-sm text-green-800 space-y-2">
                          <li>• <strong>Risk Scoring:</strong> Automated analysis of transaction patterns</li>
                          <li>• <strong>Document Verification:</strong> AI-powered document authenticity checks</li>
                          <li>• <strong>Behavioral Analysis:</strong> Detection of unusual account activity</li>
                          <li>• <strong>AML Screening:</strong> Automated sanctions and watchlist checks</li>
                          <li>• <strong>Appeal Process:</strong> Immediate human review upon request</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-purple-900 mb-3">Investment Recommendations</h3>
                        <ul className="text-sm text-purple-800 space-y-2">
                          <li>• <strong>Portfolio Analysis:</strong> AI optimization of investment allocations</li>
                          <li>• <strong>Market Matching:</strong> Properties matched to your preferences</li>
                          <li>• <strong>Risk Assessment:</strong> Automated investment risk calculations</li>
                          <li>• <strong>Performance Prediction:</strong> AI-based ROI forecasting</li>
                          <li>• <strong>Transparency:</strong> All recommendation logic is explainable</li>
                        </ul>
                      </div>

                      <div className="bg-orange-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-orange-900 mb-3">Customer Support AI</h3>
                        <ul className="text-sm text-orange-800 space-y-2">
                          <li>• <strong>Chat Assistance:</strong> AI-powered customer support responses</li>
                          <li>• <strong>Intent Recognition:</strong> Understanding and routing user queries</li>
                          <li>• <strong>Multilingual Support:</strong> Automatic language detection and translation</li>
                          <li>• <strong>Learning Patterns:</strong> Improving responses based on interactions</li>
                          <li>• <strong>Human Escalation:</strong> Seamless handoff to human agents when needed</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                      <h3 className="font-semibold text-yellow-900 mb-3">Your Rights Regarding Automated Decisions</h3>
                      <ul className="text-yellow-800 space-y-2">
                        <li>• Right to human review of any automated decision affecting you</li>
                        <li>• Right to explanation of AI decision-making logic</li>
                        <li>• Right to contest automated decisions and request manual processing</li>
                        <li>• Right to opt-out of certain AI features (may limit service functionality)</li>
                        <li>• Right to data correction if AI decisions are based on inaccurate information</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Blockchain & Public Data */}
            <section id="blockchain">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Server className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold">Blockchain & Public Data</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      Our platform uses blockchain technology for property tokenization and transaction transparency. 
                      Some data becomes permanently public on the blockchain.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-blue-900 mb-3">Public Blockchain Data</h3>
                        <ul className="text-sm text-blue-800 space-y-2">
                          <li>• <strong>Token Transactions:</strong> All token transfers are publicly visible</li>
                          <li>• <strong>Wallet Addresses:</strong> Pseudonymous identifiers for transactions</li>
                          <li>• <strong>Property Tokens:</strong> Token supply and basic property metadata</li>
                          <li>• <strong>Smart Contracts:</strong> Contract code and transaction history</li>
                          <li>• <strong>Revenue Distributions:</strong> Dividend payment records</li>
                        </ul>
                        <div className="mt-4 p-3 bg-blue-100 rounded">
                          <p className="text-xs text-blue-900">
                            <strong>Note:</strong> Blockchain data is pseudonymous - wallet addresses are not 
                            directly linked to personal identities unless you choose to share this information.
                          </p>
                        </div>
                      </div>

                      <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="font-semibold text-green-900 mb-3">Private Data Protection</h3>
                        <ul className="text-sm text-green-800 space-y-2">
                          <li>• <strong>Personal Identity:</strong> Never stored on blockchain</li>
                          <li>• <strong>Property Details:</strong> Sensitive information kept off-chain</li>
                          <li>• <strong>Financial Data:</strong> Account balances and personal finances private</li>
                          <li>• <strong>Legal Documents:</strong> Stored securely in encrypted databases</li>
                          <li>• <strong>Communication:</strong> Messages and chat data remain private</li>
                        </ul>
                        <div className="mt-4 p-3 bg-green-100 rounded">
                          <p className="text-xs text-green-900">
                            <strong>Security:</strong> We use advanced cryptographic techniques to protect 
                            your privacy while enabling blockchain transparency.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Blockchain Network Details</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-3">Hedera Network Integration</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>• <strong>Network:</strong> Hedera Hashgraph (enterprise-grade DLT)</li>
                          <li>• <strong>Token Standard:</strong> Hedera Token Service (HTS)</li>
                          <li>• <strong>Transaction Fees:</strong> Minimal network fees (typically $0.0001)</li>
                          <li>• <strong>Finality:</strong> Transactions confirmed in 3-5 seconds</li>
                          <li>• <strong>Energy Efficiency:</strong> Carbon-negative network operations</li>
                          <li>• <strong>Compliance:</strong> Built-in regulatory compliance features</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Data Protection & Security */}
            <section id="protection">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Lock className="h-6 w-6 text-red-600" />
                    <h2 className="text-2xl font-bold">Data Protection & Security</h2>
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
              <p>For privacy-related questions or to exercise your rights, contact us at privacy@terravault.com</p>
              <p>This policy complies with applicable data protection laws including NDPR, GDPR, and CCPA.</p>
              <p>We are committed to transparency and will notify you of any material changes to this policy.</p>
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
              <h3 className="text-xl font-bold">Relett</h3>
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
              <p>&copy; 2024 Relett. All rights reserved.</p>
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

export default PrivacyPolicy;
