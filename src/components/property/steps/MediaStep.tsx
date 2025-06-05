
'use client';

import { UseFormReturn } from 'react-hook-form';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileDropzone } from '@/components/ui/file-dropzone';
import { useSupabaseStorage } from '@/hooks/useSupabaseStorage';
import { Image, X, Star, Eye } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface MediaStepProps {
  form: UseFormReturn<any>;
}

interface UploadedImage {
  url: string;
  path: string;
  is_primary: boolean;
  category: string;
  size: number;
  name: string;
}

const IMAGE_CATEGORIES = [
  { value: 'exterior', label: 'Exterior Views' },
  { value: 'interior', label: 'Interior Rooms' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'bathroom', label: 'Bathrooms' },
  { value: 'bedroom', label: 'Bedrooms' },
  { value: 'amenities', label: 'Amenities' },
  { value: 'general', label: 'General' }
];

export function MediaStep({ form }: MediaStepProps) {
  const images = form.watch('images') || [];
  const [selectedCategory, setSelectedCategory] = useState<string>('exterior');
  const { uploadFile, deleteFile, isUploading, uploadProgress } = useSupabaseStorage();

  const handleFilesSelected = async (files: File[]) => {
    try {
      const uploadPromises = files.map(async (file) => {
        const result = await uploadFile(file, {
          bucket: 'property-images',
          folder: selectedCategory,
          maxSize: 5 * 1024 * 1024, // 5MB for images
          allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
        });

        return {
          url: result.url,
          path: result.path,
          is_primary: images.length === 0, // First image is primary
          category: selectedCategory,
          size: result.size,
          name: result.name
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      const updatedImages = [...images, ...uploadedImages];
      form.setValue('images', updatedImages);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const removeImage = async (index: number) => {
    const image = images[index];
    if (image?.path) {
      try {
        await deleteFile('property-images', image.path);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
    
    const updatedImages = images.filter((_: any, i: number) => i !== index);
    // If we removed the primary image, make the first remaining image primary
    if (image?.is_primary && updatedImages.length > 0) {
      updatedImages[0].is_primary = true;
    }
    form.setValue('images', updatedImages);
  };

  const setPrimaryImage = (index: number) => {
    const updatedImages = images.map((img: UploadedImage, i: number) => ({
      ...img,
      is_primary: i === index
    }));
    form.setValue('images', updatedImages);
  };

  const getImagesByCategory = (category: string) => {
    return images.filter((img: UploadedImage) => img.category === category);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <div>
        <h3 className="text-lg font-medium mb-4">Select Image Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {IMAGE_CATEGORIES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedCategory(value)}
              className={`p-3 border rounded-lg text-left transition-colors ${
                selectedCategory === value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-medium text-sm">{label}</p>
              <p className="text-xs text-gray-500 mt-1">
                {getImagesByCategory(value).length} images
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <h4 className="font-medium mb-2">
          Upload {IMAGE_CATEGORIES.find(c => c.value === selectedCategory)?.label} Images
        </h4>
        <FileDropzone
          onFilesSelected={handleFilesSelected}
          accept={{
            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
          }}
          maxFiles={10}
          maxSize={5 * 1024 * 1024}
          disabled={isUploading}
        />
        
        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Uploading images...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}
      </div>

      {/* Image Gallery by Category */}
      <div className="space-y-6">
        {IMAGE_CATEGORIES.map(({ value, label }) => {
          const categoryImages = getImagesByCategory(value);
          if (categoryImages.length === 0) return null;

          return (
            <div key={value}>
              <h4 className="font-medium mb-3 flex items-center justify-between">
                {label}
                <Badge variant="outline">{categoryImages.length} images</Badge>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryImages.map((image: UploadedImage, categoryIndex: number) => {
                  const globalIndex = images.findIndex((img: UploadedImage) => 
                    img.url === image.url && img.category === image.category
                  );
                  
                  return (
                    <Card key={categoryIndex} className="relative group overflow-hidden">
                      <CardContent className="p-2">
                        <div className="aspect-square relative">
                          <img
                            src={image.url}
                            alt={`${label} ${categoryIndex + 1}`}
                            className="w-full h-full object-cover rounded-md"
                          />
                          
                          {image.is_primary && (
                            <Badge className="absolute top-2 left-2 bg-yellow-500 hover:bg-yellow-600">
                              <Star className="h-3 w-3 mr-1" />
                              Primary
                            </Badge>
                          )}
                          
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => window.open(image.url, '_blank')}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            {!image.is_primary && (
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                onClick={() => setPrimaryImage(globalIndex)}
                              >
                                <Star className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removeImage(globalIndex)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-2 text-center">
                          <p className="text-xs text-gray-500 truncate">{image.name}</p>
                          <p className="text-xs text-gray-400">{formatFileSize(image.size)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Tips */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2 flex items-center">
          <Image className="w-4 h-4 mr-2" />
          Photography Tips
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use natural lighting when possible for best results</li>
          <li>• Take photos from multiple angles to showcase the space</li>
          <li>• Include both wide shots and detail shots</li>
          <li>• Make sure the space is clean and well-staged</li>
          <li>• Upload high-resolution images (max 5MB each)</li>
          <li>• Set your best exterior shot as the primary image</li>
        </ul>
      </div>

      {images.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No images uploaded yet</p>
          <p className="text-sm text-gray-400 mt-1">Add some photos to showcase your property</p>
        </div>
      )}
    </div>
  );
}
