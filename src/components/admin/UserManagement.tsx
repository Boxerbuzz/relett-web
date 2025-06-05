
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Search, UserPlus, Shield, AlertTriangle } from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  is_active: boolean;
  is_verified: boolean;
  verification_status: 'pending' | 'verified' | 'rejected' | 'unverified' | 'expired';
  created_at: string;
  phone: string | null;
}

interface UserRole {
  id: string;
  role: 'admin' | 'landowner' | 'verifier' | 'agent' | 'investor';
  is_active: boolean;
  assigned_at: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

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

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setUserRoles(data || []);
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  const updateUserStatus = async (userId: string, updates: Partial<User>) => {
    try {
      // Ensure verification_status is properly typed
      const cleanUpdates = {
        ...updates,
        verification_status: updates.verification_status as 'pending' | 'verified' | 'rejected' | 'unverified' | 'expired'
      };

      const { error } = await supabase
        .from('users')
        .update(cleanUpdates)
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));

      toast({
        title: 'Success',
        description: 'User updated successfully'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: 'Failed to update user',
        variant: 'destructive'
      });
    }
  };

  const assignRole = async (userId: string, role: 'admin' | 'landowner' | 'verifier' | 'agent' | 'investor') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role: role,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Role ${role} assigned successfully`
      });
      
      if (selectedUser?.id === userId) {
        fetchUserRoles(userId);
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: 'Error',
        description: 'Failed to assign role',
        variant: 'destructive'
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (user: User) => {
    if (!user.is_active) return <Badge variant="destructive">Inactive</Badge>;
    if (!user.is_verified) return <Badge variant="secondary">Unverified</Badge>;
    return <Badge className="bg-green-100 text-green-800">Active</Badge>;
  };

  const getRoleBadge = (userType: string) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      verifier: 'bg-blue-100 text-blue-800',
      agent: 'bg-purple-100 text-purple-800',
      landowner: 'bg-green-100 text-green-800',
      investor: 'bg-yellow-100 text-yellow-800'
    };
    return <Badge className={colors[userType as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>{userType}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-gray-600">Manage user accounts, roles, and permissions</p>
        </div>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.first_name} {user.last_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.user_type)}</TableCell>
                    <TableCell>{getStatusBadge(user)}</TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog 
                          open={isEditDialogOpen && selectedUser?.id === user.id} 
                          onOpenChange={(open) => {
                            setIsEditDialogOpen(open);
                            if (open) {
                              setSelectedUser(user);
                              fetchUserRoles(user.id);
                            } else {
                              setSelectedUser(null);
                            }
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Edit User: {user.first_name} {user.last_name}</DialogTitle>
                              <DialogDescription>
                                Manage user details, roles, and permissions
                              </DialogDescription>
                            </DialogHeader>
                            
                            {selectedUser && (
                              <div className="space-y-6">
                                {/* User Status Controls */}
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={selectedUser.is_active}
                                      onCheckedChange={(checked) => 
                                        updateUserStatus(selectedUser.id, { is_active: checked })
                                      }
                                    />
                                    <Label>Active Account</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      checked={selectedUser.is_verified}
                                      onCheckedChange={(checked) => 
                                        updateUserStatus(selectedUser.id, { is_verified: checked })
                                      }
                                    />
                                    <Label>Verified Account</Label>
                                  </div>
                                </div>

                                {/* Role Assignment */}
                                <div>
                                  <Label className="text-base font-medium">Assign Additional Role</Label>
                                  <div className="flex gap-2 mt-2">
                                    <Select onValueChange={(role: 'admin' | 'landowner' | 'verifier' | 'agent' | 'investor') => assignRole(selectedUser.id, role)}>
                                      <SelectTrigger className="w-48">
                                        <SelectValue placeholder="Select role" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="verifier">Verifier</SelectItem>
                                        <SelectItem value="agent">Agent</SelectItem>
                                        <SelectItem value="landowner">Landowner</SelectItem>
                                        <SelectItem value="investor">Investor</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>

                                {/* Current Roles */}
                                <div>
                                  <Label className="text-base font-medium">Current Roles</Label>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    <Badge className="bg-blue-100 text-blue-800">
                                      {selectedUser.user_type} (Primary)
                                    </Badge>
                                    {userRoles.filter(role => role.is_active).map((role) => (
                                      <Badge key={role.id} className="bg-gray-100 text-gray-800">
                                        {role.role}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                {/* User Info */}
                                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                  <div>
                                    <Label className="text-sm text-gray-500">Email</Label>
                                    <p className="font-medium">{selectedUser.email}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm text-gray-500">Phone</Label>
                                    <p className="font-medium">{selectedUser.phone || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm text-gray-500">Verification Status</Label>
                                    <p className="font-medium">{selectedUser.verification_status}</p>
                                  </div>
                                  <div>
                                    <Label className="text-sm text-gray-500">Account Created</Label>
                                    <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
