import { useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { useSentryMonitoring } from './useSentryMonitoring';
import { SecurityValidator } from '@/lib/security/SecurityValidator';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  transactionId?: string;
  propertyId?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  userFacing?: boolean;
  retryable?: boolean;
}

export function useEnhancedErrorHandler() {
  const { captureError, setContext, addBreadcrumb } = useSentryMonitoring();

  const handleError = useCallback((error: any, context: ErrorContext = {}) => {
    const {
      component = 'Unknown',
      action = 'Unknown',
      userId,
      transactionId,
      propertyId,
      severity = 'medium',
      userFacing = true,
      retryable = true
    } = context;

    // Create audit entry for security purposes
    if (userId) {
      const auditEntry = SecurityValidator.createAuditEntry(
        userId,
        `error_${action}`,
        propertyId || transactionId || 'unknown',
        {
          errorMessage: error.message,
          component,
          severity,
          stack: error.stack
        }
      );
      console.error('Error audit entry:', auditEntry);
    }

    // Add breadcrumb for error tracking
    addBreadcrumb(
      `Error in ${component}: ${action}`,
      'error',
      {
        component,
        action,
        severity,
        retryable,
        transactionId,
        propertyId
      }
    );

    // Set context for monitoring
    setContext('error_context', {
      component,
      action,
      severity,
      userFacing,
      retryable,
      timestamp: new Date().toISOString()
    });

    // Capture error with enhanced context
    captureError(error, context);

    // Show user-friendly message if needed
    if (userFacing) {
      const message = getErrorMessage(error, context);
      const title = getErrorTitle(severity, component);
      
      toast({
        title,
        description: message,
        variant: severity === 'critical' ? 'destructive' : 'default'
      });
    }

    // Log critical errors to console for immediate attention
    if (severity === 'critical') {
      console.error('CRITICAL ERROR:', {
        error: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString()
      });
    }
  }, [captureError, setContext, addBreadcrumb]);

  const handleTradingError = useCallback((error: any, transactionData?: any) => {
    handleError(error, {
      component: 'Trading',
      action: 'transaction',
      transactionId: transactionData?.transactionId,
      propertyId: transactionData?.tokenizedPropertyId,
      severity: 'high',
      userFacing: true,
      retryable: true
    });
  }, [handleError]);

  const handleGovernanceError = useCallback((error: any, pollId?: string) => {
    handleError(error, {
      component: 'Governance',
      action: 'voting',
      propertyId: pollId,
      severity: 'medium',
      userFacing: true,
      retryable: true
    });
  }, [handleError]);

  const handleWalletError = useCallback((error: any, accountId?: string) => {
    handleError(error, {
      component: 'Wallet',
      action: 'connection',
      severity: 'high',
      userFacing: true,
      retryable: true
    });
  }, [handleError]);

  const handleAnalyticsError = useCallback((error: any, dataType?: string) => {
    handleError(error, {
      component: 'Analytics',
      action: `load_${dataType || 'data'}`,
      severity: 'low',
      userFacing: false,
      retryable: true
    });
  }, [handleError]);

  const handleSecurityError = useCallback((error: any, securityContext?: any) => {
    handleError(error, {
      component: 'Security',
      action: 'validation',
      severity: 'critical',
      userFacing: true,
      retryable: false
    });
  }, [handleError]);

  return {
    handleError,
    handleTradingError,
    handleGovernanceError,
    handleWalletError,
    handleAnalyticsError,
    handleSecurityError
  };
}

function getErrorMessage(error: any, context: ErrorContext): string {
  const { component, action, severity } = context;

  // Security-related errors
  if (component === 'Security') {
    return 'A security validation failed. Please check your input and try again.';
  }

  // Trading-specific errors
  if (component === 'Trading') {
    if (error.message?.includes('insufficient')) {
      return 'Insufficient balance for this transaction.';
    }
    if (error.message?.includes('rate limit')) {
      return 'Too many requests. Please wait a moment and try again.';
    }
    return 'Trading operation failed. Please check your input and try again.';
  }

  // Governance-specific errors
  if (component === 'Governance') {
    if (error.message?.includes('already voted')) {
      return 'You have already voted in this poll.';
    }
    if (error.message?.includes('poll closed')) {
      return 'This poll has already closed.';
    }
    return 'Governance operation failed. Please try again.';
  }

  // Wallet-specific errors
  if (component === 'Wallet') {
    if (error.message?.includes('not connected')) {
      return 'Wallet is not connected. Please connect your wallet and try again.';
    }
    if (error.message?.includes('rejected')) {
      return 'Transaction was rejected by your wallet.';
    }
    return 'Wallet operation failed. Please check your wallet connection.';
  }

  // Generic error based on severity
  switch (severity) {
    case 'critical':
      return 'A critical error occurred. Our team has been notified.';
    case 'high':
      return 'An important operation failed. Please try again or contact support.';
    case 'medium':
      return 'Something went wrong. Please try again.';
    case 'low':
      return 'A minor issue occurred. You can continue using the application.';
    default:
      return error?.message || 'An unexpected error occurred.';
  }
}

function getErrorTitle(severity: string, component: string): string {
  switch (severity) {
    case 'critical':
      return 'Critical Error';
    case 'high':
      return `${component} Error`;
    case 'medium':
      return 'Error';
    case 'low':
      return 'Minor Issue';
    default:
      return 'Something went wrong';
  }
}