
'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { VerifyOTPForm } from '@/components/auth/VerifyOTPForm';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';
import { Dashboard } from '@/components/dashboard/Dashboard';

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'verify-otp' | 'change-password';

const Index = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [resetEmail, setResetEmail] = useState('');
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md">
          {authMode === 'login' && (
            <LoginForm
              onToggleMode={() => setAuthMode('signup')}
              onForgotPassword={() => setAuthMode('forgot-password')}
            />
          )}
          
          {authMode === 'signup' && (
            <SignUpForm
              onToggleMode={() => setAuthMode('login')}
            />
          )}
          
          {authMode === 'forgot-password' && (
            <ForgotPasswordForm
              onBack={() => setAuthMode('login')}
              onSuccess={(email) => {
                setResetEmail(email);
                setAuthMode('verify-otp');
              }}
            />
          )}
          
          {authMode === 'verify-otp' && (
            <VerifyOTPForm
              email={resetEmail}
              onBack={() => setAuthMode('login')}
              onSuccess={() => setAuthMode('change-password')}
            />
          )}
          
          {authMode === 'change-password' && (
            <ChangePasswordForm
              onSuccess={() => setAuthMode('login')}
            />
          )}
        </div>
      </div>
    );
  }

  // When user is authenticated, just return the Dashboard
  // The Layout wrapper is already handled in App.tsx
  return <Dashboard />;
};

export default Index;
