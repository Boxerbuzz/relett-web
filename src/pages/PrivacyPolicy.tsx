import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Eye, Database, Lock, Share, FileText, AlertTriangle, ArrowLeft, 
  Twitter, Facebook, Instagram, Linkedin, Mail, Phone, MapPin, Users,
  Globe, Settings, Clock, Trash2
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
            <h1 className="text-xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
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
          <div className="max-w-4xl mx-auto space-y-8">
            
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
                      At Terra Vault, protecting your privacy is fundamental to our mission of democratizing real estate investment. 
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
                      <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Identity Information</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Full name and preferred name</li>
                            <li>• Date of birth and age verification</li>
                            <li>• Nationality and country of residence</li>
                            <li>• Government-issued ID numbers (NIN, BVN, CAC, Passport)</li>
                            <li>• Biometric data for identity verification</li>
                            <li>• Professional qualifications and certifications</li>
                          </ul>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Email addresses (primary and secondary)</li>
                            <li>• Phone numbers (mobile and landline)</li>
                            <li>• Physical addresses (residential and business)</li>
                            <li>• Emergency contact information</li>
                            <li>• Preferred communication methods</li>
                            <li>• Language and timezone preferences</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Payment Data</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Bank account details and routing numbers</li>
                            <li>• Credit and debit card information (tokenized)</li>
                            <li>• Digital wallet addresses and keys</li>
                            <li>• Payment processor account details</li>
                            <li>• Transaction history and patterns</li>
                            <li>• Credit scores and financial assessments</li>
                          </ul>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Investment Data</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Investment portfolio and holdings</li>
                            <li>• Risk tolerance and investment goals</li>
                            <li>• Income verification documents</li>
                            <li>• Tax identification numbers</li>
                            <li>• Investment experience and sophistication</li>
                            <li>• Regulatory investor classifications</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Property Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Property Details</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Property ownership documents and titles</li>
                            <li>• Property photos, videos, and virtual tours</li>
                            <li>• Location coordinates and address information</li>
                            <li>• Property specifications and condition reports</li>
                            <li>• Valuations and market analysis data</li>
                            <li>• Rental history and income records</li>
                          </ul>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Legal Documents</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Deeds and conveyance documents</li>
                            <li>• Survey plans and boundary maps</li>
                            <li>• Certificates of occupancy</li>
                            <li>• Government consents and approvals</li>
                            <li>• Tax clearance certificates</li>
                            <li>• Insurance policies and claims history</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Technical Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Device Data</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Device identifiers and fingerprints</li>
                            <li>• Operating system and browser information</li>
                            <li>• Screen resolution and display settings</li>
                            <li>• Hardware specifications</li>
                          </ul>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Usage Data</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Navigation paths and click patterns</li>
                            <li>• Feature usage and interaction data</li>
                            <li>• Session duration and frequency</li>
                            <li>• Search queries and filters</li>
                          </ul>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-3">Network Data</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• IP addresses and geolocation</li>
                            <li>• Network connection type</li>
                            <li>• Referrer URLs and sources</li>
                            <li>• API request logs</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* How We Use Information */}
            <section id="usage">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Eye className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold">How We Use Your Information</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Platform Operations</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Account creation and management</li>
                            <li>• Identity verification and KYC compliance</li>
                            <li>• Transaction processing and escrow management</li>
                            <li>• Property listing and marketplace operations</li>
                            <li>• Token creation and distribution</li>
                          </ul>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Property Services</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Property verification and valuation</li>
                            <li>• Rental and reservation management</li>
                            <li>• Revenue distribution calculations</li>
                            <li>• Property maintenance coordination</li>
                            <li>• Investment performance tracking</li>
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-medium text-purple-900 mb-2">AI & Analytics</h4>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• Market analysis and price predictions</li>
                            <li>• Fraud detection and risk assessment</li>
                            <li>• Personalized property recommendations</li>
                            <li>• Investment opportunity matching</li>
                            <li>• Platform optimization and improvements</li>
                          </ul>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-medium text-orange-900 mb-2">Communication</h4>
                          <ul className="text-sm text-orange-800 space-y-1">
                            <li>• Transaction notifications and updates</li>
                            <li>• Property and investment alerts</li>
                            <li>• Customer support and assistance</li>
                            <li>• Educational content and resources</li>
                            <li>• Platform announcements and updates</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Information Sharing */}
            <section id="sharing">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Share className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">Information Sharing</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">With Your Consent</h4>
                          <p className="text-sm text-blue-800 mb-2">We share information when you explicitly consent, such as connecting with property agents or investors</p>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Complete data export within 30 days</li>
                            <li>• Structured data formats (JSON, CSV)</li>
                            <li>• Secure delivery methods</li>
                          </ul>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Service Providers</h4>
                          <p className="text-sm text-green-800 mb-2">We work with trusted third parties for payment processing, identity verification, and property valuation services</p>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li>• Payment processors</li>
                            <li>• Identity verification services</li>
                            <li>• Property valuation firms</li>
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-medium text-purple-900 mb-2">Legal Requirements</h4>
                          <p className="text-sm text-purple-800 mb-2">We may share information when required by law, court order, or to protect our legal rights</p>
                          <ul className="text-sm text-purple-700 space-y-1">
                            <li>• Regulatory compliance</li>
                            <li>• Legal investigations</li>
                            <li>• Data protection orders</li>
                          </ul>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg">
                          <h4 className="font-medium text-orange-900 mb-2">Blockchain Transparency</h4>
                          <p className="text-sm text-orange-800 mb-2">Some transaction data is publicly visible on the blockchain, though personal identifiers are not included</p>
                          <ul className="text-sm text-orange-700 space-y-1">
                            <li>• Public transaction records</li>
                            <li>• Token balances and ownership</li>
                            <li>• Property listings and transactions</li>
                          </ul>
                        </div>
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
                          <h4 className="font-medium text-red-900 mb-3">Encryption & Security</h4>
                          <ul className="text-sm text-red-800 space-y-1">
                            <li>• AES-256 encryption for data at rest</li>
                            <li>• TLS 1.3 for data in transit</li>
                            <li>• End-to-end encryption for sensitive communications</li>
                            <li>• Multi-factor authentication (MFA) requirements</li>
                            <li>• Biometric authentication options</li>
                            <li>• Hardware security modules (HSMs) for key management</li>
                          </ul>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <h4 className="font-medium text-blue-900 mb-3">Access Controls</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Role-based access control (RBAC)</li>
                            <li>• Principle of least privilege</li>
                            <li>• Regular access reviews and audits</li>
                            <li>• Automated access provisioning and deprovisioning</li>
                            <li>• Privileged access management (PAM)</li>
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <h4 className="font-medium text-green-900 mb-3">Infrastructure Security</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• SOC 2 Type II certified data centers</li>
                            <li>• 24/7 security monitoring and incident response</li>
                            <li>• Regular penetration testing and vulnerability assessments</li>
                            <li>• Network segmentation and firewalls</li>
                            <li>• Intrusion detection and prevention systems</li>
                          </ul>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <h4 className="font-medium text-purple-900 mb-3">Compliance & Auditing</h4>
                          <ul className="text-sm text-purple-800 space-y-1">
                            <li>• ISO 27001 information security management</li>
                            <li>• GDPR and NDPR compliance frameworks</li>
                            <li>• Regular third-party security audits</li>
                            <li>• Comprehensive audit logging and monitoring</li>
                            <li>• Data processing impact assessments</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Your Privacy Rights */}
            <section id="rights">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Users className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold">Your Privacy Rights</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="border-l-4 border-indigo-500 bg-indigo-50 p-4">
                          <h4 className="font-medium text-indigo-900 mb-2">Access & Portability</h4>
                          <p className="text-sm text-indigo-800 mb-2">Request a copy of your personal data in a machine-readable format</p>
                          <ul className="text-sm text-indigo-700 space-y-1">
                            <li>• Complete data export within 30 days</li>
                            <li>• Structured data formats (JSON, CSV)</li>
                            <li>• Secure delivery methods</li>
                          </ul>
                        </div>
                        <div className="border-l-4 border-green-500 bg-green-50 p-4">
                          <h4 className="font-medium text-green-900 mb-2">Correction & Updates</h4>
                          <p className="text-sm text-green-800 mb-2">Update or correct your personal information</p>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li>• Real-time profile updates</li>
                            <li>• Bulk correction requests</li>
                            <li>• Verification for sensitive changes</li>
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="border-l-4 border-red-500 bg-red-50 p-4">
                          <h4 className="font-medium text-red-900 mb-2">Deletion & Erasure</h4>
                          <p className="text-sm text-red-800 mb-2">Request deletion of your account and personal data</p>
                          <ul className="text-sm text-red-700 space-y-1">
                            <li>• Complete account deletion</li>
                            <li>• Selective data deletion</li>
                            <li>• Compliance with legal retention requirements</li>
                          </ul>
                        </div>
                        <div className="border-l-4 border-purple-500 bg-purple-50 p-4">
                          <h4 className="font-medium text-purple-900 mb-2">Consent & Preferences</h4>
                          <p className="text-sm text-purple-800 mb-2">Control how your data is processed and used</p>
                          <ul className="text-sm text-purple-700 space-y-1">
                            <li>• Granular consent management</li>
                            <li>• Marketing opt-out options</li>
                            <li>• Cookie and tracking preferences</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Data Retention */}
            <section id="retention">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    <h2 className="text-2xl font-bold">Data Retention</h2>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h4 className="font-medium text-yellow-900 mb-2">Account Data</h4>
                          <p className="text-sm text-yellow-800 mb-2">We retain account information for as long as your account is active or as needed to provide services</p>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• Account creation date</li>
                            <li>• Last login date</li>
                            <li>• Account status (active, suspended, deleted)</li>
                            <li>• Account settings and preferences</li>
                          </ul>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Transaction Records</h4>
                          <p className="text-sm text-green-800 mb-2">Financial and property transaction records are retained for 7 years for compliance purposes</p>
                          <ul className="text-sm text-green-700 space-y-1">
                            <li>• Transaction timestamps</li>
                            <li>• Transaction amounts and types</li>
                            <li>• Transaction details and metadata</li>
                            <li>• Transaction history and patterns</li>
                          </ul>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="bg-red-50 p-4 rounded-lg">
                          <h4 className="font-medium text-red-900 mb-2">Verification Documents</h4>
                          <p className="text-sm text-red-800 mb-2">Identity verification documents are retained for 5 years after account closure</p>
                          <ul className="text-sm text-red-700 space-y-1">
                            <li>• Document creation date</li>
                            <li>• Document expiration date</li>
                            <li>• Document status (valid, expired, revoked)</li>
                            <li>• Document details and metadata</li>
                          </ul>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Blockchain Data</h4>
                          <p className="text-sm text-blue-800 mb-2">Some transaction data is permanently recorded on the blockchain and cannot be deleted</p>
                          <ul className="text-sm text-blue-700 space-y-1">
                            <li>• Transaction timestamps</li>
                            <li>• Transaction amounts and types</li>
                            <li>• Transaction details and metadata</li>
                            <li>• Transaction history and patterns</li>
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

export default PrivacyPolicy;
