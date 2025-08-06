import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { queryKeys, cacheConfig } from "@/lib/queryClient";
import { VerificationTask } from "@/components/verification/types";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

export function useCreateVerificationTasks() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async (propertyId: string) => {
      // 1. Create property-level verification task
      const { data: propertyTask, error: propertyTaskError } = await supabase
        .from("verification_tasks")
        .insert({
          property_id: propertyId,
          status: "pending",
          created_at: new Date().toISOString(),
          task_type: "property_verification",
          priority: "medium",
        })
        .select()
        .single();

      if (propertyTaskError) throw propertyTaskError;

      // 2. Fetch all property documents for this property
      const { data: documents, error: docsError } = await supabase
        .from("property_documents")
        .select("*")
        .eq("property_id", propertyId);

      if (docsError) throw docsError;

      // 3. Create a document verification task for each document
      const docRequests = documents.map((doc: any) =>
        supabase.from("document_verification_requests").insert({
          document_id: doc.id || "",
          status: "pending",
          created_at: new Date().toISOString(),
          requested_by: user?.id || "",
          priority: "medium",
          property_id: propertyId,
        })
      );

      // Wait for all document verification requests to complete
      const docResults = await Promise.all(docRequests);

      // Check for errors in any document verification request
      const docErrors = docResults.find((res) => res.error);
      if (docErrors) throw docErrors.error;

      return {
        propertyTask,
        documentRequests: docResults.map((res) => res.data),
      };
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.verification.tasks('all'),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.verification.requests(),
      });
      toast({
        title: "Success",
        description: "Verification tasks created for property and documents.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error?.message || "Failed to create verification tasks.",
        variant: "destructive",
      });
    },
  });

  return mutation;
}

interface VerificationRequest {
  id: string;
  document_id: string;
  requested_by: string;
  assigned_verifier: string | null;
  status: string;
  priority: string;
  created_at: string;
  notes: string | null;
  property_documents: {
    id: string;
    document_name: string;
    document_type: string;
    file_url: string;
    mime_type: string;
    file_size: number;
    property_id: string | null;
    land_title_id: string | null;
    created_at: string | null;
    status: string | null;
    verification_notes: string | null;
  };
  requester?: {
    first_name: string;
    last_name: string;
    email: string;
    avatar: string;
  };
}

export function useDocumentVerificationRequests(propertyId: string) {
  const { toast } = useToast();

  const {
    data: requests,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: [...queryKeys.verification.document_request('requests'), propertyId],
    queryFn: async (): Promise<VerificationRequest[]> => {
      const { data, error } = await supabase
        .from("document_verification_requests")
        .select(
          `
          *,
          property_documents!inner(*),
          users!requested_by(first_name, last_name, email)
        `
        )
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load verification requests.",
          variant: "destructive",
        });
        throw error;
      }

      const processedData = (data || []).map((item) => ({
        ...item,
        requester: Array.isArray(item.users) ? item.users[0] : item.users,
      }));

      return (processedData as VerificationRequest[]) || [];
    },
    enabled: !!propertyId,
    ...cacheConfig.standard, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    requests: requests || [],
    loading,
    error: queryError?.message || null,
    refetch,
  };
}

export function useUpdateDocumentVerificationRequest() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateRequest = async (
    requestId: string,
    updates: {
      status?: string;
      notes?: string;
      verification_checklist?: any;
      completed_at?: string;
    }
  ) => {
    try {
      const { error } = await supabase
        .from("document_verification_requests")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Verification request updated successfully",
      });

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.verification.document_request('requests'),
      });

      return { success: true };
    } catch (error) {
      console.error("Error updating verification request:", error);
      toast({
        title: "Error",
        description: "Failed to update verification request",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  return { updateRequest };
}

export function useVerificationTasks() {
  const { toast } = useToast();

  const {
    data: requests,
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: queryKeys.verification.tasks('all'),
    queryFn: async (): Promise<VerificationTask[]> => {
      const { data, error } = await supabase
        .from("verification_tasks")
        .select(
          `
          *,
          properties!inner(
            id,
            title,
            type,
            location,
            user_id,
            users:user_id(first_name, last_name, email, avatar)
          ),
          user:verification_tasks_verifier_id_fkey(first_name, last_name, email, avatar)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching verification tasks:", error);
        toast({
          title: "Error",
          description: "Failed to load verification tasks.",
          variant: "destructive",
        });
        throw error;
      }

      return (data as VerificationTask[]) || [];
    },
    ...cacheConfig.standard, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    tasks: requests || [],
    loading,
    error: queryError?.message || null,
    refetch,
  };
}

interface UseVerificationTaskDetailActionProps {
  task: VerificationTask;
  checklist: any;
  verifierNotes: string;
  decision: "approved" | "rejected" | "";
  decisionReason?: string;
  onTaskUpdated: () => void;
  onBack?: () => void;
  setChecklist: (c: any) => void;
  setVerifierNotes: (n: string) => void;
  setDecision: (d: "approved" | "rejected" | "") => void;
  setDecisionReason: (r: string) => void;
}

export function useVerificationTaskDetailAction({
  task,
  checklist,
  verifierNotes,
  decision,
  decisionReason,
  onTaskUpdated,
  onBack,
  setChecklist,
  setVerifierNotes,
  setDecision,
  setDecisionReason,
}: UseVerificationTaskDetailActionProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Save progress (checklist, notes)
  const saveProgress = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("verification_tasks")
        .update({
          verification_checklist: checklist,
          verifier_notes: verifierNotes,
          status: "in_progress",
          updated_at: new Date().toISOString(),
        })
        .eq("id", task.id);

      if (error) throw error;

      toast({
        title: "Progress Saved",
        description: "Your verification progress has been saved.",
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.verification.tasks('all'),
      });
      onTaskUpdated();
    } catch (error) {
      console.error("Error saving progress:", error);
      toast({
        title: "Error",
        description: "Failed to save progress",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Complete verification (approve/reject)
  const completeVerification = async () => {
    if (!decision) {
      toast({
        title: "Decision Required",
        description: "Please select approve or reject before completing.",
        variant: "destructive",
      });
      return;
    }

    if (!verifierNotes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide verification notes.",
        variant: "destructive",
      });
      return;
    }

    // Check if land title is associated (required for approval)
    if (decision === "approved") {
      try {
        const { data: property, error: propertyError } = await supabase
          .from("properties")
          .select("land_title_id")
          .eq("id", task.property_id)
          .single();

        if (propertyError) throw propertyError;
        
        if (!property?.land_title_id) {
          toast({
            title: "Land Title Required",
            description: "Please associate a land title before approving the property",
            variant: "destructive",
          });
          return;
        }
      } catch (error) {
        console.error("Error checking land title association:", error);
        toast({
          title: "Error",
          description: "Failed to verify land title association",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc("complete_verification_task", {
        p_task_id: task.id,
        p_decision: decision,
        p_decision_reason: decisionReason || undefined,
        p_verifier_notes: verifierNotes,
        p_checklist: checklist,
      });

      if (error) throw error;

      toast({
        title: "Verification Complete",
        description: `Property has been ${decision}.`,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.verification.tasks('all'),
      });
      onTaskUpdated();
      if (onBack) onBack();
    } catch (error) {
      console.error("Error completing verification:", error);
      toast({
        title: "Error",
        description: "Failed to complete verification",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Optionally, add reset/clear helpers
  const resetForm = () => {
    setChecklist(task.verification_checklist || {});
    setVerifierNotes(task.verifier_notes || "");
    setDecision("");
    setDecisionReason("");
  };

  return {
    saveProgress,
    completeVerification,
    isUpdating,
    isSubmitting,
    resetForm,
  };
}

export const useVerificationTaskActions = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const assignTaskToSelf = async (taskId: string, propertyId: string) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to assign a task.",
        variant: "destructive",
      });
      return { success: false };
    }

    try {
      // 1. Update the main verification task
      const { error: taskError } = await supabase
        .from("verification_tasks")
        .update({
          verifier_id: user.id,
          status: "assigned",
          assigned_at: new Date().toISOString(),
        })
        .eq("id", taskId);

      if (taskError) throw taskError;

      // 2. Update all related document verification requests for that property
      const { error: docError } = await supabase
        .from("document_verification_requests")
        .update({
          assigned_verifier: user.id,
        })
        .eq("property_id", propertyId);

      if (docError) throw docError;

      toast({
        title: "Task Assigned",
        description: "The verification task has been assigned to you.",
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error assigning task:", error);
      toast({
        title: "Error Assigning Task",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  return { assignTaskToSelf };
};
