import { Badge } from "@/components/ui/badge";
import { Inspection } from "@/hooks/useUserBookings";
import { capitalize, formatDate, formatDateTime } from "@/lib/utils";
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  NoteIcon,
  XCircleIcon,
  ArrowClockwiseIcon,
  WarningIcon,
  HashIcon,
  CopyIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CancelInspectionDialog } from "./CancellnspectionDialog";
import {
  ReportDialog,
  ReportType,
  ReporterType,
} from "../reports/ReportDialog";
import { RescheduleInspectionDialog } from "./RescheduleInspectionDialog";

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

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const actions = getUserActions(inspection.status);

  const handleCancel = (cancelData: any) => {
    if (onStatusUpdate) onStatusUpdate(inspection.id, "cancelled");
    // You can also save the cancellation details to your database
  };

  const handleReschedule = async (rescheduleData: any) => {
    // Handle rescheduling logic here
    console.log("Rescheduling inspection:", rescheduleData);
    // You would typically update the inspection in your database
    if (onStatusUpdate) onStatusUpdate(inspection.id, "rescheduled");
  };

  const handleReport = async (reportData: any) => {
    // Handle report submission
    console.log("Submitting report:", reportData);
    // You would typically save the report to your database
  };

  return (
    <>
      {/* Header with Status and Actions */}
      <div className="flex items-center justify-between mb-6 px-4 md:px-0">
        <div className="flex items-center gap-3">
          <Badge
            variant={
              inspection.status === "confirmed"
                ? "default"
                : inspection.status === "pending"
                ? "secondary"
                : inspection.status === "completed"
                ? "outline"
                : "destructive"
            }
            className="text-sm gap-x-1 cursor-pointer"
          >
            <HashIcon />
            {inspection.id.slice(-8)}
            <CopyIcon />
          </Badge>
        </div>

        {/* Action Buttons */}
        {actions.length > 0 && (
          <div className="flex items-center gap-2">
            {actions.includes("cancel") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCancelDialog(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <XCircleIcon className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            )}
            {actions.includes("reschedule") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRescheduleDialog(true)}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <ArrowClockwiseIcon className="w-4 h-4 mr-1" />
                Reschedule
              </Button>
            )}
            {actions.includes("report") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReportDialog(true)}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <WarningIcon className="w-4 h-4 mr-1" />
                Report
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Property Details Card */}
      <div className="mx-4 md:mx-0">
        <div className="bg-white border rounded-xl overflow-hidden mb-6">
          <div className="flex flex-col md:flex-row">
            {/* Property Image */}
            <div className="md:w-1/4 w-full">
              <img
                src={
                  property?.property_images?.find((img: any) => img.is_primary)
                    ?.url ||
                  property?.backdrop ||
                  "/placeholder.svg"
                }
                alt={property?.title}
                className="w-full h-40 md:h-full object-cover"
              />
            </div>

            {/* Property Info */}
            <div className="flex-1 p-3">
              <h2 className="text-xl font-bold mb-3">{property?.title}</h2>
              <div className="flex items-center text-gray-600 mb-2">
                <MapPinIcon className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {property?.location?.address || "Location not specified"}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">
                  {capitalize(property?.type || "")}
                </Badge>
                <Badge variant="outline">
                  {capitalize(property?.category || "")}
                </Badge>
              </div>

              {/* Inspection Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    {inspection.when
                      ? formatDateTime(inspection.when || "")
                      : "Date not set"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <ClockIcon className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 capitalize">
                    {inspection.mode} Inspection
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {inspection.notes && (
          <div className="bg-gray-50 border rounded-xl p-4 mb-6 flex items-start gap-2 mx-4 md:mx-0">
            <NoteIcon size={20} className="text-gray-400 mt-1" />
            <span className="text-gray-700 text-sm">{inspection.notes}</span>
          </div>
        )}

        {/* Cancel Inspection Dialog */}
        <CancelInspectionDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          onConfirm={handleCancel}
          userId={inspection.agent_id}
        />

        {/* Reschedule Inspection Dialog */}
        <RescheduleInspectionDialog
          open={showRescheduleDialog}
          onOpenChange={setShowRescheduleDialog}
          onConfirm={handleReschedule}
          currentInspection={inspection}
        />

        {/* Generic Report Dialog */}
        <ReportDialog
          open={showReportDialog}
          onOpenChange={setShowReportDialog}
          onConfirm={handleReport}
          reportType="inspection"
          reporterType="user"
          targetId={inspection.id}
          targetTitle={property?.title}
        />
      </div>
    </>
  );
}
