import { useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import { useSentryMonitoring } from './useSentryMonitoring';
import { SecurityValidator } from '@/lib/security/SecurityValidator';
import { supabase } from '@/integrations/supabase/client';

interface TransactionLogData {
  transactionId?: string;
  tokenizedPropertyId?: string;
  action: string;
  amount?: number;
  status: 'initiated' | 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata?: any;
}

interface UserActionLogData {
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: any;
}

export function useTransactionLogger() {
  const { user } = useAuth();
  const { addBreadcrumb, setContext, trackUserAction } = useSentryMonitoring();

  const logTransaction = useCallback(async (data: TransactionLogData) => {
    if (!user) return;

    try {
      // Create audit entry
      const auditEntry = SecurityValidator.createAuditEntry(
        user.id,
        data.action,
        data.tokenizedPropertyId || data.transactionId || 'unknown',
        {
          ...data.metadata,
          amount: data.amount,
          status: data.status
        }
      );

      // Log to database
      await supabase.from('audit_trails').insert({
        user_id: user.id,
        resource_type: 'transaction',
        resource_id: data.transactionId || data.tokenizedPropertyId,
        action: data.action,
        new_values: {
          ...auditEntry.details,
          transactionId: data.transactionId,
          status: data.status
        }
      });

      // Add monitoring breadcrumb
      addBreadcrumb(
        `Transaction ${data.action}: ${data.status}`,
        'transaction',
        {
          transactionId: data.transactionId,
          tokenizedPropertyId: data.tokenizedPropertyId,
          amount: data.amount,
          status: data.status
        }
      );

      // Set context for error tracking
      setContext('transaction_context', {
        transactionId: data.transactionId,
        action: data.action,
        status: data.status,
        timestamp: new Date().toISOString()
      });

      console.log('Transaction logged:', auditEntry);
    } catch (error) {
      console.error('Failed to log transaction:', error);
    }
  }, [user, addBreadcrumb, setContext]);

  const logUserAction = useCallback(async (data: UserActionLogData) => {
    if (!user) return;

    try {
      // Create audit entry
      const auditEntry = SecurityValidator.createAuditEntry(
        user.id,
        data.action,
        data.resourceId || 'unknown',
        data.metadata
      );

      // Log to database
      await supabase.from('audit_trails').insert({
        user_id: user.id,
        resource_type: data.resource,
        resource_id: data.resourceId,
        action: data.action,
        new_values: data.metadata
      });

      // Track in monitoring
      trackUserAction(data.action, {
        resource: data.resource,
        resourceId: data.resourceId,
        ...data.metadata
      });

      console.log('User action logged:', auditEntry);
    } catch (error) {
      console.error('Failed to log user action:', error);
    }
  }, [user, trackUserAction]);

  const logSecurityEvent = useCallback(async (event: string, details: any) => {
    if (!user) return;

    try {
      const auditEntry = SecurityValidator.createAuditEntry(
        user.id,
        `security_${event}`,
        'security',
        details
      );

      // Log security events with high priority
      await supabase.from('audit_trails').insert({
        user_id: user.id,
        resource_type: 'security',
        resource_id: 'security_event',
        action: `security_${event}`,
        new_values: auditEntry.details
      });

      // Add security breadcrumb
      addBreadcrumb(
        `Security Event: ${event}`,
        'security',
        details
      );

      console.warn('Security event logged:', auditEntry);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }, [user, addBreadcrumb]);

  const logPerformanceMetric = useCallback((metric: string, value: number, context?: any) => {
    if (!user) return;

    try {
      // Track performance metrics
      addBreadcrumb(
        `Performance: ${metric}`,
        'performance',
        {
          metric,
          value,
          unit: 'ms',
          ...context
        }
      );

      // Log significant performance issues
      if (value > 5000) { // Over 5 seconds
        console.warn(`Slow performance detected: ${metric} took ${value}ms`, context);
      }
    } catch (error) {
      console.error('Failed to log performance metric:', error);
    }
  }, [user, addBreadcrumb]);

  return {
    logTransaction,
    logUserAction,
    logSecurityEvent,
    logPerformanceMetric
  };
}