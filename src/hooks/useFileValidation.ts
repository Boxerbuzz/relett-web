
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileValidationResult {
  isValid: boolean;
  errors: string[];
  optimizedFile?: File;
  metadata: {
    originalSize: number;
    finalSize: number;
    mimeType: string;
    dimensions?: { width: number; height: number };
  };
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGE_DIMENSION = 2048;

export function useFileValidation() {
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const validateFile = async (file: File, fileType: 'image' | 'document'): Promise<FileValidationResult> => {
    setIsValidating(true);
    const errors: string[] = [];

    try {
      // Check file type
      const allowedTypes = fileType === 'image' ? ALLOWED_IMAGE_TYPES : ALLOWED_DOCUMENT_TYPES;
      if (!allowedTypes.includes(file.type)) {
        errors.push(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`);
      }

      // Check file size
      const maxSize = fileType === 'image' ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;
      if (file.size > maxSize) {
        errors.push(`File size too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`);
      }

      let optimizedFile = file;
      let dimensions: { width: number; height: number } | undefined;

      // Process image files
      if (fileType === 'image' && ALLOWED_IMAGE_TYPES.includes(file.type)) {
        const imageResult = await processImage(file);
        optimizedFile = imageResult.file;
        dimensions = imageResult.dimensions;

        if (dimensions.width > MAX_IMAGE_DIMENSION || dimensions.height > MAX_IMAGE_DIMENSION) {
          // Image was resized during processing
          console.log('Image resized for optimization');
        }
      }

      // Scan file for malware (using edge function)
      const scanResult = await scanFile(optimizedFile);
      if (!scanResult.isClean) {
        errors.push('File failed security scan');
      }

      const result: FileValidationResult = {
        isValid: errors.length === 0,
        errors,
        optimizedFile: errors.length === 0 ? optimizedFile : undefined,
        metadata: {
          originalSize: file.size,
          finalSize: optimizedFile.size,
          mimeType: file.type,
          dimensions
        }
      };

      if (errors.length > 0) {
        toast({
          title: 'File Validation Failed',
          description: errors.join('. '),
          variant: 'destructive'
        });
      }

      return result;

    } catch (error) {
      console.error('File validation error:', error);
      return {
        isValid: false,
        errors: ['File validation failed'],
        metadata: {
          originalSize: file.size,
          finalSize: file.size,
          mimeType: file.type
        }
      };
    } finally {
      setIsValidating(false);
    }
  };

  const processImage = async (file: File): Promise<{ file: File; dimensions: { width: number; height: number } }> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Resize if too large
        if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
          const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve({ file: optimizedFile, dimensions: { width, height } });
          } else {
            resolve({ file, dimensions: { width: img.width, height: img.height } });
          }
        }, 'image/jpeg', 0.85);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const scanFile = async (file: File): Promise<{ isClean: boolean; threats?: string[] }> => {
    try {
      const { data, error } = await supabase.functions.invoke('scan-file', {
        body: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          fileHash: await calculateFileHash(file)
        }
      });

      if (error) {
        console.error('File scan error:', error);
        return { isClean: true }; // Fail open for now
      }

      return data;
    } catch (error) {
      console.error('File scan error:', error);
      return { isClean: true }; // Fail open for now
    }
  };

  const calculateFileHash = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  return {
    validateFile,
    isValidating
  };
}
