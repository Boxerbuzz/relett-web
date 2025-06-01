
// Enhanced database types for Phase 1: Authentication & Identity System

export type AppRole = 'admin' | 'landowner' | 'verifier' | 'agent' | 'investor';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected' | 'expired';
export type IdentityType = 'nin' | 'bvn' | 'cac' | 'passport' | 'drivers_license';
export type VerifierType = 'surveyor' | 'lawyer' | 'estate_agent' | 'government_official' | 'chartered_surveyor';

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other';
  nationality?: string;
  state_of_origin?: string;
  lga?: string; // Local Government Area
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
  avatar_url?: string;
  bio?: string;
  verification_status: VerificationStatus;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  assigned_by?: string;
  assigned_at: string;
  expires_at?: string;
  is_active: boolean;
  metadata: Record<string, any>;
}

export interface IdentityVerification {
  id: string;
  user_id: string;
  identity_type: IdentityType;
  identity_number: string;
  full_name: string;
  verification_status: VerificationStatus;
  verification_provider?: string;
  verification_response?: Record<string, any>;
  verified_at?: string;
  expires_at?: string;
  retry_count: number;
  last_retry_at?: string;
  created_at: string;
  updated_at: string;
}

export interface VerifierCredential {
  id: string;
  user_id: string;
  verifier_type: VerifierType;
  license_number: string;
  issuing_authority: string;
  license_name: string;
  issue_date: string;
  expiry_date: string;
  verification_status: VerificationStatus;
  verified_by?: string;
  verified_at?: string;
  documents: string[];
  reputation_score: number;
  total_verifications: number;
  successful_verifications: number;
  is_active: boolean;
  suspension_reason?: string;
  suspended_until?: string;
  created_at: string;
  updated_at: string;
}

export interface UserDevice {
  id: string;
  user_id: string;
  device_fingerprint: string;
  device_name?: string;
  device_type?: string;
  browser?: string;
  ip_address?: string;
  location?: {
    country?: string;
    state?: string;
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  is_trusted: boolean;
  last_used: string;
  created_at: string;
}

export interface IdentityAuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type?: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  device_fingerprint?: string;
  performed_by?: string;
  created_at: string;
}
