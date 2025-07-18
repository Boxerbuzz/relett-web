import { Badge } from "@/components/ui/badge";
import { Inspection } from "@/hooks/useUserBookings";
import { formatDate } from "@/lib/utils";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  NotSubsetOfIcon,
  NoteIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  inspection: Inspection;
  onStatusUpdate?: (id: string, status: string) => void;
}

function getUserActions(status: string) {
  switch (status) {
    case "pending":
      return ["cancel", "reschedule"];
    case "confirmed":
      return ["cancel", "reschedule", "report"];
    case "rescheduled":
      return ["cancel", "report"];
    case "completed":
      return ["report"];
    default:
      return [];
  }
}

export function InspectionDetailsContent({
  inspection,
  onStatusUpdate,
}: Props) {
  const property = inspection.property;
  const agent = inspection.agent;

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const actions = getUserActions(inspection.status);

  const handleCancel = () => {
    // Call your cancel logic, pass cancelReason
    if (onStatusUpdate) onStatusUpdate(inspection.id, "cancelled");
    setShowCancelDialog(false);
    setCancelReason("");
  };

  const handleReport = () => {
    // Open a report dialog or redirect to support
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-6 border p-2 rounded-xl mx-4 md:mx-0">
        {/* Property Image */}
        <div className="md:w-1/5 w-full flex-shrink-0">
          <img
            src={
              property?.property_images?.find((img: any) => img.is_primary)
                ?.url ||
              property?.backdrop ||
              "/placeholder.svg"
            }
            alt={property?.title}
            className="w-full h-48 md:h-40 object-cover rounded-lg"
          />
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col gap-4 justify-center">
          {/* Property Info */}
          <div>
            <h2 className="text-2xl font-bold mb-1">{property?.title}</h2>
            <div className="flex items-center text-gray-600 mb-2">
              <MapPinIcon className="w-4 h-4 mr-1" />
              <span>
                {property?.location?.address || "Location not specified"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{property?.type}</Badge>
              <Badge>{property?.category}</Badge>
            </div>
          </div>

          {/* Inspection Info */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4 text-gray-700">
              <CalendarIcon className="w-4 h-4" />
              <span>
                {inspection.when
                  ? formatDate(inspection.when || "")
                  : "Date not set"}
              </span>
              <ClockIcon className="w-4 h-4" />
              <span className="capitalize">{inspection.mode}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border p-2 rounded-xl mx-4 md:mx-0 my-3">
        {inspection.notes && (
          <div className="text-gray-700 flex items-center text-sm">
            <span className="font-medium mr-2">
              <NoteIcon size={20} />
            </span>{" "}
            {inspection.notes}
          </div>
        )}
      </div>
      <div className="mx-4 md:mx-0 my-3">
        {/* User Actions */}
        {actions.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {actions.includes("cancel") && (
              <>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowCancelDialog(true)}
                >
                  Cancel Inspection
                </Button>
                <Dialog
                  open={showCancelDialog}
                  onOpenChange={setShowCancelDialog}
                >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Inspection</DialogTitle>
                    </DialogHeader>
                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Reason for cancellation
                      </label>
                      <Textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        placeholder="Please provide a reason..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setShowCancelDialog(false)}
                      >
                        Close
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={!cancelReason.trim()}
                      >
                        Confirm Cancel
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}
            {actions.includes("reschedule") && (
              <Button
                variant="outline"
                size="sm" /* onClick={handleReschedule} */
              >
                Reschedule
              </Button>
            )}
            {actions.includes("report") && (
              <Button variant="outline" size="sm" /* onClick={handleReport} */>
                Report Issue
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );
}
