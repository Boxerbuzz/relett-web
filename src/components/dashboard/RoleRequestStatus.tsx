
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRoleRequests } from '@/hooks/useRoleRequests';
import { 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  UserPlusIcon,
  EyeIcon 
} from '@phosphor-icons/react';
import { formatDistanceToNow } from 'date-fns';

interface RoleRequestStatusProps {
  onViewRequests?: () => void;
  onSubmitRequest?: () => void;
}

export function RoleRequestStatus({ onViewRequests, onSubmitRequest }: RoleRequestStatusProps) {
  const { requests, loading, hasActivePendingRequest, getLatestRequest } = useRoleRequests();

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestRequest = getLatestRequest();
  const hasPendingRequest = hasActivePendingRequest();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <UserPlusIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return null;
    }
  };

  if (!latestRequest) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <UserPlusIcon className="h-5 w-5" />
            Role Upgrade
          </CardTitle>
          <CardDescription>
            Ready to unlock more features? Request a role upgrade.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={onSubmitRequest} className="w-full">
            <UserPlusIcon className="h-4 w-4 mr-2" />
            Become an Agent
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            {getStatusIcon(latestRequest.status)}
            Role Request Status
          </div>
          {getStatusBadge(latestRequest.status)}
        </CardTitle>
        <CardDescription>
          {latestRequest.requested_role} role request
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">
          <p className="text-gray-600">
            Requested {formatDistanceToNow(new Date(latestRequest.requested_at), { addSuffix: true })}
          </p>
          {latestRequest.reviewed_at && (
            <p className="text-gray-600">
              Reviewed {formatDistanceToNow(new Date(latestRequest.reviewed_at), { addSuffix: true })}
            </p>
          )}
        </div>

        {latestRequest.status === 'pending' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              Your request is being reviewed by our team. You'll be notified once there's an update.
            </p>
          </div>
        )}

        {latestRequest.status === 'approved' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800">
              Congratulations! Your role request has been approved. Your new permissions are now active.
            </p>
          </div>
        )}

        {latestRequest.status === 'rejected' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              Your request was not approved at this time.
              {latestRequest.admin_notes && (
                <span className="block mt-1 font-medium">
                  Reason: {latestRequest.admin_notes}
                </span>
              )}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {requests.length > 0 && (
            <Button variant="outline" size="sm" onClick={onViewRequests} className="flex-1">
              <EyeIcon className="h-4 w-4 mr-2" />
              View All Requests
            </Button>
          )}
          {!hasPendingRequest && (
            <Button size="sm" onClick={onSubmitRequest} className="flex-1">
              <UserPlusIcon className="h-4 w-4 mr-2" />
              New Request
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
