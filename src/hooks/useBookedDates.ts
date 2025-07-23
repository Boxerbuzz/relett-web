
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { queryKeys, cacheConfig } from "@/lib/queryClient";

interface BookedDateRange {
  from_date: string;
  to_date: string;
  id: string;
}

export function useBookedDates(propertyId: string) {
  return useQuery({
    queryKey: queryKeys.properties.bookedDates(propertyId),
    queryFn: async (): Promise<BookedDateRange[]> => {
      if (!propertyId) return [];

      const { data, error } = await supabase
        .from("reservations")
        .select("id, from_date, to_date")
        .eq("property_id", propertyId)
        .eq("status", "confirmed")
        .not("from_date", "is", null)
        .not("to_date", "is", null)
        .order("from_date", { ascending: true });

      if (error) throw error;

      return data || [];
    },
    enabled: !!propertyId,
    ...cacheConfig.standard,
  });
}
