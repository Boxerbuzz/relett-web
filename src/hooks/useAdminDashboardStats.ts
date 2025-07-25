
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, cacheConfig } from '@/lib/queryClient';

interface DashboardStats {
  totalUsers: number;
  pendingVerifications: number;
  totalProperties: number;
  monthlyRevenue: number;
  activeTokens: number;
  pendingDocuments: number;
  contactsCount: number;
  waitlistCount: number;
}

export function useAdminDashboardStats() {
  const {
    data: stats,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [...queryKeys.admin.analytics(), 'dashboard'],
    queryFn: async (): Promise<DashboardStats> => {
      // Current month calculation
      const currentMonth = new Date();
      currentMonth.setDate(1);

      // Parallel fetch all dashboard statistics using Promise.all
      const [
        usersCount,
        verificationsCount,
        propertiesCount,
        tokensCount,
        documentsCount,
        contactsCount,
        waitlistCount,
        paymentsData
      ] = await Promise.all([
        // Total users
        supabase
          .from("users")
          .select("*", { count: "exact", head: true }),
        
        // Pending verifications
        supabase
          .from("identity_verifications")
          .select("*", { count: "exact", head: true })
          .eq("verification_status", "pending"),
        
        // Total properties
        supabase
          .from("properties")
          .select("*", { count: "exact", head: true }),
        
        // Active tokenized properties
        supabase
          .from("tokenized_properties")
          .select("*", { count: "exact", head: true })
          .eq("status", "active"),
        
        // Pending documents
        supabase
          .from("property_documents")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        
        // Contacts count
        supabase
          .from("contacts_us")
          .select("*", { count: "exact", head: true }),
        
        // Waitlist count
        supabase
          .from("waitlist")
          .select("*", { count: "exact", head: true }),
        
        // Monthly payments
        supabase
          .from("payments")
          .select("amount")
          .eq("status", "completed")
          .gte("created_at", currentMonth.toISOString())
      ]);

      // Calculate monthly revenue
      const monthlyRevenue = paymentsData.data?.reduce(
        (sum, payment) => sum + payment.amount, 0
      ) || 0;

      return {
        totalUsers: usersCount.count || 0,
        pendingVerifications: verificationsCount.count || 0,
        totalProperties: propertiesCount.count || 0,
        monthlyRevenue: monthlyRevenue / 100, // Convert from cents
        activeTokens: tokensCount.count || 0,
        pendingDocuments: documentsCount.count || 0,
        contactsCount: contactsCount.count || 0,
        waitlistCount: waitlistCount.count || 0,
      };
    },
    ...cacheConfig.standard, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    stats: stats || {
      totalUsers: 0,
      pendingVerifications: 0,
      totalProperties: 0,
      monthlyRevenue: 0,
      activeTokens: 0,
      pendingDocuments: 0,
      contactsCount: 0,
      waitlistCount: 0,
    },
    isLoading,
    error: error?.message || null,
    refetch
  };
}
