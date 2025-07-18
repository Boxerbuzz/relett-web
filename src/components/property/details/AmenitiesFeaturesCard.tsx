import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface AmenitiesFeaturesCardProps {
  amenities: string[];
  features: string[];
  getAmenityById: (id: string) => { name: string } | undefined;
}

export function AmenitiesFeaturesCard({ amenities, features, getAmenityById }: AmenitiesFeaturesCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Property Amenities & Features</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Amenities */}
        {amenities && amenities.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">
                  {getAmenityById(amenity)?.name}
                </span>
              </div>
            ))}
          </div>
        )}
        {/* Features */}
        {features && features.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">
                  {getAmenityById(feature)?.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 