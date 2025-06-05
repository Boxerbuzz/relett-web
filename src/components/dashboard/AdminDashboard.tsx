
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserManagement } from '@/components/admin/UserManagement';
import { PropertyVerificationQueue } from '@/components/admin/PropertyVerificationQueue';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  FileCheck, 
  Shield, 
  AlertTriangle, 
  Home,
  DollarSign,
  Activity
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  pendingVerifications: number;
  totalProperties: number;
  monthlyRevenue: number;
  activeTokens: number;
  pendingDocuments: number;
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingVerifications: 0,
    totalProperties: 0,
    monthlyRevenue: 0,
    activeTokens: 0,
    pendingDocuments: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      // Fetch pending verifications
      const { count: pendingVerifications } = await supabase
        .from('identity_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'pending');

      // Fetch total properties
      const { count: totalProperties } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

      // Fetch active tokenized properties
      const { count: activeTokens } = await supabase
        .from('tokenized_properties')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch pending documents
      const { count: pendingDocuments } = await supabase
        .from('property_documents')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Calculate monthly revenue (placeholder - you'd need a payments/revenue table)
      const currentMonth = new Date();
      currentMonth.setDate(1);
      
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', currentMonth.toISOString());

      const monthlyRevenue = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        pendingVerifications: pendingVerifications || 0,
        totalProperties: totalProperties || 0,
        monthlyRevenue: monthlyRevenue / 100, // Convert from cents
        activeTokens: activeTokens || 0,
        pendingDocuments: pendingDocuments || 0
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch dashboard statistics',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      {/* Header */}
      <div className="min-w-0">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users, properties, and system operations</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Platform users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.pendingVerifications}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? '...' : stats.totalProperties}</div>
            <p className="text-xs text-muted-foreground">Listed properties</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦{loading ? '...' : stats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <div className="w-full max-w-full overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-4 min-w-fit">
              <TabsTrigger value="overview" className="whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="users" className="whitespace-nowrap">Users</TabsTrigger>
              <TabsTrigger value="properties" className="whitespace-nowrap">Properties</TabsTrigger>
              <TabsTrigger value="verification" className="whitespace-nowrap">Verification</TabsTrigger>
            </TabsList>
          </div>

          <div className="w-full max-w-full overflow-hidden">
            <TabsContent value="overview" className="space-y-6 w-full max-w-full">
              {/* System Health */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg min-w-0">
                      <span className="text-sm font-medium truncate">API Status</span>
                      <Badge className="bg-green-100 text-green-800 ml-2 flex-shrink-0">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg min-w-0">
                      <span className="text-sm font-medium truncate">Database</span>
                      <Badge className="bg-green-100 text-green-800 ml-2 flex-shrink-0">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg min-w-0">
                      <span className="text-sm font-medium truncate">Storage</span>
                      <Badge className="bg-yellow-100 text-yellow-800 ml-2 flex-shrink-0">85% Used</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest system activities and user actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { action: 'New user registration', user: 'john@example.com', time: '2 minutes ago' },
                      { action: 'Property verification completed', user: 'admin', time: '15 minutes ago' },
                      { action: 'Token purchase', user: 'sarah@example.com', time: '1 hour ago' },
                      { action: 'Document uploaded', user: 'mike@example.com', time: '2 hours ago' },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b last:border-0 min-w-0">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{activity.action}</p>
                          <p className="text-xs text-gray-500 truncate">{activity.user}</p>
                        </div>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{activity.time}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-6 w-full max-w-full overflow-hidden">
              <UserManagement />
            </TabsContent>

            <TabsContent value="properties" className="space-y-6 w-full max-w-full overflow-hidden">
              <PropertyVerificationQueue />
            </TabsContent>

            <TabsContent value="verification" className="space-y-6 w-full max-w-full overflow-hidden">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5" />
                    Verification Queue
                  </CardTitle>
                  <CardDescription>Review pending verifications and documents</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 border rounded-lg min-w-0">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium">Identity Verifications</h4>
                        <p className="text-sm text-gray-600">Pending user identity verification</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <Badge variant="destructive">{stats.pendingVerifications}</Badge>
                        <Button size="sm">Review</Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 border rounded-lg min-w-0">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium">Document Reviews</h4>
                        <p className="text-sm text-gray-600">Property documents awaiting review</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <Badge variant="destructive">{stats.pendingDocuments}</Badge>
                        <Button size="sm">Review</Button>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 border rounded-lg min-w-0">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium">Property Verifications</h4>
                        <p className="text-sm text-gray-600">Properties pending verification</p>
                      </div>
                      <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                        <Badge variant="secondary">8</Badge>
                        <Button size="sm">Review</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
