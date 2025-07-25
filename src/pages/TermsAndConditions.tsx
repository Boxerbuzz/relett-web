import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, Scale, Users, Home, Coins, FileText, AlertTriangle, ArrowLeft, 
  Twitter, Facebook, Instagram, Linkedin, Mail, Phone, MapPin, Clock,
  Gavel, DollarSign, Building, Key, Lock, Eye, UserCheck, Banknote,
  Calendar, Handshake, TrendingUp, Globe, Zap, CreditCard, Settings,
  CheckCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("acceptance");

  const tableOfContents = [
    { id: "acceptance", title: "Acceptance of Terms", icon: Scale },
    { id: "definitions", title: "Definitions", icon: FileText },
    { id: "platform-services", title: "Platform Services", icon: Globe },
    { id: "user-accounts", title: "User Accounts & Verification", icon: UserCheck },
    { id: "property-services", title: "Property Services", icon: Home },
    { id: "rental-services", title: "Rental Services", icon: Key },
    { id: "reservation-services", title: "Reservation Services", icon: Calendar },
    { id: "tokenization", title: "Property Tokenization", icon: Coins },
    { id: "investment-services", title: "Investment Services", icon: TrendingUp },
    { id: "payment-terms", title: "Payment Terms", icon: CreditCard },
    { id: "verification", title: "Verification & Compliance", icon: Shield },
    { id: "fees-charges", title: "Fees & Charges", icon: DollarSign },
    { id: "user-responsibilities", title: "User Responsibilities", icon: Users },
    { id: "prohibited-activities", title: "Prohibited Activities", icon: AlertTriangle },
    { id: "intellectual-property", title: "Intellectual Property", icon: Lock },
    { id: "privacy-data", title: "Privacy & Data Protection", icon: Eye },
    { id: "dispute-resolution", title: "Dispute Resolution", icon: Gavel },
    { id: "limitation-liability", title: "Limitation of Liability", icon: Shield },
    { id: "termination", title: "Termination", icon: Clock },
    { id: "governing-law", title: "Governing Law", icon: Building },
    { id: "amendments", title: "Amendments", icon: Settings },
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
            <h1 className="text-xl font-bold text-gray-900">Terms and Conditions</h1>
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
              <ScrollArea className="h-56">
                <div className="flex flex-col gap-2">
                  {tableOfContents.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors text-left text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-400 focus:z-10 border border-transparent ${
                          activeSection === item.id
                            ? "bg-blue-50 text-blue-700 border-blue-500" 
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        tabIndex={0}
                        aria-current={activeSection === item.id ? "page" : undefined}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
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
            
            {/* Acceptance of Terms */}
            <section id="acceptance">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Scale className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">Acceptance of Terms</h2>
                  </div>
                  <div className="prose max-w-none space-y-6">
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                      Welcome to Relett, a comprehensive property tokenization and real estate investment platform. 
                      By accessing or using our services, you agree to be bound by these Terms and Conditions.
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg mb-6 shadow-sm">
                      <h3 className="font-semibold text-blue-900 mb-3 text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-blue-500" /> Important Notice
                      </h3>
                      <p className="text-blue-800 mb-3">
                        These terms constitute a legally binding agreement between you and Relett Limited. 
                        Please read them carefully before using our platform.
                      </p>
                      <ul className="space-y-2 text-blue-700">
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> By creating an account, you confirm you are at least 18 years old</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> You have the legal capacity to enter into binding agreements</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> You will comply with all applicable laws and regulations</li>
                        <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> You understand the risks associated with real estate investment</li>
                      </ul>
                    </div>
                    <p className="text-gray-700">
                      If you do not agree to these terms, you must not access or use our services. 
                      Continued use of the platform constitutes acceptance of any updates to these terms.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Definitions */}
            <section id="definitions">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold">Definitions</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        {
                          term: "Platform",
                          definition: "Relett's web application, mobile applications, APIs, and all related services"
                        },
                        {
                          term: "User",
                          definition: "Any individual or entity that creates an account and uses our services"
                        },
                        {
                          term: "Property Token",
                          definition: "Digital tokens representing fractional ownership in real estate properties"
                        },
                        {
                          term: "Landowner",
                          definition: "Users who list properties for sale, rent, or tokenization on the platform"
                        },
                        {
                          term: "Investor",
                          definition: "Users who purchase property tokens or invest in real estate through the platform"
                        },
                        {
                          term: "Agent",
                          definition: "Licensed real estate professionals facilitating transactions on the platform"
                        },
                        {
                          term: "Verifier",
                          definition: "Licensed professionals who verify property documents and conduct inspections"
                        },
                        {
                          term: "KYC",
                          definition: "Know Your Customer - identity verification and compliance procedures"
                        },
                        {
                          term: "AML",
                          definition: "Anti-Money Laundering - procedures to prevent financial crimes"
                        },
                        {
                          term: "Smart Contract",
                          definition: "Self-executing contracts with terms directly written into blockchain code"
                        },
                        {
                          term: "Revenue Distribution",
                          definition: "Periodic payments to token holders from property rental income"
                        },
                        {
                          term: "Escrow",
                          definition: "Third-party holding of funds or documents until transaction conditions are met"
                        }
                      ].map((item, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">{item.term}</h4>
                          <p className="text-sm text-gray-700">{item.definition}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Platform Services */}
            <section id="platform-services">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Globe className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold">Platform Services</h2>
                  </div>
                  <div className="space-y-6">
                    <p className="text-gray-700 leading-relaxed">
                      Relett provides a comprehensive suite of real estate technology services designed to 
                      democratize property investment and streamline real estate transactions.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-blue-50 p-6 rounded-lg">
                        <Home className="h-8 w-8 text-blue-600 mb-3" />
                        <h3 className="font-semibold text-blue-900 mb-3">Property Management</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Property listing and marketing</li>
                          <li>• Document management and storage</li>
                          <li>• AI-powered property valuation</li>
                          <li>• Property verification services</li>
                          <li>• Virtual tours and inspections</li>
                          <li>• Market analytics and insights</li>
                        </ul>
                      </div>

                      <div className="bg-green-50 p-6 rounded-lg">
                        <Key className="h-8 w-8 text-green-600 mb-3" />
                        <h3 className="font-semibold text-green-900 mb-3">Rental Services</h3>
                        <ul className="text-sm text-green-800 space-y-1">
                          <li>• Long-term rental agreements</li>
                          <li>• Tenant screening and verification</li>
                          <li>• Automated rent collection</li>
                          <li>• Maintenance request management</li>
                          <li>• Lease agreement templates</li>
                          <li>• Property condition monitoring</li>
                        </ul>
                      </div>

                      <div className="bg-purple-50 p-6 rounded-lg">
                        <Calendar className="h-8 w-8 text-purple-600 mb-3" />
                        <h3 className="font-semibold text-purple-900 mb-3">Short-term Rentals</h3>
                        <ul className="text-sm text-purple-800 space-y-1">
                          <li>• Vacation rental bookings</li>
                          <li>• Dynamic pricing optimization</li>
                          <li>• Guest communication tools</li>
                          <li>• Cleaning and maintenance coordination</li>
                          <li>• Review and rating system</li>
                          <li>• Multi-platform listing sync</li>
                        </ul>
                      </div>

                      <div className="bg-orange-50 p-6 rounded-lg">
                        <Coins className="h-8 w-8 text-orange-600 mb-3" />
                        <h3 className="font-semibold text-orange-900 mb-3">Tokenization</h3>
                        <ul className="text-sm text-orange-800 space-y-1">
                          <li>• Property fractional ownership</li>
                          <li>• Blockchain token creation</li>
                          <li>• Smart contract deployment</li>
                          <li>• Revenue distribution automation</li>
                          <li>• Secondary market trading</li>
                          <li>• Investor relations management</li>
                        </ul>
                      </div>

                      <div className="bg-red-50 p-6 rounded-lg">
                        <TrendingUp className="h-8 w-8 text-red-600 mb-3" />
                        <h3 className="font-semibold text-red-900 mb-3">Investment Platform</h3>
                        <ul className="text-sm text-red-800 space-y-1">
                          <li>• Portfolio management tools</li>
                          <li>• Investment analytics dashboard</li>
                          <li>• Risk assessment tools</li>
                          <li>• Performance tracking</li>
                          <li>• Investment group formation</li>
                          <li>• Market research and insights</li>
                        </ul>
                      </div>

                      <div className="bg-indigo-50 p-6 rounded-lg">
                        <CreditCard className="h-8 w-8 text-indigo-600 mb-3" />
                        <h3 className="font-semibold text-indigo-900 mb-3">Payment Services</h3>
                        <ul className="text-sm text-indigo-800 space-y-1">
                          <li>• Secure payment processing</li>
                          <li>• Escrow account management</li>
                          <li>• Multi-currency support</li>
                          <li>• Automated billing and invoicing</li>
                          <li>• Payment plan options</li>
                          <li>• Financial reporting tools</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* User Accounts & Verification */}
            <section id="user-accounts">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <UserCheck className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold">User Accounts & Verification</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Account Creation</h3>
                      <p className="text-gray-700 mb-4">
                        To use our services, you must create an account providing accurate and complete information. 
                        Account creation automatically triggers several default setups in our system:
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-3">Automatic Account Setup</h4>
                        <ul className="text-sm space-y-1">
                          <li>• <strong>User Profile:</strong> Created in the main users table with basic information</li>
                          <li>• <strong>Default Account:</strong> NGN wallet account with 0 balance and 0 points</li>
                          <li>• <strong>User Role:</strong> Default 'landowner' role assigned with active status</li>
                          <li>• <strong>Notification Preferences:</strong> Email and push notifications enabled by default</li>
                          <li>• <strong>Portfolio Allocations:</strong> Default investment targets (60% residential, 30% commercial, 10% land)</li>
                          <li>• <strong>Verification Status:</strong> Set to 'unverified' pending KYC completion</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Identity Verification (KYC)</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium mb-3">Required Documents</h4>
                          <ul className="text-sm space-y-2">
                            <li className="flex items-center gap-2">
                              <Badge variant="outline">NIN</Badge>
                              <span>National Identification Number</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Badge variant="outline">BVN</Badge>
                              <span>Bank Verification Number</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Badge variant="outline">CAC</Badge>
                              <span>Corporate Affairs Commission (for businesses)</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Badge variant="outline">Passport</Badge>
                              <span>International Passport</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Badge variant="outline">Driver's License</Badge>
                              <span>Valid driver's license</span>
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-3">Verification Process</h4>
                          <ol className="text-sm space-y-2">
                            <li className="flex gap-2">
                              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">1</span>
                              <span>Document upload and AI analysis</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">2</span>
                              <span>Third-party verification service check</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">3</span>
                              <span>Manual review by compliance team</span>
                            </li>
                            <li className="flex gap-2">
                              <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">4</span>
                              <span>Account status update and notification</span>
                            </li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Property Services */}
            <section id="property-services">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Home className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold">Property Services</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Property Listing</h3>
                      <p className="text-gray-700 mb-4">
                        Landowners can list properties for sale, rent, or tokenization. Each property listing undergoes 
                        verification and may be enhanced with AI-powered features.
                      </p>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-3">Automatic Property Setup</h4>
                        <ul className="text-sm space-y-1">
                          <li>• <strong>Default Counters:</strong> Views, likes, favorites, ratings set to 0</li>
                          <li>• <strong>Status Flags:</strong> is_featured, is_verified, is_tokenized set to false</li>
                          <li>• <strong>AI Valuation:</strong> Triggered automatically using GPT-4 and market data</li>
                          <li>• <strong>Document Storage:</strong> Secure cloud storage for property documents</li>
                          <li>• <strong>Image Processing:</strong> Automatic image optimization and thumbnail generation</li>
                          <li>• <strong>Location Analysis:</strong> Geocoding and neighborhood analysis</li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Property Categories</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { category: "Residential", types: ["Apartments", "Houses", "Condos", "Townhouses"] },
                          { category: "Commercial", types: ["Office Buildings", "Retail Spaces", "Warehouses", "Hotels"] },
                          { category: "Land", types: ["Residential Plots", "Commercial Land", "Agricultural Land", "Industrial Land"] },
                          { category: "Mixed-Use", types: ["Residential/Commercial", "Office/Retail", "Multi-Purpose"] },
                          { category: "Luxury", types: ["Premium Apartments", "Luxury Homes", "Penthouses", "Villas"] },
                          { category: "Investment", types: ["REITs", "Development Projects", "Income Properties"] }
                        ].map((item, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-medium text-gray-900 mb-2">{item.category}</h4>
                            <ul className="text-sm text-gray-700 space-y-1">
                              {item.types.map((type, idx) => (
                                <li key={idx}>• {type}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Property Verification Process</h3>
                      <div className="space-y-4">
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                          <h4 className="font-medium text-blue-900 mb-2">Document Verification</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Property title documents (Certificate of Occupancy, Deed of Assignment)</li>
                            <li>• Survey plans and government approvals</li>
                            <li>• Tax clearance certificates</li>
                            <li>• Building permits and completion certificates</li>
                            <li>• Environmental impact assessments</li>
                          </ul>
                        </div>
                        <div className="bg-green-50 border-l-4 border-green-500 p-4">
                          <h4 className="font-medium text-green-900 mb-2">Physical Inspection</h4>
                          <ul className="text-sm text-green-800 space-y-1">
                            <li>• Licensed verifier conducts on-site inspection</li>
                            <li>• Property condition assessment</li>
                            <li>• Structural integrity evaluation</li>
                            <li>• Compliance with local building codes</li>
                            <li>• Photography and video documentation</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Continue with more comprehensive sections... */}
            {/* For brevity, I'll include a few more key sections */}

            {/* Payment Terms */}
            <section id="payment-terms">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">Payment Terms</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Accepted Payment Methods</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h4 className="font-medium text-green-900 mb-2">Traditional Payments</h4>
                            <ul className="text-sm text-green-800 space-y-1">
                              <li>• Credit and debit cards (Visa, Mastercard)</li>
                              <li>• Bank transfers (local and international)</li>
                              <li>• Mobile money (MTN, Airtel, etc.)</li>
                              <li>• USSD banking</li>
                              <li>• Direct debit arrangements</li>
                            </ul>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="font-medium text-purple-900 mb-2">Digital Assets</h4>
                            <ul className="text-sm text-purple-800 space-y-1">
                              <li>• Cryptocurrency payments (Bitcoin, Ethereum)</li>
                              <li>• Stablecoins (USDT, USDC)</li>
                              <li>• Hedera network tokens (HBAR)</li>
                              <li>• Property tokens for cross-investments</li>
                              <li>• Platform reward points</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">Fee Structure</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="border border-gray-300 px-4 py-2 text-left">Service</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Fee Type</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Rate</th>
                              <th className="border border-gray-300 px-4 py-2 text-left">Notes</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">Property Listing</td>
                              <td className="border border-gray-300 px-4 py-2">Success Fee</td>
                              <td className="border border-gray-300 px-4 py-2">2.5% of sale price</td>
                              <td className="border border-gray-300 px-4 py-2">Charged only upon successful sale</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">Rental Management</td>
                              <td className="border border-gray-300 px-4 py-2">Monthly Fee</td>
                              <td className="border border-gray-300 px-4 py-2">5% of rental income</td>
                              <td className="border border-gray-300 px-4 py-2">Includes tenant management</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">Property Tokenization</td>
                              <td className="border border-gray-300 px-4 py-2">Setup Fee</td>
                              <td className="border border-gray-300 px-4 py-2">1% of property value</td>
                              <td className="border border-gray-300 px-4 py-2">Minimum ₦500,000</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">Token Trading</td>
                              <td className="border border-gray-300 px-4 py-2">Transaction Fee</td>
                              <td className="border border-gray-300 px-4 py-2">0.5% per trade</td>
                              <td className="border border-gray-300 px-4 py-2">Split between buyer and seller</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-300 px-4 py-2">Payment Processing</td>
                              <td className="border border-gray-300 px-4 py-2">Processing Fee</td>
                              <td className="border border-gray-300 px-4 py-2">2.9% + ₦100</td>
                              <td className="border border-gray-300 px-4 py-2">Standard rate for card payments</td>
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
              <p>For questions about these terms, contact us at legal@terravault.com</p>
              <p>These terms are governed by the laws of the Federal Republic of Nigeria.</p>
              <p>Any disputes will be resolved through binding arbitration in Lagos, Nigeria.</p>
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

export default TermsAndConditions;
