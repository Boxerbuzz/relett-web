
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { IdentityVerification, IdentityType, VerificationStatus } from '@/types/database';

export function useIdentityVerification() {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<IdentityVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchVerifications();
    } else {
      setVerifications([]);
      setLoading(false);
    }
  }, [user]);

  const fetchVerifications = async () => {
    try {
      const { data, error } = await supabase
        .from('identity_verifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVerifications(data || []);
    } catch (err) {
      console.error('Error fetching verifications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch verifications');
    } finally {
      setLoading(false);
    }
  };

  const createVerification = async (data: {
    identity_type: IdentityType;
    identity_number: string;
    full_name: string;
  }) => {
    try {
      const { data: result, error } = await supabase
        .from('identity_verifications')
        .insert({
          user_id: user?.id,
          ...data
        })
        .select()
        .single();

      if (error) throw error;
      setVerifications(prev => [result, ...prev]);
      return { data: result, error: null };
    } catch (err) {
      console.error('Error creating verification:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create verification';
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }
  };

  const getVerificationByType = (type: IdentityType): IdentityVerification | null => {
    return verifications.find(v => v.identity_type === type) || null;
  };

  const getVerificationStatus = (type: IdentityType): VerificationStatus => {
    const verification = getVerificationByType(type);
    return verification?.verification_status || 'unverified';
  };

  const isVerified = (type?: IdentityType): boolean => {
    if (type) {
      return getVerificationStatus(type) === 'verified';
    }
    return verifications.some(v => v.verification_status === 'verified');
  };

  const hasAnyVerification = (): boolean => {
    return verifications.length > 0;
  };

  return {
    verifications,
    loading,
    error,
    createVerification,
    getVerificationByType,
    getVerificationStatus,
    isVerified,
    hasAnyVerification,
    refetch: fetchVerifications
  };
}
