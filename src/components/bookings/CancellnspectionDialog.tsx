import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const CANCELLATION_REASONS = [
  "Change of plans",
  "Found another property",
  "Scheduling conflict",
  "Agent unresponsive",
  "Other",
];

export function CancelInspectionDialog({
  open,
  onOpenChange,
  onConfirm,
  userId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (details: any) => void;
  userId: string;
}) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  const handleConfirm = () => {
    onConfirm({
      reason,
      note,
      cancelled_at: new Date().toISOString(),
      cancelled_by: userId,
      refund_amount: 0,
      refund_method: "",
      refund_status: "",
      refund_note: "",
      refund_type: "",
      refunded_at: null,
      refunded_by: null,
    });
    setReason("");
    setNote("");
    onOpenChange(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Cancel Inspection</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="space-y-4 px-4 md:px-0">
          <div>
            <Label className="text-sm font-medium">
              Reason for cancellation
            </Label>
            <RadioGroup
              value={reason}
              onValueChange={setReason}
              className="mt-2"
            >
              {CANCELLATION_REASONS.map((r) => (
                <div key={r} className="flex items-center space-x-2">
                  <RadioGroupItem value={r} id={r} />
                  <Label htmlFor={r} className="text-sm">
                    {r}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div>
            <Label className="text-sm font-medium">
              Additional note (optional)
            </Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any extra info..."
              rows={3}
              className="mt-2"
            />
          </div>
        </div>
        <div className="flex gap-2 mt-4 px-4 pb-4 md:px-0 md:pb-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!reason}
          >
            Confirm Cancel
          </Button>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
