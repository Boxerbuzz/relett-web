
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MoreHorizontal, Eye, Edit, Trash2, Shield, Ban } from 'lucide-react';

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

interface UserActionsDropdownProps {
  user: User;
  onUserUpdated: () => void;
}

export function UserActionsDropdown({ user, onUserUpdated }: UserActionsDropdownProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleViewUser = () => {
    // Navigate to user profile or details page
    window.open(`/admin/users/${user.id}`, '_blank');
  };

  const handleResetPassword = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email: user.email,
      });

      if (error) throw error;

      toast({
        title: 'Password Reset Sent',
        description: `Password reset link sent to ${user.email}`,
      });
    } catch (error) {
      console.error('Error sending password reset:', error);
      toast({
        title: 'Error',
        description: 'Failed to send password reset email',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!confirm(`Are you sure you want to delete ${user.first_name} ${user.last_name}?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.admin.deleteUser(user.id);

      if (error) throw error;

      toast({
        title: 'User Deleted',
        description: 'User has been permanently deleted',
      });
      
      onUserUpdated();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete user',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyUser = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('users')
        .update({ is_verified: true })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'User Verified',
        description: 'User has been manually verified',
      });
      
      onUserUpdated();
    } catch (error) {
      console.error('Error verifying user:', error);
      toast({
        title: 'Error',
        description: 'Failed to verify user',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isLoading}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={handleViewUser}>
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        
        {!user.is_verified && (
          <DropdownMenuItem onClick={handleVerifyUser}>
            <Shield className="mr-2 h-4 w-4" />
            Verify User
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem onClick={handleResetPassword}>
          <Edit className="mr-2 h-4 w-4" />
          Reset Password
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleDeleteUser}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
