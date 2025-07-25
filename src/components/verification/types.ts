export interface VerificationTask {
  id: string;
  property_id: string;
  verifier_id: string | null;
  task_type: string;
  status: string;
  priority: string;
  assigned_at: string | null;
  completed_at: string | null;
  deadline: string | null;
  verification_checklist: any;
  verifier_notes: string | null;
  decision: string | null;
  decision_reason: string | null;
  created_at: string;
  updated_at: string;
  properties: {
    id: string;
    title: string | null;
    type: string;
    location: {
      address: string;
      city: string;
      state: string;
      country: string;
      postal_code: string;
    };
    user_id: string;
    price?: {
      amount: number;
      currency: string;
    };
    users?: {
      first_name: string;
      last_name: string;
      email: string;
      avatar: string;
    };
  };
  user?: {
    first_name: string;
    last_name: string;
    email: string;
    avatar: string;
  };
}
