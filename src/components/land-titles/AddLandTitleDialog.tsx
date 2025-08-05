"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const landTitleSchema = z.object({
  title_number: z.string().min(1, "Title number is required"),
  title_type: z.enum(["certificate_of_occupancy", "deed_of_assignment", "grant_of_probate", "survey_plan"]),
  location_address: z.string().min(1, "Location is required"),
  area_sqm: z.number().min(1, "Area must be greater than 0"),
  acquisition_date: z.string().min(1, "Acquisition date is required"),
  acquisition_method: z.string().min(1, "Acquisition method is required"),
  description: z.string().optional(),
  state: z.string().min(1, "State is required"),
  lga: z.string().min(1, "LGA is required"),
  land_use: z.string().min(1, "Land use is required"),
});

type LandTitleFormData = z.infer<typeof landTitleSchema>;

interface AddLandTitleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddLandTitleDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddLandTitleDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LandTitleFormData>({
    resolver: zodResolver(landTitleSchema),
    defaultValues: {
      title_number: "",
      title_type: "certificate_of_occupancy",
      location_address: "",
      area_sqm: 0,
      acquisition_date: "",
      acquisition_method: "",
      description: "",
      state: "",
      lga: "",
      land_use: "",
    },
  });

  const onSubmit = async (data: LandTitleFormData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add a land title",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("land_titles").insert({
        title_number: data.title_number,
        title_type: data.title_type,
        location_address: data.location_address,
        area_sqm: data.area_sqm,
        acquisition_date: data.acquisition_date,
        acquisition_method: data.acquisition_method,
        description: data.description || "",
        state: data.state,
        lga: data.lga,
        land_use: data.land_use,
        owner_id: user.id,
        status: "verified",
        coordinates: { lat: 0, lng: 0 }, // Default coordinates
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Land title added successfully",
      });

      form.reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error adding land title:", error);
      toast({
        title: "Error",
        description: "Failed to add land title",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent size="lg">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Add Land Title</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., RT-123456/2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select title type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="certificate_of_occupancy">
                          Certificate of Occupancy
                        </SelectItem>
                        <SelectItem value="deed_of_assignment">
                          Deed of Assignment
                        </SelectItem>
                        <SelectItem value="grant_of_probate">
                          Grant of Probate
                        </SelectItem>
                        <SelectItem value="survey_plan">Survey Plan</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="area_sqm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area (Square Meters) *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="1000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="acquisition_method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Acquisition Method *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Purchase, Inheritance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Address *</FormLabel>
                  <FormControl>
                    <Input placeholder="Property location/address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Lagos" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lga"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LGA *</FormLabel>
                    <FormControl>
                      <Input placeholder="Local Government Area" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="land_use"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Land Use *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Residential, Commercial" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="acquisition_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Acquisition Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional details about the land title..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <ResponsiveDialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add Land Title"}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}