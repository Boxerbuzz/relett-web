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
  UsersIcon,
  DotsThreeIcon,
  PhoneIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CalendarDotIcon,
} from "@phosphor-icons/react";
import { format } from "date-fns";

interface ReservationCardProps {
  reservation: any;
  onUpdateStatus: (id: string, status: string) => void;
}

export function ReservationCard({
  reservation,
  onUpdateStatus,
}: ReservationCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
      case "active":
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

  const getTotalGuests = () => {
    const adults = reservation.adults || 0;
    const children = reservation.children || 0;
    const infants = reservation.infants || 0;
    return adults + children + infants;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-purple-600" />
            <div>
              <h3 className="font-semibold">
                {reservation.property?.title || "Property Reservation"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {reservation.property?.location?.address ||
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
                onClick={() => onUpdateStatus(reservation.id, "confirmed")}
              >
                Confirm
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateStatus(reservation.id, "active")}
              >
                Check In
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateStatus(reservation.id, "completed")}
              >
                Complete
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onUpdateStatus(reservation.id, "cancelled")}
              >
                Cancel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <Badge variant={getStatusColor(reservation.status)}>
            {reservation.status}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {getTotalGuests()} guest{getTotalGuests() !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {reservation.from_date && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Check-in</p>
              <div className="flex items-center gap-2 text-sm">
                <CalendarDotIcon className="h-3 w-3" />
                <span>{format(new Date(reservation.from_date), "MMM d")}</span>
              </div>
            </div>
          )}
          {reservation.to_date && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Check-out</p>
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-3 w-3" />
                <span>{format(new Date(reservation.to_date), "MMM d")}</span>
              </div>
            </div>
          )}
        </div>

        {reservation.total && (
          <div className="flex items-center gap-2 text-sm font-medium">
            <CurrencyDollarIcon className="h-4 w-4" />
            <span>₦{reservation.total.toLocaleString()}</span>
            {reservation.nights && (
              <span className="text-muted-foreground">
                ({reservation.nights} night{reservation.nights !== 1 ? "s" : ""}
                )
              </span>
            )}
          </div>
        )}

        {reservation.user && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Guest Details</h4>
            <div className="space-y-1">
              <p className="text-sm">
                {reservation.user.first_name} {reservation.user.last_name}
              </p>
              {reservation.user.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <EnvelopeIcon className="h-3 w-3" />
                  <span>{reservation.user.email}</span>
                </div>
              )}
              {reservation.user.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <PhoneIcon className="h-3 w-3" />
                  <span>{reservation.user.phone}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {reservation.note && (
          <div>
            <h4 className="font-medium text-sm mb-1">Special Requests</h4>
            <p className="text-sm text-muted-foreground">{reservation.note}</p>
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
