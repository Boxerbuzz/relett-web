import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UploadResult {
  url: string;
  path: string;
  size: number;
  type: string;
  name: string;
  id: string; // Added file hash for tracking
}

interface UploadOptions {
  bucket: string;
  path: string; // Direct path instead of folder/subfolder
  maxSize?: number; // in bytes
  allowedTypes?: string[];
  generateThumbnail?: boolean;
  onProgress?: (progress: number) => void; // Added progress callback
}

export function useSupabaseStorage() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  const uploadedFilesRef = useRef<Set<string>>(new Set());

  const generateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  };

  const uploadFile = async (
    file: File,
    options: UploadOptions
  ): Promise<UploadResult> => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Create abort controller for cancellation
      abortControllerRef.current = new AbortController();

      // Validate file size
      if (options.maxSize && file.size > options.maxSize) {
        throw new Error(
          `File size exceeds ${Math.round(
            options.maxSize / 1024 / 1024
          )}MB limit`
        );
      }

      // Validate file type
      if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} not allowed`);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Generate file hash for unique identification
      const fileHash = await generateFileHash(file);
      
      // Create unique file path with timestamp and hash
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}_${fileHash.substring(0, 8)}.${fileExt}`;

      // Use the provided path directly
      const filePath = `${options.path}/${fileName}`;

      options.onProgress?.(30);
      setUploadProgress(30);

      options.onProgress?.(50);
      setUploadProgress(50);

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        if (error.message.includes("already exists")) {
          throw new Error(
            "File already exists. Please choose a different file."
          );
        }
        throw error;
      }

      options.onProgress?.(80);
      setUploadProgress(80);

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(options.bucket).getPublicUrl(data.path);

      options.onProgress?.(100);
      setUploadProgress(100);

      // Add to uploaded files set
      uploadedFilesRef.current.add(fileHash);

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded successfully.`,
      });

      return {
        id: fileHash,
        path: data.path,
        url: publicUrl,
        size: file.size,
        type: file.type,
        name: file.name,
      };
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description:
          error instanceof Error
            ? error.message
            : "An error occurred during upload",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      abortControllerRef.current = null;
    }
  };

  const uploadMultipleFiles = async (
    files: File[],
    options: UploadOptions
  ): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    const errors: string[] = [];

    setIsUploading(true);

    for (let i = 0; i < files.length; i++) {
      try {
        const fileProgress = (i / files.length) * 100;
        const result = await uploadFile(files[i], {
          ...options,
          onProgress: (progress) => {
            const totalProgress = fileProgress + progress / files.length;
            setUploadProgress(totalProgress);
            options.onProgress?.(totalProgress);
          },
        });
        results.push(result);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        errors.push(`${files[i].name}: ${errorMessage}`);
      }
    }

    if (errors.length > 0) {
      toast({
        title: "Some uploads failed",
        description: errors.join(", "),
        variant: "destructive",
      });
    }

    setIsUploading(false);
    setUploadProgress(0);

    return results;
  };

  const cancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: "Upload cancelled",
        description: "File upload has been cancelled.",
      });
    }
  };

  const deleteFile = async (bucket: string, path: string) => {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);

      if (error) throw error;

      toast({
        title: "File deleted",
        description: "File has been successfully removed.",
      });
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete failed",
        description: "Failed to delete file",
        variant: "destructive",
      });
      throw error;
    }
  };

  const listFiles = async (bucket: string, folder?: string) => {
    try {
      const { data, error } = await supabase.storage.from(bucket).list(folder);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("List files error:", error);
      throw error;
    }
  };

  const clearUploadHistory = () => {
    uploadedFilesRef.current.clear();
  };

  return {
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    listFiles,
    cancelUpload,
    clearUploadHistory,
    isUploading,
    uploadProgress,
  };
}
