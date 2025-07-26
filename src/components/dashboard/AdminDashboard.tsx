
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TokenApprovalManagement } from "@/components/admin/TokenApprovalManagement";
import { supabase } from "@/integrations/supabase/client";

interface DashboardStats {
  totalUsers: number;
  totalProperties: number;
  pendingTokenApprovals: number;
  totalTokenValue: number;
  pendingVerifications: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProperties: 0,
    pendingTokenApprovals: 0,
    totalTokenValue: 0,
    pendingVerifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Get total users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Get total properties count
      const { count: propertiesCount } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Get pending token approvals by querying tokenized_properties directly
      const { data: pendingTokens } = await supabase
        .from('tokenized_properties')
        .select('id')
        .in('status', ['draft', 'pending_approval']);
      
      // Get total token value
      const { data: tokenValues } = await supabase
        .from('tokenized_properties')
        .select('total_value_usd')
        .in('status', ['minted', 'active']);

      const totalValue = tokenValues?.reduce((sum, token) => sum + (token.total_value_usd || 0), 0) || 0;

      // Get pending verifications
      const { count: pendingVerifications } = await supabase
        .from('identity_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'pending');

      setStats({
        totalUsers: usersCount || 0,
        totalProperties: propertiesCount || 0,
        pendingTokenApprovals: pendingTokens?.length || 0,
        totalTokenValue: totalValue,
        pendingVerifications: pendingVerifications || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users, properties, and token approvals
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.totalUsers.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.totalProperties.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tokens</CardTitle>
            <div className="flex items-center gap-2">
              {stats.pendingTokenApprovals > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {stats.pendingTokenApprovals}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.pendingTokenApprovals}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Token Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : formatCurrency(stats.totalTokenValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total tokenized value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verifications</CardTitle>
            <div className="flex items-center gap-2">
              {stats.pendingVerifications > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {stats.pendingVerifications}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.pendingVerifications}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Token Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Token Management
            {stats.pendingTokenApprovals > 0 && (
              <Badge variant="destructive" className="ml-2 text-xs">
                {stats.pendingTokenApprovals}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Review and approve tokenization requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TokenApprovalManagement />
        </CardContent>
      </Card>
    </div>
  );
}
