import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Inspection</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block mb-2 text-sm font-medium">
              Reason for cancellation
            </label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {CANCELLATION_REASONS.map((r) => (
                <RadioGroupItem key={r} value={r} className="mb-1">
                  {r}
                </RadioGroupItem>
              ))}
            </RadioGroup>
          </div>
          <div>
            <label className="block mb-2 text-sm font-medium">
              Additional note (optional)
            </label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any extra info..."
              rows={3}
            />
          </div>
          <div className="flex gap-2 mt-4">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
