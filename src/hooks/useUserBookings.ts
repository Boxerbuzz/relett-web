import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/queryClient";

export interface PropertyItem {
  id: string;
  title: string;
  location: any;
  property_images: Array<{ url: string; is_primary: boolean }>;
  backdrop: string | null;
  price: any;
  type: string | null;
  category: string | null;
  specification: any;
}

// Types
interface BookingItem {
  id: string;
  property_id: string;
  status: string;
  created_at: string;
  property?: PropertyItem;
  agent: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
  } | null;
}

export interface Inspection extends BookingItem {
  mode: string;
  when: string | null;
  notes: string | null;
  agent_id: string;
}

export interface Rental extends BookingItem {
  payment_plan: string;
  move_in_date: string | null;
  message?: string | null;
  payment_status: string;
  price: number | null;
  agent_id: string | null;
}

export interface Reservation extends BookingItem {
  from_date: string | null;
  to_date: string | null;
  adults: number | null;
  children: number | null;
  infants?: number | null;
  nights?: number | null;
  total?: number | null;
  fee?: number | null;
  caution_deposit?: number | null;
  note?: string | null;
  agent_id: string | null;
}

// Hooks
export function useUserInspections(userId: string) {
  return useQuery({
    queryKey: queryKeys.user.inspections(userId),
    queryFn: async (): Promise<Inspection[]> => {
      const { data, error } = await supabase
        .from("inspections")
        .select(
          `
          *,
          properties (
            id,
            title,
            location,
            backdrop,
            price,
            type, 
            category,
            property_images (
              url,
              is_primary
            ),
            specification
          ),
          agent:users!agent_id (
            id,
            first_name,
            last_name,
            email,
            phone,
            avatar
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map 'properties' to 'property'
      return (data || []).map((item) => ({
        ...item,
        property: {
          ...item.properties,
          title: item.properties.title || "",
          property_images: item.properties.property_images.map((img) => {
            return {
              url: img.url,
              is_primary: img.is_primary || false,
            };
          }),
        }, // <-- map to expected key
      }));
    },
    enabled: !!userId,
  });
}

export function useUserRentals(userId: string) {
  return useQuery({
    queryKey: queryKeys.user.rentals(userId),
    queryFn: async (): Promise<Rental[]> => {
      const { data, error } = await supabase
        .from("rentals")
        .select(
          `
          *,
          properties (
            id,
            title,
            location,
            property_images (
              url,
              is_primary
            )
          ),
          agent:users!agent_id (
            id,
            first_name,
            last_name,
            email,
            phone,
            avatar
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });
}

export function useUserReservations(userId: string) {
  return useQuery({
    queryKey: queryKeys.user.reservations(userId),
    queryFn: async (): Promise<Reservation[]> => {
      const { data, error } = await supabase
        .from("reservations")
        .select(
          `
          *,
          properties (
            id,
            title,
            location,
            backdrop,
            price,
            type, 
            category,
            property_images (
              url,
              is_primary
            ),
            specification
          ),
          agent:users!agent_id (
            id,
            first_name,
            last_name,
            email,
            phone,
            avatar
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map((item) => ({
        ...item,
        property: {
          ...item.properties,
          title: item.properties.title || "",
          property_images: item.properties.property_images.map((img) => {
            return {
              url: img.url,
              is_primary: img.is_primary || false,
            };
          }),
        }, // <-- map to expected key
      }));
    },
    enabled: !!userId,
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      type,
    }: {
      id: string;
      status: string;
      type: "inspection" | "rental" | "reservation";
    }) => {
      const table =
        type === "inspection"
          ? "inspections"
          : type === "rental"
          ? "rentals"
          : "reservations";

      const { error } = await supabase
        .from(table)
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      return { id, status, type };
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.inspections(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.rentals(),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.reservations(),
      });

      toast({
        title: "Success",
        description: `${data.type} status updated successfully`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update booking status",
        variant: "destructive",
      });
    },
  });
}
