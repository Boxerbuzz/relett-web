import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";

// Use the generated types for strong alignment
type PropertyDocument =
  Database["public"]["Tables"]["property_documents"]["Row"];
type CreateDocumentData =
  Database["public"]["Tables"]["property_documents"]["Insert"];
type UpdateDocumentData =
  Database["public"]["Tables"]["property_documents"]["Update"];

export function usePropertyDocument() {
  const [isLoading, setIsLoading] = useState(false);
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const { deleteFile } = useSupabaseStorage();
  const { toast } = useToast();

  // Create a single document
  const createDocument = async (
    data: CreateDocumentData
  ): Promise<PropertyDocument | null> => {
    setIsLoading(true);
    try {
      const { data: document, error } = await supabase
        .from("property_documents")
        .insert({
          property_id: data.property_id,
          document_name: data.document_name,
          document_type: data.document_type,
          file_url: data.file_url,
          file_size: data.file_size,
          mime_type: data.mime_type,
          document_hash: data.document_hash,
          status: data.status || "pending",
          metadata: data.metadata || {},
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Document created successfully",
      });

      return document;
    } catch (error) {
      console.error("Error creating document:", error);
      toast({
        title: "Error",
        description: "Failed to create document. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Create multiple documents
  const createDocuments = async (
    propertyId: string,
    documents: CreateDocumentData[]
  ): Promise<{
    success: boolean;
    error: any;
    documents?: PropertyDocument[];
  }> => {
    setIsLoading(true);
    try {
      if (!documents || documents.length === 0) {
        return { success: true, error: null };
      }

      const documentInserts = documents.map((doc) => ({
        property_id: propertyId,
        document_name: doc.document_name,
        document_type: doc.document_type,
        file_url: doc.file_url,
        file_size: doc.file_size,
        mime_type: doc.mime_type,
        document_hash: doc.document_hash,
        status: doc.status || "pending",
        metadata: doc.metadata || {},
      }));

      const { data: createdDocuments, error } = await supabase
        .from("property_documents")
        .insert(documentInserts)
        .select();

      if (error) throw error;

      toast({
        title: "Success",
        description: `${documents.length} document(s) created successfully`,
      });

      return { success: true, error: null, documents: createdDocuments };
    } catch (error) {
      console.error("Error creating documents:", error);
      toast({
        title: "Error",
        description: "Failed to create documents. Please try again.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  // Get documents for a property
  const getDocuments = async (
    propertyId: string
  ): Promise<PropertyDocument[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("property_documents")
        .select("*")
        .eq("property_id", propertyId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setDocuments(data || []);
      return data || [];
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch documents. Please try again.",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Update a document
  const updateDocument = async (
    documentId: string,
    data: UpdateDocumentData
  ): Promise<PropertyDocument | null> => {
    setIsLoading(true);
    try {
      const { data: updatedDocument, error } = await supabase
        .from("property_documents")
        .update({
          ...data,
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === documentId ? updatedDocument : doc))
      );

      toast({
        title: "Success",
        description: "Document updated successfully",
      });

      return updatedDocument;
    } catch (error) {
      console.error("Error updating document:", error);
      toast({
        title: "Error",
        description: "Failed to update document. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a document
  const deleteDocument = async (
    documentId: string,
    bucket: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { data: doc, error: fetchError } = await supabase
        .from("property_documents")
        .select("file_url")
        .eq("id", documentId)
        .single();

      if (fetchError) throw fetchError;
      if (!doc?.file_url) throw new Error("No file URL found for document");

      // 2. Parse the file path from the file_url (if needed)
      // If file_url is a public URL, extract the path part
      const filePath = extractPathFromUrl(doc.file_url);

      // 3. Delete the file from storage
      await deleteFile(bucket, filePath);

      const { error } = await supabase
        .from("property_documents")
        .delete()
        .eq("id", documentId);

      if (error) throw error;

      // Update local state
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));

      toast({
        title: "Success",
        description: "Document deleted successfully",
      });

      return true;
    } catch (error) {
      console.error("Error deleting document:", error);
      toast({
        title: "Error",
        description: "Failed to delete document. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Verify a document (admin function)
  const verifyDocument = async (
    documentId: string,
    status: "verified" | "rejected",
    notes?: string,
    verifiedBy?: string
  ): Promise<PropertyDocument | null> => {
    setIsLoading(true);
    try {
      const { data: verifiedDocument, error } = await supabase
        .from("property_documents")
        .update({
          status,
          verification_notes: notes,
          verified_by: verifiedBy,
          verified_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setDocuments((prev) =>
        prev.map((doc) => (doc.id === documentId ? verifiedDocument : doc))
      );

      toast({
        title: "Success",
        description: `Document ${status} successfully`,
      });

      return verifiedDocument;
    } catch (error) {
      console.error("Error verifying document:", error);
      toast({
        title: "Error",
        description: "Failed to verify document. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get documents by status
  const getDocumentsByStatus = async (
    propertyId: string,
    status: "pending" | "verified" | "rejected"
  ): Promise<PropertyDocument[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("property_documents")
        .select("*")
        .eq("property_id", propertyId)
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching documents by status:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get documents by type
  const getDocumentsByType = async (
    propertyId: string,
    documentType: string
  ): Promise<PropertyDocument[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("property_documents")
        .select("*")
        .eq("property_id", propertyId)
        .eq("document_type", documentType as any)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Error fetching documents by type:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to extract the storage path from a public URL
  function extractPathFromUrl(url: string): string {
    // Example: https://xyz.supabase.co/storage/v1/object/public/property-documents/userid/filename.pdf
    // Returns: userid/filename.pdf
    const parts = url.split("/object/public/");
    return parts[1] || url;
  }

  return {
    // State
    documents,
    isLoading,

    // Actions
    createDocument,
    createDocuments,
    getDocuments,
    updateDocument,
    deleteDocument,
    verifyDocument,
    getDocumentsByStatus,
    getDocumentsByType,
  };
}
