
'use client';

import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Image, X, Star } from 'lucide-react';

interface MediaStepProps {
  form: UseFormReturn<any>;
}

export function MediaStep({ form }: MediaStepProps) {
  const images = form.watch('images') || [];

  const addImage = () => {
    // Simulate image upload - in real app, integrate with Supabase Storage
    const newImage = {
      url: `https://images.unsplash.com/photo-${Date.now()}?w=800&h=600&fit=crop`,
      is_primary: images.length === 0,
      category: 'general'
    };
    form.setValue('images', [...images, newImage]);
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_: any, i: number) => i !== index);
    form.setValue('images', updatedImages);
  };

  const setPrimaryImage = (index: number) => {
    const updatedImages = images.map((img: any, i: number) => ({
      ...img,
      is_primary: i === index
    }));
    form.setValue('images', updatedImages);
  };

  return (
    <div className="space-y-6">
      <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
        <Image className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Upload Property Images</h3>
        <p className="mt-1 text-sm text-gray-500">
          Add high-quality photos to showcase your property
        </p>
        <Button 
          type="button"
          className="mt-4"
          onClick={addImage}
        >
          <Upload className="h-4 w-4 mr-2" />
          Upload Images
        </Button>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image: any, index: number) => (
            <Card key={index} className="relative group">
              <CardContent className="p-2">
                <div className="aspect-square relative">
                  <img
                    src={image.url}
                    alt={`Property image ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                  
                  {image.is_primary && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500">
                      <Star className="h-3 w-3 mr-1" />
                      Primary
                    </Badge>
                  )}
                  
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center gap-2">
                    {!image.is_primary && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => setPrimaryImage(index)}
                      >
                        <Star className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Tips for great property photos:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use natural lighting when possible</li>
          <li>• Take photos from multiple angles</li>
          <li>• Include exterior and interior shots</li>
          <li>• Show key features and amenities</li>
          <li>• Ensure images are high resolution</li>
        </ul>
      </div>
    </div>
  );
}
