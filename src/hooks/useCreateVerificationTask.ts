import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/queryClient";
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
        queryKey: queryKeys.verification.tasks(),
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
