
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Shield, Home, Coins, Scale, Users, ArrowLeft, Twitter, 
  Facebook, Instagram, Linkedin, Mail, Phone, MapPin, Calendar,
  CreditCard, Building, CheckCircle, AlertTriangle, Lock, Gavel
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("overview");

  const tableOfContents = [
    { id: "overview", title: "Overview", icon: FileText },
    { id: "definitions", title: "Definitions", icon: Scale },
    { id: "property-listings", title: "Property Listings & Sales", icon: Home },
    { id: "rentals", title: "Property Rentals", icon: Building },
    { id: "reservations", title: "Short-term Reservations", icon: Calendar },
    { id: "tokenization", title: "Property Tokenization", icon: Coins },
    { id: "verification", title: "Property Verification", icon: CheckCircle },
    { id: "payments", title: "Payments & Transactions", icon: CreditCard },
    { id: "marketplace", title: "Marketplace Services", icon: Users },
    { id: "compliance", title: "Legal Compliance", icon: Gavel },
    { id: "user-conduct", title: "User Conduct", icon: Shield },
    { id: "limitations", title: "Limitations & Disclaimers", icon: AlertTriangle },
    { id: "privacy", title: "Data Protection", icon: Lock },
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
            <h1 className="text-xl font-bold text-gray-900">Terms and Conditions</h1>
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
            
            {/* Overview */}
            <section id="overview">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">Platform Overview</h2>
                  </div>
                  <div className="prose max-w-none">
                    <p className="text-lg text-gray-700 leading-relaxed mb-6">
                      Welcome to Terra Vault, a comprehensive property technology platform that revolutionizes real estate 
                      transactions, management, and investment through blockchain technology and AI-powered services.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      By accessing or using our platform, you agree to be bound by these Terms and Conditions. 
                      These terms govern your use of all Terra Vault services including property listings, rentals, 
                      reservations, tokenization, verification, and marketplace activities.
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
                    <Scale className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold">Key Definitions</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">"Platform" or "Service"</h4>
                        <p className="text-sm text-gray-700">The Terra Vault web application, mobile applications, APIs, and all related services.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">"Property Tokenization"</h4>
                        <p className="text-sm text-gray-700">The process of converting real estate assets into digital tokens on the Hedera blockchain.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">"Verified Properties"</h4>
                        <p className="text-sm text-gray-700">Properties that have completed our comprehensive verification process including document review and professional inspection.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">"Revenue Distribution"</h4>
                        <p className="text-sm text-gray-700">Automatic distribution of rental income and property appreciation to token holders based on their ownership percentage.</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">"Escrow Services"</h4>
                        <p className="text-sm text-gray-700">Secure holding of funds during property transactions until all conditions are met.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">"KYC/AML"</h4>
                        <p className="text-sm text-gray-700">Know Your Customer and Anti-Money Laundering verification processes required for platform participation.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">"Smart Contracts"</h4>
                        <p className="text-sm text-gray-700">Automated blockchain contracts that execute property transactions and revenue distributions.</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">"Marketplace"</h4>
                        <p className="text-sm text-gray-700">The Terra Vault ecosystem where users can buy, sell, rent, and invest in properties and property tokens.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Property Listings & Sales */}
            <section id="property-listings">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Home className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold">Property Listings & Sales</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Listing Requirements</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Valid legal title and ownership documentation</li>
                        <li>• Complete property information including specifications, location, and condition</li>
                        <li>• High-quality photos and property description</li>
                        <li>• Professional verification and inspection completion</li>
                        <li>• Compliance with local real estate regulations</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Sales Process</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• All sales are conducted through our secure escrow system</li>
                        <li>• Buyers must complete KYC verification before purchasing</li>
                        <li>• Purchase agreements are legally binding and enforceable</li>
                        <li>• Platform facilitates but does not guarantee transactions</li>
                        <li>• Transfer of ownership follows local legal requirements</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Seller Obligations</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Provide accurate and complete property information</li>
                        <li>• Maintain property in described condition until sale completion</li>
                        <li>• Respond promptly to buyer inquiries and requests</li>
                        <li>• Complete all required legal documentation</li>
                        <li>• Pay applicable platform fees and commissions</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Buyer Protection</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• 7-day inspection period for physical property review</li>
                        <li>• Escrow protection for all payments</li>
                        <li>• Professional property valuation reports</li>
                        <li>• Legal document verification</li>
                        <li>• Dispute resolution services</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Property Rentals */}
            <section id="rentals">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Building className="h-6 w-6 text-blue-600" />
                    <h2 className="text-2xl font-bold">Property Rentals</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Rental Categories</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Long-term Rentals</h4>
                          <p className="text-sm text-blue-800">Residential and commercial properties for 6+ months with traditional lease agreements.</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Medium-term Rentals</h4>
                          <p className="text-sm text-green-800">Furnished properties for 1-6 months, ideal for relocations and extended stays.</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Landlord Responsibilities</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Maintain property in habitable condition throughout tenancy</li>
                        <li>• Provide accurate property descriptions and photos</li>
                        <li>• Respond to maintenance requests within 24-48 hours</li>
                        <li>• Comply with local landlord-tenant laws</li>
                        <li>• Process security deposits according to regulations</li>
                        <li>• Provide necessary property documentation and certificates</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Tenant Obligations</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Pay rent and associated fees on time</li>
                        <li>• Maintain property in good condition</li>
                        <li>• Report maintenance issues promptly</li>
                        <li>• Comply with property rules and local regulations</li>
                        <li>• Provide proper notice before termination</li>
                        <li>• Allow reasonable access for inspections and repairs</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Payment Processing</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Automated monthly rent collection</li>
                        <li>• Security deposit held in escrow</li>
                        <li>• Late payment fees as specified in lease agreement</li>
                        <li>• Transparent fee structure for all parties</li>
                        <li>• Digital receipts and payment history</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Short-term Reservations */}
            <section id="reservations">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Calendar className="h-6 w-6 text-orange-600" />
                    <h2 className="text-2xl font-bold">Short-term Reservations</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Booking Process</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Instant booking for verified properties</li>
                        <li>• Real-time availability calendar</li>
                        <li>• Secure payment processing with escrow protection</li>
                        <li>• Automated confirmation and check-in instructions</li>
                        <li>• 24/7 customer support during stays</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Host Requirements</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Professional property photos and accurate descriptions</li>
                        <li>• Competitive pricing and transparent fee structure</li>
                        <li>• Prompt communication with guests</li>
                        <li>• Clean, safe, and well-maintained accommodations</li>
                        <li>• Compliance with local short-term rental regulations</li>
                        <li>• Appropriate insurance coverage</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Guest Responsibilities</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Respect property rules and neighborhood guidelines</li>
                        <li>• Leave property in clean, undamaged condition</li>
                        <li>• Report any issues or damages immediately</li>
                        <li>• Comply with maximum occupancy limits</li>
                        <li>• Provide accurate guest information for safety and legal compliance</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Cancellation Policies</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Flexible</h4>
                          <p className="text-sm text-green-800">Full refund 24 hours before check-in</p>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg">
                          <h4 className="font-medium text-yellow-900 mb-2">Moderate</h4>
                          <p className="text-sm text-yellow-800">Full refund 5 days before, 50% until 24 hours</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg">
                          <h4 className="font-medium text-red-900 mb-2">Strict</h4>
                          <p className="text-sm text-red-800">Full refund 14 days before, 50% until 7 days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Property Tokenization */}
            <section id="tokenization">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Coins className="h-6 w-6 text-purple-600" />
                    <h2 className="text-2xl font-bold">Property Tokenization</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Tokenization Process</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Properties must be fully verified and valued by certified professionals</li>
                        <li>• Legal structure established for fractional ownership</li>
                        <li>• Smart contracts deployed on Hedera blockchain</li>
                        <li>• Token distribution based on investment contributions</li>
                        <li>• Revenue sharing automatically executed via smart contracts</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Investment Terms</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Fixed Returns</h4>
                          <p className="text-sm text-blue-800">Predetermined annual returns regardless of property performance</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Variable Returns</h4>
                          <p className="text-sm text-green-800">Returns based on actual rental income and property appreciation</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-medium text-purple-900 mb-2">Hybrid Model</h4>
                          <p className="text-sm text-purple-800">Combination of guaranteed base return plus performance bonuses</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Token Holder Rights</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Proportional ownership rights in the underlying property</li>
                        <li>• Regular revenue distributions from rental income</li>
                        <li>• Voting rights on major property decisions</li>
                        <li>• Access to detailed financial reporting</li>
                        <li>• Right to trade tokens on secondary markets (subject to lock-up periods)</li>
                        <li>• Protection under applicable securities regulations</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Risk Disclosures</h3>
                      <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                        <ul className="space-y-2 text-red-800 text-sm">
                          <li>• Property values may decrease, resulting in investment losses</li>
                          <li>• Rental income is not guaranteed and may fluctuate</li>
                          <li>• Tokens may have limited liquidity in secondary markets</li>
                          <li>• Lock-up periods may prevent immediate token transfers</li>
                          <li>• Regulatory changes may affect token value and tradability</li>
                          <li>• Property management decisions may impact returns</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Property Verification */}
            <section id="verification">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <h2 className="text-2xl font-bold">Property Verification Services</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Verification Process</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Document Verification</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Title deed authenticity check</li>
                            <li>• Survey plan validation</li>
                            <li>• Certificate of Occupancy verification</li>
                            <li>• Government consent confirmation</li>
                            <li>• Tax clearance validation</li>
                            <li>• Environmental impact assessment review</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-3">Physical Inspection</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Structural integrity assessment</li>
                            <li>• Property boundary confirmation</li>
                            <li>• Utilities and infrastructure check</li>
                            <li>• Condition and maintenance evaluation</li>
                            <li>• Accessibility and safety review</li>
                            <li>• Photographic documentation</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Verifier Qualifications</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Licensed surveyors and engineers</li>
                        <li>• Certified property valuers</li>
                        <li>• Legal professionals specializing in real estate</li>
                        <li>• Government-authorized inspectors</li>
                        <li>• Insurance and background checks completed</li>
                        <li>• Ongoing training and certification requirements</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Verification Standards</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Compliance with Nigerian real estate regulations</li>
                        <li>• International best practices for property assessment</li>
                        <li>• AI-powered fraud detection and analysis</li>
                        <li>• Multiple verifier cross-validation for high-value properties</li>
                        <li>• Blockchain-based immutable verification records</li>
                        <li>• Regular quality audits and performance monitoring</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Payments & Transactions */}
            <section id="payments">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <CreditCard className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold">Payments & Transactions</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Accepted Payment Methods</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">Traditional Payments</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Credit and debit cards (Visa, Mastercard)</li>
                            <li>• Bank transfers and wire payments</li>
                            <li>• Mobile money (MTN, Airtel, etc.)</li>
                            <li>• USSD payments</li>
                          </ul>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-medium text-gray-900">Digital Payments</h4>
                          <ul className="space-y-1 text-sm text-gray-700">
                            <li>• Cryptocurrency (HBAR, BTC, ETH, USDC)</li>
                            <li>• Digital wallets and e-payment platforms</li>
                            <li>• Paystack and Flutterwave integration</li>
                            <li>• International payment processors</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Transaction Fees</h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Property Sales</h4>
                            <p className="text-sm text-gray-700">2.5% commission split between buyer and seller</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Rental Transactions</h4>
                            <p className="text-sm text-gray-700">5% of monthly rent for long-term, 10% for short-term</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Token Transactions</h4>
                            <p className="text-sm text-gray-700">1% of transaction value plus blockchain gas fees</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Escrow Protection</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• All payments held in secure escrow until transaction completion</li>
                        <li>• Multi-signature wallet security for large transactions</li>
                        <li>• Insurance coverage for escrow funds</li>
                        <li>• Automated release upon condition fulfillment</li>
                        <li>• Dispute resolution and mediation services</li>
                        <li>• Full transaction audit trail and documentation</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Additional sections continue... */}
            {/* For brevity, I'll include the remaining key sections */}

            {/* Legal Compliance */}
            <section id="compliance">
              <Card>
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <Gavel className="h-6 w-6 text-red-600" />
                    <h2 className="text-2xl font-bold">Legal Compliance & Responsibilities</h2>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Regulatory Framework</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Full compliance with Nigerian real estate laws and regulations</li>
                        <li>• SEC Nigeria guidelines for digital securities and tokenization</li>
                        <li>• Central Bank of Nigeria (CBN) payment and forex regulations</li>
                        <li>• Nigerian Data Protection Regulation (NDPR) compliance</li>
                        <li>• Anti-money laundering (AML) and counter-terrorism financing (CTF) measures</li>
                        <li>• International best practices for property technology platforms</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-3">User Responsibilities</h3>
                      <ul className="space-y-2 text-gray-700">
                        <li>• Compliance with all applicable local, state, and federal laws</li>
                        <li>• Accurate reporting of income and capital gains for tax purposes</li>
                        <li>• Obtaining necessary permits and licenses for property activities</li>
                        <li>• Maintaining proper insurance coverage for owned or managed properties</li>
                        <li>• Respecting intellectual property rights and platform terms</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <Separator className="my-8" />

            <div className="text-center text-sm text-gray-600 space-y-2">
              <p>For questions about these terms, please contact us at legal@terravault.com</p>
              <p>These terms are governed by the laws of Nigeria and are subject to change with reasonable notice.</p>
              <p>Continued use of the platform after changes constitutes acceptance of updated terms.</p>
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

export default TermsAndConditions;
