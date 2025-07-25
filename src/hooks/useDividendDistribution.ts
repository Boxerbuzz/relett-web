import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DividendDistribution {
  id: string;
  tokenized_property_id: string;
  total_revenue: number;
  distribution_date: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  payments: DividendPayment[];
}

export interface DividendPayment {
  id: string;
  recipient_id: string;
  amount: number;
  tax_withholding: number;
  net_amount: number;
  status: 'pending' | 'paid' | 'failed';
  paid_at?: string;
}

export function useDividendDistribution() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const distributeDividends = async (
    tokenizedPropertyId: string,
    totalRevenue: number
  ) => {
    setLoading(true);
    setError(null);

    try {
      // Get all token holders for this property
      const { data: tokenHolders, error: holdersError } = await supabase
        .from('token_holdings')
        .select('*')
        .eq('tokenized_property_id', tokenizedPropertyId);

      if (holdersError) throw holdersError;

      if (!tokenHolders || tokenHolders.length === 0) {
        throw new Error('No token holders found for this property');
      }

      // Get tokenized property details to calculate total tokens
      const { data: property, error: propertyError } = await supabase
        .from('tokenized_properties')
        .select('total_supply')
        .eq('id', tokenizedPropertyId)
        .single();

      if (propertyError) throw propertyError;

      // Create revenue distribution record
      const { data: distribution, error: distributionError } = await supabase
        .from('revenue_distributions')
        .insert({
          tokenized_property_id: tokenizedPropertyId,
          total_revenue: totalRevenue,
          distribution_date: new Date().toISOString(),
          status: 'processing'
        })
        .select()
        .single();

      if (distributionError) throw distributionError;

      // Calculate dividends for each token holder
      const dividendPayments = tokenHolders.map(holder => {
        const tokenPercentage = holder.tokens_owned / property.total_supply;
        const grossAmount = totalRevenue * tokenPercentage;
        const taxWithholding = grossAmount * 0.1; // 10% withholding tax
        const netAmount = grossAmount - taxWithholding;

        return {
          revenue_distribution_id: distribution.id,
          recipient_id: holder.holder_id,
          token_holding_id: holder.id,
          amount: grossAmount,
          tax_withholding: taxWithholding,
          net_amount: netAmount,
          currency: 'NGN',
          status: 'pending' as const
        };
      });

      // Insert dividend payments
      const { error: paymentsError } = await supabase
        .from('dividend_payments')
        .insert(dividendPayments);

      if (paymentsError) throw paymentsError;

      // Process actual payments through payment provider
      const paymentPromises = dividendPayments.map(async (payment) => {
        try {
          // Use transfer API (Paystack, bank transfer, etc.)
          const transferResult = await processDividendTransfer(
            payment.recipient_id,
            payment.net_amount
          );

          if (transferResult.success) {
            // Update payment status to paid
            await supabase
              .from('dividend_payments')
              .update({
                status: 'paid',
                paid_at: new Date().toISOString(),
                external_transaction_id: transferResult.transactionId
              })
              .eq('revenue_distribution_id', distribution.id)
              .eq('recipient_id', payment.recipient_id);
          } else {
            // Mark as failed
            await supabase
              .from('dividend_payments')
              .update({ status: 'failed' })
              .eq('revenue_distribution_id', distribution.id)
              .eq('recipient_id', payment.recipient_id);
          }

          return transferResult;
        } catch (error) {
          console.error(`Failed to process dividend for user ${payment.recipient_id}:`, error);
          
          await supabase
            .from('dividend_payments')
            .update({ status: 'failed' })
            .eq('revenue_distribution_id', distribution.id)
            .eq('recipient_id', payment.recipient_id);

          return { success: false, error: error.message };
        }
      });

      const results = await Promise.all(paymentPromises);
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      // Update distribution status
      const finalStatus = failureCount === 0 ? 'completed' : 
        successCount === 0 ? 'failed' : 'completed'; // Partial success is still completed

      await supabase
        .from('revenue_distributions')
        .update({ status: finalStatus })
        .eq('id', distribution.id);

      toast({
        title: 'Dividend Distribution Complete',
        description: `Successfully processed ${successCount} payments. ${failureCount} failed.`,
        variant: successCount > 0 ? 'default' : 'destructive'
      });

      return {
        distributionId: distribution.id,
        successCount,
        failureCount,
        totalPayments: results.length
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to distribute dividends';
      setError(errorMessage);
      toast({
        title: 'Distribution Failed',
        description: errorMessage,
        variant: 'destructive'
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDividendHistory = async (tokenizedPropertyId: string) => {
    try {
      const { data, error } = await supabase
        .from('revenue_distributions')
        .select(`
          *,
          dividend_payments(*)
        `)
        .eq('tokenized_property_id', tokenizedPropertyId)
        .order('distribution_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching dividend history:', err);
      throw err;
    }
  };

  return {
    distributeDividends,
    getDividendHistory,
    loading,
    error
  };
}

// Helper function to process actual dividend transfers
async function processDividendTransfer(
  recipientId: string,
  amount: number
): Promise<{ success: boolean; transactionId?: string; error?: string }> {
  try {
    // Get recipient's bank details or payment method
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('bank_details')
      .eq('id', recipientId)
      .single();

    if (userError || !user?.bank_details) {
      return { 
        success: false, 
        error: 'Recipient bank details not found' 
      };
    }

    // Use Paystack Transfer API or similar
    const transferResult = await supabase.functions.invoke('process-dividend-transfer', {
      body: {
        recipientId,
        amount,
        bankDetails: user.bank_details
      }
    });

    if (transferResult.error) {
      return { 
        success: false, 
        error: transferResult.error.message 
      };
    }

    return {
      success: true,
      transactionId: transferResult.data?.reference
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Transfer failed'
    };
  }
}