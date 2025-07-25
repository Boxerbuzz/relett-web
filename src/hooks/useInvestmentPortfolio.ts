
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { InvestmentService, type InvestmentPortfolio } from '@/lib/investment';
import { useToast } from '@/hooks/use-toast';

export function useInvestmentPortfolio() {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState<InvestmentPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const investmentService = new InvestmentService();

  useEffect(() => {
    if (user) {
      fetchPortfolio();
    } else {
      setLoading(false);
    }

    return () => {
      investmentService.close();
    };
  }, [user]);

  const fetchPortfolio = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      const portfolioData = await investmentService.getInvestorPortfolio(user.id);
      setPortfolio(portfolioData);
    } catch (err) {
      console.error('Error fetching investment portfolio:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch portfolio';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchPortfolio();
  };

  return {
    portfolio,
    loading,
    error,
    refetch
  };
}
