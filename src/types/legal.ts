export interface LegalFrameworkConfig {
  scenario: 'tokenization' | 'investment';
  propertyDetails?: {
    id: string;
    title: string;
    location: string;
    value: number;
  };
  tokenDetails?: {
    tokenPrice: number;
    totalTokens: number;
    minimumInvestment: number;
  };
  minimumReadingTime?: number;
  requiredSections?: string[];
  customClauses?: LegalClause[];
}

export interface LegalClause {
  id: string;
  title: string;
  content: string;
  isRequired: boolean;
  category: string;
}

export interface ReadingProgress {
  sectionId: string;
  timeSpent: number;
  completed: boolean;
  lastVisited: Date;
}

export interface LegalAgreement {
  id: string;
  userId: string;
  agreementType: 'tokenization' | 'investment';
  version: string;
  propertyId?: string;
  tokenizedPropertyId?: string;
  agreedAt: Date;
  readingTimeSeconds: number;
  sectionsCompleted: string[];
  metadata: Record<string, any>;
}

export interface LegalSection {
  id: string;
  title: string;
  content: string;
  icon: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  minimumReadTime: number;
  isRequired: boolean;
  category: 'risks' | 'process' | 'terms' | 'compliance' | 'rights' | 'responsibilities';
}