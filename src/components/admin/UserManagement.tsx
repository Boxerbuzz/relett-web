"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { supabase } from "@/integrations/supabase/client";
import {
  MagnifyingGlassIcon,
  UserCheckIcon,
  ProhibitIcon,
} from "@phosphor-icons/react";
import { UserMobileCard } from "./UserMobileCard";
import { UserActionsDropdown } from "./UserActionsDropdown";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  verification_status: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { toast } = useToast();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setUsers((data as User[]) || []);
    } catch (error) {
      handleError(error, "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("users")
        .update({ is_active: !currentStatus })
        .eq("id", userId);

      if (error) throw error;

      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_active: !currentStatus } : user
        )
      );

      toast({
        title: "Success",
        description: `User ${
          !currentStatus ? "activated" : "deactivated"
        } successfully`,
      });
    } catch (error) {
      handleError(error, "Failed to update user status");
    }
  };

  const handleUserUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
    fetchUsers();
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.user_type === filterRole;
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && user.is_active) ||
      (filterStatus === "inactive" && !user.is_active) ||
      (filterStatus === "verified" && user.is_verified) ||
      (filterStatus === "unverified" && !user.is_verified);

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getStatusBadge = (user: User) => {
    if (!user.is_active) {
      return <Badge variant="destructive">Inactive</Badge>;
    }
    if (user.is_verified) {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
    }
    return <Badge variant="secondary">Unverified</Badge>;
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      admin: "bg-purple-100 text-purple-800",
      agent: "bg-blue-100 text-blue-800",
      landowner: "bg-green-100 text-green-800",
      investor: "bg-orange-100 text-orange-800",
      verifier: "bg-indigo-100 text-indigo-800",
    };

    return (
      <Badge
        className={
          roleColors[role as keyof typeof roleColors] ||
          "bg-gray-100 text-gray-800"
        }
      >
        {role}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Loading users...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheckIcon className="h-5 w-5" />
          User Management
        </CardTitle>
        <CardDescription>
          Manage platform users and their permissions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="agent">Agent</SelectItem>
              <SelectItem value="landowner">Landowner</SelectItem>
              <SelectItem value="investor">Investor</SelectItem>
              <SelectItem value="verifier">Verifier</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="unverified">Unverified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Cards - Show on small screens */}
        <div className="md:hidden space-y-4">
          {filteredUsers.map((user) => (
            <UserMobileCard
              key={user.id}
              user={user}
              onToggleStatus={toggleUserStatus}
              onUserUpdated={handleUserUpdated}
            />
          ))}
        </div>

        {/* Desktop Table - Hide on small screens */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-[200px]">
                        {user.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getRoleBadge(user.user_type)}</TableCell>
                  <TableCell>{getStatusBadge(user)}</TableCell>
                  <TableCell>
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={user.is_active ? "destructive" : "default"}
                        onClick={() =>
                          toggleUserStatus(user.id, user.is_active)
                        }
                      >
                        {user.is_active ? (
                          <ProhibitIcon className="h-4 w-4" />
                        ) : (
                          <UserCheckIcon className="h-4 w-4" />
                        )}
                      </Button>
                      <UserActionsDropdown
                        user={user}
                        onUserUpdated={handleUserUpdated}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found matching your criteria.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
