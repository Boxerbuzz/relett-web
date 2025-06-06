
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, Shield, Home, Coins, Scale, Users } from "lucide-react";

const TermsAndConditions = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Terms and Conditions</h1>
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
  );
};

export default TermsAndConditions;
