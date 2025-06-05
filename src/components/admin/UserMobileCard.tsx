
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UserCheck, UserX, MoreHorizontal } from 'lucide-react';

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

interface UserMobileCardProps {
  user: User;
  onToggleStatus: (userId: string, currentStatus: boolean) => void;
}

export function UserMobileCard({ user, onToggleStatus }: UserMobileCardProps) {
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
      admin: 'bg-purple-100 text-purple-800',
      agent: 'bg-blue-100 text-blue-800',
      landowner: 'bg-green-100 text-green-800',
      investor: 'bg-orange-100 text-orange-800',
      verifier: 'bg-indigo-100 text-indigo-800'
    };
    
    return (
      <Badge className={roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
        {role}
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="font-medium truncate">{user.first_name} {user.last_name}</h3>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {getRoleBadge(user.user_type)}
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <div className="text-xs text-gray-500">Status</div>
              {getStatusBadge(user)}
            </div>
            <div className="flex flex-col gap-1">
              <div className="text-xs text-gray-500">Created</div>
              <div className="text-sm">{new Date(user.created_at).toLocaleDateString()}</div>
            </div>
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant={user.is_active ? "destructive" : "default"}
              onClick={() => onToggleStatus(user.id, user.is_active)}
              className="flex-1"
            >
              {user.is_active ? (
                <>
                  <UserX className="h-4 w-4 mr-1" />
                  Deactivate
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-1" />
                  Activate
                </>
              )}
            </Button>
            <Button size="sm" variant="outline">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
