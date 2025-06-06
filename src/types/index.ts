
export interface User {
  id: string;
  email: string;
  role: 'landowner' | 'verifier' | 'agent' | 'admin' | 'investor';
  created_at: string;
  email_confirmed_at?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  user_type?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role: 'landowner' | 'verifier' | 'agent') => Promise<void>;
  signOut: () => Promise<void>;
}
