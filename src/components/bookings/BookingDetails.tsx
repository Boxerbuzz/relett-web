import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserIcon,
  PhoneIcon,
  XIcon,
  EnvelopeIcon,
} from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth";
import { RentalDetailsContent } from "./RentalDetailsContent";
import { ReservationDetailsContent } from "./ReservationDetailsContent";
import { InspectionDetailsContent } from "./InspectionDetailsContent";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { formatDate } from "@/lib/utils";
import { BookingStatusBadge } from "./BookingStatusBadge";

export type BookingType = "rental" | "reservation" | "inspection";

interface BookingDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  bookingType: BookingType;
  bookingData: any;
  onStatusUpdate?: (id: string, status: string) => void;
}

export function BookingDetails({
  isOpen,
  onClose,
  bookingType,
  bookingData,
  onStatusUpdate,
}: BookingDetailsProps) {
  const { user } = useAuth();
  if (!bookingData) return null;

  // Determine if current user is the agent or customer
  const isAgent = user?.id === bookingData.agent_id;
  const isCustomer = user?.id === bookingData.user_id;

  const renderContent = () => {
    switch (bookingType) {
      case "rental":
        return (
          <RentalDetailsContent
            rental={bookingData}
            onStatusUpdate={onStatusUpdate}
          />
        );
      case "reservation":
        return (
          <ReservationDetailsContent
            reservation={bookingData}
            onStatusUpdate={onStatusUpdate}
          />
        );
      case "inspection":
        return (
          <InspectionDetailsContent
            inspection={bookingData}
            onStatusUpdate={onStatusUpdate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ResponsiveDialog open={isOpen} onOpenChange={onClose}>
      <ResponsiveDialogContent
        className="max-w-5xl w-full max-h-[80vh] overflow-y-auto"
        size="3xl"
      >
        <ResponsiveDialogHeader className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <ResponsiveDialogTitle className="text-xl font-bold">
                {bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}{" "}
                Details
              </ResponsiveDialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <BookingStatusBadge status={bookingData.status} />
                <span className="text-sm text-muted-foreground">
                  Created {formatDate(bookingData.created_at)}
                </span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="md:hidden"
            >
              <XIcon className="h-4 w-4" />
            </Button>
          </div>

          {isCustomer && bookingData.agent && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Agent Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {bookingData.agent.first_name} {bookingData.agent.last_name}
                  </span>
                </div>
                {bookingData.agent.email && (
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{bookingData.agent.email}</span>
                  </div>
                )}
                {bookingData.agent.phone && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{bookingData.agent.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </ResponsiveDialogHeader>

        <div className="mt-0">{renderContent()}</div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
