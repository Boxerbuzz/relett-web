
export interface User {
  id: string;
  email: string;
  role: 'landowner' | 'verifier' | 'admin';
  name: string;
  created_at: string;
}

export interface LandRecord {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  area: number;
  area_unit: 'acres' | 'hectares' | 'sqft' | 'sqm';
  documents: Document[];
  status: 'draft' | 'pending_verification' | 'verified' | 'tokenized';
  verification?: Verification;
  token_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  filename: string;
  url: string;
  type: 'deed' | 'survey' | 'certificate' | 'other';
  uploaded_at: string;
}

export interface Verification {
  id: string;
  verifier_id: string;
  verifier_name: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  signature?: string;
  verified_at?: string;
}

export interface LandToken {
  id: string;
  land_record_id: string;
  token_id: string;
  owner_id: string;
  price?: number;
  is_for_sale: boolean;
  metadata: {
    name: string;
    description: string;
    image_url: string;
  };
  created_at: string;
}

export interface MarketplaceListing {
  id: string;
  token_id: string;
  seller_id: string;
  price: number;
  currency: 'HBAR' | 'USD';
  status: 'active' | 'sold' | 'cancelled';
  created_at: string;
}
