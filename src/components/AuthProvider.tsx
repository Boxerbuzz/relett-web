
'use client';

import { useState, useEffect, ReactNode } from 'react';
import { AuthContext } from '@/lib/auth';
import { User } from '@/types';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate auth check - replace with Supabase integration
    const checkAuth = async () => {
      setLoading(false);
    };
    checkAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Simple check - if email and password are provided, log in
    if (email && password) {
      const mockUser: User = {
        id: '1',
        email,
        role: 'landowner',
        name: 'John Doe',
        created_at: new Date().toISOString(),
      };
      setUser(mockUser);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'landowner' | 'verifier' | 'agent') => {
    // Simulate sign up - replace with Supabase
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      role,
      name,
      created_at: new Date().toISOString(),
    };
    setUser(mockUser);
  };

  const signOut = async () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
