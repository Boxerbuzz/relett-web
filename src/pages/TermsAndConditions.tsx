
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FileText, Shield, Home, Coins, Scale, Users, ArrowLeft, Twitter, Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsAndConditions = () => {
  const navigate = useNavigate();

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
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Overview</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Welcome to Terra Vault, a comprehensive property tokenization platform. By accessing or using our services, 
                you agree to be bound by these Terms and Conditions. Please read them carefully before using our platform.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Property Management Services */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Home className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Property Management Services</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p><strong>Property Listing:</strong> Users can list properties for sale, rent, or tokenization subject to verification and compliance requirements.</p>
                  <p><strong>Verification Process:</strong> All properties undergo mandatory verification by certified professionals before being approved on the platform.</p>
                  <p><strong>Documentation:</strong> Property owners must provide valid legal documents including deeds, surveys, and certificates of occupancy.</p>
                  <p><strong>Accuracy:</strong> Users are responsible for providing accurate and up-to-date property information. Misrepresentation may result in account suspension.</p>
                </div>
              </CardContent>
            </Card>

            {/* Tokenization Services */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Coins className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Property Tokenization</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p><strong>Blockchain Technology:</strong> Tokens are created using Hedera Hashgraph technology, subject to network availability and gas fees.</p>
                  <p><strong>Investment Risk:</strong> Property tokenization involves investment risks. Token values may fluctuate based on market conditions.</p>
                  <p><strong>Revenue Distribution:</strong> Token holders may receive revenue distributions based on property performance, subject to applicable fees and taxes.</p>
                  <p><strong>Minimum Investment:</strong> Each tokenized property has a minimum investment threshold that must be met before tokenization proceeds.</p>
                  <p><strong>Lock-up Period:</strong> Tokens may have lock-up periods during which they cannot be traded or transferred.</p>
                </div>
              </CardContent>
            </Card>

            {/* Marketplace Services */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Marketplace & Trading</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p><strong>Property Transactions:</strong> All property sales and purchases are facilitated through our secure escrow system.</p>
                  <p><strong>Token Trading:</strong> Secondary market trading of property tokens is subject to liquidity and market conditions.</p>
                  <p><strong>Transaction Fees:</strong> Platform charges transaction fees for successful property sales, token trades, and other services.</p>
                  <p><strong>KYC/AML Compliance:</strong> All users must complete identity verification before participating in transactions above certain thresholds.</p>
                </div>
              </CardContent>
            </Card>

            {/* Legal Compliance */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Scale className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold">Legal Compliance & Responsibilities</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p><strong>Regulatory Compliance:</strong> Users must comply with all applicable local, state, and federal laws regarding property ownership and investment.</p>
                  <p><strong>Tax Obligations:</strong> Users are responsible for their own tax obligations related to property ownership, sales, and investment income.</p>
                  <p><strong>Legal Title:</strong> Property owners must have clear legal title and authority to list, sell, or tokenize properties on the platform.</p>
                  <p><strong>Dispute Resolution:</strong> Disputes will be resolved through binding arbitration in accordance with the laws of Nigeria.</p>
                </div>
              </CardContent>
            </Card>

            {/* Platform Usage */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold">Platform Usage & Restrictions</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <p><strong>Account Security:</strong> Users are responsible for maintaining the confidentiality of their account credentials and wallet private keys.</p>
                  <p><strong>Prohibited Activities:</strong> Money laundering, fraud, misrepresentation, and other illegal activities are strictly prohibited.</p>
                  <p><strong>Service Availability:</strong> We strive for 99.9% uptime but cannot guarantee uninterrupted service due to maintenance, upgrades, or technical issues.</p>
                  <p><strong>Intellectual Property:</strong> All platform content, including designs, logos, and software, are protected by intellectual property laws.</p>
                  <p><strong>Account Termination:</strong> We reserve the right to suspend or terminate accounts that violate these terms or engage in suspicious activities.</p>
                </div>
              </CardContent>
            </Card>

            {/* Disclaimers */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Disclaimers and Limitations</h3>
                <div className="space-y-3 text-gray-700 text-sm">
                  <p><strong>Investment Disclaimer:</strong> Property investments carry inherent risks. Past performance does not guarantee future results.</p>
                  <p><strong>Technology Risks:</strong> Blockchain technology and smart contracts may have bugs or vulnerabilities that could result in loss of funds.</p>
                  <p><strong>Market Volatility:</strong> Property and token values are subject to market fluctuations and economic conditions.</p>
                  <p><strong>Limited Liability:</strong> Terra Vault's liability is limited to the fees paid for our services in the 12 months preceding any claim.</p>
                </div>
              </CardContent>
            </Card>

            <Separator />

            <div className="text-center text-sm text-gray-600">
              <p>For questions about these terms, please contact us at legal@terravault.com</p>
              <p className="mt-2">These terms are governed by the laws of Nigeria and are subject to change with notice.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
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
