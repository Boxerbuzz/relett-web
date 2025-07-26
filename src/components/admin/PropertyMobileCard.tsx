import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PencilIcon,
  TrashIcon,
  MapPinIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  UserPlusIcon,
} from "@phosphor-icons/react";

interface Property {
  id: string;
  title: string;
  type: string;
  category: string;
  status: string;
  location: any;
  price: any;
  created_at: string;
  is_verified: boolean;
  is_featured: boolean;
  is_tokenized: boolean;
  views: number;
  likes: number;
  user_id: string;
  users?: {
    first_name: string;
    last_name: string;
    email: string;
  };
  verification_tasks?: {
    id: string;
    status: string;
    priority: string;
    assigned_at: string | null;
    verifier_id: string | null;
  }[];
}

interface PropertyMobileCardProps {
  property: Property;
  onEdit?: (property: Property) => void;
  onDelete?: (propertyId: string) => void;
  onUpdateStatus?: (propertyId: string, isVerified: boolean) => Promise<void>;
  onInitiateVerification?: (property: Property) => void;
}

export function PropertyMobileCard({
  property,
  onEdit,
  onDelete,
  onUpdateStatus,
  onInitiateVerification,
}: PropertyMobileCardProps) {
  const getStatusBadge = (property: Property) => {
    if (property.is_verified) {
      return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
    }
    if (property.verification_tasks && property.verification_tasks.length > 0) {
      return <Badge className="bg-blue-100 text-blue-800">Under Review</Badge>;
    }
    if (property.status === "active") {
      return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
    }
    if (property.status === "pending") {
      return <Badge variant="secondary">Pending</Badge>;
    }
    return <Badge variant="outline">Draft</Badge>;
  };

  const hasActiveVerificationTask = (property: Property) => {
    return (
      property.verification_tasks &&
      property.verification_tasks.some((task) =>
        ["pending", "assigned", "in_progress"].includes(task.status)
      )
    );
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        {/* Header with title and actions */}
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">
              {property.title || "Untitled Property"}
            </h3>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <MapPinIcon className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">
                {property.location?.city || "Location not specified"}
              </span>
            </div>
          </div>
          <div className="flex gap-2 ml-2 flex-shrink-0">
            {onEdit && onDelete && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(property)}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(property.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </>
            )}
            {onUpdateStatus && (
              <>
                <Button variant="outline" size="sm">
                  <EyeIcon className="h-4 w-4" />
                </Button>
                {!hasActiveVerificationTask(property) &&
                  !property.is_verified &&
                  onInitiateVerification && (
                    <Button
                      size="sm"
                      onClick={() => onInitiateVerification(property)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlusIcon className="h-4 w-4" />
                    </Button>
                  )}
                {!property.is_verified &&
                  !hasActiveVerificationTask(property) && (
                    <>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => onUpdateStatus(property.id, true)}
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => onUpdateStatus(property.id, false)}
                      >
                        <XCircleIcon className="h-4 w-4" />
                      </Button>
                    </>
                  )}
              </>
            )}
          </div>
        </div>

        {/* Owner info */}
        <div className="text-sm">
          <span className="text-gray-500">Owner:</span>
          <div className="mt-1">
            <div className="font-medium">
              {property.users?.first_name} {property.users?.last_name}
            </div>
            <div className="text-gray-500 truncate">
              {property.users?.email}
            </div>
          </div>
        </div>

        {/* Property details grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-500">Type:</span>
            <Badge variant="outline" className="ml-1 text-xs">
              {property.type}
            </Badge>
          </div>
          <div>
            <span className="text-gray-500">Price:</span>
            <div className="font-medium mt-1">
              {property.price?.currency}{" "}
              {property.price?.amount?.toLocaleString()}
            </div>
          </div>
          <div>
            <span className="text-gray-500">Views:</span>
            <div className="font-medium mt-1">{property.views || 0}</div>
          </div>
          <div>
            <span className="text-gray-500">Likes:</span>
            <div className="font-medium mt-1">{property.likes || 0}</div>
          </div>
        </div>

        {/* Status and badges */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {getStatusBadge(property)}
          {property.is_verified && (
            <Badge variant="outline" className="text-xs">
              Verified
            </Badge>
          )}
          {property.is_featured && (
            <Badge variant="outline" className="text-xs">
              Featured
            </Badge>
          )}
          {property.is_tokenized && (
            <Badge variant="outline" className="text-xs">
              Tokenized
            </Badge>
          )}
        </div>

        {/* Created date */}
        <div className="text-xs text-gray-500 pt-1">
          Created: {new Date(property.created_at).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
