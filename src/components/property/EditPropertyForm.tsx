import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  propertySchema,
  PropertyFormData,
} from "@/hooks/usePropertyCreation";
import { BasicDetailsStep } from "./steps/BasicDetailsStep";
import { LocationStep } from "./steps/LocationStep";
// import { SpecificationsStep } from "./steps/SpecificationsStep";
import { DocumentsStep } from "./steps/DocumentsStep";
import { MediaStep } from "./steps/MediaStep";

interface EditPropertyFormProps {
  propertyId: string;
}

export function EditPropertyForm({ propertyId }: EditPropertyFormProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertySchema),
    mode: "onChange",
  });

  // Load property data
  useEffect(() => {
    const loadProperty = async () => {
      try {
        setLoading(true);
        
        // Get property data
        const { data: property, error: propertyError } = await supabase
          .from("properties")
          .select(`
            *,
            property_images(*),
            property_documents(*)
          `)
          .eq("id", propertyId)
          .single();

        if (propertyError) {
          throw propertyError;
        }

        if (!property) {
          toast({
            title: "Property not found",
            variant: "destructive",
          });
          navigate("/my-properties");
          return;
        }

        // Transform data to match form structure
        const priceData = typeof property.price === 'object' && property.price ? property.price as any : {};
        const locationData = typeof property.location === 'object' && property.location ? property.location as any : {};
        const specData = typeof property.specification === 'object' && property.specification ? property.specification as any : {};

        const formData: PropertyFormData = {
          id: property.id,
          title: property.title || "",
          description: property.description || "",
          type: property.type as "residential" | "commercial" | "industrial" | "land",
          sub_type: property.sub_type || "",
          category: property.category as "sell" | "rent" | "shortlet" | "lease",
          condition: (property.condition || "good") as "newlyBuilt" | "renovated" | "good" | "needs_renovation",
          price: {
            amount: priceData.amount || 0,
            currency: priceData.currency || "NGN",
            term: priceData.term || "month",
            deposit: priceData.deposit || 0,
            service_charge: priceData.service_charge || 0,
            is_negotiable: priceData.is_negotiable || false,
          },
          location: {
            address: locationData.address || "",
            city: locationData.city || "",
            state: locationData.state || "",
            country: locationData.country || "Nigeria",
            postal_code: locationData.postal_code || "",
            coordinates: {
              lat: locationData.latitude || 0,
              lng: locationData.longitude || 0,
            },
            landmark: locationData.landmark || "",
          },
          specification: {
            area: specData.area || 0,
            area_unit: (specData.area_unit || "sqm") as "sqm" | "sqft" | "acres" | "hectares",
            bedrooms: specData.bedrooms || 0,
            bathrooms: specData.bathrooms || 0,
            toilets: specData.toilets || 0,
            floors: specData.floors || 1,
            garages: property.garages || 0,
            year_built: property.year_built ? new Date(property.year_built).getFullYear() : new Date().getFullYear(),
            is_furnished: specData.is_furnished || false,
            units: specData.units || 1,
            full_bedroom_count: specData.full_bedroom_count || 0,
            full_bathroom_count: specData.full_bathroom_count || 0,
          },
          features: property.features || [],
          amenities: property.amenities || [],
          tags: property.tags || [],
          images: property.property_images?.map((img: any) => ({
            path: img.url,
            name: img.url.split('/').pop() || 'image',
            size: 0,
            category: img.category || "exterior",
            url: img.url,
            is_primary: img.is_primary,
          })) || [],
          documents: property.property_documents?.map((doc: any) => ({
            name: doc.document_name,
            type: doc.document_type,
            url: doc.file_url,
            size: doc.file_size || 0,
            mime_type: doc.mime_type || '',
          })) || [],
          max_guest: property.max_guest || 0,
          is_exclusive: property.is_exclusive || false,
          is_featured: property.is_featured || false,
        };

        // Set form values
        form.reset(formData);
      } catch (error) {
        console.error("Error loading property:", error);
        toast({
          title: "Error loading property",
          description: "Could not load property data.",
          variant: "destructive",
        });
        navigate("/my-properties");
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [propertyId, form, toast, navigate]);

  const onSubmit = async (data: PropertyFormData) => {
    try {
      setSaving(true);

      // Update property data
      const { error: updateError } = await supabase
        .from("properties")
        .update({
          title: data.title,
          description: data.description,
          type: data.type,
          sub_type: data.sub_type,
          category: data.category,
          condition: data.condition,
          price: data.price,
          location: data.location,
          specification: data.specification,
          features: data.features,
          amenities: data.amenities,
          tags: data.tags,
          max_guest: data.max_guest,
          is_exclusive: data.is_exclusive,
          is_featured: data.is_featured,
          garages: data.specification.garages,
          year_built: new Date(data.specification.year_built || new Date().getFullYear(), 0, 1).toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", propertyId);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Property updated",
        description: "Your property has been successfully updated.",
      });

      navigate("/my-properties");
    } catch (error) {
      console.error("Error updating property:", error);
      toast({
        title: "Error updating property",
        description: "Could not update property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading property...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/my-properties")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to My Properties
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Property</h1>
        <p className="text-gray-600 mt-2">
          Update your property information and settings.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Details */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
            </CardHeader>
            <CardContent>
              <BasicDetailsStep form={form} />
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent>
              <LocationStep form={form} />
            </CardContent>
          </Card>

          {/* Specifications */}
          <Card>
            <CardHeader>
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Property specifications will be available in the next update.
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentsStep form={form} />
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent>
              <MediaStep form={form} />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/my-properties")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}