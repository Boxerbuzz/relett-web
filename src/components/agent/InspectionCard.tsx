import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  DotsThreeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";

interface InspectionCardProps {
  inspection: any;
  onUpdateStatus: (id: string, status: string) => void;
}

export function InspectionCard({
  inspection,
  onUpdateStatus,
}: InspectionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "completed":
        return "outline";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div>
              <h3 className="font-semibold">
                {inspection.property?.title || "Property Inspection"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {inspection.property?.location?.address ||
                  "Location not specified"}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <DotsThreeIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onUpdateStatus(inspection.id, "confirmed")}
              >
                Confirm
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateStatus(inspection.id, "completed")}
              >
                Mark Complete
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateStatus(inspection.id, "cancelled")}
              >
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant={getStatusColor(inspection.status)}>
            {inspection.status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {inspection.mode}
          </span>
        </div>

        {inspection.when && (
          <div className="flex items-center gap-2 text-sm">
            <CalendarIcon className="h-4 w-4" />
            <span>
              {format(new Date(inspection.when), "MMM d, yyyy h:mm a")}
            </span>
          </div>
        )}

        {inspection.user && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Client Details</h4>
            <div className="space-y-1">
              <p className="text-sm">
                {inspection.user.first_name} {inspection.user.last_name}
              </p>
              {inspection.user.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <EnvelopeIcon className="h-3 w-3" />
                  <span>{inspection.user.email}</span>
                </div>
              )}
              {inspection.user.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <PhoneIcon className="h-3 w-3" />
                  <span>{inspection.user.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {inspection.notes && (
          <div>
            <h4 className="font-medium text-sm mb-1">Notes</h4>
            <p className="text-sm text-muted-foreground">{inspection.notes}</p>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" className="flex-1">
            <PhoneIcon className="h-3 w-3 mr-1" />
            Call
          </Button>
          <Button size="sm" variant="outline" className="flex-1">
            <EnvelopeIcon className="h-3 w-3 mr-1" />
            Email
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
