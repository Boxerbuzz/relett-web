import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TransactionStatus {
  id: string;
  hedera_transaction_id?: string | null;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'token_purchase' | 'token_transfer' | 'dividend_payment' | 'property_tokenization';
  amount?: number;
  tokenized_property_id?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  confirmations?: number;
  error_message?: string;
  retry_count?: number;
}

export interface PortfolioBalance {
  tokenized_property_id: string;
  property_name: string;
  tokens_owned: string;
  current_value: number;
  last_updated: string;
}

export function useRealtimeTransactionMonitoring(userId?: string) {
  const [transactions, setTransactions] = useState<TransactionStatus[]>([]);
  const [portfolioBalances, setPortfolioBalances] = useState<PortfolioBalance[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [retryQueue, setRetryQueue] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Fetch initial transaction data
  const fetchTransactions = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('token_transactions')
        .select('*')
        .eq('from_holder', userId)
        .or(`to_holder.eq.${userId}`)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      const formattedTransactions: TransactionStatus[] = data.map(tx => ({
        id: tx.id,
        hedera_transaction_id: tx.hedera_transaction_id,
        status: tx.status as 'pending' | 'confirmed' | 'failed',
        type: 'token_transfer',
        amount: tx.total_value,
        tokenized_property_id: tx.tokenized_property_id,
        user_id: userId,
        created_at: tx.created_at,
        updated_at: tx.created_at, // Use created_at as fallback since updated_at doesn't exist
        error_message: typeof tx.metadata === 'object' && tx.metadata && 'error_message' in tx.metadata 
          ? tx.metadata.error_message as string 
          : undefined
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  }, [userId]);

  // Fetch portfolio balances
  const fetchPortfolioBalances = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('token_holdings')
        .select(`
          *,
          tokenized_properties!token_holdings_tokenized_property_id_fkey(
            id,
            token_name,
            properties!properties_tokenized_property_id_fkey(title)
          )
        `)
        .eq('holder_id', userId);

      if (error) throw error;

      const balances: PortfolioBalance[] = data.map(holding => ({
        tokenized_property_id: holding.tokenized_property_id,
        property_name: 'Property Token', // Simplified for now due to complex nested types
        tokens_owned: holding.tokens_owned,
        current_value: holding.total_investment || 0,
        last_updated: holding.updated_at
      }));

      setPortfolioBalances(balances);
    } catch (error) {
      console.error('Error fetching portfolio balances:', error);
    }
  }, [userId]);

  // Check transaction status on Hedera
  const checkTransactionStatus = useCallback(async (transactionId: string, hederaTxId?: string) => {
    if (!hederaTxId) return;

    try {
      // In a real implementation, this would call Hedera API
      // For now, we'll simulate status checking
      const response = await fetch(`https://testnet.mirrornode.hedera.com/api/v1/transactions/${hederaTxId}`);
      
      if (response.ok) {
        const data = await response.json();
        const isConfirmed = data.transactions?.[0]?.result === 'SUCCESS';
        
        // Update transaction status in database
        const { error } = await supabase
          .from('token_transactions')
          .update({ 
            status: isConfirmed ? 'confirmed' : 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('id', transactionId);

        if (!error) {
          setTransactions(prev => 
            prev.map(tx => 
              tx.id === transactionId 
                ? { ...tx, status: isConfirmed ? 'confirmed' : 'failed' }
                : tx
            )
          );

          if (isConfirmed) {
            toast({
              title: 'Transaction Confirmed',
              description: 'Your blockchain transaction has been confirmed.',
            });
            // Refresh portfolio balances
            fetchPortfolioBalances();
          }
        }
      }
    } catch (error) {
      console.error('Error checking transaction status:', error);
    }
  }, [toast, fetchPortfolioBalances]);

  // Retry failed transactions
  const retryTransaction = useCallback(async (transactionId: string) => {
    setRetryQueue(prev => new Set(prev).add(transactionId));
    
    try {
      // Get transaction details
      const transaction = transactions.find(tx => tx.id === transactionId);
      if (!transaction) return;

      // Increment retry count
      const { error } = await supabase
        .from('token_transactions')
        .update({ 
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId);

      if (!error) {
        setTransactions(prev => 
          prev.map(tx => 
            tx.id === transactionId 
              ? { ...tx, status: 'pending', retry_count: (tx.retry_count || 0) + 1 }
              : tx
          )
        );

        toast({
          title: 'Transaction Retry',
          description: 'Retrying your transaction...',
        });
      }
    } catch (error) {
      console.error('Error retrying transaction:', error);
      toast({
        title: 'Retry Failed',
        description: 'Could not retry transaction. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setRetryQueue(prev => {
        const newQueue = new Set(prev);
        newQueue.delete(transactionId);
        return newQueue;
      });
    }
  }, [transactions, toast]);

  // Start real-time monitoring
  const startMonitoring = useCallback(() => {
    if (!userId || isMonitoring) return;

    setIsMonitoring(true);

    // Subscribe to real-time updates for token transactions
    const channel = supabase
      .channel('transaction-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'token_transactions',
          filter: `from_holder=eq.${userId},to_holder=eq.${userId}`
        },
        (payload) => {
          console.log('Transaction update:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newTransaction: TransactionStatus = {
              id: payload.new.id,
              hedera_transaction_id: payload.new.hedera_transaction_id,
              status: payload.new.status,
              type: 'token_transfer',
              amount: payload.new.total_value,
              tokenized_property_id: payload.new.tokenized_property_id,
              user_id: userId,
              created_at: payload.new.created_at,
              updated_at: payload.new.updated_at
            };
            
            setTransactions(prev => [newTransaction, ...prev]);
            
            toast({
              title: 'New Transaction',
              description: 'A new transaction has been initiated.',
            });
          } else if (payload.eventType === 'UPDATE') {
            setTransactions(prev => 
              prev.map(tx => 
                tx.id === payload.new.id 
                  ? { ...tx, status: payload.new.status, updated_at: payload.new.updated_at }
                  : tx
              )
            );
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'token_holdings',
          filter: `holder_id=eq.${userId}`
        },
        () => {
          // Refresh portfolio balances when holdings change
          fetchPortfolioBalances();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      setIsMonitoring(false);
    };
  }, [userId, isMonitoring, toast, fetchPortfolioBalances]);

  // Stop monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Check pending transactions periodically
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      transactions
        .filter(tx => tx.status === 'pending' && tx.hedera_transaction_id)
        .forEach(tx => checkTransactionStatus(tx.id, tx.hedera_transaction_id || undefined));
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [isMonitoring, transactions, checkTransactionStatus]);

  // Initial data fetch
  useEffect(() => {
    if (userId) {
      fetchTransactions();
      fetchPortfolioBalances();
    }
  }, [userId, fetchTransactions, fetchPortfolioBalances]);

  return {
    transactions,
    portfolioBalances,
    isMonitoring,
    retryQueue,
    startMonitoring,
    stopMonitoring,
    retryTransaction,
    checkTransactionStatus,
    refreshData: () => {
      fetchTransactions();
      fetchPortfolioBalances();
    }
  };
}