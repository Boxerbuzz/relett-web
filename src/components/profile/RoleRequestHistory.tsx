import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRoleRequests } from "@/hooks/useRoleRequests";
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon,
  CalendarIcon,
  FileTextIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";
import { capitalize } from "@/lib/utils";

interface RoleRequestHistoryProps {
  onSubmitNewRequest?: () => void;
}

export function RoleRequestHistory({
  onSubmitNewRequest,
}: RoleRequestHistoryProps) {
  const { requests, loading, hasActivePendingRequest } = useRoleRequests();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      case "approved":
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <UserPlusIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Role Requests</CardTitle>
          <CardDescription>Track your role upgrade requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <UserPlusIcon className="h-5 w-5" />
              Role Requests
            </CardTitle>
            <CardDescription>Track your role upgrade requests</CardDescription>
          </div>
          {!hasActivePendingRequest() && (
            <Button onClick={onSubmitNewRequest}>
              <UserPlusIcon className="h-4 w-4 mr-2" />
              New Request
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <div className="text-center py-8">
            <UserPlusIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Role Requests
            </h3>
            <p className="text-gray-600 mb-4">
              You haven't submitted any role upgrade requests yet.
            </p>
            <Button onClick={onSubmitNewRequest}>
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Submit Your First Request
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <h4 className="font-medium">
                        {capitalize(request.requested_role)} Role Request
                      </h4>
                      <p className="text-sm text-gray-600">
                        From {request.current_role} to {request.requested_role}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>

                {request.reason && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <FileTextIcon className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        Request Reason
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{request.reason}</p>
                  </div>
                )}

                {request.admin_notes && request.status === "rejected" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <XCircleIcon className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium text-red-700">
                        Admin Notes
                      </span>
                    </div>
                    <p className="text-sm text-red-600">
                      {request.admin_notes}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Requested{" "}
                    {format(new Date(request.requested_at), "MMM d, yyyy")}
                  </div>
                  {request.reviewed_at && (
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      Reviewed{" "}
                      {format(new Date(request.reviewed_at), "MMM d, yyyy")}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
