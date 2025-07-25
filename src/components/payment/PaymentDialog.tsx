import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { usePaymentFlow, PaymentStatus } from "@/hooks/usePaymentFlow";

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "rental" | "reservation";
  bookingId?: string;
  amount: number;
  currency?: string;
  metadata: Record<string, any>;
  propertyId: string;
  propertyTitle?: string;
  agentId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  type,
  bookingId,
  amount,
  currency = "NGN",
  metadata,
  propertyId,
  propertyTitle,
  onSuccess,
  onCancel,
  agentId,
}: PaymentDialogProps) {
  const {
    loading,
    paymentStatus,
    initializePayment,
    verifyPaymentStatus,
    retryPayment,
  } = usePaymentFlow();
  const [reference, setReference] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // Auto-verify payment status when dialog opens and we have a reference
    if (open && reference && paymentStatus?.status === "pending") {
      const interval = setInterval(async () => {
        const status = await verifyPaymentStatus(reference);
        if (status.status === "completed") {
          onSuccess?.();
          clearInterval(interval);
        }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
    }
  }, [open, reference, paymentStatus?.status]);

  const handleInitializePayment = async () => {
    try {
      const paymentRef = await initializePayment({
        type,
        bookingId,
        amount: amount / 100,
        currency,
        metadata,
        propertyId,
        agentId,
      });
      setReference(paymentRef);
    } catch (error) {
      console.error("Payment initialization failed:", error);
    }
  };

  const handleRetryPayment = async () => {
    if (!bookingId) return;

    try {
      const paymentRef = await retryPayment(bookingId, type);
      setReference(paymentRef);
    } catch (error) {
      console.error("Payment retry failed:", error);
    }
  };

  const handleVerifyPayment = async () => {
    if (!reference) return;

    setVerifying(true);
    try {
      const status = await verifyPaymentStatus(reference);
      if (status.status === "completed") {
        onSuccess?.();
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
    } finally {
      setVerifying(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  const getStatusIcon = (status: PaymentStatus["status"]) => {
    switch (status) {
      case "processing":
      case "pending":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
      case "expired":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusMessage = (status: PaymentStatus["status"]) => {
    switch (status) {
      case "processing":
        return "Initializing payment...";
      case "pending":
        return "Payment window opened. Complete your payment and return here.";
      case "completed":
        return "Payment successful! Your booking has been confirmed.";
      case "failed":
        return "Payment failed. Please try again.";
      case "expired":
        return "Payment session expired. Please start a new payment.";
      default:
        return "";
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {type === "rental" ? "Rental Payment" : "Reservation Payment"}
          </DialogTitle>
          <DialogDescription>
            {propertyTitle && `Payment for ${propertyTitle}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Payment Amount */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-2xl font-bold text-primary">
              {formatAmount(amount / 100, currency)}
            </div>
          </div>

          {/* Payment Status */}
          {paymentStatus && (
            <Alert>
              <div className="flex items-center gap-2">
                {getStatusIcon(paymentStatus.status)}
                <AlertDescription>
                  {getStatusMessage(paymentStatus.status)}
                  {paymentStatus.error && (
                    <div className="text-red-600 mt-1">
                      {paymentStatus.error}
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {/* Payment URL */}
          {paymentStatus?.paymentUrl && paymentStatus.status === "pending" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(paymentStatus.paymentUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Payment Window
            </Button>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            {!paymentStatus && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleInitializePayment}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Start Payment"
                  )}
                </Button>
              </>
            )}

            {paymentStatus?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVerifyPayment}
                  disabled={verifying}
                  className="flex-1"
                >
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Check Status
                    </>
                  )}
                </Button>
              </>
            )}

            {(paymentStatus?.status === "failed" ||
              paymentStatus?.status === "expired") && (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={
                    bookingId ? handleRetryPayment : handleInitializePayment
                  }
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Retry Payment"
                  )}
                </Button>
              </>
            )}

            {paymentStatus?.status === "completed" && (
              <Button onClick={() => onOpenChange(false)} className="w-full">
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
