import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeftIcon, StarIcon, ImagesIcon } from "@phosphor-icons/react";
import { Badge } from "@/components/ui/badge";

interface ImageGalleryProps {
  images: Array<{ url: string; is_primary?: boolean }>; // minimal type
  propertyTitle: string;
  currentImageIndex: number;
  onPrev: () => void;
  onNext: () => void;
  isFeatured?: boolean;
  isVerified?: boolean;
  isTokenized?: boolean;
}

export function ImageGallery({
  images,
  propertyTitle,
  currentImageIndex,
  onPrev,
  onNext,
  isFeatured,
  isVerified,
  isTokenized,
}: ImageGalleryProps) {
  const currentImage = images[currentImageIndex];
  return (
    <Card className="relative rounded-lg overflow-hidden h-100">
      <CardContent className="p-0">
        {currentImage ? (
          <>
            <img
              src={currentImage.url}
              alt={propertyTitle || "Property"}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button
                  title="Previous Image"
                  aria-label="Previous Image"
                  type="button"
                  onClick={onPrev}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                >
                  <ArrowLeftIcon className="h-5 w-5" />
                </button>
                <button
                  title="Next Image"
                  aria-label="Next Image"
                  type="button"
                  onClick={onNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70"
                >
                  <ArrowLeftIcon className="h-5 w-5 rotate-180" />
                </button>
                <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}
            <div className="absolute top-4 left-4 flex gap-2">
              {isFeatured && (
                <Badge className="bg-yellow-500 text-white">
                  <StarIcon className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {isVerified && (
                <Badge className="bg-green-500 text-white">Verified</Badge>
              )}
              {isTokenized && (
                <Badge className="bg-purple-500 text-white">Tokenized</Badge>
              )}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImagesIcon className="h-16 w-16 text-gray-400" />
          </div>
        )}
      </CardContent>
    </Card>
  );
} 