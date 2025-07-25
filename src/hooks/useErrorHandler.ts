import { toast } from '@/hooks/use-toast';
import { useSentryMonitoring } from './useSentryMonitoring';
import { useEnhancedErrorHandler } from './useEnhancedErrorHandler';
import { SecurityValidator } from '@/lib/security/SecurityValidator';

export function useErrorHandler() {
  const { captureError } = useSentryMonitoring();

  const handleError = (error: any, context?: string) => {
    // Log to monitoring
    captureError(error, { context });

    // Show user-friendly message
    const message = getErrorMessage(error);
    toast({
      title: "Something went wrong",
      description: message,
      variant: "destructive"
    });
  };

  const handleAuthError = (error: any) => {
    const authMessages: Record<string, string> = {
      'invalid_credentials': 'Invalid email or password',
      'email_not_confirmed': 'Please verify your email before signing in',
      'user_not_found': 'No account found with this email',
      'weak_password': 'Password must be at least 6 characters',
      'email_address_invalid': 'Please enter a valid email address',
      'signup_disabled': 'Account registration is currently disabled',
      'invalid_verification_code': 'Invalid verification code',
      'verification_code_expired': 'Verification code has expired'
    };

    const message = authMessages[error.message] || error.message || 'Authentication failed';
    
    toast({
      title: "Authentication Error",
      description: message,
      variant: "destructive"
    });

    captureError(error, { context: 'authentication' });
  };

  const handlePaymentError = (error: any) => {
    const paymentMessages: Record<string, string> = {
      'insufficient_funds': 'Insufficient funds in your account',
      'payment_declined': 'Payment was declined by your bank',
      'invalid_card': 'Invalid card details',
      'expired_card': 'Your card has expired',
      'network_error': 'Network error. Please try again'
    };

    const message = paymentMessages[error.message] || 'Payment processing failed';
    
    toast({
      title: "Payment Error",
      description: message,
      variant: "destructive"
    });

    captureError(error, { context: 'payment' });
  };

  const handleNetworkError = (error: any) => {
    toast({
      title: "Connection Error",
      description: "Please check your internet connection and try again",
      variant: "destructive"
    });

    captureError(error, { context: 'network' });
  };

  const handleDataError = (error: any, operation: string) => {
    const message = `Failed to ${operation}. Please try again.`;
    
    toast({
      title: "Data Error",
      description: message,
      variant: "destructive"
    });

    captureError(error, { context: 'data', operation });
  };

  return {
    handleError,
    handleAuthError,
    handlePaymentError,
    handleNetworkError,
    handleDataError
  };
}

function getErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.error_description) return error.error_description;
  return 'An unexpected error occurred';
}