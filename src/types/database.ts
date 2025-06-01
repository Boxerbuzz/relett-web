
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'expired'
export type IdentityType = 'nin' | 'bvn' | 'cac' | 'passport' | 'drivers_license'
export type AppRole = 'admin' | 'landowner' | 'verifier' | 'agent' | 'investor'
export type VerifierType = 'surveyor' | 'lawyer' | 'estate_agent' | 'government_official' | 'chartered_surveyor'
export type Gender = 'male' | 'female' | 'other'

export interface UserProfile {
  id: string
  user_id: string
  first_name: string
  last_name: string
  middle_name?: string
  phone_number?: string
  date_of_birth?: string
  gender?: Gender
  nationality?: string
  state_of_origin?: string
  lga?: string
  address?: Record<string, any>
  avatar_url?: string
  bio?: string
  verification_status: VerificationStatus
  is_active: boolean
  last_login?: string
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role: AppRole
  assigned_by?: string
  assigned_at: string
  expires_at?: string
  is_active: boolean
  metadata: Record<string, any>
}

export interface IdentityVerification {
  id: string
  user_id: string
  identity_type: IdentityType
  identity_number: string
  full_name: string
  verification_status: VerificationStatus
  verification_provider?: string
  verification_response?: Record<string, any>
  verified_at?: string
  expires_at?: string
  retry_count: number
  last_retry_at?: string
  created_at: string
  updated_at: string
}

export interface VerifierCredential {
  id: string
  user_id: string
  verifier_type: VerifierType
  license_number: string
  issuing_authority: string
  license_name: string
  issue_date: string
  expiry_date: string
  verification_status: VerificationStatus
  verified_by?: string
  verified_at?: string
  documents: any[]
  reputation_score: number
  total_verifications: number
  successful_verifications: number
  is_active: boolean
  suspension_reason?: string
  suspended_until?: string
  created_at: string
  updated_at: string
}

// Land Registry Types for Phase 2
export type LandTitleStatus = 'draft' | 'pending_verification' | 'verified' | 'disputed' | 'revoked'
export type DocumentType = 'deed' | 'survey' | 'certificate_of_occupancy' | 'government_consent' | 'tax_clearance' | 'other'
export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'expired'
export type AgreementType = 'sale' | 'lease' | 'transfer' | 'mortgage' | 'easement'
export type AgreementStatus = 'draft' | 'active' | 'completed' | 'cancelled' | 'disputed'
export type ComplianceType = 'tax_payment' | 'land_use_approval' | 'environmental_clearance' | 'building_permit'
export type ComplianceStatus = 'compliant' | 'non_compliant' | 'pending' | 'expired'

export interface LandTitle {
  id: string
  title_number: string
  owner_id: string
  coordinates: Record<string, any>
  area_sqm: number
  description: string
  location_address: string
  state: string
  lga: string
  land_use: string
  title_type: string
  acquisition_date: string
  acquisition_method: string
  previous_title_id?: string
  status: LandTitleStatus
  blockchain_hash?: string
  blockchain_transaction_id?: string
  verification_metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface PropertyDocument {
  id: string
  land_title_id?: string
  property_id?: string
  document_type: DocumentType
  document_name: string
  file_url: string
  file_size: number
  mime_type: string
  document_hash: string
  status: DocumentStatus
  verification_notes?: string
  verified_by?: string
  verified_at?: string
  expires_at?: string
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface LegalAgreement {
  id: string
  land_title_id: string
  agreement_type: AgreementType
  parties: any[]
  terms: Record<string, any>
  financial_terms: Record<string, any>
  start_date: string
  end_date?: string
  status: AgreementStatus
  signed_document_url?: string
  blockchain_record?: string
  created_at: string
  updated_at: string
}

export interface ComplianceRecord {
  id: string
  land_title_id: string
  compliance_type: ComplianceType
  authority: string
  reference_number: string
  issue_date: string
  expiry_date?: string
  status: ComplianceStatus
  document_url?: string
  renewal_reminder_sent: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

export interface DocumentVerificationRequest {
  id: string
  document_id: string
  requested_by: string
  assigned_verifier?: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in_progress' | 'completed' | 'rejected'
  verification_checklist: Record<string, any>
  notes?: string
  completed_at?: string
  created_at: string
  updated_at: string
}

// Tokenization Types for Phase 3
export type TokenType = 'erc20' | 'erc721' | 'hts_fungible' | 'hts_nft'
export type TokenizationStatus = 'draft' | 'pending_approval' | 'approved' | 'minted' | 'active' | 'paused' | 'retired'
export type InvestmentTerms = 'fixed' | 'variable' | 'hybrid'

export interface TokenizedProperty {
  id: string
  land_title_id: string
  property_id?: string
  token_symbol: string
  token_name: string
  token_type: TokenType
  total_supply: string
  total_value_usd: number
  minimum_investment: number
  token_price: number
  status: TokenizationStatus
  blockchain_network: string
  token_contract_address?: string
  token_id?: string
  hedera_token_id?: string
  investment_terms: InvestmentTerms
  expected_roi: number
  revenue_distribution_frequency: string
  lock_up_period_months: number
  metadata: Record<string, any>
  legal_structure: Record<string, any>
  created_at: string
  updated_at: string
}

export interface TokenHolding {
  id: string
  tokenized_property_id: string
  holder_id: string
  tokens_owned: string
  purchase_price_per_token: number
  total_investment: number
  acquisition_date: string
  vesting_schedule?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface RevenueDistribution {
  id: string
  tokenized_property_id: string
  distribution_date: string
  total_revenue: number
  revenue_per_token: number
  distribution_type: string
  source_description: string
  blockchain_transaction_hash?: string
  metadata: Record<string, any>
  created_at: string
}

export interface TokenTransaction {
  id: string
  tokenized_property_id: string
  from_holder?: string
  to_holder: string
  token_amount: string
  price_per_token: number
  total_value: number
  transaction_type: 'mint' | 'transfer' | 'burn' | 'split'
  blockchain_hash?: string
  hedera_transaction_id?: string
  status: 'pending' | 'confirmed' | 'failed'
  metadata: Record<string, any>
  created_at: string
}

export interface PropertyValuation {
  id: string
  land_title_id: string
  property_id?: string
  valuer_id: string
  valuation_date: string
  valuation_amount: number
  valuation_currency: string
  valuation_method: string
  market_conditions: Record<string, any>
  comparable_properties: any[]
  report_url?: string
  valid_until: string
  created_at: string
  updated_at: string
}
