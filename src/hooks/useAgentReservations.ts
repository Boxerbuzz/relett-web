
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export function useAgentReservations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reservations, isLoading, error } = useQuery({
    queryKey: ['agent-reservations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('reservations')
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

  const updateReservationMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('reservations')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-reservations'] });
      toast({
        title: 'Success',
        description: 'Reservation updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update reservation',
        variant: 'destructive',
      });
      console.error('Error updating reservation:', error);
    },
  });

  return {
    reservations: reservations || [],
    isLoading,
    error,
    updateReservation: updateReservationMutation.mutate,
    isUpdating: updateReservationMutation.isPending,
  };
}
