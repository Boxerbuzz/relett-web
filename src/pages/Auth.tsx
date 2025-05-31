
'use client';

import { useState } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { VerifyOTPForm } from '@/components/auth/VerifyOTPForm';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'verify-otp' | 'change-password';

const Auth = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [resetEmail, setResetEmail] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 md:bg-gray-50 px-4">
      {/* Mobile: Full screen flat design, Desktop: Card design */}
      <div className="w-full max-w-md bg-white md:shadow-lg md:rounded-lg md:border">
        <div className="p-6 md:p-8">
          {authMode === 'login' && (
            <LoginForm
              onToggleMode={() => setAuthMode('signup')}
              onForgotPassword={() => setAuthMode('forgot-password')}
              isMobile={true}
            />
          )}
          
          {authMode === 'signup' && (
            <SignUpForm
              onToggleMode={() => setAuthMode('login')}
              isMobile={true}
            />
          )}
          
          {authMode === 'forgot-password' && (
            <ForgotPasswordForm
              onBack={() => setAuthMode('login')}
              onSuccess={(email) => {
                setResetEmail(email);
                setAuthMode('verify-otp');
              }}
              isMobile={true}
            />
          )}
          
          {authMode === 'verify-otp' && (
            <VerifyOTPForm
              email={resetEmail}
              onBack={() => setAuthMode('login')}
              onSuccess={() => setAuthMode('change-password')}
              isMobile={true}
            />
          )}
          
          {authMode === 'change-password' && (
            <ChangePasswordForm
              onSuccess={() => setAuthMode('login')}
              isMobile={true}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
