import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import * as z from "zod";
import { useCreateVerificationTasks } from "./usePropertyVerificationTasks";

export const propertySchema = z.object({
  id: z.string().uuid(),
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters")
    .regex(/^[a-zA-Z0-9\s\-,.']+$/, "Title contains invalid characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must be less than 1000 characters"),
  type: z.enum(["residential", "commercial", "industrial", "land"], {
    required_error: "Property type is required",
  }),
  sub_type: z
    .string()
    .min(1, "Sub-type is required")
    .max(50, "Sub-type must be less than 50 characters"),
  category: z.enum(["sell", "rent", "shortlet", "lease"], {
    required_error: "Listing category is required",
  }),
  condition: z.enum(["newlyBuilt", "renovated", "good", "needs_renovation"], {
    required_error: "Property condition is required",
  }),
  price: z.object({
    amount: z
      .number()
      .min(1000, "Price must be at least ₦1,000")
      .max(1000000000, "Price cannot exceed ₦1 billion"),
    currency: z.string().default("NGN"),
    term: z.enum(["night", "week", "month", "year"]).default("month"),
    deposit: z.number().optional(),
    service_charge: z.number().optional(),
    is_negotiable: z.boolean().default(false),
  }),
  location: z.object({
    address: z
      .string()
      .min(5, "Address must be at least 5 characters")
      .max(200, "Address must be less than 200 characters"),
    city: z
      .string()
      .min(2, "City must be at least 2 characters")
      .max(50, "City must be less than 50 characters")
      .regex(/^[a-zA-Z\s\-']+$/, "City contains invalid characters"),
    state: z
      .string()
      .min(2, "State must be at least 2 characters")
      .max(50, "State must be less than 50 characters")
      .regex(/^[a-zA-Z\s\-']+$/, "State contains invalid characters"),
    country: z
      .string()
      .min(2, "Country must be at least 2 characters")
      .max(50, "Country must be less than 50 characters")
      .regex(/^[a-zA-Z\s\-']+$/, "Country contains invalid characters"),
    coordinates: z
      .object({
        lat: z.number().min(-90).max(90).optional(),
        lng: z.number().min(-180).max(180).optional(),
      })
      .optional(),
    landmark: z.string().optional(),
    postal_code: z.string().optional(),
  }),
  specification: z.object({
    bedrooms: z.number().min(0).max(20).optional(),
    bathrooms: z.number().min(0).max(20).optional(),
    toilets: z.number().min(0).max(20).optional(),
    parking: z.number().min(0).max(50).optional(),
    garages: z.number().min(0).max(50).optional(),
    floors: z.number().min(0).max(100).optional(),
    units: z.number().min(0).max(1000).optional(),
    area: z.number().min(0).optional(),
    area_unit: z.string().optional(),
    year_built: z
      .number()
      .min(1800, "Year built cannot be before 1800")
      .max(new Date().getFullYear(), `Year built cannot be in the future`)
      .optional(),
    is_furnished: z.boolean().default(false),
    full_bedroom_count: z.number().min(0).max(20).optional(),
    full_bathroom_count: z.number().min(0).max(20).optional(),
  }),
  sqrft: z.string().optional(),
  land_title_id: z.string().optional(),
  max_guest: z.number().min(0).max(50).optional(),
  features: z.array(z.string().min(1, "Feature cannot be empty")).default([]),
  amenities: z.array(z.string().min(1, "Amenity cannot be empty")).default([]),
  documents: z
    .array(
      z.object({
        type: z.enum([
          "deed",
          "survey",
          "certificate_of_occupancy",
          "other",
          "tax_clearance",
        ]),
        name: z.string().min(1, "Document filename is required"),
        url: z.string().url("Invalid document URL"),
        path: z.string().optional(),
        id: z.string().optional(),
        size: z.number().optional(),
        uploadedAt: z.string().optional(),
        required: z.boolean().optional(),
        hash: z.string().optional(),
        mime_type: z.string().optional(),
      })
    )
    .default([]),
  images: z
    .array(
      z.object({
        url: z.string().url("Invalid image URL"),
        is_primary: z.boolean().default(false),
        category: z.string().default("general"),
        name: z.string().default(""),
        size: z.number().default(0),
        path: z.string().default(""),
      })
    )
    .min(1, "At least one image is required"),
  tags: z.array(z.string()).default([]),
  is_exclusive: z.boolean().default(false),
  is_featured: z.boolean().default(false),
});

export type PropertyFormData = z.infer<typeof propertySchema>;

export const steps = [
  { title: "Basic Details", description: "Property information" },
  { title: "Location", description: "Address and coordinates" },
  { title: "Specifications", description: "Size and features" },
  { title: "Documents", description: "Legal documents" },
  { title: "Media", description: "Photos and videos" },
  { title: "Review", description: "Confirm details" },
];

export function usePropertyCreation() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { mutate: createVerificationTask } = useCreateVerificationTasks();

  // New reusable function for creating property documents
  const createPropertyDocuments = async (
    propertyId: string,
    documents: PropertyFormData["documents"]
  ) => {
    if (!documents || documents.length === 0) {
      return { success: true, error: null };
    }

    try {
      const documentInserts = documents.map((doc) => ({
        property_id: propertyId,
        document_name: doc.name || "",
        document_type: doc.type || "",
        file_url: doc.url || "",
        file_path: doc.path || "",
        mime_type: doc.mime_type || "",
        file_size: doc.size || 0,
        document_hash: doc.hash || "",
        status: "pending" as const,
      }));

      const { error: documentError } = await supabase
        .from("property_documents")
        .insert(documentInserts);

      if (documentError) {
        console.error("Error storing documents:", documentError);
        return { success: false, error: documentError };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Error creating property documents:", error);
      return { success: false, error };
    }
  };

  // New reusable function for creating property images
  const createPropertyImages = async (
    propertyId: string,
    images: PropertyFormData["images"]
  ) => {
    if (!images || images.length === 0) {
      return { success: true, error: null };
    }

    try {
      const imageInserts = images.map((img) => ({
        property_id: propertyId,
        url: img.url,
        is_primary: img.is_primary,
        category: img.category,
      }));

      const { error: imageError } = await supabase
        .from("property_images")
        .insert(imageInserts);

      if (imageError) {
        console.error("Error storing images:", imageError);
        return { success: false, error: imageError };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error("Error creating property images:", error);
      return { success: false, error };
    }
  };

  const createProperty = async (
    data: PropertyFormData
  ): Promise<PropertyFormData | null> => {
    setIsLoading(true);
    console.log("Submitting property:", data);
    try {
      const coordinates =
        data.location.coordinates?.lat && data.location.coordinates?.lng
          ? {
              lat: data.location.coordinates.lat,
              lng: data.location.coordinates.lng,
            }
          : null;

      // Convert price values to kobo (smallest currency unit)
      const convertedPrice = {
        amount: Math.round((data.price.amount || 0) * 100), // Convert to kobo
        currency: data.price.currency || "NGN",
        term: data.price.term || "month",
        deposit: data.price.deposit ? Math.round(data.price.deposit * 100) : 0,
        service_charge: data.price.service_charge
          ? Math.round(data.price.service_charge * 100)
          : 0,
        is_negotiable: data.price.is_negotiable || false,
      };

      // Create property with all fields properly mapped
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert({
          user_id: user.id,
          title: data.title,
          description: data.description,
          type: data.type,
          sub_type: data.sub_type,
          category: data.category,
          condition: data.condition,
          status: "pending",
          location: {
            address: data.location.address,
            city: data.location.city,
            state: data.location.state,
            country: data.location.country,
            coordinates,
            landmark: data.location.landmark || "",
            postal_code: data.location.postal_code || "",
          },
          backdrop: data.images[0].url,
          specification: data.specification,
          price: convertedPrice,
          sqrft: data.sqrft || "",
          max_guest: data.max_guest || 0,
          features: data.features,
          amenities: data.amenities,
          tags: data.tags,
          is_exclusive: data.is_exclusive,
          is_featured: data.is_featured,
          garages: data.specification.garages || 0,
          year_built: new Date(
            data.specification.year_built || new Date().getFullYear()
          ).toISOString(),
          land_title_id: data.land_title_id || null,
        })
        .select()
        .single();

      if (propertyError) throw propertyError;

      // Create images using the new function
      const imageResult = await createPropertyImages(property.id, data.images);
      if (!imageResult.success) {
        console.error("Failed to create property images:", imageResult.error);
        // You might want to handle this error appropriately
      }

      // Create documents using the new function
      const documentResult = await createPropertyDocuments(
        property.id,
        data.documents
      );
      if (!documentResult.success) {
        console.error(
          "Failed to create property documents:",
          documentResult.error
        );
        // You might want to handle this error appropriately
      }

      createVerificationTask(property.id);

      return {
        ...property,
        documents: [],
        images: [],
        title: data.title,
        description: data.description,
        type: data.type,
        sub_type: data.sub_type,
        category: data.category,
        condition: data.condition,
        price: convertedPrice,
        specification: data.specification,
        sqrft: data.sqrft || "",
        max_guest: data.max_guest || 0,
        features: data.features,
        amenities: data.amenities,
        tags: data.tags,
        is_exclusive: data.is_exclusive,
        is_featured: data.is_featured,
        location: data.location,
      };
    } catch (error) {
      console.error("Error submitting property:", error);
      toast({
        title: "Error",
        description: "Failed to create property. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const createPaymentSession = async (amount: number, purpose: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-payment-session",
        {
          body: {
            amount,
            currency: "USD",
            purpose,
            metadata: { timestamp: Date.now() },
          },
        }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Payment session error:", error);
      throw error;
    }
  };

  const tokenizeProperty = async (propertyId: string, tokenDetails: any) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        "create-hedera-token",
        {
          body: {
            tokenizedPropertyId: propertyId,
            tokenName: tokenDetails.name,
            tokenSymbol: tokenDetails.symbol,
            totalSupply: tokenDetails.supply,
          },
        }
      );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Tokenization error:", error);
      throw error;
    }
  };

  return {
    createProperty,
    createPropertyDocuments, // Export the new function
    createPropertyImages, // Export the new function
    createPaymentSession,
    tokenizeProperty,
    isLoading,
  };
}
