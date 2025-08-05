"use client";

import { UseFormReturn } from "react-hook-form";
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { useSupabaseStorage } from "@/hooks/useSupabaseStorage";
import { Image, X, Star, Eye } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  { value: "general", label: "General" },
  { value: "exterior", label: "Exterior Views" },
  { value: "interior", label: "Interior Rooms" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathrooms" },
  { value: "bedroom", label: "Bedrooms" },
  { value: "amenities", label: "Amenities" },
];

export function MediaStep({ form }: MediaStepProps) {
  const images = form.watch("images") || [];
  const [selectedCategory, setSelectedCategory] = useState<string>("general");
  const { uploadFile, deleteFile, isUploading, uploadProgress, clearUploadHistory } =
    useSupabaseStorage();
  const { toast } = useToast();

  const uploadInProgress = useRef(false);
  const fileDropzoneRef = useRef<any>(null);

  // Reset FileDropzone when category changes
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Clear upload history to prevent false duplicate detection
    clearUploadHistory();
    // Reset the FileDropzone's internal state
    if (fileDropzoneRef.current?.resetFiles) {
      fileDropzoneRef.current.resetFiles();
    }
  };

  const handleFilesSelected = async (files: File[]) => {
    try {
      console.log(
        `Starting upload for ${files.length} files in category: ${selectedCategory}`
      );

      const currentImages = form.getValues("images") || [];
      
      // Get property ID or use a temporary one based on user ID
      const propertyId = form.getValues("id");
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Use user ID for temporary path if no property ID exists
      const uploadPath = propertyId || `temp-${user.id}`;
      
      const uploadPromises = files.map(async (file, index) => {
        try {
          const result = await uploadFile(file, {
            bucket: "property-images",
            path: uploadPath,
            maxSize: 5 * 1024 * 1024,
            allowedTypes: ["image/jpeg", "image/png", "image/jpg", "image/webp"],
          });

          return {
            url: result.url,
            path: result.path,
            is_primary: currentImages.length === 0 && index === 0,
            category: selectedCategory,
            size: result.size,
            name: result.name,
          };
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          throw error;
        }
      });

      const uploadedImages = await Promise.all(uploadPromises);
      const updatedImages = [...currentImages, ...uploadedImages];
      form.setValue("images", updatedImages);

      console.log(`Upload completed. Total images: ${updatedImages.length}`);
      console.log("Uploaded images:", uploadedImages);
    } catch (error) {
      console.error("Upload failed:", error);
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      toast({
        title: "Upload Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const removeImage = async (index: number) => {
    const image = images[index];
    if (image?.path) {
      try {
        await deleteFile("property-images", image.path);
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }

    const updatedImages = images.filter((_: any, i: number) => i !== index);
    // If we removed the primary image, make the first remaining image primary
    if (image?.is_primary && updatedImages.length > 0) {
      updatedImages[0].is_primary = true;
    }
    form.setValue("images", updatedImages);
  };

  const setPrimaryImage = (index: number) => {
    const updatedImages = images.map((img: UploadedImage, i: number) => ({
      ...img,
      is_primary: i === index,
    }));
    form.setValue("images", updatedImages);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
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
              onClick={() => handleCategoryChange(value)} // Use the new handler
              className={`p-3 border rounded-lg text-left transition-colors ${
                selectedCategory === value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="font-medium text-sm">{label}</p>
              <div>
                <p className="text-xs text-gray-500">
                  {
                    images.filter(
                      (image: UploadedImage) => image.category === value
                    ).length
                  }{" "}
                  <span className="text-xs text-gray-500">images</span>
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Image Upload */}
      <div>
        <h4 className="font-medium mb-2">
          Upload{" "}
          {IMAGE_CATEGORIES.find((c) => c.value === selectedCategory)?.label}{" "}
          Images
        </h4>
        <FileDropzone
          ref={fileDropzoneRef}
          onFilesSelected={handleFilesSelected}
          showSelectedFiles={false}
          accept={{
            "image/*": [".png", ".jpg", ".jpeg", ".webp"],
          }}
          maxFiles={20}
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

        {/* Debug info */}
        <div className="mt-2 text-xs text-gray-500">
          Current images: {images.length} | Category: {selectedCategory}
        </div>
      </div>

      {/* Image Gallery by Category */}
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image: UploadedImage, index: number) => {
            const globalIndex = index;

            return (
              <Card key={index} className="relative group overflow-hidden">
                <CardContent className="p-2">
                  <div className="aspect-square relative">
                    <img
                      src={image.url}
                      alt={`${image.category} ${index + 1}`}
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
                        onClick={() => window.open(image.url, "_blank")}
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
                    <p className="text-xs text-gray-500 truncate">
                      {image.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatFileSize(image.size)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Upload Tips and Validation Status */}
      <div className="space-y-4">
        {images.length < 1 && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <h4 className="font-medium text-amber-900 mb-2 flex items-center">
              <Image className="w-4 h-4 mr-2" />
              Required
            </h4>
            <p className="text-sm text-amber-800">
              At least one image is required to create a property listing. Please upload photos to continue.
            </p>
          </div>
        )}
        
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
      </div>

      {images.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No images uploaded yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Add some photos to showcase your property
          </p>
        </div>
      )}
    </div>
  );
}
