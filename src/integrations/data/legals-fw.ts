import { LegalSection } from "@/types/legal";

export const getLegalSections = (
  scenario: "tokenization" | "investment"
): LegalSection[] => {
  const commonSections: LegalSection[] = [
    {
      id: "overview",
      title: "Legal Framework Overview",
      content: `This legal framework establishes the terms and conditions for ${
        scenario === "tokenization"
          ? "tokenizing real estate properties"
          : "investing in tokenized real estate properties"
      } on the Relett platform. By proceeding, you acknowledge that you have read, understood, and agree to be bound by these terms.`,
      icon: "FileText",
      riskLevel: "medium",
      minimumReadTime: 30,
      isRequired: true,
      category: "terms",
    },
    {
      id: "investment_risks",
      title: "Investment Risks & Disclaimers",
      content: `
  CRITICAL RISK DISCLOSURE
  
  Real estate tokenization involves significant financial risks that you must understand before proceeding:
  
  • MARKET VOLATILITY: Token values may fluctuate significantly based on property values, market conditions, and investor sentiment
  • LIQUIDITY RISK: Tokens may not be easily tradeable or convertible to cash when needed
  • REGULATORY RISK: Changing regulations may affect token legality, trading, or value
  • TECHNOLOGY RISK: Blockchain and smart contract vulnerabilities may result in loss of tokens
  • PROPERTY RISK: Physical property damage, location changes, or market shifts may affect returns
  • PLATFORM RISK: Relett platform changes, closure, or technical issues may impact your investment
  
  ${
    scenario === "investment"
      ? `
  INVESTMENT-SPECIFIC RISKS:
  • You may lose your entire investment
  • Returns are not guaranteed and past performance does not predict future results
  • You may have limited control over property management decisions
  • Exit strategies may be limited or unavailable
  • Tax implications may be complex and vary by jurisdiction
  `
      : `
  TOKENIZATION-SPECIFIC RISKS:
  • Legal ownership structure may be complex and vary by jurisdiction
  • Token holder rights may be limited compared to traditional property ownership
  • Revenue distribution mechanisms may change or fail
  • Property management responsibilities remain with you
  • Compliance requirements may be extensive and costly
  `
  }
  
  NO GUARANTEE OF RETURNS OR SUCCESS. SEEK PROFESSIONAL ADVICE.
        `,
      icon: "AlertTriangle",
      riskLevel: "critical",
      minimumReadTime: 120,
      isRequired: true,
      category: "risks",
    },
  ];

  const tokenizationSections: LegalSection[] = [
    {
      id: "tokenization_process",
      title: "Tokenization Process & Structure",
      content: `
  PROPERTY TOKENIZATION FRAMEWORK
  
  1. LEGAL STRUCTURE
  • Tokens represent fractional ownership or economic interest in the underlying property
  • Legal title may remain with the original owner or be transferred to a trust/SPV structure
  • Token holders receive rights to income, appreciation, and governance as specified
  
  2. TOKEN CREATION PROCESS
  • Property valuation through licensed appraisers
  • Legal documentation and compliance verification
  • Smart contract deployment on Hedera network
  • Token issuance and initial distribution
  
  3. ONGOING OBLIGATIONS
  • Regular financial reporting to token holders
  • Property maintenance and management
  • Compliance with securities and real estate regulations
  • Distribution of rental income and sale proceeds
  
  4. GOVERNANCE STRUCTURE
  • Token holders may have voting rights on major decisions
  • Property management decisions remain with designated manager
  • Dispute resolution through specified arbitration process
        `,
      icon: "Building",
      riskLevel: "high",
      minimumReadTime: 90,
      isRequired: true,
      category: "process",
    },
    {
      id: "revenue_distribution",
      title: "Revenue Sharing & Distribution",
      content: `
  FINANCIAL TERMS & DISTRIBUTIONS
  
  1. REVENUE SOURCES
  • Rental income from property
  • Capital appreciation upon sale
  • Other property-related income
  
  2. DISTRIBUTION MECHANISM
  • Regular distributions (monthly/quarterly) of net rental income
  • Distributions calculated after expenses, fees, and reserves
  • Pro-rata distribution based on token ownership percentage
  
  3. FEES & EXPENSES
  • Platform fees (typically 2-5% of distributions)
  • Property management fees
  • Legal and compliance costs
  • Reserve funds for maintenance and improvements
  
  4. TAX CONSIDERATIONS
  • Token holders responsible for their own tax obligations
  • Form 1099 or equivalent tax documents provided
  • Professional tax advice strongly recommended
        `,
      icon: "TrendingUp",
      riskLevel: "medium",
      minimumReadTime: 60,
      isRequired: true,
      category: "terms",
    },
  ];

  const investmentSections: LegalSection[] = [
    {
      id: "investment_terms",
      title: "Investment Terms & Conditions",
      content: `
  INVESTMENT AGREEMENT TERMS
  
  1. MINIMUM INVESTMENT
  • Minimum investment amounts as specified per property
  • Additional investments permitted subject to availability
  • Investment currency and payment methods
  
  2. TOKEN ALLOCATION
  • Tokens allocated based on investment amount and current price
  • Token price may vary based on market conditions
  • No guarantee of specific allocation amounts
  
  3. HOLDING PERIOD
  • No mandatory holding period unless specified
  • Secondary market trading subject to platform availability
  • Transfer restrictions may apply
  
  4. INVESTOR RIGHTS
  • Right to receive pro-rata share of distributions
  • Voting rights on major property decisions (if applicable)
  • Access to financial reports and property information
  • Right to participate in exit events
  
  5. INVESTOR RESPONSIBILITIES
  • Compliance with platform terms and conditions
  • Accurate representation of investor status and qualifications
  • Timely payment of investments
  • Compliance with applicable laws and regulations
        `,
      icon: "Coins",
      riskLevel: "medium",
      minimumReadTime: 75,
      isRequired: true,
      category: "terms",
    },
    {
      id: "secondary_market",
      title: "Secondary Market & Liquidity",
      content: `
  TRADING & LIQUIDITY PROVISIONS
  
  1. SECONDARY MARKET ACCESS
  • Tokens may be tradeable on platform secondary market
  • Trading subject to platform availability and regulations
  • No guarantee of market liquidity or buyer availability
  
  2. TRADING RESTRICTIONS
  • Minimum holding periods may apply
  • Accredited investor requirements for certain transactions
  • Geographic restrictions based on regulations
  
  3. PRICING MECHANISM
  • Market-driven pricing based on supply and demand
  • No guaranteed relationship to underlying property value
  • Platform may provide pricing guidance but not guarantees
  
  4. TRANSACTION COSTS
  • Trading fees apply to secondary market transactions
  • Transfer fees may be charged for token movements
  • All fees clearly disclosed before transaction completion
        `,
      icon: "Users",
      riskLevel: "medium",
      minimumReadTime: 45,
      isRequired: false,
      category: "terms",
    },
  ];

  const complianceSections: LegalSection[] = [
    {
      id: "regulatory_compliance",
      title: "Regulatory Compliance & Legal Framework",
      content: `
  COMPLIANCE REQUIREMENTS
  
  1. SECURITIES REGULATIONS
  • Tokens may be considered securities in certain jurisdictions
  • Compliance with applicable securities laws required
  • Investor suitability and accreditation requirements
  
  2. REAL ESTATE REGULATIONS
  • Compliance with local real estate and property laws
  • Zoning, building codes, and municipal requirements
  • Property taxes and assessment obligations
  
  3. ANTI-MONEY LAUNDERING (AML)
  • Know Your Customer (KYC) verification required
  • Source of funds documentation may be requested
  • Ongoing monitoring for suspicious activities
  
  4. TAX COMPLIANCE
  • Reporting obligations in relevant jurisdictions
  • Withholding tax requirements for international investors
  • Professional tax advice strongly recommended
  
  5. DATA PROTECTION
  • Compliance with GDPR, CCPA, and other privacy laws
  • Secure handling of personal and financial information
  • Limited data sharing with third parties
        `,
      icon: "Scale",
      riskLevel: "high",
      minimumReadTime: 90,
      isRequired: true,
      category: "compliance",
    },
  ];

  const rightsAndResponsibilities: LegalSection[] = [
    {
      id: "platform_responsibilities",
      title: "Platform Rights & Responsibilities",
      content: `
  RELETT PLATFORM OBLIGATIONS & LIMITATIONS
  
  1. PLATFORM SERVICES
  • Technology infrastructure for tokenization and trading
  • Due diligence and verification services
  • Customer support and dispute resolution assistance
  • Regulatory compliance monitoring
  
  2. PLATFORM LIMITATIONS
  • No guarantee of investment returns or token value
  • No liability for property-specific risks or losses
  • Limited liability for technology failures or security breaches
  • Right to modify platform terms and features
  
  3. SERVICE AVAILABILITY
  • Platform operates on best-effort basis
  • Scheduled maintenance and updates may cause temporary unavailability
  • Emergency suspensions may occur for security or regulatory reasons
  
  4. DISPUTE RESOLUTION
  • Initial disputes handled through platform customer service
  • Binding arbitration for unresolved disputes
  • Class action waiver and jury trial waiver
  • Governing law and jurisdiction specifications
        `,
      icon: "Shield",
      riskLevel: "medium",
      minimumReadTime: 60,
      isRequired: true,
      category: "responsibilities",
    },
    {
      id: "user_rights",
      title: "User Rights & Protections",
      content: `
  YOUR RIGHTS AND PROTECTIONS
  
  1. INFORMATION ACCESS
  • Right to receive regular financial reports
  • Access to property documentation and legal structure
  • Notification of material changes or events
  • Right to inspect platform records related to your investment
  
  2. PRIVACY RIGHTS
  • Control over personal data collection and use
  • Right to data portability and deletion (subject to legal requirements)
  • Protection against unauthorized data sharing
  • Secure data storage and transmission
  
  3. WITHDRAWAL RIGHTS
  • Right to withdraw from tokenization/investment process before completion
  • Cooling-off period for certain investment types
  • Refund procedures for cancelled transactions
  • Clear termination and exit procedures
  
  4. COMPLAINT PROCEDURES
  • Clear complaint filing process
  • Timely response guarantees
  • Independent review procedures
  • Regulatory complaint options
        `,
      icon: "Lock",
      riskLevel: "low",
      minimumReadTime: 45,
      isRequired: false,
      category: "rights",
    },
  ];

  if (scenario === "tokenization") {
    return [
      ...commonSections,
      ...tokenizationSections,
      ...complianceSections,
      ...rightsAndResponsibilities,
    ];
  } else {
    return [
      ...commonSections,
      ...investmentSections,
      ...complianceSections,
      ...rightsAndResponsibilities,
    ];
  }
};
