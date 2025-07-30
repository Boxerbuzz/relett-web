"use client";

import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddLandTitleDialog } from "@/components/land-titles/AddLandTitleDialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  FileTextIcon,
  PlusIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface LandTitle {
  id: string;
  title_number: string;
  location_address: string;
  area_sqm: number;
  title_type: string;
  status: string;
}

interface LandTitleStepProps {
  form: UseFormReturn<any>;
}

export function LandTitleStep({ form }: LandTitleStepProps) {
  const { user } = useAuth();
  const [landTitles, setLandTitles] = useState<LandTitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const selectedLandTitleId = form.watch("land_title_id");

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
        .select("id, title_number, location_address, area_sqm, title_type, status")
        .eq("owner_id", user?.id || "")
        .eq("status", "verified")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLandTitles((data || []).map(item => ({ ...item, status: item.status || "verified" })));
    } catch (error) {
      console.error("Error fetching land titles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTitle = landTitles.find((title) => title.id === selectedLandTitleId);

  const getTitleTypeDisplay = (type: string) => {
    return type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800";
      case "pending_verification":
        return "bg-yellow-100 text-yellow-800";
      case "disputed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-2">Land Title Documentation</h3>
        <p className="text-gray-600">
          Link this property to an existing land title or create a new one. This is
          required for property tokenization.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : landTitles.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You don't have any verified land titles yet. You'll need to add one
            before tokenizing this property.{" "}
            <Link to="/land-titles" className="underline text-blue-600">
              Go to Land Titles Management
            </Link>{" "}
            or add one below.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="land_title_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Land Title</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an existing land title" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {landTitles.map((title) => (
                      <SelectItem key={title.id} value={title.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{title.title_number}</span>
                          <span className="text-sm text-gray-500">
                            {title.location_address} • {Number(title.area_sqm).toLocaleString()} sqm
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedTitle && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    Selected Land Title
                  </span>
                  <Badge className={getStatusColor(selectedTitle.status)}>
                    {selectedTitle.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Title Number:</span>
                    <p>{selectedTitle.title_number}</p>
                  </div>
                  <div>
                    <span className="font-medium">Title Type:</span>
                    <p>{getTitleTypeDisplay(selectedTitle.title_type)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Location:</span>
                    <p>{selectedTitle.location_address}</p>
                  </div>
                  <div>
                    <span className="font-medium">Area:</span>
                    <p>{Number(selectedTitle.area_sqm).toLocaleString()} sqm</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setAddDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <PlusIcon className="h-4 w-4" />
          Add New Land Title
        </Button>
        
        <Button
          type="button"
          variant="outline"
          asChild
        >
          <Link to="/land-titles" className="flex items-center gap-2">
            <FileTextIcon className="h-4 w-4" />
            Manage Land Titles
          </Link>
        </Button>
      </div>

      <AddLandTitleDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={fetchLandTitles}
      />
    </div>
  );
}