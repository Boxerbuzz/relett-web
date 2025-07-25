import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, cacheConfig } from "@/lib/queryClient";

interface VerificationStats {
  totalTasks: number;
  pendingTasks: number;
  assignedTasks: number;
  completedTasks: number;
  averageCompletionTime: number;
}

export function useVerificationStats() {
  const {
    data: stats,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.verification.stats(),
    queryFn: async (): Promise<VerificationStats> => {
      // Fetch verification tasks stats
      const { data: tasksData, error: tasksError } = await supabase
        .from("verification_tasks")
        .select("status, created_at, completed_at");

      if (tasksError) throw tasksError;

      const tasks = tasksData || [];
      const totalTasks = tasks.length;
      const pendingTasks = tasks.filter((t) => t.status === "pending").length;
      const assignedTasks = tasks.filter(
        (t) => t.status === "assigned" || t.status === "in_progress"
      ).length;
      const completedTasks = tasks.filter(
        (t) => t.status === "completed"
      ).length;

      // Calculate average completion time
      const completedTasksWithTimes = tasks.filter(
        (t) => t.status === "completed" && t.completed_at && t.created_at
      );

      let averageCompletionTime = 0;
      if (completedTasksWithTimes.length > 0) {
        const totalTime = completedTasksWithTimes.reduce((sum, task) => {
          const created = new Date(task.created_at).getTime();
          const completed = new Date(task.completed_at!).getTime();
          return sum + (completed - created);
        }, 0);
        averageCompletionTime =
          totalTime / completedTasksWithTimes.length / (1000 * 60 * 60 * 24); // Convert to days
      }

      return {
        totalTasks,
        pendingTasks,
        assignedTasks,
        completedTasks,
        averageCompletionTime,
      };
    },
    ...cacheConfig.standard, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    stats: stats || {
      totalTasks: 0,
      pendingTasks: 0,
      assignedTasks: 0,
      completedTasks: 0,
      averageCompletionTime: 0,
    },
    loading,
    error: queryError?.message || null,
    refetch,
  };
}
