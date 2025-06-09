
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FinancialReport {
  id: string;
  user_id: string;
  report_type: string;
  period_start: string;
  period_end: string;
  data: any;
  status: string;
  generated_at: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export function useFinancialReports() {
  const { user } = useAuth();
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('financial_reports')
        .select('*')
        .eq('user_id', user?.id)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      console.error('Error fetching financial reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch reports');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (
    reportType: string,
    periodStart: string,
    periodEnd: string
  ) => {
    try {
      setIsLoading(true);

      // Create a new financial report
      const { data, error } = await supabase
        .from('financial_reports')
        .insert({
          user_id: user?.id,
          report_type: reportType,
          period_start: periodStart,
          period_end: periodEnd,
          status: 'generated',
          data: {
            summary: 'Financial report generated successfully',
            period: `${periodStart} to ${periodEnd}`,
            type: reportType
          }
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Report Generated',
        description: 'Your financial report has been generated successfully.',
      });

      await fetchReports();
      return data;
    } catch (err) {
      console.error('Error generating report:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reports,
    isLoading,
    error,
    generateReport,
    refetch: fetchReports
  };
}
