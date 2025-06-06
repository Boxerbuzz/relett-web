
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Shield, Eye, Database, Lock, Share, FileText, AlertTriangle, ArrowLeft, Twitter, Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
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
            <h1 className="text-xl font-bold text-gray-900">Privacy Policy</h1>
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
                <Shield className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">Our Commitment to Privacy</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                At Terra Vault, we take your privacy seriously. This Privacy Policy explains how we collect, use, protect, 
                and share your information when you use our property tokenization platform and related services.
              </p>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Information We Collect */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">Information We Collect</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                    <ul className="space-y-1 text-gray-700 text-sm ml-4">
                      <li>• Full name, email address, phone number</li>
                      <li>• Date of birth, nationality, address</li>
                      <li>• Government-issued ID numbers (NIN, BVN, CAC, Passport)</li>
                      <li>• Bank account details and payment information</li>
                      <li>• Profile photos and biometric data for verification</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Property Information</h4>
                    <ul className="space-y-1 text-gray-700 text-sm ml-4">
                      <li>• Property ownership documents and legal titles</li>
                      <li>• Property photos, videos, and virtual tour data</li>
                      <li>• Location coordinates and address information</li>
                      <li>• Property valuations and market analysis data</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Technical Information</h4>
                    <ul className="space-y-1 text-gray-700 text-sm ml-4">
                      <li>• IP addresses, device identifiers, and browser information</li>
                      <li>• Usage patterns, navigation paths, and feature interactions</li>
                      <li>• Blockchain wallet addresses and transaction history</li>
                      <li>• Location data and GPS coordinates (with permission)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">How We Use Your Information</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Identity Verification & Compliance</h4>
                    <p className="text-sm">We verify your identity to comply with KYC/AML regulations and prevent fraud.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Property Verification & Valuation</h4>
                    <p className="text-sm">We use AI and professional services to verify property authenticity and provide accurate valuations.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Transaction Processing</h4>
                    <p className="text-sm">We process payments, token transfers, and revenue distributions securely.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Platform Improvement</h4>
                    <p className="text-sm">We analyze usage patterns to improve our services and develop new features.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Communication</h4>
                    <p className="text-sm">We send notifications about transactions, property updates, and important platform announcements.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Protection */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="h-5 w-5 text-red-600" />
                  <h3 className="text-lg font-semibold">Data Protection & Security</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Encryption</h4>
                    <p className="text-sm">All sensitive data is encrypted in transit and at rest using industry-standard encryption protocols.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Access Controls</h4>
                    <p className="text-sm">We implement strict access controls and require multi-factor authentication for administrative access.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Data Backup</h4>
                    <p className="text-sm">We maintain secure, encrypted backups with disaster recovery procedures.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Regular Audits</h4>
                    <p className="text-sm">We conduct regular security audits and penetration testing to identify and address vulnerabilities.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Information Sharing */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Share className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold">Information Sharing</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">With Your Consent</h4>
                    <p className="text-sm">We share information when you explicitly consent, such as connecting with property agents or investors.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Service Providers</h4>
                    <p className="text-sm">We work with trusted third parties for payment processing, identity verification, and property valuation services.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Legal Requirements</h4>
                    <p className="text-sm">We may share information when required by law, court order, or to protect our legal rights.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Blockchain Transparency</h4>
                    <p className="text-sm">Some transaction data is publicly visible on the blockchain, though personal identifiers are not included.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-orange-600" />
                  <h3 className="text-lg font-semibold">Your Privacy Rights</h3>
                </div>
                <div className="space-y-3 text-gray-700">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Access & Portability</h4>
                    <p className="text-sm">You can request a copy of your personal data in a machine-readable format.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Correction</h4>
                    <p className="text-sm">You can update or correct your personal information through your account settings.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Deletion</h4>
                    <p className="text-sm">You can request deletion of your account and personal data, subject to legal and regulatory requirements.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Opt-out</h4>
                    <p className="text-sm">You can opt out of marketing communications and adjust notification preferences in your settings.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold">Data Retention</h3>
                </div>
                <div className="space-y-3 text-gray-700 text-sm">
                  <p><strong>Account Data:</strong> We retain account information for as long as your account is active or as needed to provide services.</p>
                  <p><strong>Transaction Records:</strong> Financial and property transaction records are retained for 7 years for compliance purposes.</p>
                  <p><strong>Verification Documents:</strong> Identity verification documents are retained for 5 years after account closure.</p>
                  <p><strong>Blockchain Data:</strong> Some transaction data is permanently recorded on the blockchain and cannot be deleted.</p>
                </div>
              </CardContent>
            </Card>

            <Separator />

            <div className="text-center text-sm text-gray-600">
              <p>For privacy-related questions or to exercise your rights, contact us at privacy@terravault.com</p>
              <p className="mt-2">This policy complies with applicable data protection laws including NDPR and GDPR.</p>
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

export default PrivacyPolicy;
