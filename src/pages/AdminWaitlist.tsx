
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from '@/components/loading/LoadingSpinner';
import { MagnifyingGlass, ArrowLeft, Download } from 'phosphor-react';
import { Link } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  full_name?: string;
  user_type?: string;
  verification_status?: string;
  is_active?: boolean;
  is_verified?: boolean;
  created_at: string;
  last_sign_in_at?: string;
}

export default function AdminWaitlist() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const { toast } = useToast();

  const itemsPerPage = 15;

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, statusFilter, userTypeFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      let query = supabase.from('users').select('*', { count: 'exact' });

      // Apply filters
      if (searchTerm) {
        query = query.or(`email.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== 'all') {
        if (statusFilter === 'verified') {
          query = query.eq('is_verified', true);
        } else if (statusFilter === 'unverified') {
          query = query.eq('is_verified', false);
        } else if (statusFilter === 'active') {
          query = query.eq('is_active', true);
        } else if (statusFilter === 'inactive') {
          query = query.eq('is_active', false);
        }
      }

      if (userTypeFilter !== 'all') {
        query = query.eq('user_type', userTypeFilter);
      }

      // Get total count for pagination
      const { count } = await query;
      setTotalPages(Math.ceil((count || 0) / itemsPerPage));

      // Get paginated data
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const exportUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email, full_name, user_type, verification_status, is_verified, created_at, last_sign_in_at')
        .csv();

      if (error) throw error;

      // Create and download CSV file
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Export successful',
        description: 'Users data has been exported to CSV',
      });
    } catch (error) {
      console.error('Error exporting users:', error);
      toast({
        title: 'Export failed',
        description: 'Failed to export users data',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (user: User) => {
    if (!user.is_active) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (user.is_verified) {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
    }
    return <Badge className="bg-yellow-100 text-yellow-800">Unverified</Badge>;
  };

  const getUserTypeBadge = (userType?: string) => {
    const typeColors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      agent: 'bg-blue-100 text-blue-800',
      landowner: 'bg-green-100 text-green-800',
      investor: 'bg-orange-100 text-orange-800',
      verifier: 'bg-cyan-100 text-cyan-800'
    };

    return (
      <Badge className={typeColors[userType || ''] || 'bg-gray-100 text-gray-800'}>
        {userType || 'Unknown'}
      </Badge>
    );
  };

  if (loading) {
    return <LoadingSpinner text="Loading users..." />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin">
          <Button variant="ghost" size="sm">
            <ArrowLeft size={16} className="mr-2" />
            Back to Admin
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-gray-600">View and manage all platform users</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Platform Users</span>
            <Button onClick={exportUsers} variant="outline">
              <Download size={16} className="mr-2" />
              Export CSV
            </Button>
          </CardTitle>
          <CardDescription>
            All registered users with filtering and search options
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <MagnifyingGlass size={16} className="absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="unverified">Unverified</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="User Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="landowner">Landowner</SelectItem>
                <SelectItem value="investor">Investor</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
                <SelectItem value="verifier">Verifier</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Last Sign In</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.full_name || 'Not provided'}</TableCell>
                    <TableCell>{getUserTypeBadge(user.user_type)}</TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {user.last_sign_in_at 
                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                        : 'Never'
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          onClick={() => setCurrentPage(pageNum)}
                          isActive={currentPage === pageNum}
                          className="cursor-pointer"
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, users.length)} of {users.length} users
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
