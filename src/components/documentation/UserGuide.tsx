import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpenIcon,
  TrendUpIcon,
  ChartBarIcon,
  ShieldIcon,
  CreditCardIcon,
  UsersIcon,
  GearIcon,
  LinkIcon,
} from "@phosphor-icons/react";
import { Vote, ChevronRightIcon } from "lucide-react";

export function UserGuide() {
  const [selectedGuide, setSelectedGuide] = useState("getting-started");

  const guides = {
    "getting-started": {
      title: "Getting Started",
      icon: BookOpenIcon,
      sections: [
        {
          title: "Welcome to PropertyToken",
          content: `PropertyToken is a revolutionary platform that enables property tokenization on the Hedera blockchain. Here's how to get started:

1. **Complete Your Profile**: Ensure your profile is complete with accurate information
2. **Verify Your Identity**: Upload required KYC documents for verification
3. **Connect Your Wallet**: Link your HashPack wallet for transactions
4. **Explore Properties**: Browse available tokenized properties
5. **Start Investing**: Purchase property tokens to begin building your portfolio`,
        },
        {
          title: "Account Verification",
          content: `To ensure security and compliance, all users must complete identity verification:

**Required Documents:**
- Government-issued ID (passport, driver's license, or national ID)
- Proof of address (utility bill, bank statement, or lease agreement)
- Selfie with ID for verification

**Verification Process:**
1. Upload clear photos of your documents
2. Wait for verifier review (typically 24-48 hours)
3. Receive notification of approval status
4. Gain access to all platform features`,
        },
        {
          title: "Understanding Property Tokens",
          content: `Property tokens represent fractional ownership in real estate assets:

**Token Benefits:**
- Fractional ownership of high-value properties
- Potential rental income distribution
- Voting rights on property decisions
- Liquidity through secondary market trading
- Lower barrier to entry compared to traditional real estate

**Token Types:**
- **Utility Tokens**: Access to platform features
- **Security Tokens**: Represent actual property ownership
- **Governance Tokens**: Voting rights in property decisions`,
        },
      ],
    },
    trading: {
      title: "Trading Guide",
      icon: TrendUpIcon,
      sections: [
        {
          title: "How to Buy Property Tokens",
          content: `Follow these steps to purchase property tokens:

**Before You Start:**
- Ensure your account is verified
- Have sufficient balance in your connected wallet
- Review property details and documentation

**Purchase Process:**
1. Browse available properties in the marketplace
2. Select a property and review its details
3. Choose the number of tokens to purchase
4. Review transaction details and fees
5. Confirm the transaction in your wallet
6. Receive confirmation and token transfer`,
        },
        {
          title: "Trading on Secondary Markets",
          content: `Trade your tokens with other investors:

**Market Orders:**
- Buy/sell immediately at current market price
- Suitable for quick transactions
- May have price slippage

**Limit Orders:**
- Set your desired buy/sell price
- Order executes when price is reached
- Better price control but may not execute immediately

**Trading Tips:**
- Monitor market depth before placing large orders
- Consider transaction fees in your calculations
- Use limit orders for better price control
- Review property performance before trading`,
        },
        {
          title: "Portfolio Management",
          content: `Effectively manage your token portfolio:

**Portfolio Tracking:**
- Monitor token values and performance
- Track rental income distributions
- View transaction history
- Analyze portfolio diversification

**Risk Management:**
- Diversify across multiple properties
- Monitor property-specific risks
- Stay informed about market conditions
- Consider long-term vs. short-term strategies

**Performance Metrics:**
- Total portfolio value
- Return on investment (ROI)
- Income yield from rentals
- Token price appreciation`,
        },
      ],
    },
    governance: {
      title: "Governance",
      icon: Vote,
      sections: [
        {
          title: "Voting Rights and Responsibilities",
          content: `As a token holder, you have voting rights on important property decisions:

**Voting Power:**
- Based on number of tokens owned
- Proportional to your investment stake
- Cannot be transferred separately from tokens

**Types of Votes:**
- Property improvements and renovations
- Management company selection
- Major capital expenditures
- Sale or refinancing decisions
- Rent adjustment proposals

**Voting Process:**
1. Receive notification of new proposals
2. Review proposal details and documentation
3. Cast your vote within the specified timeframe
4. View real-time voting results
5. Receive notification of final outcomes`,
        },
        {
          title: "Creating Proposals",
          content: `Token holders can create proposals for property decisions:

**Proposal Requirements:**
- Minimum token holding threshold
- Detailed proposal description
- Supporting documentation
- Clear voting options
- Proposed timeline for implementation

**Proposal Types:**
- **Improvement Proposals**: Property upgrades or renovations
- **Management Proposals**: Changes to property management
- **Financial Proposals**: Budget allocations or financial decisions
- **Strategic Proposals**: Long-term property strategy

**Submission Process:**
1. Draft your proposal with all required details
2. Submit for initial review
3. Address any feedback from moderators
4. Proposal goes live for voting
5. Monitor voting progress and engage with community`,
        },
      ],
    },
    analytics: {
      title: "Analytics & Reporting",
      icon: ChartBarIcon,
      sections: [
        {
          title: "Understanding Your Dashboard",
          content: `Your analytics dashboard provides comprehensive insights:

**Portfolio Overview:**
- Total portfolio value and performance
- Asset allocation across properties
- Recent transaction activity
- Income distribution history

**Property Performance:**
- Individual property returns
- Occupancy rates and rental income
- Property value appreciation
- Market comparison metrics

**Market Analysis:**
- Property market trends
- Token price movements
- Trading volume analysis
- Market sentiment indicators`,
        },
        {
          title: "Financial Reports",
          content: `Access detailed financial reporting:

**Income Statements:**
- Rental income received
- Management fees and expenses
- Net income distributions
- Tax-related information

**Performance Reports:**
- Return on investment calculations
- Capital gains/losses
- Yield analysis
- Benchmark comparisons

**Export Options:**
- Download reports in PDF format
- Export data to CSV for analysis
- Schedule automatic report delivery
- Integration with tax software`,
        },
      ],
    },
    security: {
      title: "Security Best Practices",
      icon: ShieldIcon,
      sections: [
        {
          title: "Account Security",
          content: `Protect your account with these security measures:

**Strong Authentication:**
- Use a strong, unique password
- Enable two-factor authentication (2FA)
- Regularly update your password
- Don't share login credentials

**Wallet Security:**
- Use hardware wallets for large holdings
- Keep private keys secure and offline
- Enable wallet transaction confirmations
- Regularly backup your wallet

**Platform Security:**
- Log out when using shared computers
- Monitor account activity regularly
- Report suspicious activity immediately
- Keep your browser and devices updated`,
        },
        {
          title: "Transaction Safety",
          content: `Follow these guidelines for safe transactions:

**Before Transacting:**
- Verify recipient addresses carefully
- Double-check transaction amounts
- Understand all fees involved
- Ensure sufficient wallet balance

**During Transactions:**
- Never share private keys or seeds
- Verify transaction details in your wallet
- Don't rush through confirmations
- Save transaction receipts

**After Transactions:**
- Monitor transaction status
- Verify token receipt in your portfolio
- Keep records for tax purposes
- Report any issues immediately`,
        },
      ],
    },
  };

  const GuideSection = ({
    section,
  }: {
    section: { title: string; content: string };
  }) => (
    <div className="space-y-4">
      <h4 className="text-lg font-semibold text-foreground">{section.title}</h4>
      <div className="prose prose-sm max-w-none text-muted-foreground">
        {section.content.split("\n\n").map((paragraph, index) => (
          <p key={index} className="mb-4 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-foreground">User Guide</h1>
        <p className="text-muted-foreground">
          Everything you need to know about using PropertyToken
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Guide Sections</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(guides).map(([key, guide]) => {
              const IconComponent = guide.icon;
              return (
                <Button
                  key={key}
                  variant={selectedGuide === key ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedGuide(key)}
                >
                  <IconComponent className="h-4 w-4 mr-2" />
                  {guide.title}
                  <ChevronRightIcon className="h-4 w-4 ml-auto" />
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center space-x-2">
              {(() => {
                const IconComponent =
                  guides[selectedGuide as keyof typeof guides].icon;
                return <IconComponent className="h-6 w-6 text-primary" />;
              })()}
              <CardTitle>
                {guides[selectedGuide as keyof typeof guides].title}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-8">
                {guides[selectedGuide as keyof typeof guides].sections.map(
                  (section, index) => (
                    <div key={index}>
                      <GuideSection section={section} />
                      {index <
                        guides[selectedGuide as keyof typeof guides].sections
                          .length -
                          1 && (
                        <div className="border-t border-border my-6"></div>
                      )}
                    </div>
                  )
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>
            Common actions and helpful resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center space-y-2">
                <CreditCardIcon className="h-6 w-6 mx-auto text-primary" />
                <div>
                  <div className="font-medium">Start Trading</div>
                  <div className="text-sm text-muted-foreground">
                    Browse and buy tokens
                  </div>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4">
              <div className="text-center space-y-2">
                <UsersIcon className="h-6 w-6 mx-auto text-primary" />
                <div>
                  <div className="font-medium">Join Community</div>
                  <div className="text-sm text-muted-foreground">
                    Connect with other investors
                  </div>
                </div>
              </div>
            </Button>

            <Button variant="outline" className="h-auto p-4">
              <div className="text-center space-y-2">
                <GearIcon className="h-6 w-6 mx-auto text-primary" />
                <div>
                  <div className="font-medium">Account Settings</div>
                  <div className="text-sm text-muted-foreground">
                    Manage your profile
                  </div>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Support Contact */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">Need Additional Help?</h3>
            <p className="text-muted-foreground">
              Can't find what you're looking for? Our support team is here to
              help.
            </p>
            <div className="flex justify-center space-x-4">
              <Button>
                Contact Support
                <LinkIcon className="h-4 w-4 ml-2" />
              </Button>
              <Button variant="outline">
                FAQ
                <LinkIcon className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
