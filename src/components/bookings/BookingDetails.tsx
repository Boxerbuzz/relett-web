import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  UserIcon,
  PhoneIcon,
  XIcon,
  EnvelopeIcon,
  HashIcon,
  CopyIcon,
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
import { Badge } from "../ui/badge";

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
        className="max-w-5xl w-full md:max-h-[80vh] flex flex-col p-0 gap-y-0"
        size="3xl"
      >
        <ResponsiveDialogHeader className="space-y-4 sticky top-0 bg-background z-10 border-b flex-shrink-0 p-4 rounded-tl-md rounded-tr-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <ResponsiveDialogTitle className="text-xl font-bold">
                {bookingType.charAt(0).toUpperCase() + bookingType.slice(1)}{" "}
                Details
              </ResponsiveDialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <BookingStatusBadge status={bookingData.status} size="sm" />
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      bookingData.status === "confirmed"
                        ? "default"
                        : bookingData.status === "pending"
                        ? "secondary"
                        : bookingData.status === "completed"
                        ? "outline"
                        : "destructive"
                    }
                    className="text-xs gap-x-1 cursor-pointer"
                  >
                    <HashIcon />
                    {bookingData.id.slice(-8)}
                    <CopyIcon />
                  </Badge>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="">
              <XIcon className="h-4 w-4" />
            </Button>
          </div>
        </ResponsiveDialogHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isCustomer && bookingData.agent && (
            <Card className="mb-6">
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

          {renderContent()}
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
