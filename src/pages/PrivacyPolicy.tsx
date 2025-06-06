
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Eye, Database, Lock, Share, FileText, AlertTriangle } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
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
  );
};

export default PrivacyPolicy;
