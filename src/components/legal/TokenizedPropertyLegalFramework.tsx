import React, { useState, useEffect, useCallback } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  FileText, 
  Shield, 
  Clock, 
  CheckCircle, 
  Eye,
  Download,
  Info,
  Building,
  Coins,
  Scale,
  Users,
  TrendingUp,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LegalFrameworkConfig, LegalSection, ReadingProgress } from '@/types/legal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TokenizedPropertyLegalFrameworkProps {
  config: LegalFrameworkConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgreementComplete: (agreementId: string) => void;
}

const getLegalSections = (scenario: 'tokenization' | 'investment'): LegalSection[] => {
  const commonSections: LegalSection[] = [
    {
      id: 'overview',
      title: 'Legal Framework Overview',
      content: `This legal framework establishes the terms and conditions for ${scenario === 'tokenization' ? 'tokenizing real estate properties' : 'investing in tokenized real estate properties'} on the Relett platform. By proceeding, you acknowledge that you have read, understood, and agree to be bound by these terms.`,
      icon: 'FileText',
      riskLevel: 'medium',
      minimumReadTime: 30,
      isRequired: true,
      category: 'terms'
    },
    {
      id: 'investment_risks',
      title: 'Investment Risks & Disclaimers',
      content: `
CRITICAL RISK DISCLOSURE

Real estate tokenization involves significant financial risks that you must understand before proceeding:

• MARKET VOLATILITY: Token values may fluctuate significantly based on property values, market conditions, and investor sentiment
• LIQUIDITY RISK: Tokens may not be easily tradeable or convertible to cash when needed
• REGULATORY RISK: Changing regulations may affect token legality, trading, or value
• TECHNOLOGY RISK: Blockchain and smart contract vulnerabilities may result in loss of tokens
• PROPERTY RISK: Physical property damage, location changes, or market shifts may affect returns
• PLATFORM RISK: Relett platform changes, closure, or technical issues may impact your investment

${scenario === 'investment' ? `
INVESTMENT-SPECIFIC RISKS:
• You may lose your entire investment
• Returns are not guaranteed and past performance does not predict future results
• You may have limited control over property management decisions
• Exit strategies may be limited or unavailable
• Tax implications may be complex and vary by jurisdiction
` : `
TOKENIZATION-SPECIFIC RISKS:
• Legal ownership structure may be complex and vary by jurisdiction
• Token holder rights may be limited compared to traditional property ownership
• Revenue distribution mechanisms may change or fail
• Property management responsibilities remain with you
• Compliance requirements may be extensive and costly
`}

NO GUARANTEE OF RETURNS OR SUCCESS. SEEK PROFESSIONAL ADVICE.
      `,
      icon: 'AlertTriangle',
      riskLevel: 'critical',
      minimumReadTime: 120,
      isRequired: true,
      category: 'risks'
    }
  ];

  const tokenizationSections: LegalSection[] = [
    {
      id: 'tokenization_process',
      title: 'Tokenization Process & Structure',
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
      icon: 'Building',
      riskLevel: 'high',
      minimumReadTime: 90,
      isRequired: true,
      category: 'process'
    },
    {
      id: 'revenue_distribution',
      title: 'Revenue Sharing & Distribution',
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
      icon: 'TrendingUp',
      riskLevel: 'medium',
      minimumReadTime: 60,
      isRequired: true,
      category: 'terms'
    }
  ];

  const investmentSections: LegalSection[] = [
    {
      id: 'investment_terms',
      title: 'Investment Terms & Conditions',
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
      icon: 'Coins',
      riskLevel: 'medium',
      minimumReadTime: 75,
      isRequired: true,
      category: 'terms'
    },
    {
      id: 'secondary_market',
      title: 'Secondary Market & Liquidity',
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
      icon: 'Users',
      riskLevel: 'medium',
      minimumReadTime: 45,
      isRequired: false,
      category: 'terms'
    }
  ];

  const complianceSections: LegalSection[] = [
    {
      id: 'regulatory_compliance',
      title: 'Regulatory Compliance & Legal Framework',
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
      icon: 'Scale',
      riskLevel: 'high',
      minimumReadTime: 90,
      isRequired: true,
      category: 'compliance'
    }
  ];

  const rightsAndResponsibilities: LegalSection[] = [
    {
      id: 'platform_responsibilities',
      title: 'Platform Rights & Responsibilities',
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
      icon: 'Shield',
      riskLevel: 'medium',
      minimumReadTime: 60,
      isRequired: true,
      category: 'responsibilities'
    },
    {
      id: 'user_rights',
      title: 'User Rights & Protections',
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
      icon: 'Lock',
      riskLevel: 'low',
      minimumReadTime: 45,
      isRequired: false,
      category: 'rights'
    }
  ];

  if (scenario === 'tokenization') {
    return [...commonSections, ...tokenizationSections, ...complianceSections, ...rightsAndResponsibilities];
  } else {
    return [...commonSections, ...investmentSections, ...complianceSections, ...rightsAndResponsibilities];
  }
};

export const TokenizedPropertyLegalFramework: React.FC<TokenizedPropertyLegalFrameworkProps> = ({
  config,
  open,
  onOpenChange,
  onAgreementComplete
}) => {
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState(0);
  const [readingProgress, setReadingProgress] = useState<Record<string, ReadingProgress>>({});
  const [totalReadingTime, setTotalReadingTime] = useState(0);
  const [canProceed, setCanProceed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime] = useState(Date.now());

  const sections = getLegalSections(config.scenario);
  const requiredSections = sections.filter(s => s.isRequired);
  const currentSectionData = sections[currentSection];

  // Track reading time for current section
  useEffect(() => {
    if (!currentSectionData || !open) return;

    const interval = setInterval(() => {
      setReadingProgress(prev => {
        const sectionProgress = prev[currentSectionData.id] || {
          sectionId: currentSectionData.id,
          timeSpent: 0,
          completed: false,
          lastVisited: new Date()
        };

        const newTimeSpent = sectionProgress.timeSpent + 1;
        const isCompleted = newTimeSpent >= currentSectionData.minimumReadTime;

        return {
          ...prev,
          [currentSectionData.id]: {
            ...sectionProgress,
            timeSpent: newTimeSpent,
            completed: isCompleted,
            lastVisited: new Date()
          }
        };
      });

      setTotalReadingTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentSectionData, open]);

  // Check if user can proceed
  useEffect(() => {
    const allRequiredSectionsCompleted = requiredSections.every(section => 
      readingProgress[section.id]?.completed
    );
    
    const minimumTimeReached = totalReadingTime >= (config.minimumReadingTime || 300); // 5 minutes default
    
    setCanProceed(allRequiredSectionsCompleted && minimumTimeReached);
  }, [readingProgress, totalReadingTime, requiredSections, config.minimumReadingTime]);

  const handleAgree = async () => {
    if (!canProceed) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const agreementData = {
        user_id: user.id,
        agreement_type: config.scenario,
        version: '1.0.0',
        property_id: config.propertyDetails?.id,
        tokenized_property_id: config.scenario === 'investment' ? config.propertyDetails?.id : null,
        reading_time_seconds: totalReadingTime,
        sections_completed: Object.keys(readingProgress),
        metadata: {
          scenario: config.scenario,
          propertyId: config.propertyDetails?.id,
          minimumReadingTime: config.minimumReadingTime,
          sectionsRead: Object.keys(readingProgress).length,
          userAgent: navigator.userAgent,
          completedAt: new Date().toISOString()
        }
      };

      const { data, error } = await supabase
        .from('tokenization_legal_agreements')
        .insert(agreementData)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Legal Agreement Accepted",
        description: "You have successfully agreed to the legal framework.",
      });

      onAgreementComplete(data.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving legal agreement:', error);
      toast({
        title: "Error",
        description: "Failed to save legal agreement. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProgressPercentage = () => {
    const completedSections = Object.values(readingProgress).filter(p => p.completed).length;
    return (completedSections / sections.length) * 100;
  };

  const getIconComponent = (iconName: string) => {
    const icons = {
      FileText,
      AlertTriangle,
      Building,
      TrendingUp,
      Coins,
      Users,
      Scale,
      Shield,
      Lock,
      Info
    };
    const IconComponent = icons[iconName as keyof typeof icons] || FileText;
    return <IconComponent className="h-5 w-5" />;
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl h-[90vh] flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">
                  {config.scenario === 'tokenization' ? 'Property Tokenization' : 'Investment'} Legal Framework
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Please read all sections carefully before proceeding
                </p>
              </div>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                ×
              </Button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Reading Progress</span>
                <span>{Math.round(getProgressPercentage())}% Complete</span>
              </div>
              <Progress value={getProgressPercentage()} className="h-2" />
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{Math.floor(totalReadingTime / 60)}:{(totalReadingTime % 60).toString().padStart(2, '0')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>{Object.values(readingProgress).filter(p => p.completed).length}/{sections.length} sections</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <div className="flex-1 flex overflow-hidden">
            {/* Section Navigation */}
            <div className="w-80 border-r bg-muted/30">
              <ScrollArea className="h-full p-4">
                <div className="space-y-2">
                  {sections.map((section, index) => {
                    const progress = readingProgress[section.id];
                    const isCompleted = progress?.completed || false;
                    const isActive = index === currentSection;
                    
                    return (
                      <div
                        key={section.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-colors",
                          isActive && "bg-primary text-primary-foreground",
                          !isActive && isCompleted && "bg-green-50 border-green-200",
                          !isActive && !isCompleted && "hover:bg-muted"
                        )}
                        onClick={() => setCurrentSection(index)}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getIconComponent(section.icon)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm truncate">{section.title}</h4>
                            {isCompleted && (
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={getRiskBadgeColor(section.riskLevel) as any}
                              className="text-xs"
                            >
                              {section.riskLevel}
                            </Badge>
                            {section.isRequired && (
                              <Badge variant="outline" className="text-xs">
                                Required
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs mt-1 opacity-70">
                            {progress ? `${progress.timeSpent}s` : '0s'} / {section.minimumReadTime}s
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {/* Section Content */}
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b">
                <div className="flex items-center gap-3 mb-4">
                  {getIconComponent(currentSectionData.icon)}
                  <h2 className="text-lg font-semibold">{currentSectionData.title}</h2>
                  <Badge variant={getRiskBadgeColor(currentSectionData.riskLevel) as any}>
                    {currentSectionData.riskLevel} risk
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>
                      {readingProgress[currentSectionData.id]?.timeSpent || 0}s / {currentSectionData.minimumReadTime}s
                    </span>
                  </div>
                  {readingProgress[currentSectionData.id]?.completed && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Section completed</span>
                    </div>
                  )}
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {currentSectionData.content}
                  </div>
                </div>
              </ScrollArea>

              <div className="p-6 border-t bg-muted/30">
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                    disabled={currentSection === 0}
                  >
                    Previous Section
                  </Button>
                  
                  {currentSection < sections.length - 1 ? (
                    <Button
                      onClick={() => setCurrentSection(currentSection + 1)}
                    >
                      Next Section
                    </Button>
                  ) : (
                    <Button
                      onClick={handleAgree}
                      disabled={!canProceed || isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? 'Processing...' : 'I Agree & Accept'}
                    </Button>
                  )}
                </div>
                
                {!canProceed && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-800">Requirements not met:</p>
                        <ul className="mt-1 space-y-1 text-yellow-700">
                          {requiredSections.some(s => !readingProgress[s.id]?.completed) && (
                            <li>• Complete reading all required sections</li>
                          )}
                          {totalReadingTime < (config.minimumReadingTime || 300) && (
                            <li>• Spend minimum reading time ({Math.ceil((config.minimumReadingTime || 300) / 60)} minutes)</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};