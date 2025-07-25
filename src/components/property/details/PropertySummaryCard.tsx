import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  MapPinIcon,
  EyeIcon,
  HeartIcon,
  CalendarIcon,
  StarIcon,
  BedIcon,
  ShowerIcon,
  SquareIcon,
} from "@phosphor-icons/react";
import { Separator } from "@/components/ui/separator";

interface PropertySummaryCardProps {
  property: any;
  formatPrice: (price: any) => string;
  capitalize: (str: string) => string;
}

export function PropertySummaryCard({
  property,
  formatPrice,
  capitalize,
}: PropertySummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold mb-2">
              {property.title || "Property Title"}
            </CardTitle>
            <div className="flex items-center text-gray-600 mb-4">
              <MapPinIcon className="h-4 w-4 mr-2" />
              <span>
                {`${property.location?.address || ""}, ${
                  property.location?.state || ""
                }`.trim() || "Address not specified"}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="badge badge-secondary">
                {capitalize(property.category)}
              </span>
              <span className="badge badge-outline">
                {capitalize(property.type)}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {formatPrice(property.price)}
              {property.price.term && (
                <span className="text-sm text-gray-600">
                  /{capitalize(property.price.term)}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-600">Price</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <BedIcon className="w-5 h-5 mr-1" />
              <span className="text-lg font-semibold">
                {property.specification?.bedrooms || 0}
              </span>
            </div>
            <div className="text-sm text-gray-600">Bedrooms</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <ShowerIcon className="w-5 h-5 mr-1" />
              <span className="text-lg font-semibold">
                {property.specification?.bathrooms || 0}
              </span>
            </div>
            <div className="text-sm text-gray-600">Bathrooms</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <SquareIcon className="w-5 h-5 mr-1" />
              <span className="text-lg font-semibold">
                {property.specification?.area || "N/A"}
              </span>
            </div>
            <div className="text-sm text-gray-600">Sq ft</div>
          </div>
        </div>
        <Separator className="my-6" />
        <div>
          <h3 className="text-lg font-semibold mb-3">Description</h3>
          <p className="text-gray-700 leading-relaxed">
            {property.description || "No description available."}
          </p>
        </div>
        <div className="flex items-center gap-6 mt-6 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <EyeIcon className="h-4 w-4" />
            <span>{property.views || 0} views</span>
          </div>
          <div className="flex items-center gap-1">
            <HeartIcon className="h-4 w-4" />
            <span>{property.likes || 0} likes</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-4 w-4" />
            <span>
              Listed {new Date(property.created_at).toLocaleDateString()}
            </span>
          </div>
          {property.ratings > 0 && (
            <div className="flex items-center gap-1">
              <StarIcon className="h-4 w-4 fill-current text-yellow-500" />
              <span>{property.ratings.toFixed(1)} rating</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
