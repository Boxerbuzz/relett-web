
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowRight, Database, Shield, Key, Users, Home, Coins, FileText } from "lucide-react";

const DataFlow = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Data Flow Architecture</h1>
        <p className="text-gray-600">Technical overview of how data flows through the Terra Vault platform</p>
      </div>

      {/* User Journey Flow */}
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Registration & Authentication Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">1. Sign Up</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Email & Password</li>
                  <li>• User Type Selection</li>
                  <li>• Basic Profile Info</li>
                </ul>
                <Badge variant="secondary" className="mt-2">Frontend</Badge>
              </div>
              <ArrowRight className="hidden md:block self-center text-gray-400" />
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">2. Supabase Auth</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• User Creation</li>
                  <li>• Email Verification</li>
                  <li>• Session Management</li>
                </ul>
                <Badge variant="secondary" className="mt-2">Backend</Badge>
              </div>
              <ArrowRight className="hidden md:block self-center text-gray-400" />
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">3. Profile Setup</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• User Profiles Table</li>
                  <li>• Role Assignment</li>
                  <li>• Preferences Setup</li>
                </ul>
                <Badge variant="secondary" className="mt-2">Database</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Identity Verification Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-2">KYC Upload</h4>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• Document Upload</li>
                  <li>• File Validation</li>
                  <li>• Metadata Extraction</li>
                </ul>
              </div>
              <ArrowRight className="hidden md:block self-center text-gray-400" />
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-2">Security Scan</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• Virus Scanning</li>
                  <li>• File Integrity</li>
                  <li>• Format Validation</li>
                </ul>
              </div>
              <ArrowRight className="hidden md:block self-center text-gray-400" />
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">AI Analysis</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Document OCR</li>
                  <li>• Data Extraction</li>
                  <li>• Fraud Detection</li>
                </ul>
              </div>
              <ArrowRight className="hidden md:block self-center text-gray-400" />
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-2">Verification</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Manual Review</li>
                  <li>• Status Update</li>
                  <li>• User Notification</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Property Management Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-1 text-sm">Property Upload</h4>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• Form Data</li>
                  <li>• Media Files</li>
                  <li>• Documents</li>
                </ul>
              </div>
              <ArrowRight className="hidden md:block self-center text-gray-400" />
              <div className="bg-purple-50 p-3 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-1 text-sm">Storage</h4>
                <ul className="text-xs text-purple-800 space-y-1">
                  <li>• Supabase DB</li>
                  <li>• File Storage</li>
                  <li>• Hedera Files</li>
                </ul>
              </div>
              <ArrowRight className="hidden md:block self-center text-gray-400" />
              <div className="bg-green-50 p-3 rounded-lg">
                <h4 className="font-semibold text-green-900 mb-1 text-sm">AI Valuation</h4>
                <ul className="text-xs text-green-800 space-y-1">
                  <li>• Market Analysis</li>
                  <li>• Price Estimation</li>
                  <li>• Risk Assessment</li>
                </ul>
              </div>
              <ArrowRight className="hidden md:block self-center text-gray-400" />
              <div className="bg-orange-50 p-3 rounded-lg">
                <h4 className="font-semibold text-orange-900 mb-1 text-sm">Verification</h4>
                <ul className="text-xs text-orange-800 space-y-1">
                  <li>• Document Review</li>
                  <li>• Legal Check</li>
                  <li>• Approval</li>
                </ul>
              </div>
              <ArrowRight className="hidden md:block self-center text-gray-400" />
              <div className="bg-red-50 p-3 rounded-lg">
                <h4 className="font-semibold text-red-900 mb-1 text-sm">Marketplace</h4>
                <ul className="text-xs text-red-800 space-y-1">
                  <li>• Live Listing</li>
                  <li>• Search Index</li>
                  <li>• Public Access</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Tokenization & Trading Flow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-indigo-50 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-900 mb-2">Token Creation</h4>
                <ul className="text-sm text-indigo-800 space-y-1">
                  <li>• Hedera HTS</li>
                  <li>• Smart Contract</li>
                  <li>• Token Supply</li>
                </ul>
              </div>
              <ArrowRight className="hidden md:block self-center text-gray-400" />
              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="font-semibold text-pink-900 mb-2">Investment</h4>
                <ul className="text-sm text-pink-800 space-y-1">
                  <li>• Payment Processing</li>
                  <li>• Token Distribution</li>
                  <li>• Wallet Association</li>
                </ul>
              </div>
              <ArrowRight className="hidden md:block self-center text-gray-400" />
              <div className="bg-cyan-50 p-4 rounded-lg">
                <h4 className="font-semibold text-cyan-900 mb-2">Portfolio</h4>
                <ul className="text-sm text-cyan-800 space-y-1">
                  <li>• Holdings Tracking</li>
                  <li>• Performance Data</li>
                  <li>• Analytics</li>
                </ul>
              </div>
              <ArrowRight className="hidden md:block self-center text-gray-400" />
              <div className="bg-teal-50 p-4 rounded-lg">
                <h4 className="font-semibold text-teal-900 mb-2">Revenue</h4>
                <ul className="text-sm text-teal-800 space-y-1">
                  <li>• Distribution Calc</li>
                  <li>• Automatic Payout</li>
                  <li>• Tax Reporting</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Architecture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Architecture & Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Frontend (React)</h4>
                <div className="space-y-2">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <h5 className="font-medium text-blue-900">State Management</h5>
                    <p className="text-sm text-blue-800">React Query, Context API</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <h5 className="font-medium text-blue-900">Authentication</h5>
                    <p className="text-sm text-blue-800">Supabase Auth Client</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <h5 className="font-medium text-blue-900">File Upload</h5>
                    <p className="text-sm text-blue-800">Direct to Supabase Storage</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Backend (Supabase)</h4>
                <div className="space-y-2">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <h5 className="font-medium text-green-900">Database</h5>
                    <p className="text-sm text-green-800">PostgreSQL with RLS</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <h5 className="font-medium text-green-900">Edge Functions</h5>
                    <p className="text-sm text-green-800">Serverless API endpoints</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <h5 className="font-medium text-green-900">Real-time</h5>
                    <p className="text-sm text-green-800">WebSocket subscriptions</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Blockchain (Hedera)</h4>
                <div className="space-y-2">
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <h5 className="font-medium text-purple-900">Token Service</h5>
                    <p className="text-sm text-purple-800">HTS for tokenization</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <h5 className="font-medium text-purple-900">File Service</h5>
                    <p className="text-sm text-purple-800">Immutable document storage</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <h5 className="font-medium text-purple-900">Smart Contracts</h5>
                    <p className="text-sm text-purple-800">Property & revenue logic</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Layers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Security & Privacy Layers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                <h4 className="font-semibold text-red-900 mb-2">Authentication</h4>
                <ul className="text-sm text-red-800 space-y-1">
                  <li>• JWT Tokens</li>
                  <li>• Session Management</li>
                  <li>• MFA Support</li>
                  <li>• OAuth Integration</li>
                </ul>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                <h4 className="font-semibold text-orange-900 mb-2">Authorization</h4>
                <ul className="text-sm text-orange-800 space-y-1">
                  <li>• Role-Based Access</li>
                  <li>• Row Level Security</li>
                  <li>• API Rate Limiting</li>
                  <li>• Permission Matrices</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-900 mb-2">Data Protection</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Encryption at Rest</li>
                  <li>• TLS in Transit</li>
                  <li>• Data Anonymization</li>
                  <li>• Secure Backups</li>
                </ul>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                <h4 className="font-semibold text-green-900 mb-2">Monitoring</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Audit Logging</li>
                  <li>• Anomaly Detection</li>
                  <li>• Error Tracking</li>
                  <li>• Performance Metrics</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-gray-600" />
              <h3 className="text-lg font-semibold">Key Technical Specifications</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-medium mb-2">Frontend Technologies</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• React 18 with TypeScript</li>
                  <li>• Vite build tool</li>
                  <li>• Tailwind CSS + Shadcn UI</li>
                  <li>• TanStack React Query</li>
                  <li>• React Router DOM</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Backend & Infrastructure</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Supabase (PostgreSQL + Auth)</li>
                  <li>• Edge Functions (Deno runtime)</li>
                  <li>• Hedera Hashgraph blockchain</li>
                  <li>• Real-time subscriptions</li>
                  <li>• Automated backups & monitoring</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataFlow;
