"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddLandTitleDialog } from "./AddLandTitleDialog";
// import { ViewLandTitleDialog } from "./ViewLandTitleDialog";
// import { LinkPropertyDialog } from "./LinkPropertyDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileTextIcon,
  EyeIcon,
  LinkIcon,
  PlusIcon,
  HouseIcon,
  MapPinAreaIcon,
  CalendarBlankIcon,
  SquareIcon,
} from "@phosphor-icons/react";
import { capitalize } from "@/lib/utils";

interface LandTitle {
  id: string;
  title_number: string;
  owner_id: string;
  coordinates: any;
  area_sqm: number;
  description: string;
  location_address: string;
  state: string;
  lga: string;
  land_use: string;
  title_type: string;
  acquisition_date: string;
  acquisition_method: string;
  previous_title_id?: string;
  status: string;
  blockchain_hash?: string;
  blockchain_transaction_id?: string;
  verification_metadata?: any;
  created_at: string;
  updated_at: string;
  properties?: any[];
}

export function LandTitleManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [landTitles, setLandTitles] = useState<LandTitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<LandTitle | null>(null);

  useEffect(() => {
    if (user) {
      fetchLandTitles();
    }
  }, [user]);

  const fetchLandTitles = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("land_titles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLandTitles((data as LandTitle[]) || []);
    } catch (error) {
      console.error("Error fetching land titles:", error);
      toast({
        title: "Error",
        description: "Failed to fetch land titles",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (title: LandTitle) => {
    setSelectedTitle(title);
    setViewDialogOpen(true);
  };

  const handleLinkProperty = (title: LandTitle) => {
    setSelectedTitle(title);
    setLinkDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "disputed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTitleTypeColor = (type: string) => {
    switch (type) {
      case "certificate_of_occupancy":
        return "bg-blue-100 text-blue-800";
      case "deed_of_assignment":
        return "bg-purple-100 text-purple-800";
      case "grant_of_probate":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Your Land Titles</h2>
          <p className="text-sm text-gray-600">
            Manage property deeds and documentation
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Land Title
        </Button>
      </div>

      {landTitles.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Land Titles
            </h3>
            <p className="text-gray-600 mb-4">
              Start by adding your first land title or property deed
            </p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add First Land Title
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="grid" className="space-y-4">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {landTitles.map((title) => (
                <Card
                  key={title.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {title.title_number}
                        </CardTitle>
                        <p className="text-sm text-gray-600">
                          {title.location_address}
                        </p>
                      </div>
                      <Badge className={getStatusColor(title.status)}>
                        {capitalize(title.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Badge
                        variant="outline"
                        className={getTitleTypeColor(title.title_type)}
                      >
                        {title.title_type.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPinAreaIcon className="h-4 w-4 mr-1" />{" "}
                        {title.location_address}
                      </div>
                      <div className="flex items-center gap-2">
                        <SquareIcon className="h-4 w-4 mr-1" />{" "}
                        {Number(title.area_sqm)?.toLocaleString()} sqm
                      </div>
                      <div className="flex items-center gap-2">
                        <CalendarBlankIcon className="h-4 w-4 mr-1" />{" "}
                        {new Date(title.acquisition_date).toLocaleDateString()}
                      </div>
                    </div>

                    {title.properties && title.properties.length > 0 && (
                      <div className="border-t pt-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <HouseIcon className="h-4 w-4" />
                          {title.properties.length} linked property(ies)
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(title)}
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleLinkProperty(title)}
                        disabled
                      >
                        <LinkIcon className="h-4 w-4 mr-1" />
                        Link Property
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="table">
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title Number</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Area (sqm)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Properties</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {landTitles.map((title) => (
                    <TableRow key={title.id}>
                      <TableCell className="font-medium">
                        {title.title_number}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getTitleTypeColor(title.title_type)}
                        >
                          {title.title_type.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{title.location_address}</TableCell>
                      <TableCell>
                        {Number(title.area_sqm)?.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(title.status)}>
                          {title.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {title.properties?.length || 0} linked
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleView(title)}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLinkProperty(title)}
                            disabled
                          >
                            <LinkIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Dialogs */}
      <AddLandTitleDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={fetchLandTitles}
      />

      {/* TODO: Implement dialogs */}
    </div>
  );
}
