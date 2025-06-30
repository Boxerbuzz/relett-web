import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

const PropertyDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-9 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery Skeleton */}
            <Card className="relative rounded-lg overflow-hidden">
              <CardContent className="p-0">
                <div className="w-full h-96 bg-gray-200 animate-pulse"></div>
                {/* Status badges skeleton */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <div className="h-6 w-16 bg-gray-300 rounded-full animate-pulse"></div>
                  <div className="h-6 w-16 bg-gray-300 rounded-full animate-pulse"></div>
                </div>
              </CardContent>
            </Card>

            {/* Property Summary Skeleton */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="h-8 w-3/4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded mb-4 animate-pulse"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-8 w-32 bg-gray-200 rounded mb-2 animate-pulse"></div>
                    <div className="flex gap-2">
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="text-center">
                      <div className="h-6 w-16 bg-gray-200 rounded mb-1 mx-auto animate-pulse"></div>
                      <div className="h-4 w-12 bg-gray-200 rounded mx-auto animate-pulse"></div>
                    </div>
                  ))}
                </div>

                <Separator className="my-6" />

                {/* Description Skeleton */}
                <div>
                  <div className="h-6 w-24 bg-gray-200 rounded mb-3 animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-4/6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>

                {/* Property Stats Skeleton */}
                <div className="flex items-center gap-6 mt-6">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 w-16 bg-gray-200 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Amenities Skeleton */}
            <Card>
              <CardHeader>
                <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {/* Agent Info Skeleton */}
            <Card>
              <CardHeader>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                  <div>
                    <div className="h-5 w-24 bg-gray-200 rounded mb-1 animate-pulse"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-3 animate-pulse"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-gray-200 rounded mr-3 animate-pulse"></div>
                    <div className="h-4 w-40 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>

            {/* Quick Actions Skeleton */}
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-6 w-28 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              </CardContent>
            </Card>

            {/* Investment Info Skeleton */}
            <Card>
              <CardHeader>
                <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i}>
                      <div className="h-4 w-16 bg-gray-200 rounded mb-1 animate-pulse"></div>
                      <div className="h-5 w-12 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const PropertyDetailsNotFound = ({ error }: { error: string }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Property Not Found
        </h1>
        <p className="text-gray-600 mb-6">
          {error || "The property you are looking for does not exist."}
        </p>
        <Button onClick={() => navigate("/marketplace")}>
          Browse Properties
        </Button>
      </div>
    </div>
  );
};

export { PropertyDetailSkeleton, PropertyDetailsNotFound };
