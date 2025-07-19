import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
  ResponsiveDialogCloseButton,
} from "@/components/ui/responsive-dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export type ReportType = 
  | "inspection" 
  | "rental" 
  | "reservation" 
  | "property" 
  | "agent" 
  | "payment" 
  | "general";

export type ReporterType = "user" | "agent" | "admin";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reportData: ReportData) => void;
  reportType: ReportType;
  reporterType: ReporterType;
  targetId?: string; // ID of the thing being reported
  targetTitle?: string; // Name/title of the thing being reported
}

export interface ReportData {
  type: ReportType;
  reporterType: ReporterType;
  reason: string;
  description: string;
  targetId?: string;
  targetTitle?: string;
  reportedAt: string;
}

const getReportReasons = (type: ReportType, reporterType: ReporterType) => {
  const baseReasons = ["Inappropriate content", "Spam", "Misleading information"];
  
  switch (type) {
    case "inspection":
      return [
        "Agent didn't show up",
        "Property doesn't match description",
        "Scheduling issues",
        "Unprofessional behavior",
        ...baseReasons
      ];
    case "rental":
      return [
        "Payment issues",
        "Property condition problems",
        "Contract disputes",
        "Maintenance issues",
        ...baseReasons
      ];
    case "reservation":
      return [
        "Booking problems",
        "Property availability issues",
        "Communication problems",
        "Service quality issues",
        ...baseReasons
      ];
    case "property":
      return [
        "False information",
        "Photos don't match reality",
        "Price discrepancies",
        "Availability issues",
        ...baseReasons
      ];
    case "agent":
      return [
        "Unprofessional behavior",
        "Poor communication",
        "No response",
        "Misleading information",
        ...baseReasons
      ];
    case "payment":
      return [
        "Transaction failed",
        "Double charge",
        "Refund issues",
        "Payment method problems",
        ...baseReasons
      ];
    default:
      return baseReasons;
  }
};

const getReportTitle = (type: ReportType) => {
  switch (type) {
    case "inspection": return "Report Inspection Issue";
    case "rental": return "Report Rental Issue";
    case "reservation": return "Report Reservation Issue";
    case "property": return "Report Property";
    case "agent": return "Report Agent";
    case "payment": return "Report Payment Issue";
    default: return "Report Issue";
  }
};

export function ReportDialog({
  open,
  onOpenChange,
  onConfirm,
  reportType,
  reporterType,
  targetId,
  targetTitle,
}: ReportDialogProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");

  const reasons = getReportReasons(reportType, reporterType);
  const title = getReportTitle(reportType);

  const handleConfirm = () => {
    const reportData: ReportData = {
      type: reportType,
      reporterType,
      reason,
      description,
      targetId,
      targetTitle,
      reportedAt: new Date().toISOString(),
    };
    
    onConfirm(reportData);
    setReason("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        
        <div className="space-y-4 px-4 md:px-0">
          {targetTitle && (
            <div className="text-sm text-gray-600">
              Reporting: <span className="font-medium">{targetTitle}</span>
            </div>
          )}
          
          <div>
            <Label className="text-sm font-medium">Reason for report</Label>
            <RadioGroup value={reason} onValueChange={setReason} className="mt-2">
              {reasons.map((r) => (
                <div key={r} className="flex items-center space-x-2">
                  <RadioGroupItem value={r} id={r} />
                  <Label htmlFor={r} className="text-sm">{r}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Additional details (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide more details about the issue..."
              rows={3}
              className="mt-2"
            />
          </div>
        </div>

        <ResponsiveDialogFooter>
          <ResponsiveDialogCloseButton />
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason.trim()}
          >
            Submit Report
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
} 