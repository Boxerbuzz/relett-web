
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, Code, Users, Zap, Shield, Database, Coins, Home, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const Documentation = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Terra Vault Documentation</h1>
        <p className="text-gray-600">Complete guide to using the Terra Vault platform for property tokenization and investment</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="tokenization">Tokenization</TabsTrigger>
          <TabsTrigger value="api">API Reference</TabsTrigger>
          <TabsTrigger value="troubleshooting">Support</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Platform Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-6">
                  Terra Vault is a comprehensive property tokenization platform that enables users to digitize, trade, and invest in real estate through blockchain technology.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <Home className="h-8 w-8 text-blue-600 mb-2" />
                    <h3 className="font-semibold text-blue-900 mb-1">Property Management</h3>
                    <p className="text-sm text-blue-800">List, verify, and manage properties with AI-powered valuations</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <Coins className="h-8 w-8 text-purple-600 mb-2" />
                    <h3 className="font-semibold text-purple-900 mb-1">Tokenization</h3>
                    <p className="text-sm text-purple-800">Convert properties into tradeable blockchain tokens</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <Users className="h-8 w-8 text-green-600 mb-2" />
                    <h3 className="font-semibold text-green-900 mb-1">Investment</h3>
                    <p className="text-sm text-green-800">Fractional ownership and revenue sharing opportunities</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg">
                    <Shield className="h-8 w-8 text-orange-600 mb-2" />
                    <h3 className="font-semibold text-orange-900 mb-1">Security</h3>
                    <p className="text-sm text-orange-800">Enterprise-grade security and compliance features</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Roles & Permissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4">
                    <Badge variant="default" className="mb-2">Landowner</Badge>
                    <ul className="text-sm space-y-1">
                      <li>• List properties for sale/rent</li>
                      <li>• Request property tokenization</li>
                      <li>• Manage property portfolio</li>
                      <li>• Receive revenue distributions</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <Badge variant="secondary" className="mb-2">Investor</Badge>
                    <ul className="text-sm space-y-1">
                      <li>• Browse marketplace</li>
                      <li>• Purchase property tokens</li>
                      <li>• Track investment performance</li>
                      <li>• Join investment groups</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <Badge variant="outline" className="mb-2">Agent</Badge>
                    <ul className="text-sm space-y-1">
                      <li>• Assist with property transactions</li>
                      <li>• Provide market insights</li>
                      <li>• Manage client relationships</li>
                      <li>• Earn commissions</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <Badge variant="destructive" className="mb-2">Verifier</Badge>
                    <ul className="text-sm space-y-1">
                      <li>• Verify property documents</li>
                      <li>• Conduct property inspections</li>
                      <li>• Approve listings</li>
                      <li>• Maintain compliance</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <Badge className="mb-2 bg-purple-600">Admin</Badge>
                    <ul className="text-sm space-y-1">
                      <li>• Platform administration</li>
                      <li>• User management</li>
                      <li>• System monitoring</li>
                      <li>• Support & moderation</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="getting-started">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-semibold">1</div>
                    <div>
                      <h3 className="font-semibold mb-2">Create Your Account</h3>
                      <p className="text-gray-700 mb-2">Sign up with your email and choose your user type (Landowner, Investor, Agent, or Verifier)</p>
                      <Button variant="outline" size="sm">
                        Go to Sign Up <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-semibold">2</div>
                    <div>
                      <h3 className="font-semibold mb-2">Complete Identity Verification</h3>
                      <p className="text-gray-700 mb-2">Upload required documents (NIN, BVN, or International Passport) for KYC compliance</p>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4">
                        <li>• Government-issued ID</li>
                        <li>• Proof of address</li>
                        <li>• Professional credentials (for Verifiers)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-semibold">3</div>
                    <div>
                      <h3 className="font-semibold mb-2">Set Up Your Profile</h3>
                      <p className="text-gray-700 mb-2">Complete your profile with contact information, preferences, and notification settings</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-semibold">4</div>
                    <div>
                      <h3 className="font-semibold mb-2">Start Using the Platform</h3>
                      <p className="text-gray-700 mb-2">Depending on your role:</p>
                      <ul className="text-sm text-gray-600 space-y-1 ml-4">
                        <li>• <strong>Landowners:</strong> List your first property</li>
                        <li>• <strong>Investors:</strong> Browse the marketplace</li>
                        <li>• <strong>Agents:</strong> Set up your service offerings</li>
                        <li>• <strong>Verifiers:</strong> Review pending verifications</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account Security Best Practices</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Password Security
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Use a strong, unique password</li>
                      <li>• Enable two-factor authentication</li>
                      <li>• Never share your login credentials</li>
                      <li>• Log out from public devices</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Wallet Security
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Backup your wallet private keys</li>
                      <li>• Use hardware wallets for large amounts</li>
                      <li>• Verify transaction details carefully</li>
                      <li>• Keep wallet software updated</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Management Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Adding a New Property</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <ol className="space-y-2 text-sm">
                        <li><strong>1. Basic Information:</strong> Property title, description, type, and category</li>
                        <li><strong>2. Location Details:</strong> Complete address with GPS coordinates</li>
                        <li><strong>3. Specifications:</strong> Bedrooms, bathrooms, square footage, amenities</li>
                        <li><strong>4. Media Upload:</strong> High-quality photos, videos, virtual tours</li>
                        <li><strong>5. Legal Documents:</strong> Title deeds, surveys, certificates</li>
                        <li><strong>6. Review & Submit:</strong> Final review before submission for verification</li>
                      </ol>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Required Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Essential Documents</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Certificate of Occupancy (C of O)</li>
                          <li>• Deed of Assignment/Conveyance</li>
                          <li>• Survey Plan</li>
                          <li>• Government Consent</li>
                          <li>• Tax Clearance Certificate</li>
                        </ul>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Additional Documents</h4>
                        <ul className="text-sm space-y-1">
                          <li>• Building Plan Approval</li>
                          <li>• Environmental Impact Assessment</li>
                          <li>• Property Valuation Report</li>
                          <li>• Insurance Documentation</li>
                          <li>• Property Management Agreement</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">AI Valuation Process</h3>
                    <p className="text-gray-700 mb-3">
                      Our AI system provides instant property valuations based on multiple factors:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900">Market Analysis</h4>
                        <p className="text-sm text-blue-800">Comparable property prices in the area</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <h4 className="font-medium text-green-900">Property Features</h4>
                        <p className="text-sm text-green-800">Size, condition, amenities, and specifications</p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <h4 className="font-medium text-purple-900">Location Factors</h4>
                        <p className="text-sm text-purple-800">Accessibility, infrastructure, and neighborhood</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tokenization">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Tokenization Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">What is Property Tokenization?</h3>
                    <p className="text-gray-700 mb-4">
                      Property tokenization converts real estate assets into digital tokens on the blockchain, 
                      enabling fractional ownership and easier trading of property investments.
                    </p>
                    
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Benefits of Tokenization</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• <strong>Fractional Ownership:</strong> Invest in high-value properties with smaller amounts</li>
                        <li>• <strong>Liquidity:</strong> Trade property tokens more easily than physical real estate</li>
                        <li>• <strong>Transparency:</strong> All transactions recorded on the blockchain</li>
                        <li>• <strong>Accessibility:</strong> Global investment opportunities</li>
                        <li>• <strong>Reduced Costs:</strong> Lower transaction fees and intermediary costs</li>
                      </ul>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Tokenization Process</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
                        <div>
                          <h4 className="font-medium">Property Verification</h4>
                          <p className="text-sm text-gray-600">Property must be verified and approved before tokenization</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">2</div>
                        <div>
                          <h4 className="font-medium">Token Parameters</h4>
                          <p className="text-sm text-gray-600">Define token supply, price, investment terms, and revenue distribution</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">3</div>
                        <div>
                          <h4 className="font-medium">Blockchain Deployment</h4>
                          <p className="text-sm text-gray-600">Create tokens using Hedera Token Service (HTS)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">4</div>
                        <div>
                          <h4 className="font-medium">Investor Onboarding</h4>
                          <p className="text-sm text-gray-600">Market the opportunity and onboard qualified investors</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-semibold">5</div>
                        <div>
                          <h4 className="font-medium">Token Distribution</h4>
                          <p className="text-sm text-gray-600">Distribute tokens to investors and begin revenue sharing</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Investment Terms & Options</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-4">
                        <Badge className="mb-2">Fixed Returns</Badge>
                        <h4 className="font-medium mb-2">Fixed Interest Model</h4>
                        <p className="text-sm text-gray-600">Predetermined returns regardless of property performance</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <Badge variant="secondary" className="mb-2">Variable Returns</Badge>
                        <h4 className="font-medium mb-2">Revenue Sharing</h4>
                        <p className="text-sm text-gray-600">Returns based on actual property income and appreciation</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <Badge variant="outline" className="mb-2">Hybrid Model</Badge>
                        <h4 className="font-medium mb-2">Mixed Approach</h4>
                        <p className="text-sm text-gray-600">Combination of fixed base return plus performance bonuses</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="api">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  API Reference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Authentication</h3>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm">
                      <div className="mb-2 text-green-400">// Authentication using Supabase client</div>
                      <div>const supabase = createClient(url, key)</div>
                      <div>const {'{ data, error }'} = await supabase.auth.signInWithPassword({'{'}email, password{'}'})</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Properties API</h3>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">GET</Badge>
                          <code className="text-sm">/api/properties</code>
                        </div>
                        <p className="text-sm text-gray-600">Fetch all properties with optional filters</p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>POST</Badge>
                          <code className="text-sm">/api/properties</code>
                        </div>
                        <p className="text-sm text-gray-600">Create a new property listing</p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">PUT</Badge>
                          <code className="text-sm">/api/properties/:id</code>
                        </div>
                        <p className="text-sm text-gray-600">Update an existing property</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Tokenization API</h3>
                    <div className="space-y-3">
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>POST</Badge>
                          <code className="text-sm">/api/tokenize</code>
                        </div>
                        <p className="text-sm text-gray-600">Create tokens for a verified property</p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">GET</Badge>
                          <code className="text-sm">/api/tokens/:propertyId</code>
                        </div>
                        <p className="text-sm text-gray-600">Get token information for a property</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Rate Limits</h3>
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <ul className="text-sm space-y-1">
                        <li>• <strong>General API:</strong> 100 requests per minute</li>
                        <li>• <strong>Authentication:</strong> 10 requests per minute</li>
                        <li>• <strong>File Uploads:</strong> 20 requests per hour</li>
                        <li>• <strong>Tokenization:</strong> 5 requests per hour</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="troubleshooting">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Common Issues & Solutions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3">Authentication Issues</h3>
                    <div className="space-y-3">
                      <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                        <h4 className="font-medium text-red-900 mb-1">Login Failed</h4>
                        <p className="text-sm text-red-800 mb-2">Can't sign in with correct credentials</p>
                        <ul className="text-sm text-red-700 space-y-1">
                          <li>• Check if email is verified</li>
                          <li>• Try password reset</li>
                          <li>• Clear browser cache and cookies</li>
                          <li>• Contact support if issue persists</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Property Upload Issues</h3>
                    <div className="space-y-3">
                      <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
                        <h4 className="font-medium text-orange-900 mb-1">File Upload Failed</h4>
                        <p className="text-sm text-orange-800 mb-2">Documents or images won't upload</p>
                        <ul className="text-sm text-orange-700 space-y-1">
                          <li>• Check file size limits (max 10MB per file)</li>
                          <li>• Ensure supported formats (PDF, JPG, PNG)</li>
                          <li>• Check internet connection</li>
                          <li>• Try uploading one file at a time</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Payment & Transaction Issues</h3>
                    <div className="space-y-3">
                      <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-1">Payment Failed</h4>
                        <p className="text-sm text-blue-800 mb-2">Token purchase or payment processing error</p>
                        <ul className="text-sm text-blue-700 space-y-1">
                          <li>• Verify payment method details</li>
                          <li>• Check account balance</li>
                          <li>• Contact your bank if needed</li>
                          <li>• Try alternative payment method</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Contact Support</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">General Support</h4>
                        <p className="text-sm text-gray-600 mb-2">For general questions and assistance</p>
                        <p className="text-sm"><strong>Email:</strong> support@terravault.com</p>
                        <p className="text-sm"><strong>Response:</strong> 24-48 hours</p>
                      </div>
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-2">Technical Support</h4>
                        <p className="text-sm text-gray-600 mb-2">For technical issues and bugs</p>
                        <p className="text-sm"><strong>Email:</strong> tech@terravault.com</p>
                        <p className="text-sm"><strong>Response:</strong> 12-24 hours</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm font-medium">Platform Status</span>
                    <Badge className="bg-green-600">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm font-medium">Blockchain Network</span>
                    <Badge className="bg-green-600">Operational</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-sm font-medium">Payment Processing</span>
                    <Badge className="bg-green-600">Operational</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documentation;
