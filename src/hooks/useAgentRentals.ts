
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export function useAgentRentals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rentals, isLoading, error } = useQuery({
    queryKey: ['agent-rentals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('rentals')
        .select(`
          *,
          property:properties(*),
          user:users(*)
        `)
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const updateRentalMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('rentals')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-rentals'] });
      toast({
        title: 'Success',
        description: 'Rental updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update rental',
        variant: 'destructive',
      });
      console.error('Error updating rental:', error);
    },
  });

  return {
    rentals: rentals || [],
    isLoading,
    error,
    updateRental: updateRentalMutation.mutate,
    isUpdating: updateRentalMutation.isPending,
  };
}
