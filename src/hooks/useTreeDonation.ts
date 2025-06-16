
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { paystackService } from '@/lib/paystack';
import { useToast } from '@/hooks/use-toast';

export interface Tree {
  id: string;
  name: string;
  scientific_name?: string;
  description?: string;
  image_url: string;
  location: string;
  country: string;
  price_ngn: number;
  carbon_offset_kg: number;
  growth_time_years: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface TreeDonation {
  id: string;
  user_id: string;
  tree_id: string;
  quantity: number;
  total_amount_ngn: number;
  payment_reference?: string;
  payment_status: string;
  payment_provider: string;
  planted_at?: string;
  certificate_url?: string;
  metadata: any; // Changed from Record<string, any> to any to match Supabase Json type
  created_at: string;
  updated_at: string;
}

export function useTreeDonation() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [donations, setDonations] = useState<TreeDonation[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch available trees
  const fetchTrees = async () => {
    try {
      const { data, error } = await supabase
        .from('trees')
        .select('*')
        .eq('is_available', true)
        .order('price_ngn', { ascending: true });

      if (error) throw error;
      setTrees(data || []);
    } catch (error) {
      console.error('Error fetching trees:', error);
      toast({
        title: 'Error',
        description: 'Failed to load available trees',
        variant: 'destructive',
      });
    }
  };

  // Fetch user's donations
  const fetchUserDonations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tree_donations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Type assertion to handle the Json to any conversion
      setDonations((data as any[]) || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  // Create donation and initiate payment
  const createDonation = async (treeId: string, quantity: number) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to make a donation',
        variant: 'destructive',
      });
      return;
    }

    const tree = trees.find(t => t.id === treeId);
    if (!tree) {
      toast({
        title: 'Error',
        description: 'Selected tree not found',
        variant: 'destructive',
      });
      return;
    }

    const totalAmount = tree.price_ngn * quantity;
    const reference = `tree_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    setLoading(true);

    try {
      // Create donation record
      const { data: donation, error: donationError } = await supabase
        .from('tree_donations')
        .insert({
          user_id: user.id,
          tree_id: treeId,
          quantity,
          total_amount_ngn: totalAmount,
          payment_reference: reference,
          payment_status: 'pending',
        })
        .select()
        .single();

      if (donationError) throw donationError;

      // Initialize Paystack payment
      await paystackService.initializePayment({
        amount: totalAmount / 100, // Convert from kobo to naira
        email: user.email,
        reference,
        metadata: {
          donation_id: donation.id,
          tree_name: tree.name,
          quantity,
          purpose: 'tree_donation',
        },
        onSuccess: async (transaction) => {
          // Update donation status
          await supabase
            .from('tree_donations')
            .update({ 
              payment_status: 'completed',
              metadata: { transaction }
            })
            .eq('id', donation.id);

          toast({
            title: 'Donation Successful!',
            description: `Thank you for donating ${quantity} ${tree.name}${quantity > 1 ? 's' : ''}!`,
          });

          // Refresh donations list
          fetchUserDonations();
        },
        onCancel: () => {
          toast({
            title: 'Payment Cancelled',
            description: 'Your donation was not completed',
            variant: 'destructive',
          });
        },
        onError: (error) => {
          console.error('Payment error:', error);
          toast({
            title: 'Payment Failed',
            description: 'There was an error processing your payment',
            variant: 'destructive',
          });
        },
      });

    } catch (error) {
      console.error('Error creating donation:', error);
      toast({
        title: 'Error',
        description: 'Failed to process donation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrees();
    if (user) {
      fetchUserDonations();
    }
  }, [user]);

  return {
    trees,
    donations,
    loading,
    createDonation,
    fetchTrees,
    fetchUserDonations,
  };
}
