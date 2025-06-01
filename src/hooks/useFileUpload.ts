
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UploadOptions {
  bucket: string;
  path?: string;
  maxSize?: number; // in bytes
  allowedTypes?: string[];
}

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const uploadFile = async (file: File, options: UploadOptions) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Validate file size
      if (options.maxSize && file.size > options.maxSize) {
        throw new Error(`File size exceeds ${Math.round(options.maxSize / 1024 / 1024)}MB limit`);
      }

      // Validate file type
      if (options.allowedTypes && !options.allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} not allowed`);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${options.path ? options.path + '/' : ''}${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(options.bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(options.bucket)
        .getPublicUrl(data.path);

      setUploadProgress(100);
      
      toast({
        title: 'Upload successful',
        description: `${file.name} has been uploaded successfully.`,
      });

      return {
        path: data.path,
        url: publicUrl,
        size: file.size,
        type: file.type,
        name: file.name
      };

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'An error occurred during upload',
        variant: 'destructive'
      });
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const deleteFile = async (bucket: string, path: string) => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;

      toast({
        title: 'File deleted',
        description: 'File has been successfully removed.',
      });

    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: 'Delete failed',
        description: 'Failed to delete file',
        variant: 'destructive'
      });
      throw error;
    }
  };

  return {
    uploadFile,
    deleteFile,
    isUploading,
    uploadProgress
  };
}
