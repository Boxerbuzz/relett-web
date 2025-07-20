"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PropertyMobileCard } from "./PropertyMobileCard";
import {
  Search,
  Home,
  MapPin,
  Edit,
  Trash2,
  Eye,
  DollarSign,
} from "lucide-react";

interface Property {
  id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  location: any;
  price: any;
  created_at: string;
  is_verified: boolean;
  is_featured: boolean;
  is_tokenized: boolean;
  views: number;
  likes: number;
  user_id: string;
  users?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export function PropertyManagement() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(
          `
          *,
          users:user_id (
            first_name,
            last_name,
            email
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties((data as Property[]) || []);
    } catch (error) {
      console.error("Error fetching properties:", error);
      toast({
        title: "Error",
        description: "Failed to fetch properties",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProperty = async (
    propertyId: string,
    updates: Partial<Property>
  ) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update(updates)
        .eq("id", propertyId);

      if (error) throw error;

      setProperties(
        properties.map((property) =>
          property.id === propertyId ? { ...property, ...updates } : property
        )
      );

      toast({
        title: "Success",
        description: "Property updated successfully",
      });
    } catch (error) {
      console.error("Error updating property:", error);
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive",
      });
    }
  };

  const deleteProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ is_deleted: true })
        .eq("id", propertyId);

      if (error) throw error;

      setProperties(properties.filter((p) => p.id !== propertyId));

      toast({
        title: "Success",
        description: "Property deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "Error",
        description: "Failed to delete property",
        variant: "destructive",
      });
    }
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location?.city
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      property.users?.first_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      property.users?.last_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || property.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <Badge
        className={
          colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {status}
      </Badge>
    );
  };

  const getVerificationBadge = (isVerified: boolean) => {
    return isVerified ? (
      <Badge className="bg-blue-100 text-blue-800">Verified</Badge>
    ) : (
      <Badge variant="secondary">Unverified</Badge>
    );
  };

  const stats = {
    total: properties.length,
    active: properties.filter((p) => p.status === "active").length,
    verified: properties.filter((p) => p.is_verified).length,
    featured: properties.filter((p) => p.is_featured).length,
    tokenized: properties.filter((p) => p.is_tokenized).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Property Management</h2>
          <p className="text-gray-600">
            Manage all property listings on the platform
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Home className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">
                  Total Properties
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold">{stats.verified}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Featured</p>
                <p className="text-2xl font-bold">{stats.featured}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Tokenized</p>
                <p className="text-2xl font-bold">{stats.tokenized}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search properties, locations, or owners..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Properties ({filteredProperties.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-8">Loading properties...</div>
          ) : (
            <>
              {/* Mobile Cards - Show on small screens */}
              <div className="md:hidden space-y-4 p-4">
                {filteredProperties.map((property) => (
                  <PropertyMobileCard
                    key={property.id}
                    property={property}
                    onEdit={(property) => {
                      setSelectedProperty(property);
                      setIsEditDialogOpen(true);
                    }}
                    onDelete={deleteProperty}
                  />
                ))}
              </div>

              {/* Desktop Table - Hide on small screens */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Owner</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.map((property) => (
                      <TableRow key={property.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {property.title || "Untitled Property"}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {`${property.location?.city}, ${property.location?.state}` ||
                                "Location not specified"}
                            </div>
                            <div className="flex gap-1 mt-1">
                              {property.is_verified && (
                                <Badge variant="outline" className="text-xs">
                                  Verified
                                </Badge>
                              )}
                              {property.is_featured && (
                                <Badge variant="outline" className="text-xs">
                                  Featured
                                </Badge>
                              )}
                              {property.is_tokenized && (
                                <Badge variant="outline" className="text-xs">
                                  Tokenized
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {property.users?.first_name}{" "}
                              {property.users?.last_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {property.users?.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{property.type}</Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(property.status)}</TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {property.price?.currency}{" "}
                            {(property.price?.amount / 100)?.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{property.views || 0} views</div>
                            <div>{property.likes || 0} likes</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog
                              open={
                                isEditDialogOpen &&
                                selectedProperty?.id === property.id
                              }
                              onOpenChange={(open) => {
                                setIsEditDialogOpen(open);
                                if (open) {
                                  setSelectedProperty(property);
                                } else {
                                  setSelectedProperty(null);
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl">
                                <DialogHeader>
                                  <DialogTitle>Edit Property</DialogTitle>
                                  <DialogDescription>
                                    Manage property settings and features
                                  </DialogDescription>
                                </DialogHeader>

                                {selectedProperty && (
                                  <div className="space-y-6">
                                    {/* Property Status Controls */}
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          checked={selectedProperty.is_verified}
                                          onCheckedChange={(checked) =>
                                            updateProperty(
                                              selectedProperty.id,
                                              { is_verified: checked }
                                            )
                                          }
                                        />
                                        <Label>Verified</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Switch
                                          checked={selectedProperty.is_featured}
                                          onCheckedChange={(checked) =>
                                            updateProperty(
                                              selectedProperty.id,
                                              { is_featured: checked }
                                            )
                                          }
                                        />
                                        <Label>Featured</Label>
                                      </div>
                                    </div>

                                    {/* Status Update */}
                                    <div>
                                      <Label className="text-base font-medium">
                                        Property Status
                                      </Label>
                                      <Select
                                        value={selectedProperty.status}
                                        onValueChange={(status) =>
                                          updateProperty(selectedProperty.id, {
                                            status,
                                          })
                                        }
                                      >
                                        <SelectTrigger className="w-full mt-2">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="active">
                                            Active
                                          </SelectItem>
                                          <SelectItem value="inactive">
                                            Inactive
                                          </SelectItem>
                                          <SelectItem value="pending">
                                            Pending
                                          </SelectItem>
                                          <SelectItem value="rejected">
                                            Rejected
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    {/* Property Details */}
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                      <div>
                                        <Label className="text-sm text-gray-500">
                                          Created
                                        </Label>
                                        <p className="font-medium">
                                          {new Date(
                                            selectedProperty.created_at
                                          ).toLocaleDateString()}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-sm text-gray-500">
                                          Views
                                        </Label>
                                        <p className="font-medium">
                                          {selectedProperty.views || 0}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-sm text-gray-500">
                                          Likes
                                        </Label>
                                        <p className="font-medium">
                                          {selectedProperty.likes || 0}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="text-sm text-gray-500">
                                          Category
                                        </Label>
                                        <p className="font-medium">
                                          {selectedProperty.category}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => deleteProperty(property.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
