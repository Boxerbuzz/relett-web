"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  EyeIcon,
} from "@phosphor-icons/react";
import { Layers, Filter, Fullscreen, Minimize } from "lucide-react";
import { GoogleMapWithProperties } from "@/components/maps/GoogleMapWithProperties";
import { useFullscreen } from "@/hooks/useFullscreen";

const mapProperties = [
  {
    id: 1,
    title: "Downtown Commercial Plot",
    location: "Victoria Island, Lagos",
    coordinates: { lat: 6.4281, lng: 3.4219 },
    size: "2.5 acres",
    value: "$1.2M",
    status: "verified",
    type: "commercial",
    tokenized: true,
  },
  {
    id: 2,
    title: "Residential Land Parcel",
    location: "Lekki, Lagos",
    coordinates: { lat: 6.4474, lng: 3.5611 },
    size: "1.8 acres",
    value: "$800K",
    status: "verified",
    type: "residential",
    tokenized: false,
  },
  {
    id: 3,
    title: "Agricultural Investment Land",
    location: "Ogun State",
    coordinates: { lat: 7.1608, lng: 3.3587 },
    size: "10 acres",
    value: "$500K",
    status: "pending",
    type: "agricultural",
    tokenized: false,
  },
];

const MapView = () => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "commercial":
        return "bg-blue-100 text-blue-800";
      case "residential":
        return "bg-purple-100 text-purple-800";
      case "agricultural":
        return "bg-green-100 text-green-800";
      case "industrial":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Map View
          </h1>
          <p className="text-gray-600">
            Explore properties on an interactive map
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Layers size={16} className="mr-2" />
            Layers
          </Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize size={16} className="mr-2" />
            ) : (
              <Fullscreen size={16} className="mr-2" />
            )}
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                placeholder="Search by location, property name..."
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Select>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="agricultural">Agricultural</SelectItem>
                  <SelectItem value="industrial">Industrial</SelectItem>
                </SelectContent>
              </Select>

              <Select>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="tokenized">Tokenized</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Filter size={16} className="mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPinIcon size={20} className="mr-2" />
                Interactive Property Map
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 relative">
              <GoogleMapWithProperties 
                className="w-full h-full"
                center={{ lat: 6.5244, lng: 3.3792 }}
                zoom={11}
              />
            </CardContent>
          </Card>
        </div>

        {/* Property List */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Properties on Map</CardTitle>
            </CardHeader>
          </Card>

          <Tabs defaultValue="all" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="verified">Verified</TabsTrigger>
              <TabsTrigger value="tokenized">Tokenized</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {mapProperties.map((property) => (
                <Card
                  key={property.id}
                  className="hover:shadow-md transition-shadow cursor-pointer"
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm line-clamp-2">
                          {property.title}
                        </h4>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <EyeIcon size={12} />
                        </Button>
                      </div>

                      <div className="flex items-center text-xs text-gray-500">
                        <MapPinIcon size={12} className="mr-1" />
                        {property.location}
                      </div>

                      <div className="flex flex-wrap gap-1">
                        <Badge
                          className={getStatusColor(property.status)}
                          variant="outline"
                        >
                          {property.status}
                        </Badge>
                        <Badge
                          className={getTypeColor(property.type)}
                          variant="outline"
                        >
                          {property.type}
                        </Badge>
                        {property.tokenized && (
                          <Badge
                            variant="outline"
                            className="text-blue-600 border-blue-200"
                          >
                            Tokenized
                          </Badge>
                        )}
                      </div>

                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">
                          Size: {property.size}
                        </span>
                        <span className="font-medium">{property.value}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="verified" className="space-y-4">
              {mapProperties
                .filter((p) => p.status === "verified")
                .map((property) => (
                  <Card
                    key={property.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {property.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <EyeIcon size={12} />
                          </Button>
                        </div>

                        <div className="flex items-center text-xs text-gray-500">
                          <MapPinIcon size={12} className="mr-1" />
                          {property.location}
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">
                            Size: {property.size}
                          </span>
                          <span className="font-medium">{property.value}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>

            <TabsContent value="tokenized" className="space-y-4">
              {mapProperties
                .filter((p) => p.tokenized)
                .map((property) => (
                  <Card
                    key={property.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm line-clamp-2">
                            {property.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                          >
                            <EyeIcon size={12} />
                          </Button>
                        </div>

                        <div className="flex items-center text-xs text-gray-500">
                          <MapPinIcon size={12} className="mr-1" />
                          {property.location}
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">
                            Size: {property.size}
                          </span>
                          <span className="font-medium">{property.value}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MapView;
