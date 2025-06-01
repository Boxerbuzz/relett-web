
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { FinancialReport } from '@/types/preferences';

export function useFinancialReports() {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('financial_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching financial reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load financial reports.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async (reportType: string, periodStart: string, periodEnd: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // In a real app, this would trigger a background job to generate the report
      const reportData = {
        summary: 'Investment performance report generated',
        period: `${periodStart} to ${periodEnd}`,
        // Add more report data based on reportType
      };

      const { data, error } = await supabase
        .from('financial_reports')
        .insert({
          user_id: user.id,
          report_type: reportType,
          period_start: periodStart,
          period_end: periodEnd,
          data: reportData,
          status: 'generated'
        })
        .select()
        .single();

      if (error) throw error;

      setReports(prev => [data, ...prev]);
      toast({
        title: 'Report Generated',
        description: 'Your financial report has been generated successfully.',
      });

      return data;
    } catch (error) {
      console.error('Error generating financial report:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate financial report.',
        variant: 'destructive'
      });
    }
  };

  return {
    reports,
    generateReport,
    isLoading,
    refetch: fetchReports
  };
}
