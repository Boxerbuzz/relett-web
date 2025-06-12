
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export function useAgentInspections() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: inspections, isLoading, error } = useQuery({
    queryKey: ['agent-inspections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('inspections')
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

  const updateInspectionMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const { error } = await supabase
        .from('inspections')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-inspections'] });
      toast({
        title: 'Success',
        description: 'Inspection updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update inspection',
        variant: 'destructive',
      });
      console.error('Error updating inspection:', error);
    },
  });

  return {
    inspections: inspections || [],
    isLoading,
    error,
    updateInspection: updateInspectionMutation.mutate,
    isUpdating: updateInspectionMutation.isPending,
  };
}
