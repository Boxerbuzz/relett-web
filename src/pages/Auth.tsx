
'use client';

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { VerifyOTPForm } from '@/components/auth/VerifyOTPForm';
import { ChangePasswordForm } from '@/components/auth/ChangePasswordForm';

type AuthMode = 'login' | 'signup' | 'forgot-password' | 'verify-otp' | 'change-password';

const Auth = () => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [resetEmail, setResetEmail] = useState('');
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for password recovery flow
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    
    if (type === 'recovery') {
      setAuthMode('change-password');
    }
  }, []);

  useEffect(() => {
    // Redirect authenticated users
    if (user && !loading) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  // Only show loading spinner if we're still checking auth state AND user is not set
  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 md:bg-gray-50 px-4">
      {/* Mobile: Full screen flat design, Desktop: Card design */}
      <div className="w-full max-w-md bg-white md:shadow-lg md:rounded-lg md:border">
        <div className="p-6 md:p-8">
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
                setAuthMode('login'); // Go back to login after sending reset email
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
    </div>
  );
};

export default Auth;
